#ifndef PRESETS_H
#define PRESETS_H

#include "config.h"
#include "button.h"
#include "faders.h"
#include "rotary_encoders.h"
#include "mqtt_manager.h" // Include MQTTManager here

// Forward declaration for Button struct

// Function declarations
void initPresets();
void savePreset(int index, int encoderValues[], int faderValues[], int buttons[]);
void loadPreset(int index, int encoderValues[], int faderValues[], int buttons[]);
void updatePresetSelection();
void handlePresetButton(int encoderValues[], int faderValues[], int buttons[], MQTTManager& mqttManager); // Updated declaration

#endif // PRESETS_H
