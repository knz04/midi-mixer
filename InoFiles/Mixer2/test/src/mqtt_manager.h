#ifndef MQTT_MANAGER_H
#define MQTT_MANAGER_H
#include <config.h>
#include <WiFiManager.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>

class MQTTManager {
public:
    void init(const char* server, int port, const char* user, const char* pass, const char* rootCa);
    void loop();
    void publish(const String& topic, const String& message);
    void toggleMQTT(); // Enable/disable MQTT functionality

    void handlePresetSave(); // Publish when a preset is saved
    void handleControlUpdate(const String& message); // Publish control updates
    void handleMessage(char *topic, byte *payload, unsigned int length);
    void checkRotaryPress(int rotaryIndex, bool isPressed); // Handle 5 presses for toggle

private:
    void connect();
    String generatePairingCode();
    bool initialized = false;
    WiFiClientSecure espClient;
    PubSubClient client;
    String uniqueID;
    String mqttTopic;
    String mqttTopic2;
    bool isMQTTEnabled = false; // Tracks MQTT functionality state
    int rotaryPressCount = 0;
    unsigned long lastPressTime = 0;
    static constexpr unsigned long PRESS_INTERVAL = 300; // Max interval between consecutive presses (ms)
};

#endif
