import React, { useState, useEffect } from "react";
import Channel from "./Channel";
import mqtt from "mqtt";

const host =
  "wss://f39a69e4dedc479e9f339f5111d80be5.s1.eu.hivemq.cloud:8884/mqtt";

const options = {
  clientId: "client" + Math.random().toString(36).substring(7),
  protocol: "wss", // Ensure 'wss' for WebSocket over SSL/TLS
  username: "sketchmidi",
  password: "Sketchmidi123",
  clean: true,
  reconnectPeriod: 1000, // Auto-reconnect every 1 second
};

const topic = "midi/update";

const NewMixer = () => {
  const [mqttMessage, setMqttMessage] = useState("");
  const [channels, setChannels] = useState([
    {
      rotary: 0,
      fader: 0,
      button: 0,
      activeRotary: false,
      activeFader: false,
      activeButton: false,
    },
    {
      rotary: 0,
      fader: 0,
      button: 0,
      activeRotary: false,
      activeFader: false,
      activeButton: false,
    },
    {
      rotary: 0,
      fader: 0,
      button: 0,
      activeRotary: false,
      activeFader: false,
      activeButton: false,
    },
    {
      rotary: 0,
      fader: 0,
      button: 0,
      activeRotary: false,
      activeFader: false,
      activeButton: false,
    },
    {
      rotary: 0,
      fader: 0,
      button: 0,
      activeRotary: false,
      activeFader: false,
      activeButton: false,
    },
    {
      rotary: 0,
      fader: 0,
      button: 0,
      activeRotary: false,
      activeFader: false,
      activeButton: false,
    },
  ]);

  // MQTT Client Logic
  useEffect(() => {
    const client = mqtt.connect(host, options);
    client.on("connect", () => {
      console.log("Connected to MQTT broker");
      client.subscribe(topic, (err) => {
        if (err) {
          console.error("Subscription error:", err);
          setMqttMessage("Error subscribing to topic.");
        } else {
          console.log(`Subscribed to topic: ${topic}`);
        }
      });
    });

    client.on("error", (err) => {
      console.error("Connection error:", err);
      setMqttMessage("Error connecting to MQTT broker.");
    });

    client.on("message", (topic, message) => {
      const midiMessage = message.toString();
      // Example: Parse MIDI message C0N60V1
      const channelIndex = parseInt(midiMessage.slice(4));
      const node = parseInt(midiMessage.slice(3)); // Node number
      const velocity = parseInt(midiMessage.slice(6)); // Velocity (button state)

      console.log("Parsed values:", {
        channelIndex,
        node,
        velocity,
      });

      setChannels((prev) => {
        const updatedChannels = [...prev];
        const channel = updatedChannels[channelIndex];

        if (node >= 60 && node <= 69) {
          channel.rotary = velocity;
          channel.activeRotary = true; // Mark rotary as active
        } else if (node >= 70 && node <= 79) {
          channel.fader = velocity;
          channel.activeFader = true; // Mark fader as active
        } else if (node >= 80 && node <= 89) {
          channel.button = velocity;
          channel.activeButton = true; // Button active if velocity is 127
        }

        return updatedChannels;
      });
    });

    client.on("close", () => {
      console.log("Connection closed");
    });

    // Cleanup on component unmount
    return () => {
      client.end();
    };
  }, []);

  return (
    <div className="mixer">
      <div className="grid grid-cols-6">
        {channels.map((channel, index) => (
          <Channel
            key={index}
            rotary={channel.rotary}
            fader={channel.fader}
            button={channel.button}
            activeRotary={channel.activeRotary}
            activeFader={channel.activeFader}
            activeButton={channel.activeButton}
          />
        ))}
      </div>
    </div>
  );
};

export default NewMixer;
