#include <settings.h>
#include <communicationHandler.h>


unsigned short mvtSensor = 0x003C;
unsigned short lightDuration = 0x0064;
unsigned short standbyLight = 0x03E8;
unsigned short activeLight = 0x2710;

void getSettings() {
    mvtSensor = EEPROM.read(0);
    lightDuration = EEPROM.read(1);
    standbyLight = EEPROM.read(2);
    activeLight = EEPROM.read(3);
}

void sendSettings() {
    unsigned char commandID = 0xAC;
    unsigned char commandDATA[8] = {
        mvtSensor >> 8, 
        mvtSensor, 
        lightDuration >> 8, 
        lightDuration,
        standbyLight >> 8,
        standbyLight,
        activeLight >> 8,
        activeLight
    };
    TransmitData(commandID, commandDATA);
}

void saveSettings() {
    EEPROM.write(0, mvtSensor);
    EEPROM.write(1, lightDuration);
    EEPROM.write(2, standbyLight);
    EEPROM.write(3, activeLight);
}

