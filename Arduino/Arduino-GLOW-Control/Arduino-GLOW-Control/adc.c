/*
 * adc.c
 *
 * Created: 25-11-2025 10:29:42
 *  Author: magne
 */

#include <avr/io.h>
#include "adc.h"

void InitADC() {
	DDRF = 0x00;
	ADCSRA = 0b10000111; //set prescaler to 128 || ADEN == bit 7 || interrupt == bit 3
	ADMUX = 0b01000000; //set inputs to ADC0, bit 0-4 || ADLAR == bit 5 || AVCC = 5V, bit 6
	//ADCSRB = 0b00000000; //set inputs to ADC0, bit 5	
}

void StartADC() {
	ADCSRA |= (1 << ADSC);
}
