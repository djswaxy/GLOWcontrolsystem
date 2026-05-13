#include <settings.h>
#include <communicationHandler.h>


unsigned short mvtSensor = 0x003C;
unsigned short lightDuration = 0x0064;
unsigned short standbyLight = 0x03E8;
unsigned short activeLight = 0x2710;
unsigned int PasserbyDay = 60;
unsigned int PasserbyMAH = 04; // fra 00 til 24
unsigned int PasserbyMAHAmount = 52;
unsigned int PasserbyWeek = 320;
unsigned int PasserbyAllTime = 980;

void getSettings() {
    mvtSensor = EEPROM.read(0);
    lightDuration = EEPROM.read(1);
    standbyLight = EEPROM.read(2);
    activeLight = EEPROM.read(3);
}

void getStats() {
    PasserbyDay = EEPROM.read(4);
    PasserbyMAH = EEPROM.read(5);
    PasserbyMAHAmount = EEPROM.read(6);
    PasserbyWeek = EEPROM.read(7);
    PasserbyAllTime = EEPROM.read(8);
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

void saveStats() {
    EEPROM.write(4, PasserbyDay);
    EEPROM.write(5, PasserbyMAH);
    EEPROM.write(6, PasserbyMAHAmount);
    EEPROM.write(7, PasserbyWeek);
    EEPROM.write(8, PasserbyAllTime);
}