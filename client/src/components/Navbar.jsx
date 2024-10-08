import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../context/userContext";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";

const Navbar = () => {
    const { user, setUser } = useContext(UserContext); // Access user context

    const navigate = useNavigate(); // Initialize navigate

    const handleLogout = async () => {
        try {
            await axios.post("/logout"); // Send request to backend
            setUser(null); // Clear user context
            navigate("/"); // Redirect to home page after logout
            toast.success("Logged out successfully");
        } catch (error) {
            console.error(error);
            toast.error("Logout failed, please try again.");
        }
    };

    return (
        <nav style={{ display: "block", justifyContent: "space-between", alignItems: "center" }}>
            <h1 style={{ fontSize: "2rem", margin: "0" }}>SketchMIDI</h1>
            <div style={{ position: "absolute", top: "20px", right: "10px" }}>
                {/* Conditionally show buttons based on user's login status */}
                {user ? (
                    <>
                        <button onClick={handleLogout} style={{ background: "none", border: "none", fontSize: "1rem", cursor: "pointer" }}>
                            Log Out
                        </button>
                    </>
                ) : null}
            </div>
        </nav>
    );
};

export default Navbar;
