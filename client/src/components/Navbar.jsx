import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../context/userContext";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext); // Access user context

  const handleLogout = async () => {
    try {
      await axios.post("/logout"); // Send request to backend
      setUser(null); // Clear user context
      navigate("/"); // Redirect to home page after logout
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed, please try again.");
    }
  };

  return (
    <nav>
      <img src={logo} alt="MIDI Mixer Logo" style={{ height: "200px" }} />
      <div>
        {/* Conditionally show buttons based on user's login status */}
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : null}
      </div>
    </nav>
  );
};

export default Navbar;
