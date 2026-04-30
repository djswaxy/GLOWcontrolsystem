
#include "communicationHandler.h"



volatile unsigned char received_bytes[6];
volatile unsigned char rx_index = 0;
volatile unsigned char packet_received = 0;

ISR(USART0_RX_vect) {
	unsigned char data = UDR0;
	if (rx_index == 0 && data != 0xAA) return;
	
	received_bytes[rx_index] = data;
	rx_index++;
	
	if (rx_index >= 8) {
		if (received_bytes[7] == 0xBB) {
			
			packet_received = 1;
		}
	}
}

void initCommunication() {
    DDRE |= 0x00000010;
	DDRE &= 0x11111110;
	sei();
}

void TransmitData(unsigned char message_id, unsigned char data) {
    
}

void Receiver() {
    switch(received_bytes[1]){
        case 0x01:
            setLight(received_bytes[2]);
            break;
        case 0x02:
            setLight(received_bytes[2]);
            break;
    }
}

void ClearReceivedMessage(){
    for (unsigned char i = 0; i < 8; i++) {
	received_bytes[i] = 0;
	}
	rx_index = 0;
	packet_received = 0;
}