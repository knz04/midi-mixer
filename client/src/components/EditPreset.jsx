import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function EditPreset({ preset, onClose, onUpdate, onDelete }) {
  const [presetName, setPresetName] = useState(preset.presetName);
  const [description, setDescription] = useState(preset.description);
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

  const handleSubmit = async (event) => {
    event.preventDefault();

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

    try {
      const response = await axios.put(
        `/presets/${preset._id}`,
        { presetName, description },
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
