import React, { useState } from "react";
import toast from "react-hot-toast";

const AddPreset = ({ onClose }) => {
  const [presetName, setPresetName] = useState("");
  const [description, setDescription] = useState("");
  const [channels, setChannels] = useState([
    { rotary: 0, fader: 0, button: false }, // Changed mute to button
  ]);

  const handleAddChannel = () => {
    setChannels([...channels, { rotary: 0, fader: 0, button: false }]); // Changed mute to button
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form data to be sent to the backend
    const presetData = {
      presetName,
      description,
      channels: channels.map((channel, index) => ({
        channel: index + 1, // Assuming channel numbers start from 1
        button: channel.button, // Using button instead of mute
        fader: channel.fader,
        rotary: channel.rotary,
      })),
    };

    try {
      // Make a request to the backend to create a new preset, including credentials (cookies)
      const response = await fetch("http://localhost:8000/presets/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(presetData),
        credentials: "include", // Include cookies in the request
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Preset created:", data);
        toast.success("Preset created successfully!");
        onClose(); // Close the form after successful creation
      } else {
        console.error("Failed to create preset");
        toast.error("Failed to create preset");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 p-4 sm:p-0">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl"> {/* Changed max-w-md to max-w-4xl */}
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
          <div className="mb-4">
            <label className="block text-gray-700">Channels</label>
            <p className="text-sm text-gray-500 mb-2">(Insert import from device button here.)</p>
            {channels.map((channel, index) => (
              <div key={index} className="mb-2">
                <label className="block text-gray-700">Rotary Potentiometer</label>
                <input
                  type="number"
                  value={channel.rotary}
                  onChange={(e) =>
                    setChannels(
                      channels.map(
                        (ch, i) =>
                          i === index
                            ? { ...ch, rotary: Number(e.target.value) }
                            : ch // Convert to number
                      )
                    )
                  }
                  required
                  className="mt-1 p-2 border border-gray-300 rounded w-full"
                />
                <label className="block text-gray-700 mt-2">Fader Potentiometer</label>
                <input
                  type="number"
                  value={channel.fader}
                  onChange={(e) =>
                    setChannels(
                      channels.map(
                        (ch, i) =>
                          i === index
                            ? { ...ch, fader: Number(e.target.value) }
                            : ch // Convert to number
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
                    checked={channel.button} // Changed to button
                    onChange={(e) =>
                      setChannels(
                        channels.map(
                          (ch, i) =>
                            i === index
                              ? { ...ch, button: e.target.checked }
                              : ch // Changed to button
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
          </div>
          <button
            type="submit"
            className="mt-4 p-2 bg-green-500 text-white rounded w-full"
          >
            Create Preset
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
