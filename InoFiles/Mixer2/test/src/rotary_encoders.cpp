#include "rotary_encoders.h"
#include "mqtt_manager.h"
extern MQTTManager mqttManager;

RotaryEncoder encoders[NUM_ENCODERS] = {
    RotaryEncoder(encoderClkPins[0], encoderDtPins[0]),
    RotaryEncoder(encoderClkPins[1], encoderDtPins[1]),
    RotaryEncoder(encoderClkPins[2], encoderDtPins[2]),
    RotaryEncoder(encoderClkPins[3], encoderDtPins[3]),
    RotaryEncoder(encoderClkPins[4], encoderDtPins[4]),
    RotaryEncoder(encoderClkPins[5], encoderDtPins[5])
};

bool isPresetLoading = false; 
int encoderValues[NUM_ENCODERS] = {0};
int lastEncoderPos[NUM_ENCODERS] = {0};
unsigned long lastDebounceTime[NUM_ENCODERS] = {0};
const unsigned long debounceDelay = 10;

// Constants for acceleration
constexpr float m = 20;           // Maximum acceleration factor (10x)
constexpr float longCutoff = 50;  // Slowest speed cutoff (no acceleration)
constexpr float shortCutoff = 5;  // Fastest speed cutoff (maximum acceleration)
constexpr float a = (m - 1) / (shortCutoff - longCutoff); // Factor for acceleration
constexpr float b = 1 - longCutoff * a;                  // Constant for acceleration calculation

unsigned long lastTickTime[NUM_ENCODERS] = {0}; // To track the time between ticks for acceleration

void initEncoders() {
    for (int i = 0; i < NUM_ENCODERS; i++) {
        encoders[i].setPosition(0);
    }
}

void handleEncoder(int index) {
    if (isPresetLoading) {
        return;
    }

    encoders[index].tick();
    int newValue = encoders[index].getPosition();

    // Debouncing and updating only when position changes
    if ((millis() - lastDebounceTime[index]) > debounceDelay) {
        if (newValue != lastEncoderPos[index]) {
            // Calculate the time since the last tick for acceleration
            unsigned long ms = millis() - lastTickTime[index];
            lastTickTime[index] = millis();

            // Accelerate if the rotation speed is fast enough
            if (ms < longCutoff) {
                // Apply acceleration factor based on time between ticks
                if (ms < shortCutoff) {
                    ms = shortCutoff; // Limit to max acceleration speed
                }

                float ticksActual_float = a * ms + b;  // Calculate the scaling factor
                long deltaTicks = (long)(ticksActual_float * (newValue - lastEncoderPos[index]));

                // Apply the accelerated change to the encoder value
                newValue = lastEncoderPos[index] + deltaTicks;
            }

            // Constrain the value to the 0-127 MIDI range
            encoderValues[index] = constrain(newValue, 0, 127);
            encoders[index].setPosition(encoderValues[index]);

            // MIDI message
            String midiMessage = "C0N" + String(60 + index) + "V" + String(encoderValues[index]);
            Serial.println(midiMessage);
            Serial1.println(midiMessage);
            mqttManager.handleControlUpdate(midiMessage);

            // Update the last encoder position and debounce time
            lastEncoderPos[index] = encoderValues[index];
            lastDebounceTime[index] = millis();
        }
    }
}
