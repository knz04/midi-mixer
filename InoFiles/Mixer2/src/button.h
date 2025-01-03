#ifndef BUTTON_H
#define BUTTON_H

#include "config.h"
extern int buttonStates[NUM_BUTTONS];
extern bool buttonToggleStates[NUM_BUTTONS];
void handleButtons();
struct Button {
    int previousState;
};


#endif
