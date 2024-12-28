import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function EditDevice({ device, onClose, onUpdate, onDelete }) {
  const [deviceName, setDeviceName] = useState(device.deviceName || "");
  const [devices, setDevices] = useState([]);

  // Fetch devices when the component mounts
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/devices/" + localStorage.getItem("userId"),
          { withCredentials: true }
        );
        setDevices(response.data);
      } catch (error) {
        console.error("Error fetching devices:", error);
        toast.error("Failed to fetch devices.");
      }
    };

    fetchDevices();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Check if the device name already exists for the current user
    const deviceNameExists = devices.some(
      (device) => device.deviceName === deviceName // Exclude the current device being edited
    );
    if (deviceNameExists) {
      toast.error(
        "Device name is already taken. Please choose a different name."
      );
      return; // Don't proceed with form submission if name is taken
    }

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
        <button
          type="submit"
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={onClose}
          className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Delete Device
        </button>
      </form>
    </div>
  );
}
