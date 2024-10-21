import React, { useState } from "react";
import toast from "react-hot-toast";

const AddDevice = ({ onClose }) => {
  const [deviceName, setDeviceName] = useState("");
  const [macAdd, setMacAdd] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Data to be sent to the backend, including presetId set to null
    const deviceData = {
      deviceName,
      macAdd,
      presetId: null, // Setting presetId to null by default
    };

    try {
      // Make a request to the backend to create a new device, including credentials (cookies)
      const response = await fetch("http://localhost:8000/devices/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deviceData),
        credentials: "include", // Include cookies in the request
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Device created:", data);
        toast.success("Device created successfully!");
        onClose(); // Close the form after successful creation
      } else {
        console.error("Failed to create device");
        toast.error("Failed to create device");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create a New Device</h2>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Device Name</label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">MAC Address</label>
            <input
              type="text"
              value={macAdd}
              onChange={(e) => setMacAdd(e.target.value)}
              required
              pattern="^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$" // MAC address validation
              title="Please enter a valid MAC address in the format XX:XX:XX:XX:XX:XX"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button type="submit" className="mb-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            Create Device
          </button>
          <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDevice;
