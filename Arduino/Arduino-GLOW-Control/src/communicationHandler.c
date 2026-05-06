
#include "communicationHandler.h"

volatile unsigned char received_bytes[6];
volatile unsigned char rx_index = 0;
volatile unsigned char packet_received = 0;

static void processIncomingByte(unsigned char data) {
    if (rx_index == 0 && data != 0xAA) {
        return;
    }

    if (rx_index < 6) {
        received_bytes[rx_index] = data;
        rx_index++;
    }

    if (rx_index == 6) {
        if (received_bytes[5] == 0xBB) {
            packet_received = 1;
        }
        rx_index = 0;
    }
}

void initCommunication() {
    // UART0 pin direction is handled by the UART peripheral.
}

void pollCommunication() {
    while (CharReady()) {
        toggleLED(4);
        processIncomingByte((unsigned char)ReadChar());
    }
}

void TransmitData(unsigned char message_id, unsigned char data) {
    unsigned char message[6];

    message[0] = 0xAA; 
    message[1] = message_id;
    message[2] = data; 
    message[3] = 0x00;
    message[4] = 0x00;
    message[5] = 0xBB;

    for (int i = 0; i < 6; i++)
	{
        SendChar((char)message[i]);
	}
}

void ForbiPasserende(){
    TransmitData(0x02, 0x01);
}

void Receiver() {
    if (!packet_received) {
        return;
    }

    toggleLED(6);
    switch(received_bytes[1]){
        case 0x01:
            break;
        case 0x02:
            break;
    }

    packet_received = 0;
}

void ClearReceivedMessage(){
    for (unsigned char i = 0; i < 6; i++) {
	received_bytes[i] = 0;
	}
	rx_index = 0;
	packet_received = 0;
}
