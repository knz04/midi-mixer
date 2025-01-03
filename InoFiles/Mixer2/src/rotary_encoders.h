#ifndef ROTARY_ENCODERS_H
#define ROTARY_ENCODERS_H

#include <Arduino.h>
#include <RotaryEncoder.h>
#include "config.h"

extern RotaryEncoder encoders[NUM_ENCODERS];
extern int lastEncoderPos[NUM_ENCODERS];
// Functions
extern bool isPresetLoading;
void initEncoders();
void handleEncoder(int index);

#endif
