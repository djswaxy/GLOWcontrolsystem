/*
 * soundPlayer.c
 *
 * Created: 04-12-2025 11:13:31
 *  Author: magne + johannes
 */ 

#include "soundPlayer.h"

// Must be volatile to be changed in an ISR
volatile unsigned char receivedBytes[8];
volatile unsigned char rxIndex = 0;
volatile unsigned char packetReceived = 0;

ISR(USART0_RX_vect) {
	unsigned char data = UDR0;
	// If we are on first byte and that byte is not the start byte something went wrong
	if (rxIndex == 0 && data != 0x7E) return;
	
	// Insert data and increment index
	receivedBytes[rxIndex] = data;
	rxIndex++;
	
	if (rxIndex >= 8) {
		if (receivedBytes[7] == 0xEF) {
			// Successfully received packet
			packetReceived = 1;
		}
	}
}

void InitSound() {
	// Set PINE leg 1 to output and leg 0 to input and enable global interrupts
	DDRE |= 0x00000010;
	DDRE &= 0x11111110;
	sei();
}

void ClearReceiveBuffer() {
	// Clears all variables for receive buffer including array
	for (unsigned char i = 0; i < 8; i++) {
		receivedBytes[i] = 0;
	}
	rxIndex = 0;
	packetReceived = 0;
}

unsigned char WaitForAcknowledgment() {
	// Make sure we dont wait too long
	unsigned int buffer = 0;
	unsigned int bufferMax = 50000;
	while(!packetReceived) {
		buffer++;
		if (buffer >= bufferMax) return 0;
	}
	// Could use this boolean statement to test later if SOMO received command correctly
	return (receivedBytes[1] == 0x41);
}

void SendPacket(unsigned char commandType, unsigned char value) {
	//Declare command array and enable SOMO feedback
	unsigned char command[8];
	unsigned char feedback = 1;
	
	//Calculate checkSum
	int checkSum = 0xFFFF - (commandType + feedback + 0x00 + value) + 1;
	
	//Put together command from type and value
	command[0] = 0x7E; //Start signal
	command[1] = commandType; // playsound = 0x03, setvolume = 0x06
	command[2] = feedback; // 1 = feedback
	command[3] = 0x00;
	command[4] = value;
	command[5] = (checkSum >> 8);
	command[6] = checkSum;
	command[7] = 0xEF; //End signal
	
	//Command is ready to be sent. Clear buffer before and wait for SOMO acknowledgment after
	ClearReceiveBuffer();
	SendCommand(command);
	WaitForAcknowledgment();
}

void PlaySound(unsigned char id) {
	// Send sound packet with sound ID number
	SendPacket(0x03, id);
}

void SetVolume(unsigned char volume) {
	// Send volume packet with volume level between 0-30
	if (volume < 0) {
		volume = 0;
	}
	if (volume > 30) {
		volume = 30;
	}
	SendPacket(0x06, volume);
}

void SendCommand(unsigned char* command) {
	for (int i = 0; i < 8; i++)
	{
		SendChar(command[i]);
	}
}