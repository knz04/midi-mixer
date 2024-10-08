#include <RotaryEncoder.h>
#include <BLEMIDI_Transport.h>
#include <hardware/BLEMIDI_ESP32.h>

// BLE MIDI Instance
BLEMIDI_CREATE_INSTANCE("BLE_MIDI_ENCODER", MIDI);

// Total number of rotary encoders and potentiometers
const int NRotaries = 3;    // Adjust this number based on the total number of rotary encoders
const int NPots = 8;        // Total number of potentiometers (knobs or faders)

// Define pins for each rotary encoder (CLK and DT for each)
const int rotaryPinCLK[NRotaries] = {16, 18, 20};  // CLK pins for each encoder
const int rotaryPinDT[NRotaries] = {17, 19, 21};   // DT pins for each encoder

// Potentiometer configuration
const int potPin[NPots] = {A9, A8, A7, A6, A3, A2, A1, A0};  // Analog pins for potentiometers
int potCState[NPots] = {0};   // Current state of potentiometers
int potPState[NPots] = {0};   // Previous state of potentiometers
int midiCState[NPots] = {0};  // Current MIDI state (mapped value)
int midiPState[NPots] = {0};  // Previous MIDI state
int potVar = 0;               // Variable to track the difference
const int varThreshold = 5;   // Threshold for detecting significant movement
unsigned long PTime[NPots] = {0};   // Time tracking for each potentiometer
unsigned long timer[NPots] = {0};   // Timer for movement tracking
bool potMoving = false;            // Potentiometer movement flag
const unsigned long TIMEOUT = 100;  // Timeout for considering pot as still

// Rotary encoder objects
RotaryEncoder encoders[NRotaries] = {
    RotaryEncoder(rotaryPinCLK[0], rotaryPinDT[0]),
    RotaryEncoder(rotaryPinCLK[1], rotaryPinDT[1]),
    RotaryEncoder(rotaryPinCLK[2], rotaryPinDT[2])
};

// Global variables for rotary encoders
unsigned long lastTime[NRotaries] = {0};  // Array to store the last time for each encoder
int lastPosition[NRotaries] = {0};        // Array to store the last position for each encoder

// Acceleration constants
constexpr float m = 10;             // Maximum acceleration factor
constexpr float longCutoff = 200;   // Time (ms) with no acceleration
constexpr float shortCutoff = 5;    // Minimum time (ms) with maximum acceleration

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

    Serial.println("Starting BLE MIDI rotary encoders and potentiometers...");
}

// Handle rotary encoder movement
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

// Handle potentiometer movement and MIDI control change
void potentiometers() {
    for (int i = 0; i < NPots; i++) { // Loops through all the potentiometers

        potCState[i] = analogRead(potPin[i]); // reads the pins from Arduino
        midiCState[i] = map(potCState[i], 0, 1023, 0, 127); // Maps the reading of the potCState to a value usable in MIDI

        potVar = abs(potCState[i] - potPState[i]); // Calculates the absolute value of the difference between the current and previous state of the pot

        if (potVar > varThreshold) { // If the potentiometer variation is greater than the threshold
            PTime[i] = millis();     // Store the previous time
        }

        timer[i] = millis() - PTime[i]; // Reset the timer

        if (timer[i] < TIMEOUT) {   // If the timer is less than the maximum allowed time, the potentiometer is still moving
            potMoving = true;
        } else {
            potMoving = false;
        }

        if (potMoving == true) { // If the potentiometer is still moving, send the control change
            if (midiPState[i] != midiCState[i]) {
                // Send MIDI CC
                MIDI.sendControlChange(i + 10, midiCState[i], 1);  // Using i + 10 as CC number to avoid conflict with rotary encoders
                Serial.print("Potentiometer "); Serial.print(i); Serial.print(" position: ");
                Serial.println(midiCState[i]);

                // Update previous states
                potPState[i] = potCState[i];
                midiPState[i] = midiCState[i];
            }
        }
    }
}

void loop() {
    // Handle each rotary encoder
    for (int i = 0; i < NRotaries; i++) {
        handleRotaryEncoder(i);
    }

    // Handle potentiometers
    potentiometers();
}
