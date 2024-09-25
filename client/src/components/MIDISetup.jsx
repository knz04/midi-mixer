import React, { useState, useEffect } from "react";

const MIDISetup = () => {
  const [midiAccess, setMidiAccess] = useState(null);
  const [output, setOutput] = useState(null);
  const [sliders, setSliders] = useState({
    track1: 0,
    track2: 0,
    track3: 0,
  });

  // Initialize MIDI Access
  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
      console.error("Web MIDI API is not supported in this browser.");
    }
  }, []);

  const onMIDISuccess = (midi) => {
    setMidiAccess(midi);
    const outputs = Array.from(midi.outputs.values());
    if (outputs.length > 0) {
      setOutput(outputs[0]); // Set the first available output
    }
  };

  const onMIDIFailure = () => {
    console.error("Could not access your MIDI devices.");
  };

  // Function to send MIDI CC message
  const sendMIDIMessage = (ccNumber, value) => {
    if (output) {
      const channel = 0; // Using channel 0 for simplicity
      const midiMessage = [0xb0 + channel, ccNumber, value];
      output.send(midiMessage); // Send the MIDI message
      console.log(`Sent CC ${ccNumber} with value ${value}`);
    } else {
      console.error("No MIDI output available.");
    }
  };

  // Handle slider change
  const handleSliderChange = (track, value) => {
    setSliders((prevSliders) => ({
      ...prevSliders,
      [track]: value,
    }));

    const trackCCMapping = {
      track1: 7, // MIDI CC for track 1 volume
      track2: 8, // MIDI CC for track 2 volume
      track3: 9, // MIDI CC for track 3 volume
    };

    sendMIDIMessage(trackCCMapping[track], value);
  };

  return (
    <div>
      <h1>MIDI Setup</h1>
      <div>
        <p>Connected to: {output ? output.name : "No MIDI output"}</p>
        <div>
          <label>Track 1 Volume: {sliders.track1}</label>
          <input
            type="range"
            min="0"
            max="127"
            value={sliders.track1}
            onChange={(e) =>
              handleSliderChange("track1", parseInt(e.target.value))
            }
          />
        </div>
        <div>
          <label>Track 2 Volume: {sliders.track2}</label>
          <input
            type="range"
            min="0"
            max="127"
            value={sliders.track2}
            onChange={(e) =>
              handleSliderChange("track2", parseInt(e.target.value))
            }
          />
        </div>
        <div>
          <label>Track 3 Volume: {sliders.track3}</label>
          <input
            type="range"
            min="0"
            max="127"
            value={sliders.track3}
            onChange={(e) =>
              handleSliderChange("track3", parseInt(e.target.value))
            }
          />
        </div>
      </div>
    </div>
  );
};

export default MIDISetup;
