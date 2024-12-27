import React, { useState, useEffect } from "react";
import Channel from "./Channel";
import SavePreset from "./SavePreset";
import mqtt from "mqtt";

// MQTT Setup
const host =
  "wss://e0d1458af7764ee788c14d0501883ccb.s1.eu.hivemq.cloud:8884/mqtt";

const options = {
  clientId: "client" + Math.random().toString(36).substring(7),
  protocol: "wss", // Ensure 'wss' for WebSocket over SSL/TLS
  username: "Midi",
  password: "midimidi",
  clean: true,
  reconnectPeriod: 1000, // Auto-reconnect every 1 second
};

const NewMixer = ({ state, preset, device, setState }) => {
  const topic = `midi/${device}/update`;
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

      // Update state to true when a message is received
      setState(true);

      setChannels((prev) => {
        const updatedChannels = [...prev];
        const channel = updatedChannels[channelIndex];
        console.log("channel: ", channel);

        if (node >= 60 && node <= 69) {
          channel.rotary = velocity;
          channel.activeRotary = true; // Mark rotary as active
        } else if (node >= 80 && node <= 89) {
          channel.fader = velocity;
          channel.activeFader = true; // Mark fader as active
        } else if (node >= 70 && node <= 79) {
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
  }, [setState]);

  // New mapping for preset data transformation
  const transformPresetData = (presetData) => {
    const channels = [];

    // Iterate over the preset data to map components to channels
    presetData.forEach(({ channel, component, value }) => {
      // Ensure the channel exists in the array
      if (!channels[channel - 1]) {
        channels[channel - 1] = {
          rotary: 0,
          fader: 0,
          button: 0,
          activeRotary: false,
          activeFader: false,
          activeButton: false,
        };
      }

      // Map components to the appropriate properties
      if (component === "rotary") {
        channels[channel - 1].rotary = value;
        channels[channel - 1].activeRotary = true;
      } else if (component === "fader") {
        channels[channel - 1].fader = value;
        channels[channel - 1].activeFader = true;
      } else if (component === "button") {
        channels[channel - 1].button = value;
        channels[channel - 1].activeButton = value === 127; // Button active if value is 127
      }
    });

    // Fill any undefined channels with default values
    for (let i = 0; i < 6; i++) {
      if (!channels[i]) {
        channels[i] = {
          rotary: 0,
          fader: 0,
          button: 0,
          activeRotary: false,
          activeFader: false,
          activeButton: false,
        };
      }
    }

    return channels;
  };

  // Use preset data transformation
  const transformedPresetData = preset ? transformPresetData(preset) : [];
  console.log("transformedPresetData: ", transformedPresetData);

  // Determine which data to use based on 'state'
  const channelsToUse = state ? channels : transformedPresetData;

  // Function to handle updates from child
  const handleChannelUpdate = (channelIndex, updatedChannel) => {
    setChannels((prevChannels) => {
      const newChannels = [...prevChannels];
      newChannels[channelIndex] = updatedChannel; // Update the specific channel
      return newChannels;
    });
  };

  useEffect(() => {
    console.log("Current channel state in parent:", channelsToUse);
  }, [channelsToUse]);

  return (
    <div>
      <div className="mixer">
        <div className="grid grid-cols-6">
          {channelsToUse.map((channel, index) => (
            <Channel
              key={index}
              idx={index}
              rotary={channel.rotary}
              fader={channel.fader}
              button={channel.button}
              activeRotary={channel.activeRotary}
              activeFader={channel.activeFader}
              activeButton={channel.activeButton}
              onUpdate={(updatedChannel) =>
                handleChannelUpdate(index, updatedChannel)
              }
            />
          ))}
        </div>

        {/* <SavePreset channels={channelsToUse} /> */}
      </div>
    </div>
  );
};

export default NewMixer;
