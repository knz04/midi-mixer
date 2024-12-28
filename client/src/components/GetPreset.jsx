import React, { useState, useEffect } from "react";

const GetPreset = () => {
  const [presets, setPresets] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://api.sketchmidi.cc/api/presets");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setPresets(data);
      } catch (error) {
        console.error("Error fetching presets:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {presets.length > 0 ? (
        presets.map((preset) => <div key={preset.id}>{preset.name}</div>)
      ) : (
        <p>No presets found.</p>
      )}
    </div>
  );
};

export default GetPreset;
