import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AddPreset from "./AddPreset";
import EditPreset from "./EditPreset"; // Import the EditPreset component

export default function PresetList() {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [fetchedPreset, setFetchedPreset] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false); // Toggle edit form visibility

  // Lifted fetchPresets function outside of useEffect so it can be reused
  const fetchPresets = async () => {
    try {
      const response = await axios.get("/presets/:id", {
        withCredentials: true,
      });
      setPresets(response.data);
      toast.success("Presets fetched successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch presets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresets();
  }, []);

  useEffect(() => {
    const savedPresetId = localStorage.getItem("selectedPresetId");
    if (savedPresetId) {
      setSelectedPreset(savedPresetId);
      fetchPresetDetails(savedPresetId);
    }
  }, []);

  const fetchPresetDetails = async (presetId) => {
    try {
      const response = await axios.get(`/presets/get-preset/${presetId}`, {
        withCredentials: true,
      });
      setFetchedPreset(response.data);
      toast.success("Preset fetched successfully!");
    } catch (error) {
      console.error("Error fetching preset:", error);
      toast.error("Failed to fetch preset.");
    }
  };

  const handlePresetChange = (event) => {
    const selectedPresetId = event.target.value;
    setSelectedPreset(selectedPresetId);
    localStorage.setItem("selectedPresetId", selectedPresetId);
    fetchPresetDetails(selectedPresetId);
  };

  const handleOpenForm = () => {
    setShowForm(true);
  };

  const handleOpenEditForm = () => {
    setShowEditForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setShowEditForm(false);
  };

  if (loading) {
    return <div>Loading presets...</div>;
  }

  return (
    <div>
      <h1>Your Presets</h1>
      {presets.length === 0 ? (
        <p>No presets available.</p>
      ) : (
        <select value={selectedPreset} onChange={handlePresetChange}>
          <option value="" disabled>
            Select a preset
          </option>
          {presets.map((preset) => (
            <option key={preset._id} value={preset._id}>
              {preset.presetName}
            </option>
          ))}
        </select>
      )}

      <button onClick={handleOpenForm}>Create a new preset</button>

      {showForm && <AddPreset onClose={handleCloseForm} />}

      {fetchedPreset && (
        <div>
          <strong>Description:</strong> {fetchedPreset.description}
          <h3>Channels:</h3>
          <ul>
            {fetchedPreset.channels.map((channel, index) => (
              <li key={channel._id}>
                <strong>Channel Number:</strong> {index + 1}
                <br />
                <strong>Fader:</strong> {channel.fader}
                <br />
                <strong>Rotary:</strong> {channel.rotary}
                <br />
                <strong>Mute:</strong> {channel.button ? "On" : "Off"}
              </li>
            ))}
          </ul>
          {/* Show the "Edit Preset" button */}
          <button onClick={handleOpenEditForm}>Edit Preset</button>
        </div>
      )}

      {/* Render the EditPreset component when editing */}
      {showEditForm && (
        <EditPreset
          preset={fetchedPreset}
          onClose={handleCloseForm}
          onUpdate={() => {
            fetchPresetDetails(selectedPreset); // Re-fetch the preset details
            fetchPresets(); // Re-fetch the preset list after editing
          }}
        />
      )}
    </div>
  );
}
