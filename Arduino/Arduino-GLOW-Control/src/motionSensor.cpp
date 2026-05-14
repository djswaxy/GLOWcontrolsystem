#include "motionSensor.h"
#include <Arduino.h>

const int numberOfSensors = 3;

// dig-pins
const int trigPins[numberOfSensors] = {22, 24, 26};
const int echoPins[numberOfSensors] = {23, 25, 27};

int maxDistance = 400;
int movementThreshold = 10;

int lastDistance[numberOfSensors] = {-1, -1, -1};

void setupMotionSensors() {
  for (int i = 0; i < numberOfSensors; i++) {
    pinMode(trigPins[i], OUTPUT);
    pinMode(echoPins[i], INPUT);
  }

  delay(1000);

  for (int i = 0; i < numberOfSensors; i++) {
    lastDistance[i] = getDistance(i);
  }
}

void setDistance(int distanceValue) { // Adjust range cm (2cm - 400cm)
  maxDistance = distanceValue;
}

void setMovementThreshold(int thresholdValue) { // Adjust sensitivity cm ()
  movementThreshold = thresholdValue;
}

bool motionDetected(int sensorIndex) {
  if (sensorIndex < 0 || sensorIndex >= numberOfSensors) {
    return false;
  }

  int currentDistance = getDistance(sensorIndex);

  if (currentDistance < 0) {
    return false;
  }

  if (currentDistance > maxDistance) {
    lastDistance[sensorIndex] = currentDistance;
    return false;
  }

  if (lastDistance[sensorIndex] < 0) {
    lastDistance[sensorIndex] = currentDistance;
    return false;
  }

  int change = abs(currentDistance - lastDistance[sensorIndex]);

  lastDistance[sensorIndex] = currentDistance;

  return change >= movementThreshold;
}

int getDistance(int sensorIndex) {
  if (sensorIndex < 0 || sensorIndex >= numberOfSensors) {
    return -1;
  }

  long duration;

  digitalWrite(trigPins[sensorIndex], LOW);
  delayMicroseconds(3);

  digitalWrite(trigPins[sensorIndex], HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPins[sensorIndex], LOW);

  duration = pulseIn(echoPins[sensorIndex], HIGH, 30000);

  if (duration == 0) {
    return -1;
  }

  int distance = duration * 0.0343 / 2;

  if (distance < 2 || distance > 400) {
    return -1;
  }

  return distance;
}