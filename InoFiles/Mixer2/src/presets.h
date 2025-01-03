#ifndef PRESETS_H
#define PRESETS_H

#include "config.h"
#include "button.h"
#include "faders.h"
#include "rotary_encoders.h"
#include "mqtt_manager.h" // Include MQTTManager here

// Forward declaration for Button struct

// Function declarations
// Structure to hold preset data
struct Preset {
    int faderValues[NUM_FADERS];
    int encoderValues[NUM_ENCODERS];
    int buttonStates[NUM_BUTTONS];
};

// Extern declarations for global preset variables
extern Preset presets[NUM_PRESETS];
extern int selectedPreset;

void initStorage();
void initPresets();
void savePreset(int index, int encoderValues[], int faderValues[], bool buttonToggleStates[]);
void loadPreset(int index, int encoderValues[], int faderValues[], bool buttonToggleStates[]);
void updatePresetSelection();
void handlePresetButton(int encoderValues[], int faderValues[], int buttons[], MQTTManager& mqttManager); // Updated declaration

#endif // PRESETS_H
