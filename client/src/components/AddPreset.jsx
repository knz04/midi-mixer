import React, { useState } from "react";

const AddPreset = ({ onClose }) => {
  const [presetName, setPresetName] = useState("");
  const [description, setDescription] = useState("");
  const [channels, setChannels] = useState([
    { rotary: 0, fader: 0, mute: false },
  ]);

  const handleAddChannel = () => {
    setChannels([...channels, { rotary: 0, fader: 0, mute: false }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form data to be sent to the backend
    const presetData = {
      presetName,
      description,
      channels,
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
        onClose(); // Close the form after successful creation
      } else {
        console.error("Failed to create preset");
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
            {channels.map((channel, index) => (
              <div key={index}>
                <label>Rotary Potentiometer</label>
                <input
                  type="number"
                  value={channel.rotary}
                  onChange={(e) =>
                    setChannels(
                      channels.map((ch, i) =>
                        i === index ? { ...ch, rotary: e.target.value } : ch
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
                      channels.map((ch, i) =>
                        i === index ? { ...ch, fader: e.target.value } : ch
                      )
                    )
                  }
                  required
                />
                <label>
                  Mute
                  <input
                    type="checkbox"
                    checked={channel.mute}
                    onChange={(e) =>
                      setChannels(
                        channels.map((ch, i) =>
                          i === index ? { ...ch, mute: e.target.checked } : ch
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
