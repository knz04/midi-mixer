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


MQTTManager mqttManager;

void setup() {
    Serial.begin(BAUD_RATE);
    // Initialize MUX
    initMux();

    // Initialize rotary encoders
    initEncoders();

    // Initialize faders
    initializeFaderReadings();

    // Initialize presets
    initPresets();
    
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
