#include <Arduino.h>
#include <RotaryEncoder.h>

// Serial communication settings
#define BAUD_RATE 115200

// Define the number of rotary encoders, faders, and buttons
#define NUM_ENCODERS 2  // Rotary encoders
#define NUM_FADERS 2    // Faders connected to multiplexer
#define NUM_BUTTONS 2   // Buttons connected to multiplexer
#define NUM_PRESETS 8

// Define pins for rotary encoders
const int encoderClkPins[NUM_ENCODERS] = {4, 15};  // CLK pins for each encoder
const int encoderDtPins[NUM_ENCODERS] = {5, 16};   // DT pins for each encoder

// Define MUX signal and select pins
const int signalPinButton = 47; // For buttons (digital input)
const int signalPinFader = 6;   // For faders (analog input)
const int s0 = 36;
const int s1 = 37;
const int s2 = 38;
const int s3 = 39;
const int PRESET_ENCODER_CLK = 10;
const int PRESET_ENCODER_DT = 11;
const int PRESET_BUTTON_PIN = 20;

// Define acceleration parameters for encoders
constexpr float maxAccelerationFactor = 10;
constexpr float longCutoff = 50;
constexpr float shortCutoff = 5;
constexpr float a = (maxAccelerationFactor - 1) / (shortCutoff - longCutoff);
constexpr float b = 1 - longCutoff * a;

static unsigned long lastButtonPressTime = 0;
static int buttonPressCount = 0;
const int doublePressInterval = 1000;
const int singlePressTimeout = 2000;
const unsigned long doublePressDelay = 2000; 

// Create arrays for encoders and states
RotaryEncoder encoders[NUM_ENCODERS] = {
    RotaryEncoder(encoderClkPins[0], encoderDtPins[0]),
    RotaryEncoder(encoderClkPins[1], encoderDtPins[1])
};
int encoderValues[NUM_ENCODERS] = {0};
int lastEncoderPos[NUM_ENCODERS] = {0};

RotaryEncoder presetEncoder(PRESET_ENCODER_CLK, PRESET_ENCODER_DT);
int selectedPreset = 0;
// Button structure for MUX buttons
struct Button {
    int channel;
    int previousState;
};

Button buttons[NUM_BUTTONS] = {
    {0, HIGH},
    {1, HIGH}
};

struct Preset {
  String name;
  int encoderValues[NUM_ENCODERS];
  int faderValues[NUM_FADERS];
  int buttonStates[NUM_BUTTONS];
};

Preset presets[NUM_PRESETS];

// Fader states
int lastFaderValue[NUM_FADERS] = {-1, -1};

// Noise filtering parameters for faders
const int numReadings = 10;  // Number of readings to average
int faderReadings[NUM_FADERS][numReadings];  // Stores the last N readings for each fader
int readingIndex[NUM_FADERS] = {0};  // Tracks the current reading index for each fader
int total[NUM_FADERS] = {0};  // Stores the sum of the readings for each fader
int filteredFaderValue[NUM_FADERS] = {0};  // Stores the filtered (average) value

// Consecutive value change tracking
int stableFaderValue[NUM_FADERS] = {0};  // Stores the stable fader value for each fader
int sameValueCount[NUM_FADERS] = {0};  // Counts how many times the same value has been read

// Debounce settings for encoders
unsigned long lastDebounceTime[NUM_ENCODERS] = {0};
unsigned long debounceDelay = 10; // 10ms debounce delay

// Function to select the MUX channel
void selectMuxChannel(int channel) {
    digitalWrite(s0, bitRead(channel, 0));
    digitalWrite(s1, bitRead(channel, 1));
    digitalWrite(s2, bitRead(channel, 2));
    digitalWrite(s3, bitRead(channel, 3));
}

// Function to get average reading for noise filtering (for faders)
int getAverageFaderReading(int channel) {
    selectMuxChannel(channel);
    return analogRead(signalPinFader);
}

// Initialize fader readings to avoid startup noise
void initializeFaderReadings() {
    for (int i = 0; i < NUM_FADERS; i++) {
        for (int j = 0; j < numReadings; j++) {
            faderReadings[i][j] = getAverageFaderReading(i);
            total[i] += faderReadings[i][j];
        }
        filteredFaderValue[i] = total[i] / numReadings;  // Initial average value
    }
}

// Function to handle rotary encoder values
void handleEncoder(int index) {
    encoders[index].tick(); // Update encoder state
    int newValue = encoders[index].getPosition();

    if ((millis() - lastDebounceTime[index]) > debounceDelay) {
        if (newValue != lastEncoderPos[index]) {
            unsigned long ms = encoders[index].getMillisBetweenRotations();
            if (ms < longCutoff) {
                if (ms < shortCutoff) {
                    ms = shortCutoff;
                }
                float ticksActual_float = a * ms + b;
                long deltaTicks = (long)ticksActual_float * (newValue - lastEncoderPos[index]);
                newValue += deltaTicks;
            }
            encoderValues[index] = constrain(newValue, 0, 127);
            encoders[index].setPosition(encoderValues[index]);

            // MIDI message format: C0N{note}V{value}
           // MIDI channel (adjustable per encoder)
            int note = 60 + index; // Assign unique note per encoder
            String midiMessage = "C0N" + String(note) + "V" + String(encoderValues[index]);
            Serial.println(midiMessage);

            lastEncoderPos[index] = encoderValues[index];
            lastDebounceTime[index] = millis();
        }
    }
}

