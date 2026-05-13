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
    EEPROM.get(0, mvtSensor);
    EEPROM.get(2, lightDuration);
    EEPROM.get(4, standbyLight);
    EEPROM.get(6, activeLight);
}

void getStats() {
    EEPROM.get(8, PasserbyDay);
    EEPROM.get(10, PasserbyMAH);
    EEPROM.get(12, PasserbyMAHAmount);
    EEPROM.get(14, PasserbyWeek);
    EEPROM.get(16, PasserbyAllTime);
}


void sendSettings() {
    unsigned char commandID = 0xAC;
    unsigned char commandDATA[8] = {
        (unsigned char)(mvtSensor >> 8), 
        (unsigned char)(mvtSensor), 
        (unsigned char)(lightDuration >> 8), 
        (unsigned char)(lightDuration),
        (unsigned char)(standbyLight >> 8),
        (unsigned char)(standbyLight),
        (unsigned char)(activeLight >> 8),
        (unsigned char)(activeLight)
    };
    TransmitData(commandID, commandDATA);
}

void saveSettings() {
    EEPROM.put(0, mvtSensor);
    EEPROM.put(2, lightDuration);
    EEPROM.put(4, standbyLight);
    EEPROM.put(6, activeLight);
}
void saveStats() {
    EEPROM.put(8, PasserbyDay);
    EEPROM.put(10, PasserbyMAH);
    EEPROM.put(12, PasserbyMAHAmount);
    EEPROM.put(14, PasserbyWeek);
    EEPROM.put(16, PasserbyAllTime);
}

