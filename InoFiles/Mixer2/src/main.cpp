#include <Arduino.h>
#include "config.h"
#include "rotary_encoders.h"
#include "mux.h"
#include "presets.h"
#include "faders.h"
#include "button.h"
#include "mqtt_manager.h"
#include <LittleFS.h>
#include <ArduinoJson.h>

#define WM_LITTLEFS 
MQTTManager mqttManager;

void formatLittleFS() {
    if (LittleFS.format()) {
        Serial.println("LittleFS formatted successfully.");
    } else {
        Serial.println("LittleFS format failed.");
    }
}

void listFiles() {
    File root = LittleFS.open("/");
    File file = root.openNextFile();
    while (file) {
        Serial.print("File: ");
        Serial.println(file.name());
        file = root.openNextFile();
    }
}

void setup() {
    Serial.begin(BAUD_RATE);
    delay(5000);
    if (!LittleFS.begin()) {
        Serial.println("Mount failed. Formatting LittleFS...");
        formatLittleFS(); // Force format LittleFS
        if (!LittleFS.begin()) {
            Serial.println("Failed to initialize LittleFS after formatting.");
            return;
        }
    }

    Serial.println("LittleFS initialized successfully.");

    //if (!LittleFS.begin()) {
    //    Serial.println("[ERROR] Failed to mount LittleFS. Ensure proper filesystem setup.");
    //    return;
    //} else {
    //    Serial.println("[INFO] LittleFS mounted successfully.");
    //}

    // Initialize other components
    initMux();
    initStorage();
    initEncoders();
    initializeFaderReadings();
    initPresets();
    listFiles();
    delay(5000);
}


void loop() {
    // Handle rotary encoders
    for (int i = 0; i < NUM_ENCODERS; i++) {
        handleEncoder(i);
    }
    //Serial.println("C0N61V127");
    //delay(500);
    //Serial.println("C0N71V0");
    //delay(500);
    //Serial.println("C0N72V64");
    //delay(500);
    //Serial.println("C0N80V72");
    
    //Serial1.println("C0N60V127");
    // Handle faders
    handleFaders();

    // Handle buttons
    handleButtons();  
    // Handle preset selection and bu   on actions
    updatePresetSelection();
    handlePresetButton(lastEncoderPos,lastFaderValue,buttonStates,mqttManager);
    mqttManager.loop();

}
