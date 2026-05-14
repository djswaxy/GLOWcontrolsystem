#ifndef LED_DRIVER_H
#define LED_DRIVER_H

#include <Arduino.h>

class LEDDriver {
  private:
    int _pin;
    uint8_t _maxBrightness;     
    uint8_t _standbyBrightness; 

  public:
    LEDDriver(int pin);
    void begin();
    
    // Metoder til logik og indstillinger
    void setMaxLight(int percent);
    void setStandbyLight(int percent);
    void setActiveTime(int seconds);
    
    void setBrightness(int value);
    void goActive();
    void goStandby();
};

void setupAllLEDs(LEDDriver leds[], int size);

#endif