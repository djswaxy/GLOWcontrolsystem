
#include "communicationHandler.h"



ISR(){

}

void initCommunication() {
    //DDRE |= 0x00000010;
	//DDRE &= 0x11111110;
	sei();
}

void TransmitData(unsigned char message_id, unsigned char data) {

 }

void Receiver(unsigned char message_id) {

}
