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
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Preset Name:
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
          />
        </label>
        <br />
        <label>
          Description:
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <br />
        <h3>Channels:</h3>
        {channels.map((channel, index) => (
          <div key={index}>
            <strong>Channel {index + 1}</strong>
            <br />
            <label>
              Fader:
              <input
                type="number"
                value={channel.fader}
                onChange={(e) =>
                  handleChannelChange(index, "fader", e.target.value)
                }
              />
            </label>
            <br />
            <label>
              Rotary:
              <input
                type="number"
                value={channel.rotary}
                onChange={(e) =>
                  handleChannelChange(index, "rotary", e.target.value)
                }
              />
            </label>
            <br />
            <label>
              Mute:
              <input
                type="checkbox"
                checked={channel.button}
                onChange={(e) =>
                  handleChannelChange(index, "button", e.target.checked)
                }
              />
            </label>
          </div>
        ))}
        <br />
        <button type="submit">Save Changes</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
        <button type="button" onClick={handleDelete}>
          Delete Preset
        </button>
      </form>
    </div>
  );
}
