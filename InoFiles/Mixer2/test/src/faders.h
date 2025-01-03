#ifndef FADERS_H
#define FADERS_H
#include "config.h"

extern bool faderSynced[NUM_FADERS]; // Indicates if the fader is in sync
extern int lastFaderValue[NUM_FADERS];
void initializeFaderReadings();
void handleFaders();

#endif
