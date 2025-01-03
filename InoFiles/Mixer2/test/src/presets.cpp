#include "presets.h"
#include "config.h"
#include <RotaryEncoder.h>
#include "button.h"
#include "faders.h"
#include "mqtt_manager.h"
#include <LittleFS.h>
#include <ArduinoJson.h>

// Constants
#define PRESET_FILE "/presets.json"

// Local struct for Button


// Local constants for timeout intervals
const unsigned long doublePressInterval = 1000; // Adjust as needed (milliseconds)
const unsigned long singlePressTimeout = 1500; // Adjust as needed (milliseconds)

struct Preset {
    int encoderValues[NUM_ENCODERS];
    int faderValues[NUM_FADERS];
    int buttonStates[NUM_BUTTONS];
};

Preset presets[NUM_PRESETS];
RotaryEncoder presetEncoder(PRESET_ENCODER_CLK, PRESET_ENCODER_DT);
int selectedPreset = 0;

void savePresetsToFile() {
    DynamicJsonDocument doc(1024);
    for (int i = 0; i < NUM_PRESETS; i++) {
       JsonObject preset = doc.createNestedObject(String(i));
        JsonArray encoders = preset["encoders"].to<JsonArray>();
        JsonArray faders = preset["faders"].to<JsonArray>();
        JsonArray buttons = preset["buttons"].to<JsonArray>();

        for (int j = 0; j < NUM_ENCODERS; j++) encoders.add(presets[i].encoderValues[j]);
        for (int j = 0; j < NUM_FADERS; j++) faders.add(presets[i].faderValues[j]);
        for (int j = 0; j < NUM_BUTTONS; j++) buttons.add(presets[i].buttonStates[j]);
    }

    File file = LittleFS.open(PRESET_FILE, "w", false);
    if (!file) {
        Serial.println("Failed to open preset file for writing");
        return;
    }

    if (serializeJson(doc, file) == 0) {
        Serial.println("Failed to write JSON to file");
    } else {
        Serial.println("Presets saved successfully");
    }

    file.close();
}


void loadPresetsFromFile() {
    DynamicJsonDocument doc(1024);

    File file = LittleFS.open("/presets.json", "r", false);
    if (!file) {
        Serial.println("Failed to open file for reading");
        return;
    }

    DeserializationError error = deserializeJson(doc, file);
    if (error) {
        Serial.println("Failed to read file, using default configuration");
    }

    for (int i = 0; i < 4; i++) {
        JsonObject preset = doc[String(i)];
        JsonArray encoders = preset["encoders"];
        JsonArray faders = preset["faders"];
        JsonArray buttons = preset["buttons"];

        // Load your preset data from encoders, faders, and buttons
         for (int j = 0; j < NUM_ENCODERS; j++) presets[i].encoderValues[j] = encoders[j];
        for (int j = 0; j < NUM_FADERS; j++) presets[i].faderValues[j] = faders[j];
        for (int j = 0; j < NUM_BUTTONS; j++) presets[i].buttonStates[j] = buttons[j];

    }
    Serial.println("Presets loaded successfully");
    file.close();
}

void initStorage() {
    if (!LittleFS.begin()) {
        Serial.println("Failed to initialize LittleFS");
        return;
    }
    Serial.println("LittleFS initialized");
}

void initPresets() {
    initStorage();
    loadPresetsFromFile();

    pinMode(PRESET_BUTTON_PIN, INPUT_PULLUP);
    presetEncoder.setPosition(0);
}

void savePreset(int index, int encoderValues[], int faderValues[], int buttons[]) {
    for (int i = 0; i < NUM_ENCODERS; i++) {
        presets[index].encoderValues[i] = encoderValues[i];
    }
    for (int i = 0; i < NUM_FADERS; i++) {
        presets[index].faderValues[i] = faderValues[i];
    }
    for (int i = 0; i < NUM_BUTTONS; i++) {
        presets[index].buttonStates[i] = (buttons[i] == LOW) ? 127 : 0;
    }
    savePresetsToFile();
    Serial.println("Preset saved: " + String(index));
}

void loadPreset(int index, int encoderValues[], int faderValues[], int buttons[]) {
    isPresetLoading = true;
    for (int i = 0; i < NUM_ENCODERS; i++) {
        Serial.println("C0N6"+String(i)+"V"+String(presets[index].encoderValues[i]));
        encoderValues[i] = presets[index].encoderValues[i];
        encoders[i].setPosition(encoderValues[i]);
    }
    for (int i = 0; i < NUM_FADERS; i++) {
        Serial.println("C0N8"+String(i)+"V"+String(presets[index].faderValues[i]));
        faderValues[i] = presets[index].faderValues[i];
        faderSynced[i] = false;
    }
    for (int i = 0; i < NUM_BUTTONS; i++) {
        Serial.println("C0N7"+String(i)+"V"+String(presets[index].buttonStates[i]));
        buttons[i] = (presets[index].buttonStates[i] == 127) ? LOW : HIGH;
    }
    Serial.println("Preset loaded: " + String(index));
    isPresetLoading = false;
}

void updatePresetSelection() {
    presetEncoder.tick();
    int newPosition = presetEncoder.getPosition();

    if (newPosition < 0) {
        presetEncoder.setPosition(NUM_PRESETS - 1);
        selectedPreset = NUM_PRESETS;
    } else if (newPosition >= NUM_PRESETS) {
        presetEncoder.setPosition(0);
        selectedPreset = 1;
    } else if (newPosition != selectedPreset) {
        selectedPreset = newPosition;
        Serial.println("Selected preset: " + String(selectedPreset));
    }
}

// Updated handlePresetButton function in presets.cpp
void handlePresetButton(int encoderValues[], int faderValues[], int buttons[], MQTTManager& mqttManager) {
    static bool buttonPressed = false;
    static bool waitingForSecondPress = false;
    static unsigned long buttonPressStartTime = 0;
    static unsigned long lastButtonPressTime = 0;
    unsigned long currentTime = millis();

    int currentButtonState = digitalRead(PRESET_BUTTON_PIN);

    if (!buttonPressed && currentButtonState == LOW) {
        buttonPressed = true;
        buttonPressStartTime = currentTime;
    } else if (buttonPressed && currentButtonState == HIGH) {
        unsigned long pressDuration = currentTime - buttonPressStartTime;

        if (pressDuration >= 3000) {
            mqttManager.toggleMQTT();
            Serial.println("MQTT toggled via long press.");
        } else if (waitingForSecondPress && (currentTime - lastButtonPressTime < doublePressInterval)) {
            savePreset(selectedPreset, encoderValues, faderValues, buttons);
            waitingForSecondPress = false;
        } else if (!waitingForSecondPress) {
            waitingForSecondPress = true;
        }

        buttonPressed = false;
        lastButtonPressTime = currentTime;
    }

    if (waitingForSecondPress && (currentTime - lastButtonPressTime > doublePressInterval)) {
        loadPreset(selectedPreset, encoderValues, faderValues, buttons);
        waitingForSecondPress = false;
    }
}
