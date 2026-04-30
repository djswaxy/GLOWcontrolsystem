
#ifndef COMMUNICATION_H
#define COMMUNICATION_H

#ifdef __cplusplus
extern "C" {
#endif

#include <avr/io.h>
#include "uart.h"
#include <avr/interrupt.h>


void setLight(unsigned char strength);

#ifdef __cplusplus
}
#endif

#endif // COMMUNICATION_H