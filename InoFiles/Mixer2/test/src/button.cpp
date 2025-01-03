#include "button.h"
#include "mux.h"
#include "config.h"
#include "mqtt_manager.h"

extern MQTTManager mqttManager;
int buttonStates[NUM_BUTTONS] = {HIGH};

void handleButtons() {
    for (int i = 0; i < NUM_BUTTONS; i++) {
        selectMuxChannel(i);
        int currentState = digitalRead(signalPinButton);

        if (currentState != buttonStates[i]) {
            String midiMessage = "C0N" + String(70 + i) + "V" + (currentState == LOW ? "127" : "0");
            Serial.println(midiMessage);
            Serial1.println(midiMessage);
            mqttManager.handleControlUpdate(midiMessage);
            buttonStates[i] = currentState;
        }
    }
}
