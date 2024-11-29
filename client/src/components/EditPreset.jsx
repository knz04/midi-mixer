import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function EditPreset({ preset, onClose, onUpdate, onDelete }) {
  const [presetName, setPresetName] = useState(preset.presetName);
  const [description, setDescription] = useState(preset.description);
  const [channels, setChannels] = useState([...preset.channels]);

  // Handle changes to channels
  const handleChannelChange = (index, field, value) => {
    const updatedChannels = channels.map((channel, i) =>
      i === index ? { ...channel, [field]: value } : channel
    );
    setChannels(updatedChannels);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.put(
        `/presets/${preset._id}`,
        { presetName, description, channels },
        { withCredentials: true }
      );
      toast.success("Preset updated successfully!");
      onUpdate(); // Trigger update on the parent component
      onClose(); // Close the edit form
    } catch (error) {
      console.error("Error updating preset:", error);
      toast.error("Failed to update preset.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this preset?")) {
      try {
        await axios.delete(`/presets/${preset._id}`, { withCredentials: true });
        toast.success("Preset deleted successfully!");
        localStorage.removeItem("selectedPresetId"); // Clear local storage
        onDelete(); // Trigger refresh on the parent component
        onClose(); // Close the edit form
      } catch (error) {
        console.error("Error deleting preset:", error);
        toast.error("Failed to delete preset.");
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-screen overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <label className="block mb-4">
            Preset Name:
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md"
            />
          </label>
          <label className="block mb-4">
            Description:
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md"
            />
          </label>
          <h3 className="text-lg font-semibold mb-2">Channels:</h3>
          {channels.map((channel, index) => (
            <div key={index} className="mb-4 p-4 border rounded-md">
              <strong className="block mb-2">Channel {index + 1}</strong>
              <label className="block mb-2">
                Component:
                <select
                  value={channel.component}
                  onChange={(e) =>
                    handleChannelChange(index, "component", e.target.value)
                  }
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                >
                  <option value="rotary">Rotary</option>
                  <option value="fader">Fader</option>
                  <option value="button">Button</option>
                </select>
              </label>
              {(channel.component === "rotary" ||
                channel.component === "fader") && (
                <label className="block mb-2">
                  Value:
                  <input
                    type="number"
                    value={channel.value}
                    onChange={(e) =>
                      handleChannelChange(
                        index,
                        "value",
                        parseInt(e.target.value, 10)
                      )
                    }
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                  />
                </label>
              )}
              {channel.component === "button" && (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={channel.button}
                    onChange={(e) =>
                      handleChannelChange(index, "button", e.target.checked)
                    }
                    className="mr-2"
                  />
                  Mute
                </label>
              )}
            </div>
          ))}
          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Delete Preset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
