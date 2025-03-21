import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Register";
import Login from "./pages/Login";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom";
import { UserContextProvider } from "../context/userContext";
import "./App.css";
import "./Mixer.css";

axios.defaults.baseURL = "https://api.sketchmidi.cc";
axios.defaults.withCredentials = true;

const App = () => {
  return (
    <UserContextProvider>
      <div className="flex flex-col min-h-screen w-screen">
        <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register" element={<Signup />} />
          {/* <Route path="/login" element={<Login />} /> */}
        </Routes>
      </div>
    </UserContextProvider>
  );
};

export default App;
