import React, { useRef, useState, useEffect } from "react";

const CustomKnob = ({ onChange, value }) => {
  const knobRef = useRef(null);
  const ringRef = useRef(null);
  const [lastRot, setLastRot] = useState(0); // Default rotation
  const maxRot = 140;
  const speed = 1.5;

  useEffect(() => {
    // Convert initial value (0-127) to rotation
    const initialRotation = ((value / 127) * 2 - 1) * maxRot;
    setLastRot(initialRotation);
    knobRef.current.style.transform = `rotate(${initialRotation}deg)`;
    ringRef.current.style.background = `conic-gradient(var(--accent) ${
      initialRotation > 0 ? initialRotation : 0
    }deg, rgba(255, 255, 255, 0.0) 0 360deg, var(--accent) 0deg)`;
  }, [value]);

  const handlePointerDown = (event) => {
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    knobRef.current.startY = event.clientY;
  };

  const handlePointerMove = (event) => {
    const delta = knobRef.current.startY - event.clientY;
    let currentY = lastRot + delta * speed;
    currentY = Math.max(-maxRot, Math.min(maxRot, currentY));
    knobRef.current.style.transform = `rotate(${currentY}deg)`;

    if (currentY > 0) {
      ringRef.current.style.background = `conic-gradient(var(--accent) ${currentY}deg, rgba(255, 255, 255, 0.0) 0 360deg, var(--accent) 0deg)`;
    } else {
      ringRef.current.style.background = `conic-gradient(var(--accent) 0deg, rgba(255, 255, 255, 0.0) 0 ${
        360 + currentY
      }deg, var(--accent) 0deg)`;
    }

    const newValue = Math.round(((currentY + maxRot) / (2 * maxRot)) * 127);
    onChange(Math.max(0, Math.min(127, newValue)));
  };

  const handlePointerUp = () => {
    setLastRot(
      parseFloat(
        knobRef.current.style.transform
          .replace("rotate(", "")
          .replace("deg)", "")
      )
    );
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerup", handlePointerUp);
  };

  return (
    <div className="knob-container" onPointerDown={handlePointerDown}>
      <div className="ring"></div>
      <div className="ring-fill" ref={ringRef}></div>
      <div className="space"></div>
      <div className="knob" ref={knobRef}>
        <div className="knob-indicator-container">
          <div className="knob-indicator"></div>
        </div>
      </div>
    </div>
  );
};

export default CustomKnob;
