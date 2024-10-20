import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function EditDevice({ device, onClose, onUpdate, onDelete }) {
  const [deviceName, setDeviceName] = useState(device.deviceName);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.put(
        `/devices/${device._id}`,
        { deviceName }, // Only update deviceName
        { withCredentials: true }
      );
      toast.success("Device updated successfully!");
      onUpdate(); // Trigger update on the parent component
      onClose(); // Close the edit form
    } catch (error) {
      console.error("Error updating device:", error);
      toast.error("Failed to update device.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this device?")) {
      try {
        await axios.delete(`/devices/${device._id}`, { withCredentials: true });
        toast.success("Device deleted successfully!");
        onDelete(); // Trigger refresh on the parent component
        onClose(); // Close the edit form
      } catch (error) {
        console.error("Error deleting device:", error);
        toast.error("Failed to delete device.");
      }
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Device Name:
          <input
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
          />
        </label>
        <br />
        {/* Removed the MAC Address input field */}
        <button type="submit">Save Changes</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
        <button type="button" onClick={handleDelete}>
          Delete Device
        </button>
      </form>
    </div>
  );
}
