/*
 * 	fdcan_translator.c
 *
 *  Created on: Mar 7, 2026
 *      Author: magne
 */
#include <stdint.h>
#include "fdcan_translator.h"
#include "FreeRTOS.h"


// Drivers
#include "battery.h"
#include "speed.h"
#include "ready.h"
#include "mode.h"
#include "fault.h"
#include "power.h"
#include "motor.h"
#include "fdcan_mailer.h"

extern MailboxNode* RxMailbox;

void Distribute(uint32_t message_id) {
	// Takes the signal and calls the function with their value.
	switch(message_id) {
		case 0x20:
			char* speed = Seperate_Message(0, 4);
			char* volt = Seperate_Message(6, 2);

			Translate_Speed(speed);
			Translate_Voltage(volt);


			free(speed);
			free(volt);

			break;
		case 0x21:
			char* current = Seperate_Message(2, 2);

			Translate_Current(current);

			free(current);

			break;
		case 0x22:
			char* motor = Seperate_Message(2, 2);
			char* fault = Seperate_Message(4, 1);

			Translate_Motor(motor);
			Translate_Fault(*fault);

			free(motor);
			free(fault);

			break;
		case 0x23:

			break;
		case 0x24:
			char* ready = Seperate_Message(3, 1);
			Translate_Ready(*ready);
			free(ready);

			break;
	}
}

char* Seperate_Message(int startByte, int size) {
    char* arr = (char*)malloc(size * sizeof(char));
    if (arr == NULL) return arr;
    for (int i = 0; i < size; i++) {
        arr[i] = RxMailbox->message_data[i + startByte];
    }
    return arr;
}

void Translate_Speed(char* erpm_bytes) {
	uint32_t ERPM = (uint32_t)(erpm_bytes[0] << 24) | (erpm_bytes[1] << 16) | (erpm_bytes[2] << 8) | erpm_bytes[3];
	Set_RPM(ERPM);

}

void Translate_Power(char* power_byte) {
	Set_Power(power_byte);

}

void Translate_Current(char* current_byte) {
	uint16_t raw_current = (uint16_t)((current_byte[0] << 8) | current_byte[1]);

	Set_Current(raw_current);
}

void Translate_Voltage(char* volt_bytes) {
	uint16_t raw_voltage = (uint16_t)((volt_bytes[0] << 8) | volt_bytes[1]);

	 Set_Voltage(raw_voltage);
}

void Translate_Fault(char fault_byte) {
	Set_Fault(fault_byte);
}

void Translate_Ready(char ready) {
	// Set_Ready();
}

void Translate_Motor(char* temp) {
	float scaled_temp = ((temp[0] << 8) + temp[1]) / 10.0f; // Bit shift by 8 and dividing by 10 (scaling)
	Set_Motor_Temperature(scaled_temp);
}

void Translate_Battery() {


}

void Translate_Mode(int mode) {


}

