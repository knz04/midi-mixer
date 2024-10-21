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
    <nav>
      <img src={logo} alt="MIDI Mixer Logo" className="h-20" />
      <div className="absolute top-5 right-4">
        {/* Conditionally show buttons based on user's login status */}
        {user && (
          <button
            onClick={handleLogout}
            style={{ border: "none", borderBottom: "1px solid" }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
