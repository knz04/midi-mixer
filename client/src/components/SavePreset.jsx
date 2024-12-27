import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const SavePreset = (channels) => {
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch presets from the backend
  const fetchPresets = async () => {
    try {
      const response = await axios.get("/presets/:id", {
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

  // Handle changes in the selected preset
  const handlePresetChange = (event) => {
    const selectedPresetId = event.target.value;
    setSelectedPreset(selectedPresetId);
    localStorage.setItem("selectedPresetId", selectedPresetId);
    // Optionally, you can fetch details for the selected preset
  };

  // Open form for creating a new preset
  const handleOpenForm = () => {
    setShowForm(true);
  };

  // Close form
  const handleCloseForm = () => {
    setShowForm(false);
  };

  // Example function to save the preset (this can be triggered by a save button)
  const savePreset = async (event) => {
    event.preventDefault();
    console.log(selectedPreset);
    console.log(channels.channels);

    if (!selectedPreset) {
      toast.error("Please select a preset first.");
      return;
    }

    try {
      // Sending a PUT request to update the channels of the preset with the provided presetId
      const response = await axios.put(
        `/presets/${selectedPreset}`, // Use the selectedPreset as the presetId in the URL
        channels.channels,
        { withCredentials: true }
      );

      // If the request is successful
      toast.success("Preset channels updated successfully!");
      handleCloseForm(); // Close the form after successful update
      fetchPresets(); // Optionally refresh the preset list after update
    } catch (error) {
      // If an error occurs during the request
      console.error("Error updating preset channels:", error);
      toast.error("Failed to update preset channels.");
    }
  };

  if (loading) {
    return <div>Loading presets...</div>;
  }

  return (
    <div>
      {/* Button to open the form */}
      <button
        onClick={handleOpenForm}
        className="mt-4 p-2 bg-yellow-500 text-white rounded"
      >
        Update Preset
      </button>

      {/* Display the form if showForm is true */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-4">Update Preset</h3>

            {/* Dropdown to select preset */}
            <div className="mb-4">
              <select
                value={selectedPreset}
                onChange={handlePresetChange}
                className="w-full p-2 border rounded"
              >
                <option value="" disabled>
                  Select a preset
                </option>
                {presets.map((preset) => (
                  <option key={preset._id} value={preset._id}>
                    {preset.presetName}
                  </option>
                ))}
              </select>
            </div>

            {/* Save and Cancel buttons */}
            <div className="flex justify-between">
              <button
                onClick={savePreset}
                className="p-2 bg-blue-500 text-white rounded"
              >
                Save
              </button>
              <button
                onClick={handleCloseForm}
                className="p-2 bg-red-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavePreset;
