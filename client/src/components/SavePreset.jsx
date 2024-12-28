import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AddPreset from "./AddPreset";

const SavePreset = (channels) => {
  // console.log("to save: ", channels);
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddOpenForm = () => {
    setShowAddForm(true);
  };

  const handleAddCloseForm = () => {
    setShowAddForm(false);
    fetchPresets();
  };

  const handlePresetCreated = () => {
    fetchPresets();
  };
  // Function to convert channels into the required database format
  const convertToDatabaseFormat = (input) => {
    const result = [];
    input.forEach((channel, index) => {
      const channelIndex = index + 1; // Channels are 1-indexed

      if (channel.activeRotary) {
        result.push({
          channel: channelIndex,
          component: "rotary",
          value: channel.rotary,
        });
      }

      if (channel.activeFader) {
        result.push({
          channel: channelIndex,
          component: "fader",
          value: channel.fader,
        });
      }

      if (channel.activeButton) {
        result.push({
          channel: channelIndex,
          component: "button",
          value: channel.button,
        });
      }
    });
    return result;
  };

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
  };

  // Open form for creating a new preset
  const handleOpenForm = () => {
    setShowForm(true);
  };

  // Close form
  const handleCloseForm = () => {
    setShowForm(false);
    fetchPresets();
  };

  // Save preset to the backend
  const savePreset = async (event) => {
    event.preventDefault();
    console.log("selectedPreset: ", selectedPreset);
    console.log("channels.channels: ", channels.channels);

    if (!selectedPreset) {
      toast.error("Please select a preset first.");
      return;
    }

    // Convert channels to database format
    const formattedChannels = convertToDatabaseFormat(channels.channels);
    console.log("Formatted channels: ", formattedChannels);

    try {
      const response = await axios.put(
        `/presets/${selectedPreset}`,
        { channels: formattedChannels },
        { withCredentials: true }
      );
      toast.success("Preset channels updated successfully!");
      handleCloseForm();
      fetchPresets();
    } catch (error) {
      console.error("Error updating preset channels:", error);
      toast.error("Failed to update preset channels.");
    }
  };

  if (loading) {
    return <div>Loading presets...</div>;
  }

  return (
    <div>
      <button
        onClick={handleOpenForm}
        className="mt-4 p-2 bg-yellow-500 text-white rounded"
      >
        Update Preset
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-4">Update Preset</h3>

            {presets.length === 0 ? (
              <div className="flex flex-col items-center">
                <p>No saved presets.</p>
              </div>
            ) : (
              <div className="pt-4">
                <select
                  value={selectedPreset} // This is where the selected preset value is controlled
                  onChange={handlePresetChange}
                  className="mb-4 p-2 border rounded hover:border-blue-500 transition"
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
            )}

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

            <button
              onClick={handleAddOpenForm}
              className="mt-4 p-2 bg-green-500 text-white rounded"
            >
              Create a new preset
            </button>
            <div className="flex items-center">
              {showAddForm && (
                <AddPreset
                  onClose={handleAddCloseForm}
                  onPresetCreated={handlePresetCreated}
                  preset={convertToDatabaseFormat(channels.channels)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavePreset;
