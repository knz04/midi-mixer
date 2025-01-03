const mqtt = require('mqtt');

// Set up your MQTT broker details
const brokerUrl = 'mqtts://e0d1458af7764ee788c14d0501883ccb.s1.eu.hivemq.cloud:8883'; // Secure TLS connection
const mqttUser = 'Midi';         // MQTT username
const mqttPass = 'midimidi';     // MQTT password

// Define the topics
const uniqueID = 'CC8DA2ECBDD4'; // Replace with the unique ID from your ESP32
const esp32Topic = `midi/${uniqueID}/messages`; // Topic to send confirmation message to ESP32
const midiReceiveTopic = `midi/${uniqueID}/messages`;       // Topic to listen for incoming MIDI messages

// Connect to the MQTT broker
const client = mqtt.connect(brokerUrl, {
    username: mqttUser,
    password: mqttPass,
    protocol: 'mqtts'
});

// When connected, subscribe to the topic for incoming MIDI messages and publish a confirmation message
client.on('connect', () => {
    console.log('Connected to MQTT broker');

    // Subscribe to the topic to receive MIDI messages from ESP32
    client.subscribe(midiReceiveTopic, (err) => {
        if (!err) {
            console.log(`Subscribed to topic: ${midiReceiveTopic}`);
        } else {
            console.error('Subscription error:', err);
        }
    });

    // Send the "confirm" message to the ESP32's unique topic after a 2-second delay
    setTimeout(() => {
        client.publish(esp32Topic, 'confirm', () => {
            console.log(`Confirmation message sent to ESP32 topic: ${esp32Topic}`);
        });
    }, 2000); // Delay before publishing confirmation
});

// Listen for messages on the subscribed MIDI topic
client.on('message', (topic, message) => {
    console.log(`Received message on ${topic}: ${message.toString()}`);
    // Process the MIDI message or take additional actions if needed
});

// Error handling
client.on('error', (error) => {
    console.error('Connection error:', error);
});
