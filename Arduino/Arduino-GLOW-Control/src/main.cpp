#include <Arduino.h>
#include <communicationHandler.h>
#include <util/delay.h>
#include <led.h>
#include <uart.h>
#include <settings.h>
#include <motionSensor.h> //LESE SENSORER
#include "LEDDriver.h"

LEDDriver leds[] = { LEDDriver(8), LEDDriver(9), LEDDriver(10), LEDDriver(11), LEDDriver(12) };
const int numLeds = 5;
extern volatile unsigned char packet_received;

extern unsigned int PasserbyDay;
extern unsigned int PasserbyWeek;
extern unsigned int PasserbyAllTime;

unsigned long lastMotionTime = 0; 
const unsigned long LIGHT_DURATION_MS = 5000; // Lengde lys er tent
bool isLightActive = false;

void applyLightSettings(unsigned short maxPercent, unsigned short standbyPercent) {
    for (int i = 0; i < numLeds; i++) {
        leds[i].setMaxLight(maxPercent);
        leds[i].setStandbyLight(standbyPercent);
        
        // Valgfritt: Tving lysene til standby umiddelbart så du ser at det funker!
        leds[i].goStandby(); 
    }
}

struct {
  unsigned char ID = 0xCC;
  unsigned char DATA[8] = {0xCC, 0xCC, 0xCC, 0x00, 0x00, 0x00, 0x00, 0x00};
} connectToPC;

typedef struct {
  int sensorIndex;
  int ledIndex;
  int adjacentLedIndex[2];
  bool active;
  unsigned long activeTime;
} SensorLightModule_t;

SensorLightModule_t sensorLights[] = {
  {0, 0, {1, -1}, false, 0},
  {1, 2, {1, 3}, false, 0},
  {2, 4, {3, -1}, false, 0}
};

void setup() {
  initLEDport();
  InitUART0(9600, 8, 1);
  initCommunication();
  setupMotionSensors();
  TransmitData(connectToPC.ID,connectToPC.DATA); 
  getSettings();
  saveSettings();
  toggleLED(5);
}

void loop() {

  if (packet_received == 1) { 
      // Kjør logikken for å tolke hva Node.js nettopp sendte oss
      Receiver();
      
      ClearReceivedMessage();
  }
  
  // This is a map for the desired light state. The map is to prevent accidental light turn offs
  bool targetedLightMap[numLeds] = {false};

  // Going through the 3 sensors
  for (int i = 0; i < 3; i++) {
    // If motion is detected, turn on light and restart its timer.
    if (motionDetected(sensorLights[i].sensorIndex)) {
      sensorLights[i].activeTime = millis(); //millis er stoppeklokke
      if (!sensorLights[i].active) {
        sensorLights[i].active = true;
      }
      // Legg til i stats
      PasserbyDay++;
      PasserbyWeek++;
      PasserbyAllTime++;
      saveStats();
    }
    // If timer is at 0, turn of light
    if (sensorLights[i].active && (millis() - sensorLights[i].activeTime >= LIGHT_DURATION_MS)) {
      sensorLights[i].active = false;
    }

    // If timer is still active, set the targeted state for the light and the adjacent lights.
    if (sensorLights[i].active) {
      targetedLightMap[sensorLights[i].ledIndex] = true;
      for (int j = 0; j < 2; j++) {
        if (sensorLights[i].adjacentLedIndex[j] != -1) {
          targetedLightMap[sensorLights[i].adjacentLedIndex[j]] = true;
        }
      }
    }
  }

  // Controlling the light, by turning them on and off bases of on their current state and their targeted state.
  static bool currentLightMap[numLeds] = {false}; //static to not change the value on loop reset
  for (int i = 0; i < numLeds; i++) {
    if (targetedLightMap[i] && !currentLightMap[i]) {
      currentLightMap[i] = true;
      leds[i].goActive();
    } else if (!targetedLightMap[i] && currentLightMap[i]) {
      currentLightMap[i] = false;
      leds[i].goStandby();
    }
  }
}