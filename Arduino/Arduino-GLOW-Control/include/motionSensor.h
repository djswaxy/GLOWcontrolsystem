#ifndef MOTION_SENSOR_H
#define MOTION_SENSOR_H

void setupMotionSensors();

void setDistance(int distanceValue);
void setMovementThreshold(int thresholdValue);

bool motionDetected(int sensorIndex);
int getDistance(int sensorIndex);

#endif