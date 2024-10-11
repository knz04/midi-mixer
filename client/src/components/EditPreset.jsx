import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function EditPreset({ preset, onClose }) {
  const [presetData, setPresetData] = useState(preset); // Initialize with the passed preset prop

  // Function to handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setPresetData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.put(`/presets/${preset._id}`, presetData, {
        withCredentials: true,
      });
      toast.success("Preset updated successfully!");
      onClose(); // Close the edit modal after successful update
    } catch (error) {
      console.error("Error updating preset:", error);
      toast.error("Failed to update preset.");
    }
  };

  return (
    <div>
      <h2>Edit Preset</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Preset Name:
            <input
              type="text"
              name="presetName"
              value={presetData.presetName}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Description:
            <textarea
              name="description"
              value={presetData.description}
              onChange={handleChange}
            />
          </label>
        </div>
        {/* Channels can be a more complex input depending on your data structure */}
        {presetData.channels.map((channel, index) => (
          <div key={index}>
            <h4>Channel {index + 1}</h4>
            <label>
              Fader:
              <input
                type="number"
                name="fader"
                value={channel.fader}
                onChange={(e) => {
                  const updatedChannels = [...presetData.channels];
                  updatedChannels[index].fader = e.target.value;
                  setPresetData({ ...presetData, channels: updatedChannels });
                }}
              />
            </label>
            <label>
              Rotary:
              <input
                type="number"
                name="rotary"
                value={channel.rotary}
                onChange={(e) => {
                  const updatedChannels = [...presetData.channels];
                  updatedChannels[index].rotary = e.target.value;
                  setPresetData({ ...presetData, channels: updatedChannels });
                }}
              />
            </label>
            <label>
              Mute:
              <input
                type="checkbox"
                name="button"
                checked={channel.button}
                onChange={(e) => {
                  const updatedChannels = [...presetData.channels];
                  updatedChannels[index].button = e.target.checked;
                  setPresetData({ ...presetData, channels: updatedChannels });
                }}
              />
            </label>
          </div>
        ))}
        <button type="submit">Update Preset</button>
      </form>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}
