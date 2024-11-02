import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../context/userContext";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";

const Navbar = () => {
  const { user, setUser } = useContext(UserContext); // Access user context
  const navigate = useNavigate(); // Initialize navigate

  async function handleLogout() {
    try {
      await axios.post("/logout", {}, { withCredentials: true }); // Send request to backend
      setUser(null); // Clear user context
      localStorage.clear(); // Clear local storage
      navigate("/"); // Redirect to home page after logout
      toast.success("Logged out successfully");
    } catch (error) {
      console.error(error);
      toast.error("Logout failed, please try again.");
    }
  }

  return (
    // <nav className="p-2 bg-red-500">
    //   <img src={logo} alt="MIDI Mixer Logo" className="h-20" />
    //   <div className="absolute top-5 right-4">
    //     {/* Conditionally show buttons based on user's login status */}
    //     {user && (
    //       <button
    //         onClick={handleLogout}
    //         style={{ border: "none", borderBottom: "1px solid" }}
    //       >
    //         Logout
    //       </button>
    //     )}
    //   </div>
    // </nav>

    <nav className="w-screen h-32 md:h-16 mb-4 flex flex-col md:flex-row relative justify-between p-2">
      <span className="h-16 object-contain text-2xl font-bold">Midi Mixer</span>
      {user && (
        <div className="flex flex-row items-center justify-center">
          <h1 className="mr-4">Hi, {user.name}!</h1>
          <button
            onClick={handleLogout}
            style={{ border: "none", borderBottom: "1px solid" }}
          >
            Logout
          </button>
        </div>
      )}

      <hr className="md:hidden my-4 border-black" />
    </nav>
  );
};

export default Navbar;
