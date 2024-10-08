#include <RotaryEncoder.h>
#include <BLEMIDI_Transport.h>
#include <hardware/BLEMIDI_ESP32.h>

// BLE MIDI Instance
BLEMIDI_CREATE_INSTANCE("BLE_MIDI_ENCODER", MIDI);

// Total number of rotary encoders
const int NRotaries = 3; // Adjust this number based on the total number of rotary encoders

// Define pins for each rotary encoder (CLK and DT for each)
const int rotaryPinCLK[NRotaries] = {16, 18, 20};  // CLK pins for each encoder
const int rotaryPinDT[NRotaries] = {17, 19, 21};   // DT pins for each encoder

// Array of encoder objects
RotaryEncoder encoders[NRotaries] = {
    RotaryEncoder(rotaryPinCLK[0], rotaryPinDT[0]),
    RotaryEncoder(rotaryPinCLK[1], rotaryPinDT[1]),
    RotaryEncoder(rotaryPinCLK[2], rotaryPinDT[2])
};

// Acceleration constants
constexpr float m = 10;             // Maximum acceleration factor
constexpr float longCutoff = 200;   // Time (ms) with no acceleration
constexpr float shortCutoff = 5;    // Minimum time (ms) with maximum acceleration

// Global variables for storing positions and other states
unsigned long lastTime[NRotaries] = {0};  // Array to store the last time for each encoder
int lastPosition[NRotaries] = {0};        // Array to store the last position for each encoder

void setup() {
    Serial.begin(9600);

    // Initialize BLE MIDI
    MIDI.begin();

    // Initialize all encoders
    for (int i = 0; i < NRotaries; i++) {
        encoders[i].setPosition(0);  // Set initial position to 0
        pinMode(rotaryPinCLK[i], INPUT_PULLUP);
        pinMode(rotaryPinDT[i], INPUT_PULLUP);
    }

    Serial.println("Starting BLE MIDI rotary encoders...");
}

void handleRotaryEncoder(int encoderIndex) {
    encoders[encoderIndex].tick(); // Update encoder state for the given encoder

    int currentPosition = encoders[encoderIndex].getPosition(); // Get the current position of the encoder
    if (currentPosition != lastPosition[encoderIndex]) {
        unsigned long currentTime = millis();
        unsigned long timeDiff = currentTime - lastTime[encoderIndex];

        // Apply acceleration based on the time between rotations
        if (timeDiff < longCutoff) {
            if (timeDiff < shortCutoff) timeDiff = shortCutoff; // Cap at minimum cutoff

            float accelerationFactor = m / timeDiff;  // Simple acceleration formula
            int adjustedDiff = (int)((currentPosition - lastPosition[encoderIndex]) * accelerationFactor);

            // Adjust and constrain the position between 0 and 127
            currentPosition += adjustedDiff;
            currentPosition = constrain(currentPosition, 0, 127);

            // Update encoder position
            encoders[encoderIndex].setPosition(currentPosition);
        }

        // Clamp the position and send MIDI CC message
        currentPosition = constrain(currentPosition, 0, 127);
        Serial.print("Encoder "); Serial.print(encoderIndex); Serial.print(" position: ");
        Serial.println(currentPosition);

        // Send MIDI CC message for this encoder
        MIDI.sendControlChange(encoderIndex + 1, currentPosition, 1);  // Use encoder index as CC number for simplicity

        lastPosition[encoderIndex] = currentPosition; // Update last position
        lastTime[encoderIndex] = currentTime;         // Update last time
    }
}

void loop() {
    // Loop through each rotary encoder and handle it
    for (int i = 0; i < NRotaries; i++) {
        handleRotaryEncoder(i);
    }
}
