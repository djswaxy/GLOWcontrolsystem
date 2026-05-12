#define F_CPU 16000000UL
#include <Arduino.h>
#include <communicationHandler.h>
#include <util/delay.h>
#include <led.h>
#include <uart.h>
extern volatile unsigned char packet_received;

unsigned char lysStyrke;
unsigned char lysTimer;
// Messages
struct {
  unsigned char ID = 0xCC;
  unsigned char DATA[3] = {0xCC, 0xCC, 0xCC};
} connectToPC;

struct {
  unsigned char ID = 0xAC;
  unsigned char DATA[3] = {0x00, 0x18, 0x05};
} settingChangeResponseBoth; // test med respons for både Movement Sens og Light Duration

struct {
  unsigned char ID = 0xAC;
  unsigned char DATA[3] = {0x01, 0x22, 0x00};
} settingChangeResponseMovTrig; // test med respons for både Movement Sens = 34 (%?)

struct {
  unsigned char ID = 0xAC;
  unsigned char DATA[3] = {0x02, 0x07, 0x00};
} settingChangeResponseLightDur; // test med respons for Light Duration = 7s

struct {
  unsigned char ID = 0xAB;
  unsigned char DATA[3] = {0x00, 0x34, 0x00};
} TwentyFourHourSensorToday; // test med passerby's today 0x34 = 52
struct {
  unsigned char ID = 0xAB;
  unsigned char DATA[3] = {0x01, 0x04, 0x11};
} TwentyFourHourSensorMostActiveHour; // test med passerby's today 0x34 = 52
struct {
  unsigned char ID = 0xAB;
  unsigned char DATA[3] = {0x02, 0x66, 0x00};
} TwentyFourHourSensorWeek; //
struct {
  unsigned char ID = 0xAB;
  unsigned char DATA[3] = {0x03, 0x09, 0xC4};
} TwentyFourHourSensorAllTime; // test med ALL TIME = 2500 med high byte så low byte


void setup() {
  initLEDport();
  InitUART0(9600, 8, 1);
  initCommunication();

  toggleLED(5);
}

void loop() {
  if (packet_received == 1) {
      
      // Kjør logikken for å tolke hva Node.js nettopp sendte oss
      Receiver();               
      
      // VELDIG VIKTIG: Nullstill alt slik at Arduinoen er klar for neste pakke!
      ClearReceivedMessage();   
  }

  //_delay_ms(1000);

  /*
  TransmitData(connectToPC.ID, connectToPC.DATA);
  toggleLED(0);
  _delay_ms(1000);
  TransmitData(settingChangeResponseBoth.ID, settingChangeResponseBoth.DATA);
  _delay_ms(1000);
  TransmitData(settingChangeResponseMovTrig.ID, settingChangeResponseMovTrig.DATA);
  _delay_ms(1000);
  TransmitData(settingChangeResponseLightDur.ID, settingChangeResponseLightDur.DATA);
  */

  /* test 24hr sensor
  _delay_ms(1000); 
  TransmitData(TwentyFourHourSensorToday.ID, TwentyFourHourSensorToday.DATA);
  _delay_ms(1000);
  TransmitData(TwentyFourHourSensorMostActiveHour.ID, TwentyFourHourSensorMostActiveHour.DATA);
  _delay_ms(1000);
  TransmitData(TwentyFourHourSensorWeek.ID, TwentyFourHourSensorWeek.DATA);
  _delay_ms(1000);
  TransmitData(TwentyFourHourSensorAllTime.ID, TwentyFourHourSensorAllTime.DATA);
  */
  //ForbiPasserende();
}