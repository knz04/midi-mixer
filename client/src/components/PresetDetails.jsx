import React from "react";

export default function PresetDetails({ fetchedPreset, handleOpenEditForm }) {
  if (!fetchedPreset) {
    return null;
  }

  return (
    <div>
      <strong>Description:</strong> {fetchedPreset.description}
      <h3>Channels:</h3>
      <ul>
        {fetchedPreset.channels.map((channel, index) => (
          <li key={channel._id}>
            <strong>Channel Number:</strong> {index + 1}
            <br />
            <strong>Fader:</strong> {channel.fader}
            <br />
            <strong>Rotary:</strong> {channel.rotary}
            <br />
            <strong>Mute:</strong> {channel.button ? "On" : "Off"}
          </li>
        ))}
      </ul>
      {/* Show the "Edit Preset" button */}
      <button onClick={handleOpenEditForm}>Edit Preset</button>
    </div>
  );
}
