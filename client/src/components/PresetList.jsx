import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AddPreset from "./AddPreset";
import EditPreset from "./EditPreset";
import PresetDetails from "./PresetDetails";
import Mixer from "./Mixer";
import NewMixer from "./NewMixer";

export default function PresetList() {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [fetchedPreset, setFetchedPreset] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

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

  const handlePresetCreated = () => {
    fetchPresets();
  };

  const handleMessage = () => {};

  if (loading) {
    return <div>Loading presets...</div>;
  }

  return (
    <div style={{ marginLeft: "15px" }}>
      <h1 className="text-2xl font-bold mb-4">Your Presets</h1>
      {presets.length === 0 ? (
        <div className="flex flex-col items-center">
          <p>No presets available.</p>
        </div>
      ) : (
        <select
          value={selectedPreset}
          onChange={handlePresetChange}
          className="w-74 h-12 px-4 py-2 text-lg border border-gray-300 rounded"
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
      )}

      <Mixer channels={fetchedPreset.channels} />

      <div className="flex items-center">
        {showForm && (
          <AddPreset
            onClose={handleCloseForm}
            onPresetCreated={handlePresetCreated}
          />
        )}
      </div>
      <NewMixer />

      {fetchedPreset && (
        <PresetDetails
          fetchedPreset={fetchedPreset}
          handleOpenEditForm={handleOpenEditForm}
          handleOpenForm={handleOpenForm} // Pass handleOpenForm to PresetDetails
        />
      )}

      {showEditForm && (
        <EditPreset
          preset={fetchedPreset}
          onClose={handleCloseForm}
          onUpdate={() => {
            fetchPresetDetails(selectedPreset);
            fetchPresets();
          }}
          onDelete={() => {
            fetchPresets();
            setFetchedPreset("");
          }}
        />
      )}
      <button
        onClick={handleOpenForm}
        className="mt-4 p-2 bg-green-500 text-white rounded"
      >
        Create a new preset
      </button>
    </div>
  );
}
