#include "LightSensor.h"

LightSensor::LightSensor() 
    : tsl_(2591), luxThreshold_(50.0) {}

bool LightSensor::init() {
    if (!tsl_.begin()) {
        Serial.println("TSL2591 ikke fundet — tjek wiring!");
        return false;
    }

    tsl_.setGain(TSL2591_GAIN_LOW);
    tsl_.setTiming(TSL2591_INTEGRATIONTIME_100MS);

    enablePersistent();  // tænd efter setGain/setTiming
    return true;
}

void LightSensor::setSensitivity(float luxThreshold) {
    luxThreshold_ = luxThreshold;

    uint16_t rawLower = (uint16_t)(luxThreshold_ * 264.1);
    uint16_t rawUpper = rawLower * 2;

    tsl_.registerInterrupt(rawLower, rawUpper, TSL2591_PERSIST_5);
    enablePersistent();  // ← tænd igen efter registerInterrupt slukker den
}

int LightSensor::getLux() {
    uint32_t lum = tsl_.getFullLuminosity(); // biblioteket kalder disable() her
    enablePersistent();                       // vi tænder den igen med det samme

    uint16_t ch0 = lum & 0xFFFF;
    uint16_t ch1 = lum >> 16;

    if (ch0 == 0xFFFF || ch1 == 0xFFFF) {
        return -1;
    }

    lux_ = (int)tsl_.calculateLux(ch0, ch1);
    enablePersistent();                       // og igen efter calculateLux
    return lux_;
}

void LightSensor::printLuxLevels() {
    Serial.print("Lux: ");
    Serial.print(getLux());
    Serial.print("  |  Threshold: ");
    Serial.println(luxThreshold_);
}

void LightSensor::enablePersistent() {
    // Vi skriver direkte til sensoren via Wire
    // uden at gå gennem Adafruit biblioteket
    Wire.beginTransmission(0x29);  // TSL2591 I2C adresse
    Wire.write(0xA0 | 0x00);       // COMMAND_BIT | ENABLE register
    Wire.write(0x13);              // PON | AEN | AIEN (tænd + interrupt)
    Wire.endTransmission();
}

void LightSensor::clearInterrupt() {
    tsl_.clearInterrupt();
    enablePersistent();  // genaktiver efter clear
}