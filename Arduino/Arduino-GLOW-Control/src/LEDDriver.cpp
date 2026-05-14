#include "LEDDriver.h"

LEDDriver::LEDDriver(int pin) {
  _pin = pin;
  _maxBrightness = 230;    // Standard ~90% [cite: 99]
  _standbyBrightness = 51; // Standard ~20% [cite: 99]
}

void LEDDriver::begin() {
  pinMode(_pin, OUTPUT);
}

void LEDDriver::setMaxLight(int percent) {
  _maxBrightness = map(constrain(percent, 0, 100), 0, 100, 0, 255);
}

void LEDDriver::setStandbyLight(int percent) {
  _standbyBrightness = map(constrain(percent, 0, 100), 0, 100, 0, 255);
}

void LEDDriver::setActiveTime(int seconds) {
  // Logikbrug
}

void LEDDriver::setBrightness(int value) {
  analogWrite(_pin, constrain(value, 0, 255));
}

void LEDDriver::goActive() {
  analogWrite(_pin, _maxBrightness);
}

void LEDDriver::goStandby() {
  analogWrite(_pin, _standbyBrightness);
}

void setupAllLEDs(LEDDriver leds[], int size) {
  for (int i = 0; i < size; i++) {
    leds[i].begin();
    leds[i].setStandbyLight(20); // Projektkrav: 20% [cite: 99]
    leds[i].setMaxLight(90);    // Projektkrav: 90% [cite: 99]
  }
}