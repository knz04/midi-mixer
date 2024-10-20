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
    <div className="modal">
      <div className="modal-content">
        <h2>Create a New Device</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Device Name</label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>MAC Address</label>
            <input
              type="text"
              value={macAdd}
              onChange={(e) => setMacAdd(e.target.value)}
              required
              pattern="^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$" // MAC address validation
              title="Please enter a valid MAC address in the format XX:XX:XX:XX:XX:XX"
            />
          </div>
          <button type="submit">Create Device</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDevice;
