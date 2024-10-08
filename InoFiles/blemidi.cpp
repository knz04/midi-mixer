#include <RotaryEncoder.h>
#include <BLEMIDI_Transport.h>
#include <hardware/BLEMIDI_ESP32.h>

// BLE MIDI Instance
BLEMIDI_CREATE_INSTANCE("BLE_MIDI_ENCODER", MIDI);

// Define pins for the rotary encoder and button
const int pinA = 16;  // Connect to the A pin of the rotary encoder
const int pinB = 17;  // Connect to the B pin of the rotary encoder
const int buttonPin = 18;  // Connect to the button pin

// Create RotaryEncoder object
RotaryEncoder encoder(pinA, pinB);

// Acceleration constants
constexpr float m = 10;             // Maximum acceleration factor
constexpr float longCutoff = 200;   // Time (ms) with no acceleration
constexpr float shortCutoff = 5;    // Minimum time (ms) with maximum acceleration

// Linear acceleration formula factors
constexpr float a = (m - 1) / (shortCutoff - longCutoff);
constexpr float b = 1 - longCutoff * a;

// Set the maximum and minimum allowed values for the encoder
const int encoderMax = 127;
const int encoderMin = 0;

unsigned long lastTime = 0;
bool lastButtonState = HIGH; // Store the last button state (HIGH = not pressed)
bool currentButtonState = HIGH;
unsigned long debounceTime = 0; // To debounce button presses
const unsigned long debounceDelay = 200; // Debounce delay for button (200 ms)

// Global variable to store the last position
static int lastPosition = 0;

// Bank variables
const int maxBanks = 3;  // Define the number of banks (3 banks in this example)
int currentBank = 0;     // Start with the first bank (bank 0)
int bankCCs[maxBanks] = {1, 2, 3};  // Define the CC numbers for each bank

// Store the last values for each bank
int bankValues[maxBanks] = {0, 0, 0};  // Initialize all bank values to 0

void setup() {
    Serial.begin(9600);
    
    // Initialize BLE MIDI
    MIDI.begin();

    encoder.setPosition(0); // Initialize the position to 0
    pinMode(pinA, INPUT_PULLUP);
    pinMode(pinB, INPUT_PULLUP);
    pinMode(buttonPin, INPUT_PULLUP); // Set button pin as input with pull-up resistor

    Serial.println("Starting BLE MIDI encoder control with bank switching...");
    Serial.print("a = "); Serial.println(a);
    Serial.print("b = "); Serial.println(b);
}

void loop() {
    encoder.tick(); // Update the encoder state

    int currentPosition = encoder.getPosition(); // Get the current position

    // Read the button state and handle debouncing
    currentButtonState = digitalRead(buttonPin);
    if (currentButtonState == LOW && lastButtonState == HIGH && (millis() - debounceTime) > debounceDelay) {
        // When button is pressed, switch to the next bank
        currentBank = (currentBank + 1) % maxBanks; // Increment bank and loop back after maxBanks
        
        // Set the encoder position to the last value for the current bank
        encoder.setPosition(bankValues[currentBank]);
        
        Serial.print("Switched to bank: ");
        Serial.println(currentBank);
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
        }

        // Clamp the encoder position between 0 and 127, even without acceleration
        currentPosition = constrain(currentPosition, encoderMin, encoderMax);

        // Print the adjusted encoder position for debugging
        Serial.print("Encoder Position (Bank ");
        Serial.print(currentBank);
        Serial.print("): ");
        Serial.println(currentPosition);

        // Send MIDI CC message over BLE for the current bank
        MIDI.sendControlChange(bankCCs[currentBank], currentPosition, 1); // (ControlChange number, value, channel)

        // Store the current position in the respective bank value
        bankValues[currentBank] = currentPosition;

        lastPosition = currentPosition; // Update the last position
        lastTime = currentTime; // Update the time for the next comparison
    }
}
