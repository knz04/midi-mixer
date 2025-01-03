#include <WiFiManager.h>         // WiFi Manager library
#include <PubSubClient.h>        // MQTT client library for ESP32
#include <WiFiClientSecure.h>    // WiFi Secure Client library

const char* mqtt_server = "e0d1458af7764ee788c14d0501883ccb.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_user = "Midi";
const char* mqtt_pass = "midimidi";

WiFiClientSecure espClient;
PubSubClient client(espClient);

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

String uniqueID;
String mqttTopic;
bool isPaired = false;  // Status variable to track pairing

// Function to generate pairing code from MAC address
String generatePairingCode() {
    String macAddress = WiFi.macAddress();
    macAddress.replace(":", "");  // Remove colons
    return macAddress;
}

// MQTT message callback function
void callback(char* topic, byte* payload, unsigned int length) {
    String message;
    for (int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    Serial.println("Message received on topic: " + String(topic));
    Serial.println("Message: " + message);

    // Check if the message is the confirmation message
    if (message == "confirm") {
        isPaired = true;  // Set pairing status to true
        Serial.println("Device is now paired!");
    }
}

// Function to connect to MQTT server and subscribe to unique topic
void connectToMQTT() {
    Serial.println("Connecting to MQTT...");
    if (client.connect("ESP32Client", mqtt_user, mqtt_pass)) {
        Serial.println("Connected to MQTT broker!");
        client.subscribe(mqttTopic.c_str());
        Serial.println("Subscribed to topic: " + mqttTopic);
    } else {
        Serial.print("MQTT connection failed, state: ");
        Serial.println(client.state());
        delay(2000);
    }
}

void setup() {
    Serial.begin(115200);
    client.setCallback(callback);  // Set callback function

    WiFiManager wifiManager;
    if (!wifiManager.autoConnect("MIDI_Controller_AP")) {
        Serial.println("Failed to connect to Wi-Fi. Restarting...");
        delay(3000);
        ESP.restart();
    }

    Serial.println("Connected to Wi-Fi!");

    uniqueID = generatePairingCode();
    mqttTopic = "midi/" + uniqueID + "/messages";
    Serial.println("Pairing Code (Unique ID): " + uniqueID);
    Serial.println("MQTT Topic: " + mqttTopic);

    espClient.setCACert(root_ca);
    client.setServer(mqtt_server, mqtt_port);

    connectToMQTT();
}

void publishMIDIMessage() {
    if (client.connected()) {
        String midiMessage = "C1N60V1";  // Example MIDI message
        client.publish(mqttTopic.c_str(), midiMessage.c_str());
        Serial.println("Published MIDI message to " + mqttTopic + ": " + midiMessage);
    } else {
        connectToMQTT();
    }
}

void loop() {
    if (!client.connected()) {
        connectToMQTT();
    }
    client.loop();

    // Display pairing code if not paired
    if (!isPaired) {
        Serial.println("Displaying Pairing Code: " + uniqueID);
    }

    // Call publishMIDIMessage() as needed in the loop
    publishMIDIMessage();
    delay(2000);  // Delay for demonstration
}
