#include <Arduino.h>
#include <communicationHandler.h>
#include <util/delay.h>
#include <led.h>
#include <uart.h>

unsigned char lysStyrke;
unsigned char lysTimer;
unsigned long lastBlinkMs = 0;

void setup() {
  initLEDport();
  InitUART0(9600, 8, 0);
  initCommunication();
}

void loop() {
  pollCommunication();
  Receiver();

  if (millis() - lastBlinkMs >= 1000) {
    toggleLED(0);
    lastBlinkMs = millis();
  }

  //ForbiPasserende();
}