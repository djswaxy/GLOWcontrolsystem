
#ifndef COMMUNICATION_H
#define COMMUNICATION_H

#ifdef __cplusplus
extern "C" {
#endif

#include <avr/io.h>
#include "uart.h"
#include <avr/interrupt.h>
#include "led.h"

// Initialize Communication
void initCommunication();

// Send Data
void TransmitData(unsigned char message_id, unsigned char data);
void ForbiPasserende();

// Receive Data
void Receiver();

void ClearReceivedMessage();

#ifdef __cplusplus
}
#endif

#endif // COMMUNICATION_H