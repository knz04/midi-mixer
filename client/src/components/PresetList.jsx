import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
// import "./PresetList.css"; // Import your CSS file for styling

export default function PresetList() {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const response = await axios.get("/presets/:id", {
          withCredentials: true,
        }); // Adjust the endpoint if needed
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
        <table className="preset-table">
          <thead>
            <tr>
              <th>Preset Name</th>
              <th>Description</th>
              <th>Channels</th>
            </tr>
          </thead>
          <tbody>
            {presets.map((preset) => (
              <tr key={preset._id}>
                <td>{preset.presetName}</td>
                <td>{preset.description}</td>
                <td>
                  <table className="channel-table">
                    <thead>
                      <tr>
                        <th>Channel</th>
                        <th>Button</th>
                        <th>Fader</th>
                        <th>Rotary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preset.channels.map((channel) => (
                        <tr key={channel._id}>
                          <td>{channel.channel}</td>
                          <td>{channel.button ? "On" : "Off"}</td>
                          <td>{channel.fader}</td>
                          <td>{channel.rotary}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
