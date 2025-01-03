#include "mqtt_manager.h"
#include "config.h"

const char* mqtt_server = "e0d1458af7764ee788c14d0501883ccb.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_user = "Midi";
const char* mqtt_pass = "midimidi";
static const char *root_ca PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAw
TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh
cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMTUwNjA0MTEwNDM4
WhcNMzUwNjA0MTEwNDM4WjBPMQswCQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJu
ZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBY
MTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAK3oJHP0FDfzm54rVygc
h77ct984kIxuPOZXoHj3dcKi/vVqbvYATyjb3miGbESTtrFj/RQSa78f0uoxmyF+
0TM8ukj13Xnfs7j/EvEhmkvBioZxaUpmZmyPfjxwv60pIgbz5MDmgK7iS4+3mX6U
A5/TR5d8mUgjU+g4rk8Kb4Mu0UlXjIB0ttov0DiNewNwIRt18jA8+o+u3dpjq+sW
T8KOEUt+zwvo/7V3LvSye0rgTBIlDHCNAymg4VMk7BPZ7hm/ELNKjD+Jo2FR3qyH
B5T0Y3HsLuJvW5iB4YlcNHlsdu87kGJ55tukmi8mxdAQ4Q7e2RCOFvu396j3x+UC
B5iPNgiV5+I3lg02dZ77DnKxHZu8A/lJBdiB3QW0KtZB6awBdpUKD9jf1b0SHzUv
KBds0pjBqAlkd25HN7rOrFleaJ1/ctaJxQZBKT5ZPt0m9STJEadao0xAH0ahmbWn
OlFuhjuefXKnEgV4We0+UXgVCwOPjdAvBbI+e0ocS3MFEvzG6uBQE3xDk3SzynTn
jh8BCNAw1FtxNrQHusEwMFxIt4I7mKZ9YIqioymCzLq9gwQbooMDQaHWBfEbwrbw
qHyGO0aoSCqI3Haadr8faqU9GY/rOPNk3sgrDQoo//fb4hVC1CLQJ13hef4Y53CI
rU7m2Ys6xt0nUW7/vGT1M0NPAgMBAAGjQjBAMA4GA1UdDwEB/wQEAwIBBjAPBgNV
HRMBAf8EBTADAQH/MB0GA1UdDgQWBBR5tFnme7bl5AFzgAiIyBpY9umbbjANBgkq
hkiG9w0BAQsFAAOCAgEAVR9YqbyyqFDQDLHYGmkgJykIrGF1XIpu+ILlaS/V9lZL
ubhzEFnTIZd+50xx+7LSYK05qAvqFyFWhfFQDlnrzuBZ6brJFe+GnY+EgPbk6ZGQ
3BebYhtF8GaV0nxvwuo77x/Py9auJ/GpsMiu/X1+mvoiBOv/2X/qkSsisRcOj/KK
NFtY2PwByVS5uCbMiogziUwthDyC3+6WVwW6LLv3xLfHTjuCvjHIInNzktHCgKQ5
ORAzI4JMPJ+GslWYHb4phowim57iaztXOoJwTdwJx4nLCgdNbOhdjsnvzqvHu7Ur
TkXWStAmzOVyyghqpZXjFaH3pO3JLF+l+/+sKAIuvtd7u+Nxe5AW0wdeRlN8NwdC
jNPElpzVmbUq4JUagEiuTDkHzsxHpFKVK7q4+63SM1N95R1NbdWhscdCb+ZAJzVc
oyi3B43njTOQ5yOf+1CceWxG1bQVs5ZufpsMljq4Ui0/1lvh+wjChP4kqKOJ2qxq
4RgqsahDYVvTH9w7jXbyLeiNdd8XM2w9U/t7y0Ff/9yi0GE44Za4rF2LN9d11TPA
mRGunUHBcnWEvgJBQl9nJEiU0Zsnvgc/ubhPgXRR4Xq37Z0j4r7g1SgEEzwxA57d
emyPxgcYxn/eR44/KJ4EBs+lVDR3veyJm+kXQ99b21/+jh5Xos1AnX5iItreGCc=
-----END CERTIFICATE-----
)EOF";

