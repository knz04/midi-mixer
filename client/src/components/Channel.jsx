import React from "react";
import CustomKnob from "./CustomKnob";

const Channel = ({
  rotary,
  fader,
  button,
  activeRotary,
  activeFader,
  activeButton,
}) => {
  const rotaryStyle = activeRotary ? "bg-blue-500" : "bg-gray-500";
  const faderStyle = activeFader ? "bg-blue-500" : "bg-gray-500";
  const buttonStyle = activeButton ? "bg-blue-500" : "bg-gray-500";
  const buttonText = button === 127 ? "On" : "Off"; // Dynamic text based on button value

  return (
    <div className="grid grid-rows-[max-content-1fr] py-6 justify-center">
      {/* Rotary Knob */}
      <div className={`py-4 px-4 ${rotaryStyle}`}>
        <CustomKnob value={rotary} />
      </div>

      {/* Fader */}
      <div className={`py-4 px-4 ${faderStyle}`}>
        <input
          type="range"
          min="0"
          max="127"
          value={fader}
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
          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
          disabled={!activeButton} // Disabled if button is not active
        >
          {buttonText} {/* Display On/Off based on button value */}
        </button>
      </div>
    </div>
  );
};

export default Channel;
