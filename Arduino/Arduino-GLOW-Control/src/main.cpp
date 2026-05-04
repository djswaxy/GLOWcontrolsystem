#define F_CPU 16000000UL
#include <Arduino.h>
#include <communicationHandler.h>
#include <util/delay.h>
#include <led.h>
#include <uart.h>

unsigned char lysStyrke;
unsigned char lysTimer;

void setup() {
  initLEDport();
  InitUART0(9600, 8, 1);
  initCommunication();
}

void loop() {
  _delay_ms(1000);
  toggleLED(0);
  //ForbiPasserende();
}