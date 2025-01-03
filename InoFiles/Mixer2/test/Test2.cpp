#include <Arduino.h>
#include <RotaryEncoder.h>

#define MUX_CLK_PIN 1 // Define pin for MUX_CLK
#define MUX_DT_PIN 2  // Define pin for MUX_DT
#define BUTTON_PIN 7  // Define pin for the button

#define NUM_ENCODERS 2
#define MUX_SELECT_PINS {4, 5, 6, 7} // Pins for multiplexer selection (S0-S3)

// Serial communication settings
#define BAUD_RATE 115200

// Define acceleration parameters
constexpr float maxAccelerationFactor = 10; // Maximum acceleration factor
constexpr float longCutoff = 50;            // No acceleration at this threshold (in ms)
constexpr float shortCutoff = 5;            // Max acceleration at this threshold (in ms)

constexpr float a = (maxAccelerationFactor - 1) / (shortCutoff - longCutoff);
constexpr float b = 1 - longCutoff * a;

// Define rotary encoders and their positions
RotaryEncoder encoders[NUM_ENCODERS] = {
    RotaryEncoder(MUX_CLK_PIN, MUX_DT_PIN), // Initialize first encoder
    RotaryEncoder(MUX_CLK_PIN, MUX_DT_PIN), // Repeat for all encoders
};

// Current value for each encoder
int encoderValues[NUM_ENCODERS] = {0};

// Last positions for each encoder
static int lastPositions[NUM_ENCODERS] = {0};

// Define MIDI channel and note
int midiChannel = 1;
int midiNote[NUM_ENCODERS] = {60, 61}; // MIDI notes for each encoder

// Function declaration for selecting multiplexer channel
void selectMuxChannel(int channel);

void setup() {
    Serial.begin(BAUD_RATE); // USB serial for debugging
    Serial1.begin(BAUD_RATE); // UART communication with Pro Micro

    // Initialize all encoders and multiplexer
    for (int i = 0; i < NUM_ENCODERS; i++) {
        encoders[i].setPosition(0); // Initialize position
    }
    
    pinMode(BUTTON_PIN, INPUT_PULLUP); // Set button pin as input with pull-up
}

void loop() {
    for (int i = 0; i < NUM_ENCODERS; i++) {
        // Select the multiplexer channel for the current encoder
        selectMuxChannel(i);

        // Read the rotary encoder
        encoders[i].tick(); // Call this function regularly to update the encoder state

        // Check if the encoder has moved
        int newValue = encoders[i].getPosition();
        if (newValue != encoderValues[i]) {
            // Get time since last rotation
            unsigned long ms = encoders[i].getMillisBetweenRotations();

            // Apply linear acceleration if moving fast enough
            if (ms < longCutoff) {
                // Ensure minimum time for acceleration
                if (ms < shortCutoff) {
                    ms = shortCutoff;
                }

                // Calculate adjusted ticks
                float ticksActual_float = a * ms + b;
                long deltaTicks = (long)ticksActual_float * (newValue - lastPositions[i]);

                // Update the new position with acceleration
                newValue += deltaTicks;
                encoders[i].setPosition(newValue);
            }

            // Cap encoderValue between 0 and 127
            encoderValues[i] = constrain(newValue, 0, 127); // Limit the value to the range [0, 127]

            // Prepare MIDI message according to the protocol
            String midiMessage = "C0" + String(midiChannel) + "N" + String(midiNote[i]) + "V" + String(encoderValues[i]);
            Serial.println(midiMessage);
            Serial1.println(midiMessage); // Send via UART

            // Update last position
            lastPositions[i] = newValue;
        }
    }

    // Read the button state
    static bool lastButtonState = HIGH;
    bool currentButtonState = digitalRead(BUTTON_PIN);

    // Button press handling
    if (lastButtonState == HIGH && currentButtonState == LOW) {
        // Button was pressed
        Serial.println("C0N61V127");
    }
    if (lastButtonState == LOW && currentButtonState == HIGH) {
        // Button was released
        Serial.println("C0N61V0");
    }
    lastButtonState = currentButtonState;
}

void selectMuxChannel(int channel) {
    // Set the multiplexer selection pins (assumes active high)
    const int muxSelectPins[] = MUX_SELECT_PINS;
    for (int i = 0; i < 4; i++) {
        digitalWrite(muxSelectPins[i], (channel >> i) & 0x01); // Set pin HIGH or LOW based on channel
    }
}
