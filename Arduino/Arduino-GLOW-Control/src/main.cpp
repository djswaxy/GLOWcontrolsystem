#define F_CPU 16000000UL
#include <Arduino.h>
#include <communicationHandler.h>
#include <util/delay.h>

unsigned char lysStyrke;
unsigned char lysTimer;

void setup() {
  // put your setup code here, to run once:
  InitUART0(9600, 6, 1);
  initCommunication();
}

void loop() {
  _delay_ms(1000);
  // put your main code here, to run repeatedly:
  ForbiPasserende();
}