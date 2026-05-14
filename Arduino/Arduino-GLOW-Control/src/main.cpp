#include <Arduino.h>
#include <communicationHandler.h>
#include <util/delay.h>
#include <led.h>
#include <uart.h>
#include <settings.h>
#include <motionSensor.h> //LESE SENSORER
#include "LEDDriver.h"

LEDDriver leds[] = { LEDDriver(2), LEDDriver(3), LEDDriver(4), LEDDriver(5), LEDDriver(6) };
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
      
      // VELDIG VIKTIG: Nullstill alt slik at Arduinoen er klar for neste pakke!
      ClearReceivedMessage();   
  }
  bool motionNow = false;
  for (int i = 0; i < 3; i++) {
      if (motionDetected(i)) {
          motionNow = true;
          break; // break på at en sensor detecter bevegelse
      }
  }
  if (motionNow) {
      lastMotionTime = millis(); //millis er stoppeklokke

      if (!isLightActive) { //skru på lys
          for (int i = 0; i < numLeds; i++) {
              leds[i].goActive();
          }
          isLightActive = true;

          // Legg til i stats
          PasserbyDay++;
          PasserbyWeek++;
          PasserbyAllTime++;
          saveStats();
      }
  }
  if (isLightActive && (millis() - lastMotionTime >= LIGHT_DURATION_MS)) {
      
      for (int i = 0; i < numLeds; i++) {
          leds[i].goStandby();
      }
      isLightActive = false;
  }

}