void MQTTManager::init(const char* server, int port, const char* user, const char* pass, const char* rootCa) {
    if (initialized) {
        Serial.println("MQTT already initialized.");
        return;
    }
    client.setClient(espClient);
    client.setServer(server, port);

    espClient.setCACert(rootCa);

    uniqueID = generatePairingCode();
    //mqttTopic = "midi/update";
    mqttTopic = "midi/" + uniqueID + "/update";
    mqttTopic2 = "midi/" + uniqueID + "/preset";
    Serial.println("MQTT Topic: " + mqttTopic);

    initialized = true; // Mark as initialized
}

void MQTTManager::loop() {
    if (isMQTTEnabled && !client.connected()) {
        connect();
    }
    client.loop();
}

void MQTTManager::publish(const String& topic, const String& message) {
    if (isMQTTEnabled && client.connected()) {
        client.publish(topic.c_str(), message.c_str());
        Serial.println("Published: " + message + " to " + topic);
    }
}

void MQTTManager::connect() {
    if (client.connect("ESP32Client", mqtt_user, mqtt_pass)) {
        Serial.println("Connected to MQTT broker!");
        delay(500);
        Serial.println("pair : " + generatePairingCode());
        client.subscribe(mqttTopic.c_str());
        String receiveTopic = "midi/" + uniqueID + "/receive";
        client.subscribe(receiveTopic.c_str()); // Subscribe to the receive topic
        Serial.println("Subscribed to: " + receiveTopic);
    } else {
        Serial.println("MQTT connection failed. Retrying...");
        delay(2000);
        isMQTTEnabled = false;
    }
}


String MQTTManager::generatePairingCode() {
    String macAddress = WiFi.macAddress();
    macAddress.replace(":", "");
    return macAddress;
}

void MQTTManager::toggleMQTT() {
    if (!isMQTTEnabled) {
        Serial.println("Enabling MQTT...");
        // Ensure Wi-Fi is connected before initializing MQTT
        WiFiManager wifiManager;
        if (!wifiManager.autoConnect("MIDI_Controller_AP")) {
            Serial.println("Failed to connect to Wi-Fi. Restarting...");
            delay(3000);
            ESP.restart();
        }
        init(mqtt_server, mqtt_port, mqtt_user, mqtt_pass, root_ca);
    } else {
        Serial.println("Disabling MQTT...");
        client.disconnect(); // Cleanly disconnect from MQTT broker

        if (WiFi.status() == WL_CONNECTED) {
            WiFi.disconnect(true); // Disconnect Wi-Fi
            Serial.println("Wi-Fi Disconnected");
        }
    }
    isMQTTEnabled = !isMQTTEnabled;
    Serial.println(isMQTTEnabled ? "MQTT Enabled" : "MQTT Disabled");
}


void MQTTManager::handlePresetSave() {
    String presetMessage = "Preset saved!";
    publish(mqttTopic2, presetMessage);
}

void MQTTManager::handleControlUpdate(const String& message) {
    publish(mqttTopic, message);
}

void MQTTManager::handleMessage(char* topic, byte* payload, unsigned int length) {
    String message;
    for (unsigned int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    // Check if the message is for control updates
    if (String(topic).endsWith("/receive")) {
        // Handle incoming control updates
        Serial.println("Handling control update: " + message);
        // Add logic here to process the update, e.g., change encoder or fader values
    }
}


void MQTTManager::checkRotaryPress(int rotaryIndex, bool isPressed) {
    if (rotaryIndex == 0 && isPressed) { // Assume preset rotary is index 0
        unsigned long now = millis();
        if (now - lastPressTime < PRESS_INTERVAL) {
            rotaryPressCount++;
        } else {
            rotaryPressCount = 1; // Reset count if too much time has passed
        }
        lastPressTime = now;

        if (rotaryPressCount >= 5) {
            toggleMQTT();
            Serial.println("Mqtt Toggle");
            rotaryPressCount = 0; // Reset the press count
        }
    }
}
