#include "faders.h"
#include "mux.h"
#include "config.h"
#include "mqtt_manager.h"


#define FILTER_WINDOW_SIZE 20  // Number of readings for the rolling average
#define NOISE_THRESHOLD 1     // Minimum change to trigger an update

extern MQTTManager mqttManager;
int lastFaderValue[NUM_FADERS] = {-1, -1};
int faderBuffer[NUM_FADERS][FILTER_WINDOW_SIZE] = {{0}}; // Buffer to store readings
int bufferIndex[NUM_FADERS] = {0};                      // Index for circular buffer
bool faderSynced[NUM_FADERS] = {false};
extern bool isPresetLoading;

void initializeFaderReadings() {
    for (int i = 0; i < NUM_FADERS; i++) {
        lastFaderValue[i] = 0;
        for (int j = 0; j < FILTER_WINDOW_SIZE; j++) {
            faderBuffer[i][j] = 0;
        }
        bufferIndex[i] = 0;
    }
}

void handleFaders() {
    for (int i = 0; i < NUM_FADERS; i++) {
        selectMuxChannel(i);
        int rawValue = analogRead(signalPinFader);
        rawValue = map(rawValue, 0, 4095, 0, 127);

        // Update the buffer with the new value
        faderBuffer[i][bufferIndex[i]] = rawValue;
        bufferIndex[i] = (bufferIndex[i] + 1) % FILTER_WINDOW_SIZE;

        // Calculate the average value
        int averageValue = 0;
        for (int j = 0; j < FILTER_WINDOW_SIZE; j++) {
            averageValue += faderBuffer[i][j];
        }
        averageValue /= FILTER_WINDOW_SIZE;

        if (isPresetLoading) {
            faderSynced[i] = false; // Reset synced state during preset loading
            continue;
        }

        // If the fader is not synced yet, check if it has moved significantly
        if (!faderSynced[i]) {
            if (abs(averageValue - lastFaderValue[i]) > 10) { // Relative to the frozen value
                faderSynced[i] = true;
                Serial.println("Fader " + String(i) + " synced");
            }
        } else {
            // Once synced, send updates only for significant changes
            if (abs(averageValue - lastFaderValue[i]) > NOISE_THRESHOLD) {
                String midiMessage = "C0N" + String(80 + i) + "V" + String(averageValue);
                Serial.println(midiMessage);
                Serial1.println(midiMessage);
                mqttManager.handleControlUpdate(midiMessage);
                lastFaderValue[i] = averageValue; // Update the last value only when synced
            }
        }
    }
}

