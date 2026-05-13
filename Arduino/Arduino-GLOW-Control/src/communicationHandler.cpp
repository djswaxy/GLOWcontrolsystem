
#include "communicationHandler.h"
#include "settings.h"


extern unsigned short mvtSensor;
extern unsigned short lightDuration;
extern unsigned short standbyLight;
extern unsigned short activeLight;


 unsigned int dinSensVariabel = 20;
 unsigned int dinDurVariabel = 30;
 unsigned int dinMaxLVariabel = 70;
 unsigned int dinStandbyVariabel = 40;
 unsigned int PasserbyDay = 60;
 unsigned int PasserbyMAH = 04; // fra 00 til 24
 unsigned int PasserbyMAHAmount = 52;
 unsigned int PasserbyWeek = 320;
 unsigned int PasserbyAllTime = 980;




volatile unsigned char received_bytes[11];
volatile unsigned char rx_index = 0;
volatile unsigned char packet_received = 0;

ISR(USART0_RX_vect) {
    toggleLED(4);
    //TransmitData(0x00, 0x01);
	unsigned char data = UDR0;
    
	if (rx_index == 0 && data != 0xAA) return;
	
	
	if (rx_index < 11) { // no overflow, added by djswaxy
        received_bytes[rx_index] = data;
        rx_index++;
    }
	if (rx_index == 11) {
		if (received_bytes[10] == 0xBB) {
			toggleLED(6);
			packet_received = 1;
		}
        else { //handler for packets som blir fucked
            rx_index = 0;
        }

	} 
    
   
}

void initCommunication() {
    DDRE |= 0b00000010;
	DDRE &= 0b11111110; //changed to byte from hex, added by djswaxy
	sei();
}

void TransmitData(unsigned char message_id, unsigned char* data) {
    unsigned char message[11];

    message[0] = 0xAA; 
    message[1] = message_id;
    message[2] = data[0]; 
    message[3] = data[1];
    message[4] = data[2];
    message[5] = data[3]; 
    message[6] = data[4];
    message[7] = data[5];
    message[8] = data[6]; 
    message[9] = data[7];
    message[10] = 0xBB;

    for (int i = 0; i < 11; i++)
	{
		SendChar(message[i]);
	}
}
void Parrot() {
    unsigned char ParrotSettingID = received_bytes[1];
    unsigned char ParrotSettingDATA[8] = {};
    for (int i = 0; i < 8; i++) {
        ParrotSettingDATA[i] = received_bytes[i+2];
    }
    TransmitData(ParrotSettingID,ParrotSettingDATA);

}
void Receiver() {
    switch(received_bytes[1]){
        case 0xCC:
        { // PC wants to connect
            // PC AND ARDUINO ARE NOW CONNECTED
            break;
        }
        case 0xAC: 
        {
            unsigned int newSens    = (received_bytes[2] << 8) | received_bytes[3];
            unsigned int newDur     = (received_bytes[4] << 8) | received_bytes[5];
            unsigned int newMaxL    = (received_bytes[6] << 8) | received_bytes[7];
            unsigned int newStandby = (received_bytes[8] << 8) | received_bytes[9];
            mvtSensor = newSens;
            lightDuration = newDur;
            standbyLight = newMaxL;
            activeLight = newStandby;

            saveSettings();
            Parrot();
         // SEND DISSE TIL SENSORMETODER   
         break;
        }
       
        case 0xAB: { // Sensor Data    
            unsigned char currentData[8];
           

            // Deler 16-bits tallene i Arduino-minnet opp i High og Low bytes
            currentData[0] = PasserbyDay;
            currentData[1] = PasserbyMAH;
            currentData[2] = PasserbyMAHAmount;
            currentData[3] = (PasserbyWeek >> 8) & 0xFF;

            currentData[4] =  PasserbyWeek & 0xFF;
            currentData[5] = (PasserbyAllTime >> 8) & 0xFF;

            currentData[6] = PasserbyAllTime & 0xFF;
            currentData[7] = 0x00;

            // Send dem tilbake med ID 0xAC (slik at Node.js fanger den opp i handleBulkSettingResponse)
            TransmitData(0xAB, currentData);
            break;
        }
        case 0xAD: // PC ber om å få tilsendt nåværende innstillinger
        {
            sendSettings();
            break;
        }
        case 0xEE:
            Parrot();
            break;    
    }
}


void ClearReceivedMessage(){
    for (unsigned char i = 0; i < 11; i++) {
	received_bytes[i] = 0;
	}
	rx_index = 0;
	packet_received = 0;
}
