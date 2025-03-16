# SketchMIDI 🎼

SketchMIDI is a web-based application designed to simplify the management and control of MIDI presets wirelessly to the SketchMIDI device. This project aims to provide an affordable and intuitive MIDI mixer solution for musicians, integrating seamlessly with a web interface.

## Features
- **Real-time MIDI Control:** Adjust MIDI parameters wirelessly using the web app.
- **Preset Management:** Create, edit, and load presets to your SketchMIDI device.
- **Device Connectivity:** Easily pair your device via WiFi and control it from the web.
- **User Authentication:** Secure login and personalized settings.
- **Standalone Mode:** Can also function as a regular MIDI controller via USB Type-C.

## System Architecture
### Backend
- Built using **Node.js** with **Express.js**.
- Handles API requests for user authentication, preset management, and device communication.
- Utilizes **MongoDB** for data storage (Users, Devices, Presets collections).
- Implements **MQTT & WebSocket** for real-time communication with the **ESP32-S3** hardware.
- Secured with **JWT authentication**.

### Frontend
- Developed using **React.js** with **Vite** for performance.
- Styled with **Tailwind CSS** for a responsive user interface.
- Communicates with the backend via **RESTful APIs** and **WebSocket over MQTT**.

### Communication Protocols
1. **Backend ↔ Frontend:** Uses standard HTTP requests (GET, POST, PUT, DELETE).
2. **Backend ↔ ESP32-S3:** Uses MQTT to send and receive MIDI commands.
3. **Frontend ↔ ESP32-S3:** WebSocket over MQTT for real-time device updates.

### MIDI Message Format
Each MIDI message follows this format:
```
C0N61V27  // Rotary component on channel 2, value 27
C0N81V87  // Fader component on channel 2, value 87
```
- `C`: Channel number.
- `N`: Component type (Rotary, Button, Fader).
- `V`: Value (0-127 for rotary/fader, 0/127 for buttons).

## Getting Started
### 1. Register an Account
- Visit [SketchMIDI Website](http://www.sketchmidi.cc)
- Sign up or log in to access the web app.

### 2. Connect Your Device
1. Click **"Add a New Device"** in the app.
2. On the SketchMIDI hardware, hold the **main rotary button for 3s**.
3. Connect to the "MIDI CONTROLLER AP" and configure WiFi.
4. Take note of the **6-digit Pair ID** displayed.
5. Enter a device name and Pair ID in the app, then create the device.

### 3. Create & Manage Presets
- Select or create a new preset in the web app.
- Adjust parameters on the SketchMIDI device in real-time.
- Save changes using the **"Update Preset"** or **"Create New Preset"** button.
- Load presets to your device and save them by double-tapping the rotary button.

## Example User Login Credentials
- **Email:** user@email.com
- **Password:** 123456

