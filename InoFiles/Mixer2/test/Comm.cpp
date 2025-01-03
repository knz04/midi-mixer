#include <Arduino.h>
#include <RotaryEncoder.h>

// Define pins for the rotary encoder and button
#define ENCODER_CLK_PIN 12 // Change to your CLK pin
#define ENCODER_DT_PIN 14  // Change to your DT pin
#define BUTTON_PIN 7       // Change to your button pin

// Serial communication settings
#define BAUD_RATE 115200

// Define acceleration parameters
constexpr float maxAccelerationFactor = 10; // Maximum acceleration factor
constexpr float longCutoff = 50;            // No acceleration at this threshold (in ms)
constexpr float shortCutoff = 5;            // Max acceleration at this threshold (in ms)

constexpr float a = (maxAccelerationFactor - 1) / (shortCutoff - longCutoff);
constexpr float b = 1 - longCutoff * a;

// Encoder object
RotaryEncoder encoder(ENCODER_CLK_PIN, ENCODER_DT_PIN);

// Current value for the encoder
int encoderValue = 0;

// Last position tracked for acceleration logic
static int lastPos = 0;

void setup() {
    // Set up serial communication
    Serial.begin(BAUD_RATE); // USB serial for debugging
    Serial1.begin(BAUD_RATE); // UART communication with Pro Micro

    // Initialize encoder
    encoder.setPosition(0); // Initialize position
    pinMode(BUTTON_PIN, INPUT_PULLUP); // Set button pin as input with pull-up
}

void loop() {
    // Read the rotary encoder
    encoder.tick(); // Call this function regularly to update the encoder state

    // Get the current physical position of the encoder
    int newValue = encoder.getPosition();
    if (newValue != lastPos) {
        // Get time since last rotation
        unsigned long ms = encoder.getMillisBetweenRotations();

        // Apply linear acceleration if moving fast enough
        if (ms < longCutoff) {
            // Ensure minimum time for acceleration
            if (ms < shortCutoff) {
                ms = shortCutoff;
            }

            // Calculate adjusted ticks
            float ticksActual_float = a * ms + b;
            long deltaTicks = (long)ticksActual_float * (newValue - lastPos);

            // Update the new position with acceleration
            newValue += deltaTicks;
        }

        // Cap encoderValue between 0 and 127
        encoderValue = constrain(newValue, 0, 127); // Limit the value to the range [0, 127]

        // Update the encoder position in the RotaryEncoder object
        encoder.setPosition(encoderValue); // Sync the internal encoder state with the limited value

        // Prepare MIDI message according to the protocol
        int channel = 1;  // MIDI channel
        int note = 60;    // Note number (you can change this)
        String midiMessage = "C0" + String(channel) + "N" + String(note) + "V" + String(encoderValue);

        Serial.println(midiMessage);

        // Update last position
        lastPos = encoderValue;
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
