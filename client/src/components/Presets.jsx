import React, { useState, useEffect } from "react";
import axios from "axios";

const Presets = () => {
  const [presets, setPresets] = useState([]);
  const [newPresetName, setNewPresetName] = useState("");

  // Fetch presets from the backend when the component loads
  useEffect(() => {
    axios
      .get("http://localhost:5001/api/presets")
      .then((response) => setPresets(response.data))
      .catch((error) => console.error("Error fetching presets:", error));
  }, []);

  // Save a new preset
  const savePreset = () => {
    const newPreset = { name: newPresetName, channels: [] }; // Example preset structure
    axios
      .post("http://localhost:5001/api/presets", newPreset)
      .then((response) => setPresets([...presets, response.data])) // Update the list of presets
      .catch((error) => console.error("Error saving preset:", error));
  };

  return (
    <div>
      <h1>Presets</h1>
      <ul>
        {presets.map((preset) => (
          <li key={preset._id}>{preset.name}</li>
        ))}
      </ul>
      <input
        type="text"
        value={newPresetName}
        onChange={(e) => setNewPresetName(e.target.value)}
        placeholder="Enter preset name"
      />
      <button onClick={savePreset}>Save Preset</button>
    </div>
  );
};

export default Presets;