// Function to handle buttons from MUX
void handleButtons() {
    for (int i = 0; i < NUM_BUTTONS; i++) {
        selectMuxChannel(buttons[i].channel);
        int currentButtonState = digitalRead(signalPinButton);

        if (currentButtonState != buttons[i].previousState) {
            String midiMessage = "C0N" + String(70 + i) + "V" + (currentButtonState == LOW ? "127" : "0");
            Serial.println(midiMessage);

            buttons[i].previousState = currentButtonState;
        }
    }
}

// Function to handle fader inputs from MUX with noise filtering and stable value checking
void handleFaders() {
    for (int i = 0; i < NUM_FADERS; i++) {
        // Get new fader reading
        int newFaderReading = getAverageFaderReading(i);

        // Subtract the oldest reading and add the new one to the total
        total[i] -= faderReadings[i][readingIndex[i]];
        faderReadings[i][readingIndex[i]] = newFaderReading;
        total[i] += newFaderReading;

        // Update the index for the next reading
        readingIndex[i] = (readingIndex[i] + 1) % numReadings;

        // Calculate the average value
        filteredFaderValue[i] = total[i] / numReadings;

        // Map the filtered value to MIDI range (0-127)
        int midiValue = map(filteredFaderValue[i], 0, 4095, 0, 127);

        // Check if the value has remained the same for 5 consecutive readings
        if (midiValue == stableFaderValue[i]) {
            sameValueCount[i]++;
        } else {
            stableFaderValue[i] = midiValue;
            sameValueCount[i] = 0;
        }

        // Send MIDI message only if the value is stable for 5 consecutive readings
        if (sameValueCount[i] >= 5 && midiValue != lastFaderValue[i]) {
            String midiMessage = "C0N" + String(80 + i) + "V" + String(midiValue);
            Serial.println(midiMessage);
            lastFaderValue[i] = midiValue;
        }
    }
}


// Function to save the current state to a preset slot
void savePreset(int index) {
  presets[index].name = "Preset" + String(index);

  // Save current encoder, fader, and button values
  for (int i = 0; i < NUM_ENCODERS; i++) {
    presets[index].encoderValues[i] = encoderValues[i];
  }
  for (int i = 0; i < NUM_FADERS; i++) {
    presets[index].faderValues[i] = stableFaderValue[i];
  }
  for (int i = 0; i < NUM_BUTTONS; i++) {
    presets[index].buttonStates[i] = buttons[i].previousState;
  }
  
  Serial.println("Preset saved to slot " + String(index));
}

// Function to load a preset based on the selected index
void loadPreset(int index) {
  Serial.println("Loading preset: " + presets[index].name);

  for (int i = 0; i < NUM_ENCODERS; i++) {
    encoderValues[i] = presets[index].encoderValues[i];
    encoders[i].setPosition(encoderValues[i]);
  }
  for (int i = 0; i < NUM_FADERS; i++) {
    stableFaderValue[i] = presets[index].faderValues[i];
    lastFaderValue[i] = stableFaderValue[i];
  }
  for (int i = 0; i < NUM_BUTTONS; i++) {
    buttons[i].previousState = presets[index].buttonStates[i];
  }
}


void updatePresetSelection() {
    presetEncoder.tick();
    int newPresetPosition = presetEncoder.getPosition();

    if (newPresetPosition >= NUM_PRESETS) {
        presetEncoder.setPosition(0);
        selectedPreset = 0;
    } 
    else if (newPresetPosition < 0) {
        presetEncoder.setPosition(NUM_PRESETS - 1);
        selectedPreset = NUM_PRESETS - 1;
    } 
    else if (newPresetPosition != selectedPreset) {
        selectedPreset = newPresetPosition;
        Serial.println("Selected Preset: " + String(selectedPreset));
    }
}

void handlePresetButton() {
    static bool buttonPressed = false;
    static bool waitingForSecondPress = false;
    static unsigned long lastButtonPressTime = 0;
    unsigned long currentTime = millis();

    int currentButtonState = digitalRead(PRESET_BUTTON_PIN);

    if (!buttonPressed && currentButtonState == LOW) {
        buttonPressed = true;
        lastButtonPressTime = currentTime;
    } 
    else if (buttonPressed && currentButtonState == HIGH) {
        if (waitingForSecondPress && (currentTime - lastButtonPressTime < doublePressInterval)) {
            Serial.println("Saved Preset: " + String(selectedPreset));
            savePreset(selectedPreset);
            waitingForSecondPress = false;
        } 
        else if (!waitingForSecondPress) {
            waitingForSecondPress = true;
        }
        buttonPressed = false;
    }
    
    if (waitingForSecondPress && (currentTime - lastButtonPressTime > singlePressTimeout)) {
        Serial.println("Loaded Preset: " + String(selectedPreset));
        loadPreset(selectedPreset);
        waitingForSecondPress = false;
    }
}


void setup() {
    
    // Initialize serial communication
    Serial.begin(BAUD_RATE);

    // Set MUX pins as outputs
    pinMode(s0, OUTPUT);
    pinMode(s1, OUTPUT);
    pinMode(s2, OUTPUT);
    pinMode(s3, OUTPUT);

    // Set MUX signal pins as inputs
    pinMode(signalPinButton, INPUT);
    pinMode(signalPinFader, INPUT);

    pinMode(PRESET_BUTTON_PIN, INPUT_PULLUP);
    presetEncoder.setPosition(0);

    // Initialize encoders
    for (int i = 0; i < NUM_ENCODERS; i++) {
        encoders[i].setPosition(0);
    }

    // Initialize fader readings for noise filtering
    initializeFaderReadings();
}

void loop() {
    for (int i = 0; i < NUM_ENCODERS; i++) {
        handleEncoder(i);
    }
    handleFaders();
    handleButtons();
    updatePresetSelection();
    handlePresetButton();
}
