import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Presets from "./components/Presets";
import MIDISetup from "./components/MIDISetup";

const App = () => {
  return (
    <div className="w-full p-6">
      <MIDISetup />
      <Presets />
    </div>
  );
};
export default App;
