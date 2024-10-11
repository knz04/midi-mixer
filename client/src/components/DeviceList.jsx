import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function DeviceList() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [fetchedDevice, setFetchedDevice] = useState(null); // State to store the fetched device data

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get("/devices/:id", {
          withCredentials: true, // This sends cookies with the request
        });
        setDevices(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch devices.");
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  // Function to handle device selection and fetch its details
  const handleDeviceChange = async (event) => {
    const selectedDeviceId = event.target.value;
    setSelectedDevice(selectedDeviceId);

    try {
      // Fetch the selected device using the selectedDeviceId
      const response = await axios.get(
        `/devices/get-device/${selectedDeviceId}`,
        {
          withCredentials: true,
        }
      );

      console.log("Fetched device data:", response.data); // Log the response data
      toast.success("Device fetched successfully!");

      // Store the fetched device data in state
      setFetchedDevice(response.data); // Update the state with the fetched device data
    } catch (error) {
      console.error("Error fetching device:", error);
      toast.error("Failed to fetch device.");
    }
  };

  // Show a loading message if devices are still being fetched
  if (loading) {
    return <div>Loading devices...</div>;
  }

  return (
    <div>
      <h1>Your Devices</h1>
      {devices.length === 0 ? (
        <p>No devices available.</p>
      ) : (
        <select value={selectedDevice} onChange={handleDeviceChange}>
          <option value="" disabled>
            Select a device
          </option>
          {devices.map((device) => (
            <option key={device._id} value={device._id}>
              {device.deviceName}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
