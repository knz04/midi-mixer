import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AddPreset from "./AddPreset"; // Import the form component

export default function PresetList() {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [fetchedPreset, setFetchedPreset] = useState(null);
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

  // Function to handle preset selection and trigger the API
  const handlePresetChange = async (event) => {
    const selectedPresetId = event.target.value;
    setSelectedPreset(selectedPresetId);
    try {
      // Fetch the selected preset using the selectedPresetId
      const response = await axios.get(
        `/presets/get-preset/${selectedPresetId}`,
        {
          withCredentials: true,
        }
      );

      console.log("Fetched preset data:", response.data); // Log the response data
      toast.success("Preset fetched successfully!");

      // If you need to do something with the fetched preset data,
      // you can set it to state or handle it accordingly.
      setFetchedPreset(response.data); // Uncomment if needed
    } catch (error) {
      console.error("Error fetching preset:", error);
      toast.error("Failed to fetch preset.");
    }
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
    </div>
  );
}
