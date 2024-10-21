import React from "react";

export function DeviceDetails({ fetchedDevice }) {
  if (!fetchedDevice) {
    return null;
  }

  return (
    <div>
      <strong>Device Name:</strong> {fetchedDevice.deviceName}
      <br />
      <strong>MAC Address:</strong> {fetchedDevice.macAdd}
    </div>
  );
}