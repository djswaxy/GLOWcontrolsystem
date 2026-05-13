#include <settings.h>
#include <communicationHandler.h>


unsigned short mvtSensor = 0x003C;
unsigned short lightDuration = 0x0064;
unsigned short standbyLight = 0x03E8;
unsigned short activeLight = 0x2710;

void getSettings() {
    unsigned char commandID = 0xAC;
    unsigned char commandDATA[8] = {
        mvtSensor << 8, 
        mvtSensor, 
        lightDuration << 8, 
        lightDuration,
        standbyLight << 8,
        standbyLight,
        activeLight << 8,
        activeLight
    };
    TransmitData(commandID, commandDATA);
}