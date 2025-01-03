//#include "button.h"
//#include "mux.h"
//#include "config.h"
//#include "mqtt_manager.h"
//
//extern MQTTManager mqttManager;
//int buttonStates[NUM_BUTTONS] = {HIGH};
//
//void handleButtons() {
//    for (int i = 0; i < NUM_BUTTONS; i++) {
//        selectMuxChannel(i);
//        int currentState = digitalRead(signalPinButton);
//
//        if (currentState != buttonStates[i]) {
//            String midiMessage = "C0N" + String(70 + i) + "V" + (currentState == LOW ? "127" : "0");
//            Serial.println(midiMessage);
//            Serial1.println(midiMessage);
//            mqttManager.handleControlUpdate(midiMessage);
//            buttonStates[i] = currentState;
//        }
//    }
//}
//

#include "button.h"
#include "mux.h"
#include "config.h"
#include "mqtt_manager.h"

extern MQTTManager mqttManager;

// Button state arrays
int buttonStates[NUM_BUTTONS] = {HIGH};       // Tracks physical button states
bool buttonToggleStates[NUM_BUTTONS] = {false}; // Tracks toggle states (true = enabled, false = disabled)

void handleButtons() {
    for (int i = 0; i < NUM_BUTTONS; i++) {
        selectMuxChannel(i);
        int currentState = digitalRead(signalPinButton);

        // Check for button press event (transition from HIGH to LOW)
        if (currentState == LOW && buttonStates[i] == HIGH) {
            // Toggle the state
            buttonToggleStates[i] = !buttonToggleStates[i];

            // Generate the MIDI message based on the toggle state
            String midiMessage = "C0N" + String(70 + i) + "V" + (buttonToggleStates[i] ? "127" : "0");
            Serial.println(midiMessage);
            Serial1.println(midiMessage);
            mqttManager.handleControlUpdate(midiMessage);
        }

        // Update the physical state
        buttonStates[i] = currentState;
    }
}
