#include "LightSensor.h"
#include "communicationHandler.h"

#define LED_PIN 4
#define LUX_THRESHOLD 40.0

LightSensor sensor;
volatile bool interruptFired = false;

void onLightInterrupt() {
    interruptFired = true;
}

void setup() {
    initCommunication();

    pinMode(3, INPUT_PULLUP);
    pinMode(LED_PIN, OUTPUT);

    if (!sensor.init()) {
        while(1);
    }

    sensor.setSensitivity(LUX_THRESHOLD);
    sensor.enablePersistent();
    sensor.clearInterrupt();

    attachInterrupt(digitalPinToInterrupt(3), onLightInterrupt, CHANGE);
}

void loop() {
    sensor.printLuxLevels();

    if (interruptFired) {
        interruptFired = false;
        sensor.clearInterrupt();

        int lux = sensor.getLux();

        if (lux >= 0 && lux < LUX_THRESHOLD) {
            digitalWrite(LED_PIN, HIGH);
        } else {
            digitalWrite(LED_PIN, LOW);
        }
    }

    delay(1500);
}