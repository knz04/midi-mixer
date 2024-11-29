import React from "react";

export default function PresetDetails({
  fetchedPreset,
  handleOpenEditForm,
  handleOpenForm, // Add handleOpenForm as a prop
}) {
  if (!fetchedPreset) {
    return null;
  }

  return (
    <div className="p-6 rounded-md">
      <strong className="text-lg font-semibold">Description:</strong>
      <p className="mt-2">{fetchedPreset.description}</p>

      <h3 className="mt-4 text-xl font-medium">Channels:</h3>
      <table className="mt-2 w-full table-auto">
        <thead>
          <tr className="bg-green-500">
            <th className="px-4 py-2">Channel Number</th>
            <th className="px-4 py-2">Component</th>
            <th className="px-4 py-2">Value</th>
          </tr>
        </thead>
        <tbody>
          {fetchedPreset.channels?.map((channel, index) => (
            <tr key={channel._id || index} className="border-t bg-green-300">
              <td className="px-4 py-2">{index + 1}</td>
              <td className="px-4 py-2">{channel.component}</td>
              <td className="px-4 py-2">
                {channel.component === "rotary" || channel.component === "fader"
                  ? channel.value
                  : channel.button
                  ? "On"
                  : "Off"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-center space-x-4">
        <button
          onClick={handleOpenEditForm}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
        >
          Edit Preset
        </button>
      </div>
    </div>
  );
}
