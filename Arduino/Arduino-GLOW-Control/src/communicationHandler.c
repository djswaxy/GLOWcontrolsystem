
#include "communicationHandler.h"




volatile unsigned char received_bytes[6];
volatile unsigned char rx_index = 0;
volatile unsigned char packet_received = 0;

ISR(USART0_RX_vect) {
    toggleLED(4);
    //TransmitData(0x00, 0x01);
	unsigned char data = UDR0;
	if (rx_index == 0 && data != 0xAA) return;
	
	
	if (rx_index < 6) { // no overflow, added by djswaxy
        received_bytes[rx_index] = data;
        rx_index++;
    }
	if (rx_index >= 5) {
		if (received_bytes[5] == 0xBB) {
			toggleLED(6);
			packet_received = 1;
		}

	} 
    
   
}

void initCommunication() {
    DDRE |= 0b00000010;
	DDRE &= 0b11111110; //changed to byte from hex, added by djswaxy
	sei();
}

void TransmitData(unsigned char message_id, unsigned char* data) {
    unsigned char message[6];

    message[0] = 0xAA; 
    message[1] = message_id;
    message[2] = data[0]; 
    message[3] = data[1];
    message[4] = data[2];
    message[5] = 0xBB;

    for (int i = 0; i < 6; i++)
	{
		SendChar(message[i]);
	}
}
void Parrot() {
    unsigned char ParrotSettingID = received_bytes[1];
    unsigned char ParrotSettingDATA[3] = {received_bytes[2], received_bytes[3], 0x00};
    TransmitData(ParrotSettingID,ParrotSettingDATA);
}
void Receiver() {
    switch(received_bytes[1]){
        case 0xCC: // PC wants to connect
            // PC AND ARDUINO ARE NOW CONNECTED
            break;
        case 0xAC: // setting change
            if(received_bytes[2] == 0x00) {// CHANGE ALL STATES
                // TODO LOW PRIORITY
                // special logic, add so it takes two packets to change all settings
            } 
            if(received_bytes[2] == 0x01) {
                // !!!!ADD ACTUAL SETTING CHANGE LOGIC HERE!!!!
                Parrot();
            } // movement sens
            if(received_bytes[2] == 0x02) {
                // !!!!ADD ACTUAL SETTING CHANGE LOGIC HERE!!!!
                Parrot();
            } // light duration
            if(received_bytes[2] == 0x03) {
                // !!!!ADD ACTUAL SETTING CHANGE LOGIC HERE!!!!
                Parrot();
            } // max light strength
            if(received_bytes[2] == 0x04) {
                // !!!!ADD ACTUAL SETTING CHANGE LOGIC HERE!!!!
                Parrot();
            } // standby light strength
            break;
        case 0xAB: // Sensor Data    
             if(received_bytes[2] == 0x00) { // 24 hour passerbys
                int CurrentDayPasserbys = 68;
            } 
            if(received_bytes[2] == 0x01) {// 24 hour Most Active Hour
                int MostActiveHour = 04; // fra 00 to 24
                int MostActiveHourAmount = 54;

            } // light duration
            if(received_bytes[2] == 0x02) { // Week Passerbys
                int WeekPasserby = 1000;
            } // max light strength
            if(received_bytes[2] == 0x03) { // All Time Passerbys
                int AllTimePasserby = 1000;

            } // standby light strength
            break;
    }
}


void ClearReceivedMessage(){
    for (unsigned char i = 0; i < 6; i++) {
	received_bytes[i] = 0;
	}
	rx_index = 0;
	packet_received = 0;
}
