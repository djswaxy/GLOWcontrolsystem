#include <Arduino.h>
#include <communicationHandler.h>
#include <util/delay.h>
#include <led.h>
#include <uart.h>
#include <settings.h>
extern volatile unsigned char packet_received;


struct {
  unsigned char ID = 0xCC;
  unsigned char DATA[8] = {0xCC, 0xCC, 0xCC, 0x00, 0x00, 0x00, 0x00, 0x00};
} connectToPC;


void setup() {
  initLEDport();
  InitUART0(9600, 8, 1);
  initCommunication();
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

}