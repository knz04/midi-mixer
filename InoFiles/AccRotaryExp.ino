#include <RotaryEncoder.h>

const int pinA = 16; // Connect to the A pin of the rotary encoder
const int pinB = 17; // Connect to the B pin of the rotary encoder
const int buttonPin = 18; // Connect to the button pin

RotaryEncoder encoder(pinA, pinB);

// Define acceleration constants
constexpr float m = 10;             // Maximum acceleration factor
constexpr float longCutoff = 200;   // Time (ms) with no acceleration
constexpr float shortCutoff = 5;    // Minimum time (ms) with maximum acceleration

// Derive linear acceleration formula factors
constexpr float a = (m - 1) / (shortCutoff - longCutoff);
constexpr float b = 1 - longCutoff * a;

// Set the maximum and minimum allowed values for the encoder
const int encoderMax = 127;
const int encoderMin = 0;

unsigned long lastTime = 0;
int stepSize = 1; // Default step size (starts with low)

bool lastButtonState = HIGH; // Store the last button state (HIGH = not pressed)
bool currentButtonState = HIGH;
unsigned long debounceTime = 0; // To debounce button presses
const unsigned long debounceDelay = 200; // Debounce delay for button (200 ms)

// Global variable to store the last position
static int lastPosition = 0;

void setup() {
    Serial.begin(115200);
    encoder.setPosition(0); // Initialize the position to 0
    pinMode(pinA, INPUT_PULLUP);
    pinMode(pinB, INPUT_PULLUP);
    pinMode(buttonPin, INPUT_PULLUP); // Set button pin as input with pull-up resistor

    Serial.println("Starting accelerated encoder control...");
    Serial.print("a = "); Serial.println(a);
    Serial.print("b = "); Serial.println(b);
}

void loop() {
    encoder.tick(); // Update the encoder state

    int currentPosition = encoder.getPosition(); // Get the current position

    // Read the button state and handle debouncing
    currentButtonState = digitalRead(buttonPin);
    if (currentButtonState == LOW && lastButtonState == HIGH && (millis() - debounceTime) > debounceDelay) {
        // You could add step mode logic if you want to switch modes with button presses
        debounceTime = millis(); // Reset debounce timer
    }
    lastButtonState = currentButtonState; // Update button state

    // Handle rotary encoder movement with acceleration
    if (currentPosition != lastPosition) {
        unsigned long currentTime = millis();
        unsigned long timeDiff = currentTime - lastTime;

        // Apply acceleration based on the time between rotations
        if (timeDiff < longCutoff) {
            if (timeDiff < shortCutoff) timeDiff = shortCutoff; // Cap at minimum cutoff

            float accelerationFactor = a * timeDiff + b;
            int adjustedDiff = (int)((currentPosition - lastPosition) * accelerationFactor);

            // Adjust the current position and clamp it between the minimum and maximum values
            currentPosition += adjustedDiff;

            // Clamp the position between 0 and 127
            currentPosition = constrain(currentPosition, encoderMin, encoderMax);

            // Use the library's write function to update the position
            encoder.setPosition(currentPosition);

            //Serial.print("Accelerated Diff: ");
            //Serial.println(adjustedDiff);
        }

        // Clamp the encoder position between 0 and 127, even without acceleration
        currentPosition = constrain(currentPosition, encoderMin, encoderMax);

        // Print the adjusted encoder position
        Serial.print("Encoder Position: ");
        Serial.println(currentPosition);

        lastPosition = currentPosition; // Update the last position
        lastTime = currentTime; // Update the time for the next comparison
    }
}
