import React, { useState, useEffect } from "react";
import CustomKnob from "./CustomKnob";

const Mixer = ({ channels }) => {
  const [faderValues, setFaderValues] = useState([]);
  const [activeState, setActiveState] = useState([]);
  const [buttonStates, setButtonStates] = useState([]);

  useEffect(() => {
    if (channels) {
      const initialFaderValues = channels.map((channel) =>
        channel.component === "fader" ? channel.value : 64
      );
      const initialActiveStates = channels.map(
        (channel) => channel.component !== undefined
      );
      const initialButtonStates = channels.map(
        (channel) => channel.component === "button" && channel.button
      );

      setFaderValues(initialFaderValues);
      setActiveState(initialActiveStates);
      setButtonStates(initialButtonStates);
    }
  }, [channels]);

  const handleKnobChange = (index, value) => {
    console.log(`Knob ${index + 1} value:`, value);
  };

  const handleFaderChange = (index, value) => {
    const newValues = [...faderValues];
    newValues[index] = Math.max(0, Math.min(127, value));
    setFaderValues(newValues);
    console.log(`Fader ${index + 1} value:`, newValues[index]);
  };

  const handleButtonToggle = (index) => {
    const newButtonStates = [...buttonStates];
    newButtonStates[index] = !newButtonStates[index];
    setButtonStates(newButtonStates);
    console.log(
      `Button ${index + 1} is now:`,
      newButtonStates[index] ? "On" : "Off"
    );
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="flex space-x-8">
        {channels?.map((channel, idx) => (
          <div key={idx} className="flex flex-col items-center">
            {/* Knob for rotary */}
            {channel.component === "rotary" && (
              <CustomKnob
                value={channel.value || 64} // Pass initial value to CustomKnob
                onChange={(value) => handleKnobChange(idx, value)}
                isActive={activeState[idx]}
              />
            )}
            {/* Fader for faders */}
            {channel.component === "fader" && (
              <input
                type="range"
                min="0"
                max="127"
                value={faderValues[idx]}
                onChange={(e) => handleFaderChange(idx, e.target.value)}
                disabled={!activeState[idx]}
                className={`appearance-none h-32 w-4 rounded-lg margin-20 ${
                  activeState[idx] ? "bg-blue-500" : "bg-gray-300"
                }`}
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                }}
              />
            )}
            {/* Button for button components */}
            {channel.component === "button" && (
              <button
                onClick={() => handleButtonToggle(idx)}
                className={`px-4 py-2 rounded ${
                  buttonStates[idx] ? "bg-green-500" : "bg-red-500"
                } text-white hover:opacity-80`}
              >
                {buttonStates[idx] ? "On" : "Off"}
              </button>
            )}
            {/* Channel label */}
            <p className="text-white">CH {idx + 1}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mixer;
