#include <Arduino.h>
#include <WiFi.h>
#include <WiFiManager.h>
#include <PubSubClient.h>
#include <RotaryEncoder.h>
#include <ArduinoJson.h>

// MQTT broker details
const char* mqtt_server = "e0d1458af7764ee788c14d0501883ccb.s1.eu.hivemq.cloud"; // or your broker IP

WiFiClient espClient;
PubSubClient client(espClient);

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

// Track button press count
int buttonPressCount = 0;

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

// MQTT topic for presets
const char* mqtt_topic = "midi/presets";

// Function to initialize Wi-Fi using WiFiManager
void setupWiFi() {
  WiFiManager wifiManager;
  // Uncomment to reset WiFi credentials if needed
  // wifiManager.resetSettings();
  
  // Start WiFi setup in autoConnect mode
  if (!wifiManager.autoConnect("MIDI_Controller_AP")) {
    Serial.println("Failed to connect. Restarting...");
    delay(3000);
    ESP.restart();
  }

  Serial.println("Connected to Wi-Fi!");
}

// Function to connect to MQTT broker
void setupMQTT() {
  client.setServer(mqtt_server, 1883);
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    if (client.connect("ESP32Client", "ESP32", "ESP32ESP32")) { // Add username and password here
      Serial.println("Connected to MQTT broker");
    } else {
      Serial.print("Failed with state ");
      Serial.println(client.state());
      delay(2000);
    }
  }
}

// Function to publish preset data over MQTT
void publishPreset(const Preset& preset) {
  if (client.connected()) {
    client.publish(mqtt_topic, preset.name.c_str());
    delay(10);
    for (const String& command : preset.midiCommands) {
      client.publish(mqtt_topic, command.c_str());
      delay(10);
    }
  }
}

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

  serializeJson(doc, Serial);
  Serial.println();
}

// Function to load a preset based on the selected preset index
void loadPreset(int index) {
  Serial.println("Loading preset: " + presets[index].name);
  publishPreset(presets[index]);
}

// Function to save the current preset to the selected slot
void savePreset(int index, const String& name, const String midiCommands[6]) {
  presets[index].name = name;
  for (int i = 0; i < 6; i++) {
    presets[index].midiCommands[i] = midiCommands[i];
  }
  Serial.println("Preset saved to slot " + String(index));
  savePresetsToJSON();
  publishPreset(presets[index]);
}

// Setup function
void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  encoder.setPosition(0);

  setupWiFi();  // Connect using WiFiManager
  setupMQTT();  // Connect to MQTT broker
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
    buttonPressed = true;
    lastButtonPressTime = currentTime;
    buttonPressCount++;  // Increment button press count
  } else if (buttonPressed && !buttonState) {
    if (waitingForSecondPress && (currentTime - lastButtonPressTime < doublePressInterval)) {
      String newPresetCommands[6] = {"C0N90V64", "C0N91V32", "C0N92V64", "C0N93V32", "C0N94V0", "C0N95V127"};
      savePreset(selectedPreset, String(selectedPreset), newPresetCommands);
      waitingForSecondPress = false;
    } else if (!waitingForSecondPress) {
      waitingForSecondPress = true;
    }
    buttonPressed = false;
  }

  // Check for triple press to open WiFiManager
  if (buttonPressCount >= 3) {
    Serial.println("Opening WiFi Manager...");
    WiFiManager wifiManager;
    wifiManager.startConfigPortal("MIDI_Controller_AP");
    buttonPressCount = 0;  // Reset counter after opening
  }

  if (waitingForSecondPress && (currentTime - lastButtonPressTime > singlePressTimeout)) {
    loadPreset(selectedPreset);
    waitingForSecondPress = false;
  }

  client.loop();  // Keep MQTT connection active
}
