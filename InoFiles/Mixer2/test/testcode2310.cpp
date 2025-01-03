#include <Arduino.h>
#include <RotaryEncoder.h>

// Serial communication settings
#define BAUD_RATE 115200

// Define the number of rotary encoders and buttons
#define NUM_ENCODERS 2 // Change this to add more encoders
#define NUM_BUTTONS 2  // Change this to add more buttons

// Define pins for each encoder
const int encoderClkPins[NUM_ENCODERS] = {4, 15};  // CLK pins for each encoder
const int encoderDtPins[NUM_ENCODERS] = {5, 16};   // DT pins for each encoder

// Define MUX signal and select pins
const int signalPin = 47;
const int s0 = 36;
const int s1 = 37;
const int s2 = 38;
const int s3 = 39;

// Define acceleration parameters
constexpr float maxAccelerationFactor = 10; // Maximum acceleration factor
constexpr float longCutoff = 50;            // No acceleration at this threshold (in ms)
constexpr float shortCutoff = 5;            // Max acceleration at this threshold (in ms)

constexpr float a = (maxAccelerationFactor - 1) / (shortCutoff - longCutoff);
constexpr float b = 1 - longCutoff * a;

// Create arrays to store encoder states
RotaryEncoder encoders[NUM_ENCODERS] = {
    RotaryEncoder(encoderClkPins[0], encoderDtPins[0]),
    RotaryEncoder(encoderClkPins[1], encoderDtPins[1])
};

int encoderValues[NUM_ENCODERS] = {0};       // Store the current value for each encoder
int lastEncoderPos[NUM_ENCODERS] = {0};      // Last position tracked for acceleration logic

// Structure to hold button configuration
struct Button {
    int channel;            // MUX channel for the button
    int previousState;      // Store the previous state of the button
};

Button buttons[NUM_BUTTONS] = {
    {0, HIGH},  // Button 1 on channel 0
    {1, HIGH},  // Button 2 on channel 1
};

const int numButtons = sizeof(buttons) / sizeof(buttons[0]); // Total number of buttons

unsigned long lastDebounceTime[NUM_ENCODERS] = {0}; // Debounce timers for each encoder
unsigned long debounceDelay = 10; // 10ms debounce delay

// Function to select the MUX channel
void selectMuxChannel(int channel) {
    digitalWrite(s0, bitRead(channel, 0));
    digitalWrite(s1, bitRead(channel, 1));
    digitalWrite(s2, bitRead(channel, 2));
    digitalWrite(s3, bitRead(channel, 3));
}

// Function to handle rotary encoder values
void handleEncoder(int index) {
    encoders[index].tick(); // Update the encoder state

    // Get the current position of the encoder
    int newValue = encoders[index].getPosition();
    
    // Debounce encoder to avoid noisy signals affecting the readings
    if ((millis() - lastDebounceTime[index]) > debounceDelay) {
        if (newValue != lastEncoderPos[index]) {
            // Get time since last rotation
            unsigned long ms = encoders[index].getMillisBetweenRotations();

            // Apply acceleration logic
            if (ms < longCutoff) {
                if (ms < shortCutoff) {
                    ms = shortCutoff;
                }

                // Adjust ticks with acceleration
                float ticksActual_float = a * ms + b;
                long deltaTicks = (long)ticksActual_float * (newValue - lastEncoderPos[index]);

                // Update the new position with acceleration
                newValue += deltaTicks;
            }

            // Cap encoderValue between 0 and 127
            encoderValues[index] = constrain(newValue, 0, 127); // Limit value to [0, 127]
            encoders[index].setPosition(encoderValues[index]); // Sync encoder state

            // Prepare MIDI message for this encoder
            int channel = 1; // MIDI channel, can be different per encoder
            int note = 60 + index; // Assign a unique note per encoder
            String midiMessage = "C0" + String(channel) + "N" + String(note) + "V" + String(encoderValues[index]);
            Serial.println(midiMessage);

            // Update last position and debounce timer
            lastEncoderPos[index] = encoderValues[index];
            lastDebounceTime[index] = millis();
        }
    }
}

// Function to handle button presses from MUX
void handleButtons() {
    // Iterate through each button
    for (int i = 0; i < numButtons; i++) {
        // Select the MUX channel for the current button
        selectMuxChannel(buttons[i].channel);

        // Read the current state of the button
        int currentButtonState = digitalRead(signalPin);

        // Check if the button state has changed
        if (currentButtonState != buttons[i].previousState) {
            // If the state has changed, print the new state
            String midiMessage = "C0N" + String(61 + i) + "V" + (currentButtonState == LOW ? "127" : "0");
            Serial.println(midiMessage);

            // Update the previous state
            buttons[i].previousState = currentButtonState;
        }
    }
}

void setup() {
    // Initialize serial communication
    Serial.begin(BAUD_RATE);

    // Set the MUX select pins as outputs
    pinMode(s0, OUTPUT);
    pinMode(s1, OUTPUT);
    pinMode(s2, OUTPUT);
    pinMode(s3, OUTPUT);

    // Set the signal pin as input
    pinMode(signalPin, INPUT);

    // Initialize encoders
    for (int i = 0; i < NUM_ENCODERS; i++) {
        encoders[i].setPosition(0); // Initialize encoder positions to 0
    }
}

void loop() {
    // Handle all encoders
    for (int i = 0; i < NUM_ENCODERS; i++) {
        handleEncoder(i);
    }

    // Handle all buttons
    handleButtons();
}


