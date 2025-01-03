#include <Arduino.h>
#include "MIDIUSB.h"
#include "OLEDDisplay.h"

OLEDDisplay oled;

void setup() {
    // Set up serial communication
    Serial.begin(115200); // USB serial for debugging
    Serial1.begin(115200); // UART communication
    // Initialize OLED
    oled.begin();
    oled.showMessage("SketchMIDI");
    // Confirm startup
    Serial.println("Pro Micro is ready to receive data...");

    delay(500);
    Serial1.println("Pro Micro is ready to receive data...");
}

void loop() {
    // Check if data is available on Serial1
    if (Serial1.available() > 0) {
        String receivedData = Serial1.readStringUntil('\n');

        // Print received data to the USB serial for debugging
        Serial.print("Received: ");
        Serial.println(receivedData);
        // Parse the received MIDI message
        if (receivedData.startsWith("C0")) {
            int noteIndex = receivedData.indexOf('N') + 1;
            int velocityIndex = receivedData.indexOf('V') + 1;

            // Extract note and velocity from the received message
            int note = receivedData.substring(noteIndex, velocityIndex - 1).toInt();
            int velocity = receivedData.substring(velocityIndex).toInt();

            // Determine message type
            String component;
        if (note >= 70 && note < 80) {
            component = "BT" + String(note % 10);  // Buttons
        } else if (note >= 60 && note < 70) {
            component = "RT" + String(note % 10);  // Rotary
        } else if (note >= 80 && note < 90) {
            component = "FD" + String(note % 10);  // Faders
        } else {
            component = "Unknown";
        }

            // Display on OLED
            oled.updateMessage(component, velocity);

            // Send MIDI Note On or Note Off message based on velocity
            if (velocity > 0) {
                midiEventPacket_t noteOn = {0x09, 0x90 | 0x00, note, velocity};
                MidiUSB.sendMIDI(noteOn);
                MidiUSB.flush();
                Serial.println("Sent Note On");
            } else {
                midiEventPacket_t noteOff = {0x08, 0x80 | 0x00, note, 0};
                MidiUSB.sendMIDI(noteOff);
                MidiUSB.flush();
                Serial.println("Sent Note Off");
            }
        }
    if (receivedData.startsWith("Selected preset: ")) {
        int preset = receivedData.substring(17).toInt();
        oled.showMessage("PR " + String(preset));
    } else if (receivedData.startsWith("Preset saved: ")) {
        int preset = receivedData.substring(14).toInt();
        oled.showMessage("SV " + String(preset));
    } else if (receivedData.startsWith("Preset loaded: ")) {
        int preset = receivedData.substring(15).toInt();
        oled.showMessage("LD " + String(preset));
    }
    else if (receivedData.startsWith("MQTT Disabled")) {
        oled.showMessage("W OFF ");
    }
    else if (receivedData.startsWith("Connected")) {
        oled.showMessage("W ON");
    }
    else if (receivedData.startsWith("pair : ")){
        String code = receivedData.substring(7);
        oled.showMessage(code);
    }

    else if (receivedData.startsWith("Enabling")){
        oled.showMessage("W LD");
    }
    
    }
}