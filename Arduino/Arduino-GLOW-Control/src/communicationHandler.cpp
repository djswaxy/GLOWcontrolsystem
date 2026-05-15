
#include "communicationHandler.h"
#include "settings.h"
#include "motionSensor.h"
extern void applyLightSettings(unsigned short maxPercent, unsigned short standbyPercent);

extern unsigned short mvtSensor;
extern unsigned short dist;
extern unsigned short standbyLight;
extern unsigned short activeLight;

extern unsigned int PasserbyDay;
extern unsigned int PasserbyMAH;
extern unsigned int PasserbyMAHAmount;
extern unsigned int PasserbyWeek;
extern unsigned int PasserbyAllTime;

volatile unsigned char messageBegun = 0;
volatile unsigned char messageID = 0;
volatile unsigned char messageDATA[8];
volatile unsigned char rx_index = 0;
volatile unsigned char packet_received = 0;

ISR(USART0_RX_vect) {
    toggleLED(4);
	unsigned char data = UDR0;
    
    if (rx_index == 0) {
        if (data == 0xAA) {
            messageBegun = 1;
            return;
        }
        else if (messageBegun && !messageID) {
            messageID = data;
            return;
        }
    }
	
	if (rx_index < 8) {
        messageDATA[rx_index] = data;
        rx_index++;
        return;
    }
	if (rx_index == 8) {
		if (data == 0xBB) {
			toggleLED(6);
			packet_received = 1;
		}
        else { //handler for packets som blir fucked
            ClearReceivedMessage();
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
    unsigned char ParrotSettingID = messageID;
    unsigned char ParrotSettingDATA[8] = {};
    for (int i = 0; i < 8; i++) {
        ParrotSettingDATA[i] = messageDATA[i];
    }
    TransmitData(ParrotSettingID,ParrotSettingDATA);

}
void Receiver() {
    switch(messageID){
        case 0xCC:
        { // PC wants to connect
            // PC AND ARDUINO ARE NOW CONNECTED
            break;
        }
        case 0xAC: 
        {
            unsigned int newSens    = (messageDATA[0] << 8) | messageDATA[1];
            unsigned int newDist    = (messageDATA[2] << 8) | messageDATA[3];
            unsigned int newMaxL    = (messageDATA[4] << 8) | messageDATA[5];
            unsigned int newStandby = (messageDATA[6] << 8) | messageDATA[7];
            mvtSensor = newSens;
            dist = newDist;
            activeLight = newMaxL;
            standbyLight = newStandby;
            
            applyLightSettings(activeLight, standbyLight);

            setMovementThreshold(mvtSensor);
            setDistance(dist);

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
    ClearReceivedMessage();
}


void ClearReceivedMessage(){
    for (unsigned char i = 0; i < 8; i++) {
	    messageDATA[i] = 0;
	}
    messageBegun = 0;
    messageID = 0;
	rx_index = 0;
	packet_received = 0;
}
