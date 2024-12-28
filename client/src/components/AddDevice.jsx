import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";

const AddDevice = ({ onClose }) => {
  const [deviceName, setDeviceName] = useState("");
  const [pairId, setPairId] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the device name already exists for the user
    const deviceNameExists = devices.some(
      (device) => device.deviceName === deviceName
    );
    if (deviceNameExists) {
      toast.error(
        "Device name is already taken. Please choose a different name."
      );
      return; // Don't proceed with form submission if name is taken
    }

    const deviceData = {
      deviceName,
      pairId,
      presetId: null, // Setting presetId to null by default
    };

    try {
      const response = await axios.post(
        "http://localhost:8000/devices/new",
        deviceData,
        { withCredentials: true }
      );

      if (response.status === 200) {
        toast.success("Device created successfully!");
        onClose(); // Close the form after successful creation
      } else {
        toast.error("Failed to create device.");
      }
    } catch (error) {
      console.error("Error creating device:", error);
      toast.error("Device with a matching Pair ID already exists.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create a New Device</h2>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Device Name
            </label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Pair ID
            </label>
            <input
              type="text"
              value={pairId}
              onChange={(e) => setPairId(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="mb-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Create Device
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDevice;
