import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AddPreset from "./AddPreset";
import EditPreset from "./EditPreset";
import PresetDetails from "./PresetDetails";
import NewMixer from "./NewMixer";

export default function PresetList({ fetchedDevice }) {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [fetchedPreset, setFetchedPreset] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [state, setState] = useState(false);
  const [update, setUpdate] = useState(false);

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

  useEffect(() => {
    if (state === true) {
      // Clear the selected preset when state is true
      setSelectedPreset(""); // This will reset the dropdown to "no selection"
      localStorage.removeItem("selectedPresetId"); // Optional: remove the saved preset from localStorage
    }
  }, [state]); // This effect runs when the state changes

  const fetchPresetDetails = async (presetId) => {
    try {
      const response = await axios.get(`/presets/get-preset/${presetId}`, {
        withCredentials: true,
      });
      setFetchedPreset(response.data);
      setState(false);
      setUpdate(false); // Reset state after fetching preset
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
    console.log("Selected preset:", selectedPresetId);
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

  const parseMidiMessage = (preset) => {
    const channels = [];

    preset.forEach(({ channel, component, value }) => {
      if (!channels[channel - 1]) {
        channels[channel - 1] = {
          rotary: 0,
          fader: 0,
          button: 0,
          activeRotary: false,
          activeFader: false,
          activeButton: false,
        };
      }

      if (component === "rotary") {
        channels[channel - 1].rotary = value;
        channels[channel - 1].activeRotary = true;
      } else if (component === "fader") {
        channels[channel - 1].fader = value;
        channels[channel - 1].activeFader = true;
      } else if (component === "button") {
        channels[channel - 1].button = value;
        channels[channel - 1].activeButton = value === 127;
      }
    });

    for (let i = 0; i < 6; i++) {
      if (!channels[i]) {
        channels[i] = {
          rotary: 0,
          fader: 0,
          button: 0,
          activeRotary: false,
          activeFader: false,
          activeButton: false,
        };
      }
    }

    return channels;
  };

  const presetData =
    fetchedPreset && Array.isArray(fetchedPreset.channels)
      ? parseMidiMessage(fetchedPreset.channels)
      : [];

  if (loading) {
    return <div>Loading presets...</div>;
  }

  return (
    <div style={{ marginLeft: "15px" }}>
      <h1 className="text-2xl font-bold mb-4">Presets</h1>
      <button
        onClick={handleOpenForm}
        className="mt-4 p-2 bg-green-500 text-white rounded"
      >
        Create a new preset
      </button>

      {presets.length === 0 ? (
        <div className="flex flex-col items-center">
          <p>No presets available.</p>
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

      {fetchedDevice ? (
        <NewMixer
          state={state}
          setState={setState}
          update={update}
          setUpdate={setUpdate}
          preset={fetchedPreset.channels}
          device={fetchedDevice.pairId}
        />
      ) : (
        <div>Device is not available</div>
      )}

      {/* {fetchedPreset && (
        <PresetDetails
          fetchedPreset={fetchedPreset}
          handleOpenEditForm={handleOpenEditForm}
          handleOpenForm={handleOpenForm}
        />
      )} */}

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

      <div className="flex items-center">
        {showForm && (
          <AddPreset
            onClose={handleCloseForm}
            onPresetCreated={handlePresetCreated}
          />
        )}
      </div>
    </div>
  );
}
