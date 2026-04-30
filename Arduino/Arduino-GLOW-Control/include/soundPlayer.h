/*
 * soundPlayer.h
 *
 * Created: 04-12-2025 11:13:47
 *  Author: magne + johannes
 */ 

#ifndef SOUNDPLAYER_H_
#define SOUNDPLAYER_H_

#ifdef __cplusplus
extern "C" {
#endif

#include <avr/io.h>
#include "uart.h"
#include <avr/interrupt.h>

// Public

void InitSound(); // Initiate Sound
void PlaySound(unsigned char id); // Play sound with id: (unsigned char)
void SetVolume(unsigned char volume); // Set specific volume: (unsigned char)

// Private

void SendPacket(unsigned char commandType, unsigned char value); // Creates command with specific command type and value and sends it to SendCommand();
void SendCommand(unsigned char* command); // Sends the created Packet as a command using SendChar in uart.h
void ClearReceiveBuffer(); // Clears all variables for receive buffer including array
unsigned char WaitForAcknowledgment(); // Waits until SOMO-II is ready to receive command

#ifdef __cplusplus
}
#endif

#endif /* SOUNDPLAYER_H_ */