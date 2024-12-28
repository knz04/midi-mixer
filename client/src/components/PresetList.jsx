import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AddPreset from "./AddPreset";
import EditPreset from "./EditPreset";
import PresetDetails from "./PresetDetails";
import NewMixer from "./NewMixer";

export default function PresetList({ fetchedDevice, onPresetChange }) {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [fetchedPreset, setFetchedPreset] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [state, setState] = useState(false);
  const [update, setUpdate] = useState(false);
  const [toSave, setToSave] = useState({});
  const [showEditButton, setShowEditButton] = useState(false);

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
      const response = await axios.get(
        `https://api.sketchmidi.cc/presets/get-preset/${presetId}`,
        {
          withCredentials: true,
        }
      );
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
    // Call the parent's callback
    if (onPresetChange) {
      onPresetChange(selectedPresetId);
      setShowEditButton(true);
    }
  };

  // const handleOpenForm = () => {
  //   setShowForm(true);
  // };

  const handleOpenEditForm = () => {
    setShowEditForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setShowEditForm(false); // Close the edit form// Clear the selected device
  };

  // const handlePresetCreated = () => {
  //   fetchPresets();
  // };

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

  // const handleToSave = (presetToSave) => {
  //   setToSave(presetToSave);
  // };

  if (loading) {
    return <div>Loading presets...</div>;
  }

  return (
    <div style={{ marginLeft: "15px" }}>
      <h1 className="text-2xl font-bold mb-4">
        Presets
        <button
          onClick={() => {
            setSelectedPreset(""); // Reset dropdown selection
            setFetchedPreset(""); // Clear fetched preset data
            setShowEditButton(false); // Hide the edit button
            localStorage.removeItem("selectedPresetId"); // Clear saved preset ID
            fetchPresets();
          }}
        >
          {" "}
          &#8635;
        </button>
      </h1>
      {/* <button
        onClick={handleOpenForm}
        className="mt-4 p-2 bg-green-500 text-white rounded"
      >
        Create a new preset
      </button> */}
      {presets.length === 0 ? (
        <div className="flex flex-col items-center">
          <p>
            No saved presets available. Use the device to create a new preset.
          </p>
        </div>
      ) : (
        <div className="pt-4">
          <select
            value={selectedPreset} // This is where the selected preset value is controlled
            onChange={handlePresetChange}
            className="mb-4 p-2 mx-4 border rounded hover:border-blue-500 transition"
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
          {/* Conditionally render the "Edit preset" button */}
          {selectedPreset && (
            <button
              onClick={handleOpenEditForm}
              className="mt-4 p-2 bg-yellow-500 text-white rounded"
            >
              Edit preset
            </button>
          )}
        </div>
      )}

      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <EditPreset
            preset={fetchedPreset}
            onClose={handleCloseForm}
            onUpdate={() => {
              fetchPresetDetails(selectedPreset); // Re-fetch the preset details
              fetchPresets(); // Re-fetch the preset list after editing
            }}
            onDelete={() => {
              // Call fetchPresets after deletion
              setFetchedPreset("");
              setShowEditButton(false); // Hide PresetDetails
              localStorage.removeItem("selectedPresetId");
              fetchPresets();
            }}
          />
        </div>
      )}

      {fetchedDevice ? (
        <div>
          <NewMixer
            state={state}
            setState={setState}
            update={update}
            setUpdate={setUpdate}
            preset={fetchedPreset.channels}
            device={fetchedDevice.pairId}
            // onUpdate={handleToSave}
          />
        </div>
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
      {/* <div className="flex items-center">
        {showForm && (
          <AddPreset
            onClose={handleCloseForm}
            onPresetCreated={handlePresetCreated}
            // preset={presetToSave}
          />
        )}
      </div> */}
    </div>
  );
}
