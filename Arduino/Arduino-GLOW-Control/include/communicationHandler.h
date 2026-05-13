
#ifndef COMMUNICATION_H
#define COMMUNICATION_H


#include <avr/io.h>
#include "uart.h"
#include <avr/interrupt.h>
#include "led.h"

// Initialize Communication
void initCommunication();

// Send Data
void TransmitData(unsigned char message_id, unsigned char* data);

// Receive Data
void Receiver();

void ClearReceivedMessage();


#endif // COMMUNICATION_H