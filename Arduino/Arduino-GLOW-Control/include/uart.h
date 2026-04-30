/****************************************
* "uart.h":                             *
* Header file for Mega2560 UART driver. *
* Using UART 0.                         *
*                                       *
*****************************************/ 
#ifndef UART_H_
#define UART_H_

#ifdef __cplusplus
extern "C" {
#endif

//BaudRate is often 9600, DataBit is often 8-bit and Rx_Int is either 1 or 0
void InitUART0(unsigned long BaudRate, unsigned char DataBit, unsigned char Rx_Int);
unsigned char CharReady();
char ReadChar();
void SendChar(char Tegn);
void SendString(char* Streng);
void SendInteger(int Tal);
/****************************************/

#ifdef __cplusplus
}
#endif

#endif /* UART_H_ */