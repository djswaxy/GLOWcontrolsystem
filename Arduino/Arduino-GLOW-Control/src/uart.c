/************************************************
* "uart.c":                                     *
* Implementation file for Mega2560 UART driver. *
* Using UART 0.                                 *
*                                               *
*************************************************/
#include <avr/io.h>
#include <stdlib.h>
#include "uart.h"

// Target CPU frequency
#define XTAL 16000000

/*************************************************************************
UART 0 initialization:
    Asynchronous mode.
    Baud rate = 9600.
    Data bits = 8.
    RX and TX enabled.
    No interrupts enabled.
    Number of Stop Bits = 1.
    No Parity.
    Baud rate = 9600.
    Data bits = 8.
*************************************************************************/
void InitUART0(unsigned long BaudRate, unsigned char DataBit, unsigned char Rx_Int)
{
	if (BaudRate < 300 || BaudRate > 115200){
		return;
	}
	if (DataBit < 5 || DataBit > 8){
		return;
	}
	if (Rx_Int){
		UCSR0B = 1 << RXCIE0;
	}
	
	unsigned int ubrrValue = (16000000 + (8L * BaudRate)) / (16L *BaudRate) - 1;
	UBRR0H = (unsigned char)(ubrrValue >> 8);
	UBRR0L = (unsigned char)ubrrValue;
	
	uint8_t tempUCSR0B = 0;
	uint8_t tempUCSR0C = 0;
	
	switch (DataBit) {
		case 5:
			break;
		case 6:
			tempUCSR0C |= (1 << UCSZ00);
			break;
		case 7:
			tempUCSR0C |= (1 << UCSZ01);
			break;
		case 8:
			tempUCSR0C |= (1 << UCSZ01) | (1 << UCSZ00);
			break;
	}

	tempUCSR0B |= (1 << RXEN0) | (1 << TXEN0);
	UCSR0B |= tempUCSR0B;
	UCSR0C |= tempUCSR0C;
}

/*************************************************************************
  Returns 0 (FALSE), if the UART has NOT received a new character.
  Returns value <> 0 (TRUE), if the UART HAS received a new character.
*************************************************************************/
unsigned char CharReady()
{
	return (UCSR0A & (1 << RXC0));
}

/*************************************************************************
Awaits new character received.
Then this character is returned.
*************************************************************************/
char ReadChar()
{
	while ((UCSR0A & (1 << RXC0)) == 0)
	{}
	return UDR0;
}

/*************************************************************************
Awaits transmitter register ready.
Then send the character.
Parameter :
	Tegn : Character for sending. 
*************************************************************************/
void SendChar(char Tegn)
{
	while ((UCSR0A & (1 << UDRE0)) == 0)
	{}
	UDR0 = Tegn;
}

/*************************************************************************
Sends 0 terminated string.
Parameter:
   Streng: Pointer to the string. 
*************************************************************************/
void SendString(char* Streng)
{
	while (*Streng != '\0')
	{
		SendChar(*Streng);
		Streng++;
	}
}

/*************************************************************************
Converts the integer "Tal" to an ASCII string - and then sends this string
using the USART.
Makes use of the C standard library <stdlib.h>.
Parameter:
    Tal: The integer to be converted and sent. 
*************************************************************************/
void SendInteger(int  Tal)
{   
	char newNum[8];
	itoa(Tal, newNum, 10);
	SendString(newNum);
}

/************************************************************************/