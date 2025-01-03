#include <Arduino.h>
#include <RotaryEncoder.h>
#include <ArduinoJson.h>

// Pins for rotary encoder and button
#define ENCODER_CLK 12
#define ENCODER_DT 13
#define BUTTON_PIN 11

// Define the number of presets
#define NUM_PRESETS 8

// Rotary encoder and button debounce settings
RotaryEncoder encoder(ENCODER_CLK, ENCODER_DT);
unsigned long lastButtonPressTime = 0;
unsigned long doublePressInterval = 2000; // Time interval for double press (in ms)
unsigned long singlePressTimeout = 500; // Time to wait for second press (in ms)
bool waitingForSecondPress = false;
bool buttonPressed = false; // To track button press state

// Store current selected preset index
int selectedPreset = 0;

// Preset data structure
struct Preset {
  String name;
  String midiCommands[6];
};

// Initialize presets with random values
Preset presets[NUM_PRESETS] = {
  {"Preset0", {"C0N10V64", "C0N11V32", "C0N12V64", "C0N13V32", "C0N14V0", "C0N15V127"}},
  {"Preset1", {"C0N20V64", "C0N21V32", "C0N22V64", "C0N23V32", "C0N24V0", "C0N25V127"}},
  {"Preset2", {"C0N30V64", "C0N31V32", "C0N32V64", "C0N33V32", "C0N34V0", "C0N35V127"}},
  {"Preset3", {"C0N40V64", "C0N41V32", "C0N42V64", "C0N43V32", "C0N44V0", "C0N45V127"}},
  {"Preset4", {"C0N50V64", "C0N51V32", "C0N52V64", "C0N53V32", "C0N54V0", "C0N55V127"}},
  {"Preset5", {"C0N60V64", "C0N61V32", "C0N62V64", "C0N63V32", "C0N64V0", "C0N65V127"}},
  {"Preset6", {"C0N70V64", "C0N71V32", "C0N72V64", "C0N73V32", "C0N74V0", "C0N75V127"}},
  {"Preset7", {"C0N80V64", "C0N81V32", "C0N82V64", "C0N83V32", "C0N84V0", "C0N85V127"}}
};

// Function to save presets to JSON format
void savePresetsToJSON() {
  StaticJsonDocument<1024> doc;
  JsonArray presetArray = doc.to<JsonArray>();

  for (int i = 0; i < NUM_PRESETS; i++) {
    JsonObject presetObj = presetArray.createNestedObject();
    presetObj["name"] = presets[i].name;
    JsonArray midiCommandsArray = presetObj.createNestedArray("midiCommands");
    for (int j = 0; j < 6; j++) {
      midiCommandsArray.add(presets[i].midiCommands[j]);
    }
  }

  // Serialize JSON to serial for debugging
  serializeJson(doc, Serial);
  Serial.println();
}

// Function to load a preset based on the selected preset index
void loadPreset(int index) {
  Serial.println("Loading preset: " + presets[index].name);
  for (const String &command : presets[index].midiCommands) {
    Serial.println(command);  // Simulate sending MIDI command
  }
}

// Function to save the current preset to the selected slot
void savePreset(int index, const String& name, const String midiCommands[6]) {
  presets[index].name = name;
  for (int i = 0; i < 6; i++) {
    presets[index].midiCommands[i] = midiCommands[i];
  }
  Serial.println("Preset saved to slot " + String(index));
  savePresetsToJSON();  // Update JSON representation
}

// Setup function
void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  encoder.setPosition(0);
  savePresetsToJSON();  // Initial save for JSON output
}

// Loop function
void loop() {
  encoder.tick();
  int newPosition = encoder.getPosition();

  // Handle preset wrapping
  if (newPosition >= NUM_PRESETS) {
    encoder.setPosition(0);
    selectedPreset = 0;
  } else if (newPosition < 0) {
    encoder.setPosition(NUM_PRESETS - 1);
    selectedPreset = NUM_PRESETS - 1;
  } else if (newPosition != selectedPreset) {
    selectedPreset = newPosition;
    Serial.println("Selected Preset: " + String(selectedPreset));
  }

  // Button handling (detect release)
  bool buttonState = digitalRead(BUTTON_PIN) == LOW;
  unsigned long currentTime = millis();

  if (!buttonPressed && buttonState) {
    // Button was pressed
    buttonPressed = true;
    lastButtonPressTime = currentTime;
  } else if (buttonPressed && !buttonState) {
    // Button was released
    if (waitingForSecondPress && (currentTime - lastButtonPressTime < doublePressInterval)) {
      // Double press detected - save preset
      String newPresetCommands[6] = {"C0N90V64", "C0N91V32", "C0N92V64", "C0N93V32", "C0N94V0", "C0N95V127"};  // Example commands
      savePreset(selectedPreset, String(selectedPreset), newPresetCommands);
      waitingForSecondPress = false;
    } else if (!waitingForSecondPress) {
      // First press detected, start waiting for a potential double press
      waitingForSecondPress = true;
    }
    buttonPressed = false; // Reset button press state
  }

  // If waiting for a second press and timeout exceeds singlePressTimeout, load preset
  if (waitingForSecondPress && (currentTime - lastButtonPressTime > singlePressTimeout)) {
    loadPreset(selectedPreset);  // Load preset on single press
    waitingForSecondPress = false; // Reset double press wait
  }
}
