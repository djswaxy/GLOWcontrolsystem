#ifndef LED_H
#define LED_H
/*********************************
* "LED.H"                        *
* Header file for "LED driver"   *
* Version: MA                    *
*********************************/

void initLEDport();
void writeAllLEDs(unsigned char pattern);
void turnOnLED(unsigned char led_nr);
void turnOffLED(unsigned char led_nr);
void toggleLED(unsigned char led_nr);

#endif // LED_H