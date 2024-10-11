import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AddPreset from "./AddPreset";
import EditPreset from "./EditPreset";
import PresetDetails from "./PresetDetails"; // Import PresetDetails

export default function PresetList() {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [fetchedPreset, setFetchedPreset] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false); // Toggle edit form visibility

  const fetchPresets = async () => {
    try {
      const response = await axios.get("/presets/:id", {
        // Corrected the endpoint here
        withCredentials: true,
      });
      setPresets(response.data);
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

  // New function to fetch presets after creating one
  const handlePresetCreated = () => {
    fetchPresets(); // Refresh presets list
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

      {showForm && (
        <AddPreset
          onClose={handleCloseForm}
          onPresetCreated={handlePresetCreated}
        />
      )}

      {/* Use PresetDetails component to display fetchedPreset */}
      {fetchedPreset && (
        <PresetDetails
          fetchedPreset={fetchedPreset}
          handleOpenEditForm={handleOpenEditForm}
        />
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
