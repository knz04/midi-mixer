import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AddDevice from "./AddDevice";
import EditDevice from "./EditDevice";
import { DeviceDetails } from "./DeviceDetails"; // Import DeviceDetails component

export default function DeviceList() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(""); // Selected device ID
  const [fetchedDevice, setFetchedDevice] = useState(null); // Fetched device data
  const [showForm, setShowForm] = useState(false); // Toggle for add form
  const [showEditForm, setShowEditForm] = useState(false); // Toggle for edit form
  const [selectedPreset, setSelectedPreset] = useState(""); // Preset ID state
  const [presetLoaded, setPresetLoaded] = useState(false); // Track if preset is loaded
  const [presets, setPresets] = useState([]); // State for presets

  // Fetch list of devices
  const fetchDevices = async () => {
    try {
      const response = await axios.get("/devices/:id", {
        withCredentials: true,
      });
      setDevices(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch devices.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch list of presets
  const fetchPresets = async () => {
    try {
      const response = await axios.get("/presets/:id", {
        withCredentials: true,
      });
      setPresets(response.data); // Assuming response.data contains an array of presets
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch presets.");
    }
  };

  useEffect(() => {
    fetchDevices();
    fetchPresets(); // Fetch presets when component mounts
  }, []);

  // Retrieve stored device and preset from local storage
  useEffect(() => {
    const storedDevice = localStorage.getItem("selectedDevice");
    const storedPreset = localStorage.getItem("selectedPreset");
    const storedFetchedDevice = localStorage.getItem("fetchedDevice");

    if (storedDevice) {
      setSelectedDevice(storedDevice);
    }
    if (storedPreset) {
      setSelectedPreset(storedPreset);
    }
    if (storedFetchedDevice) {
      setFetchedDevice(JSON.parse(storedFetchedDevice)); // Parse the stored device data
    }
  }, []);

  // Store selected device and preset in local storage
  useEffect(() => {
    if (selectedDevice) {
      localStorage.setItem("selectedDevice", selectedDevice);
    } else {
      localStorage.removeItem("selectedDevice"); // Clear on deselect
    }
  }, [selectedDevice]);

  useEffect(() => {
    if (selectedPreset) {
      localStorage.setItem("selectedPreset", selectedPreset);
    } else {
      localStorage.removeItem("selectedPreset"); // Clear on deselect
    }
  }, [selectedPreset]);

  // Store fetched device in local storage
  useEffect(() => {
    if (fetchedDevice) {
      localStorage.setItem("fetchedDevice", JSON.stringify(fetchedDevice));
    } else {
      localStorage.removeItem("fetchedDevice"); // Clear on deselect
    }
  }, [fetchedDevice]);

  // Fetch details of selected device
  const fetchDeviceDetails = async (deviceId) => {
    try {
      const response = await axios.get(`/devices/get-device/${deviceId}`, {
        withCredentials: true,
      });
      setFetchedDevice(response.data); // Store fetched device data
      setPresetLoaded(!!response.data.presetId); // Set preset loaded state based on fetched device
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching device:", error);
      toast.error("Failed to fetch device.");
    }
  };

  const handleDeviceChange = (event) => {
    const selectedDeviceId = event.target.value;
    setSelectedDevice(selectedDeviceId);
    fetchDeviceDetails(selectedDeviceId); // Fetch details of the selected device
  };

  const handlePresetChange = (event) => {
    setSelectedPreset(event.target.value); // Update the selected preset state
  };

  const handleOpenForm = () => {
    setShowForm(true);
  };

  const handleOpenEditForm = () => {
    setShowEditForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setShowEditForm(false);
  };

  const handleDeviceCreated = () => {
    fetchDevices(); // Refresh devices list after adding a new device
  };

  const handleImportPreset = async () => {
    try {
      if (!selectedPreset) {
        toast.error("Please select a preset."); // Notify user if no preset is selected
        return;
      }

      if (!selectedDevice) {
        toast.error("Please select a device.");
        return;
      }

      console.log("Selected Device:", selectedDevice);
      console.log("Selected Preset:", selectedPreset);

      // Send a PUT request with the presetId in the body and deviceId in the URL
      await axios.put(
        `/devices/add-preset/${selectedDevice}`, // Device ID in the route
        { presetId: selectedPreset }, // Preset ID in the request body
        { withCredentials: true }
      );

      toast.success("Preset loaded into device successfully.");

      // Clear selected device and fetched device state
      setSelectedDevice("");
      setFetchedDevice(null);
      setSelectedPreset("");
      localStorage.removeItem("selectedDevice");
      localStorage.removeItem("selectedPreset");
      localStorage.removeItem("fetchedDevice");
    } catch (error) {
      console.error("Error loading preset into device:", error);
      toast.error("Failed to load preset into device.");
    }
  };

  const handleRemovePreset = async () => {
    try {
      await axios.put(
        `/devices/remove-preset/${selectedDevice}`,
        { presetId: fetchedDevice.presetId },
        { withCredentials: true }
      );
      toast.success("Preset removed successfully.");

      // Clear selected device and fetched device state
      setSelectedDevice("");
      setFetchedDevice(null);
      setSelectedPreset("");
      localStorage.removeItem("selectedDevice");
      localStorage.removeItem("selectedPreset");
      localStorage.removeItem("fetchedDevice");
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove preset.");
    }
  };

  if (loading) {
    return <div>Loading devices...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Devices</h1>
      {devices.length === 0 ? (
        <div className="flex flex-col items-center">
          <p>No devices available.</p>
        </div>
      ) : (
        <>
          {/* Dropdown for selecting a device */}
          <select
            value={selectedDevice}
            onChange={handleDeviceChange}
            className="mb-4 p-2 border rounded hover:border-blue-500 transition"
          >
            <option value="" disabled>
              Select a device
            </option>
            {devices.map((device) => (
              <option key={device._id} value={device._id}>
                {device.deviceName}
              </option>
            ))}
          </select>

          {/* Display DeviceDetails for selected device */}
          {fetchedDevice && <DeviceDetails fetchedDevice={fetchedDevice} />}

          {/* Preset selection dropdown */}
          {presets.length > 0 && (
            <select
              value={selectedPreset}
              onChange={handlePresetChange}
              className="mb-4 p-2 border rounded hover:border-blue-500 transition"
            >
              <option value="" disabled>
                Select a preset
              </option>
              {presets.map((preset) => (
                <option key={preset._id} value={preset._id}>
                  {preset.presetName}{" "}
                  {/* Assuming presets have a name property */}
                </option>
              ))}
            </select>
          )}

          {/* Import and Remove Preset buttons */}
          {selectedDevice && fetchedDevice && (
            <div className="mb-4">
              <button
                onClick={handleImportPreset}
                className="mr-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Import Preset
              </button>
              <button
                onClick={handleRemovePreset}
                className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Remove Preset
              </button>
            </div>
          )}

          {/* Edit Device button that shows up after a device is selected */}
          {selectedDevice && (
            <button
              onClick={handleOpenEditForm}
              className="mb-4 p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
            >
              Edit Device
            </button>
          )}
        </>
      )}

      <br />
      <button
        onClick={() => setShowForm(!showForm)} // Toggle form visibility
        className="mt-4 p-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
      >
        {showForm ? "Add a new device" : "Add a new device"}{" "}
        {/* Change button text based on form visibility */}
      </button>

      <div className="flex items-start">
        {/* Add Device form */}
        {showForm && (
          <div className="flex-grow">
            <AddDevice
              onClose={handleCloseForm}
              onDeviceCreated={handleDeviceCreated}
            />
          </div>
        )}

        {/* Edit Device Form */}
        {showEditForm && selectedDevice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <EditDevice
                device={fetchedDevice} // Pass the fetched device details
                onClose={handleCloseForm}
                onUpdate={fetchDevices} // Refresh the device list after editing
                onDelete={fetchDevices} // Refresh the device list after deletion
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
