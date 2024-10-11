import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AddPreset from "./AddPreset"; // Import the form component

export default function PresetList() {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [fetchedPreset, setFetchedPreset] = useState("");
  const [showForm, setShowForm] = useState(false); // For controlling the modal visibility

  // Fetch presets from the backend when the component mounts
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const response = await axios.get("/presets/:id", {
          withCredentials: true, // Ensure credentials are sent if required by the backend
        });
        setPresets(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch presets.");
      } finally {
        setLoading(false);
      }
    };

    fetchPresets();
  }, []);

  // Load the selected preset from localStorage when the component mounts
  useEffect(() => {
    const savedPresetId = localStorage.getItem("selectedPresetId");
    if (savedPresetId) {
      setSelectedPreset(savedPresetId);
      fetchPresetDetails(savedPresetId);
    }
  }, []);

  // Function to fetch preset details by preset ID
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

  // Function to handle preset selection and trigger the API
  const handlePresetChange = async (event) => {
    const selectedPresetId = event.target.value;
    setSelectedPreset(selectedPresetId);
    localStorage.setItem("selectedPresetId", selectedPresetId); // Save selected preset to localStorage

    fetchPresetDetails(selectedPresetId);
  };

  // Toggle form visibility
  const handleOpenForm = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  // Show a loading message if presets are still being fetched
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

      {/* Button to create a new preset */}
      <button onClick={handleOpenForm}>Create a new preset</button>

      {/* Show the form modal when 'showForm' is true */}
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
        </div>
      )}
    </div>
  );
}
