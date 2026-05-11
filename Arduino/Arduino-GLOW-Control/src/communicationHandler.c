
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
    
    TransmitData(0xFF, 0xFF);
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

void Receiver() {
    switch(received_bytes[1]){
        case 0x01:
            break;
        case 0x02:
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
