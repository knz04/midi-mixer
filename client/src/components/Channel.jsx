import React, { useState, useEffect } from "react";
import CustomKnob from "./CustomKnob";

const Channel = ({
  idx,
  rotary,
  fader,
  button,
  activeRotary,
  activeFader,
  activeButton,
  onUpdate,
}) => {
  const rotaryStyle = activeRotary ? "bg-blue-500" : "bg-gray-500";
  const faderStyle = activeFader ? "bg-blue-500" : "bg-gray-500";
  const buttonStyle = activeButton ? "bg-blue-500" : "bg-gray-500";

  // Initialize state for fader and button values
  const [rotaryValue, setRotaryValue] = useState(rotary);
  const [faderValue, setFaderValue] = useState(fader);
  const [buttonValue, setButtonValue] = useState(button);

  useEffect(() => {
    setFaderValue(fader);
  }, [fader]);

  useEffect(() => {
    setButtonValue(button);
  }, [button]);

  useEffect(() => {
    setRotaryValue(rotary);
  }, [rotary]);

  const handleFaderChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    console.log(`Fader ${idx + 1}: ${newValue}`);
    setFaderValue(newValue);
    onUpdate({
      rotary,
      fader: newValue,
      button: buttonValue,
      activeRotary,
      activeFader: true,
      activeButton,
    });
  };

  const handleKnobChange = (index, value) => {
    console.log(`Rotary ${index + 1}: `, value);
    onUpdate({
      rotary: value,
      fader: faderValue,
      button: buttonValue,
      activeRotary: true,
      activeFader,
      activeButton,
    });
  };

  const handleButtonToggle = () => {
    const newValue = buttonValue === 127 ? 0 : 127;
    setButtonValue(newValue);
    console.log(`Button ${idx + 1}: ${newValue === 127 ? "On" : "Off"}`);
    onUpdate({
      rotary,
      fader: faderValue,
      button: newValue,
      activeRotary,
      activeFader,
      activeButton: true,
    });
  };

  // Dynamic button text
  const buttonText = buttonValue === 127 ? "On" : "Off";

  return (
    <div className="grid grid-rows-[max-content-1fr] py-6 justify-center">
      {/* Rotary Knob */}
      <div className={`py-4 px-4 ${rotaryStyle}`}>
        <CustomKnob
          value={rotaryValue}
          onChange={(value) => handleKnobChange(idx, value)}
          disabled={!activeRotary}
        />
      </div>
      {/* Fader */}
      <div className={`py-4 px-4 ${faderStyle}`}>
        <input
          type="range"
          min="0"
          max="127"
          value={faderValue} // Correct value now passed
          onChange={handleFaderChange}
          className="appearance-none h-48 w-4 rounded-lg margin-20"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
          }}
          disabled={!activeFader} // Disabled if fader is not active
        />
      </div>
      {/* Button */}
      <div className={`py-4 px-4 ${buttonStyle}`}>
        <button
          onClick={handleButtonToggle}
          className={`${
            activeButton
              ? "bg-white hover:bg-blue-100 text-gray-800 font-semibold"
              : "bg-gray-200 text-gray-400"
          } py-2 px-4 border border-gray-400 rounded shadow`}
          disabled={!activeButton}
        >
          {buttonText} {/* Display On/Off based on button value */}
        </button>
      </div>
    </div>
  );
};

export default Channel;
