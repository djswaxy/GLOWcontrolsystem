#ifndef LIGHTSENSOR_H
#define LIGHTSENSOR_H

#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_TSL2591.h>

#define TSL_INT_PIN 2  // D2 - INT0

class LightSensor {
private:
    Adafruit_TSL2591 tsl_;
    float luxThreshold_;
    int lux_;

public:
    LightSensor();

    bool init();
    void setSensitivity(float luxThreshold);  // Set lux niveau for interrupt
    int  getLux();
    void printLuxLevels();
    void enablePersistent();  // Holder sensoren tændt med interrupt
    void clearInterrupt();
};

#endif