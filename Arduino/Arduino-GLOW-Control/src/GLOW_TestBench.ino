#include "LEDDriver.h"

// Pins 2, 3, 4, 5, 6
LEDDriver leds[] = { LEDDriver(2), LEDDriver(3), LEDDriver(4), LEDDriver(5), LEDDriver(6) };
const int numLeds = 5;

void setup() {
  setupAllLEDs(leds, numLeds);
}

void loop() {
  for (int i = 0; i < numLeds; i++) {
    // Fade op (1 sekund)
    for (int v = 0; v <= 255; v++) {
      leds[i].setBrightness(v);
      delay(4); // 255 * 4ms ≈ 1 sekund [cite: 469]
    }
    // Fade ned (1 sekund)
    for (int v = 255; v >= 0; v--) {
      leds[i].setBrightness(v);
      delay(4); // 255 * 4ms ≈ 1 sekund [cite: 471]
    }
    
    leds[i].goStandby(); // Sæt til standby efter fade
    delay(200);
  }
}