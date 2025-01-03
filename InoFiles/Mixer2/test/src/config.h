#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// Serial communication settings
#define BAUD_RATE 115200

// Define the number of rotary encoders, faders, and buttons
#define NUM_ENCODERS 6
#define NUM_FADERS 6
#define NUM_BUTTONS 6
#define NUM_PRESETS 8

extern const char* mqtt_server;
extern const char* mqtt_user;
extern const char* mqtt_pass;
extern const int mqtt_port; 


// Define pins for rotary encoders

const int encoderClkPins[NUM_ENCODERS] = {1,42,15,17,46,13};
const int encoderDtPins[NUM_ENCODERS] = {2,41,16,18,9,14};

//const int encoderClkPins[NUM_ENCODERS] = {16,1,9,14,18,42};
//const int encoderDtPins[NUM_ENCODERS] = {15,2,46,13,17,41};

// Define MUX signal and select pins
const int signalPinButton = 6;
const int signalPinFader = 5;
const int s0 = 35;
const int s1 = 36;
const int s2 = 37;
const int s3 = 38;

// Preset button and encoder pins
const int PRESET_ENCODER_CLK = 10;
const int PRESET_ENCODER_DT = 12;
const int PRESET_BUTTON_PIN = 11;


#endif
