import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function PresetList() {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const response = await axios.get("/presets/:id", {
          withCredentials: true,
        }); // Use withCredentials to send cookies
        setPresets(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch presets.");
      } finally {
        setLoading(false);
      }
    };

    fetchPresets();
  }, []);

  if (loading) {
    return <div>Loading presets...</div>;
  }

  return (
    <div>
      <h1>Your Presets</h1>
      {presets.length === 0 ? (
        <p>No presets available.</p>
      ) : (
        <ul>
          {presets.map((preset) => (
            <li key={preset._id}>
              <h2>{preset.presetName}</h2>
              <p>{preset.description}</p>
              <h3>Channels:</h3>
              <ul>
                {preset.channels.map((channel) => (
                  <li key={channel._id}>
                    <p>Channel: {channel.channel}</p>
                    <p>Button: {channel.button ? "On" : "Off"}</p>
                    <p>Fader: {channel.fader}</p>
                    <p>Rotary: {channel.rotary}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
