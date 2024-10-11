import React, { useState } from "react";
import toast from "react-hot-toast";

const AddPreset = ({ onClose }) => {
  const [presetName, setPresetName] = useState("");
  const [description, setDescription] = useState("");
  const [channels, setChannels] = useState([
    { rotary: 0, fader: 0, button: false }, // Changed mute to button
  ]);

  const handleAddChannel = () => {
    setChannels([...channels, { rotary: 0, fader: 0, button: false }]); // Changed mute to button
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form data to be sent to the backend
    const presetData = {
      presetName,
      description,
      channels: channels.map((channel, index) => ({
        channel: index + 1, // Assuming channel numbers start from 1
        button: channel.button, // Using button instead of mute
        fader: channel.fader,
        rotary: channel.rotary,
      })),
    };

    try {
      // Make a request to the backend to create a new preset, including credentials (cookies)
      const response = await fetch("http://localhost:8000/presets/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(presetData),
        credentials: "include", // Include cookies in the request
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Preset created:", data);
        toast.success("Preset created successfully!");
        onClose(); // Close the form after successful creation
      } else {
        console.error("Failed to create preset");
        toast.error("Failed to create preset");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Create a New Preset</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Preset Name</label>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label>Channels</label>
            <p>(Insert import from device button here.)</p>
            {channels.map((channel, index) => (
              <div key={index}>
                <label>Rotary Potentiometer</label>
                <input
                  type="number"
                  value={channel.rotary}
                  onChange={(e) =>
                    setChannels(
                      channels.map(
                        (ch, i) =>
                          i === index
                            ? { ...ch, rotary: Number(e.target.value) }
                            : ch // Convert to number
                      )
                    )
                  }
                  required
                />
                <label>Fader Potentiometer</label>
                <input
                  type="number"
                  value={channel.fader}
                  onChange={(e) =>
                    setChannels(
                      channels.map(
                        (ch, i) =>
                          i === index
                            ? { ...ch, fader: Number(e.target.value) }
                            : ch // Convert to number
                      )
                    )
                  }
                  required
                />
                <label>
                  Mute
                  <input
                    type="checkbox"
                    checked={channel.button} // Changed to button
                    onChange={(e) =>
                      setChannels(
                        channels.map(
                          (ch, i) =>
                            i === index
                              ? { ...ch, button: e.target.checked }
                              : ch // Changed to button
                        )
                      )
                    }
                  />
                </label>
              </div>
            ))}
            <button type="button" onClick={handleAddChannel}>
              Add Channel
            </button>
          </div>
          <button type="submit">Create Preset</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPreset;
