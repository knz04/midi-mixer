import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../context/userContext";
import toast from "react-hot-toast";

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
    <nav className="w-screen h-32 pt-2 md:h-16 flex flex-col md:flex-row border-b-[1px] relative justify-between p-2">
      <span className="h-8 pt-2 object-contain text-2xl font-bold">
        SketchMIDI
      </span>
      {user && (
        <div className="flex flex-row pt-1 items-center justify-center">
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
