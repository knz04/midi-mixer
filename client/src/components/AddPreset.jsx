import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";

const AddPreset = ({ onClose, preset }) => {
  // console.log("AddPreset: ", preset);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const [presetName, setPresetName] = useState("");
  const [description, setDescription] = useState("");
  const [channels, setChannels] = useState(preset);
  const [presets, setPresets] = useState([]);

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/presets/" + localStorage.getItem("userId"),
          { withCredentials: true }
        );
        setPresets(response.data);
      } catch (error) {
        console.error("Error fetching presets:", error);
        // toast.error("Failed to fetch presets.");
      }
    };

    fetchPresets();
  }, []);

  const handleSubmit = async (e) => {
    console.log("AddPreset preset: ", preset);
    e.preventDefault();

    // Check if the device name already exists for the user
    const presetNameExists = presets.some(
      (preset) => preset.presetName === presetName
    );
    if (presetNameExists) {
      toast.error(
        "Preset name is already taken. Please choose a different name."
      );
      return; // Don't proceed with form submission if name is taken
    }

    const presetData = {
      presetName,
      description,
      channels,
    };

    try {
      const response = await fetch("http://localhost:8000/presets/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(presetData),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Preset created:", data);
        toast.success("Preset created successfully!");
        onClose();
      } else {
        console.error("Failed to create preset");
        toast.error("Failed to create preset");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-full overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Create a New Preset</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Preset Name</label>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
          </div>

          {/* <div className="mb-4">
            <label className="block text-gray-700">Channels</label>
            <p className="text-sm text-gray-500 mb-2">
              (Insert import from device button here.)
            </p>
            {channels.map((channel, index) => (
              <div key={index} className="mb-2">
                <label className="block text-gray-700">
                  Rotary Potentiometer
                </label>
                <input
                  type="number"
                  value={channel.rotary}
                  onChange={(e) =>
                    setChannels(
                      channels.map((ch, i) =>
                        i === index
                          ? { ...ch, rotary: Number(e.target.value) }
                          : ch
                      )
                    )
                  }
                  required
                  className="mt-1 p-2 border border-gray-300 rounded w-full"
                />
                <label className="block text-gray-700 mt-2">
                  Fader Potentiometer
                </label>
                <input
                  type="number"
                  value={channel.fader}
                  onChange={(e) =>
                    setChannels(
                      channels.map((ch, i) =>
                        i === index
                          ? { ...ch, fader: Number(e.target.value) }
                          : ch
                      )
                    )
                  }
                  required
                  className="mt-1 p-2 border border-gray-300 rounded w-full"
                />
                <label className="block text-gray-700 mt-2">
                  Mute
                  <input
                    type="checkbox"
                    checked={channel.button}
                    onChange={(e) =>
                      setChannels(
                        channels.map((ch, i) =>
                          i === index ? { ...ch, button: e.target.checked } : ch
                        )
                      )
                    }
                    className="ml-2"
                  />
                </label>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddChannel}
              className="mt-2 p-2 bg-blue-500 text-white rounded w-full sm:w-auto"
            >
              Add Channel
            </button>
          </div> */}
          <button
            type="submit"
            className="mt-4 p-2 bg-green-500 text-white rounded w-full"
          >
            Import Preset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 p-2 bg-red-500 text-white rounded w-full"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPreset;
