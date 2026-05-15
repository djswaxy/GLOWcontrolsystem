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
  bool active;
  unsigned long activeTime;
} SensorLightModule_t;

SensorLightModule_t sensorLights[] = {
  {2, 0, false, 0},
  {1, 1, false, 0},
  {0, 2, false, 0}
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
  bool motionNow = false;
  for (int i = 0; i < 3; i++) {
      if (motionDetected(sensorLights[i].sensorIndex)) {
        sensorLights[i].activeTime = millis(); //millis er stoppeklokke
        if (!sensorLights[i].active) {
          sensorLights[i].active = true;
          leds[sensorLights[i].ledIndex].goActive();
        }
        // Legg til i stats
        PasserbyDay++;
        PasserbyWeek++;
        PasserbyAllTime++;
        saveStats();
      }
      if (sensorLights[i].active && (millis() - sensorLights[i].activeTime >= LIGHT_DURATION_MS)) {
          leds[sensorLights[i].ledIndex].goStandby();
          sensorLights[i].active = false;
      }
  }
}