#define F_CPU 16000000UL
#include <Arduino.h>
#include <communicationHandler.h>
#include <util/delay.h>
#include <led.h>
#include <uart.h>

unsigned char lysStyrke;
unsigned char lysTimer;
// Messages
struct {
  unsigned char ID = 0xCC;
  unsigned char DATA[3] = {0xCC, 0xCC, 0xCC};
} connectToPC;

void setup() {
  initLEDport();
  InitUART0(9600, 8, 1);
  initCommunication();

  toggleLED(5);
}

void loop() {
  _delay_ms(1000);
  TransmitData(connectToPC.ID, connectToPC.DATA);
  toggleLED(0);
  //ForbiPasserende();
}