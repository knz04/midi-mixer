import { useContext, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import login from "../assets/login2.png";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext); // Access the setUser function from context
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const loginUser = async (e) => {
    e.preventDefault();
    const { email, password } = data;
    try {
      const { data } = await axios.post("/login", { email, password });
      if (data.error) {
        toast.error(data.error);
      } else {
        setData({});
        setUser(data); // Update user context with the logged-in user data
        navigate("/dashboard"); // Redirect to dashboard
      }
    } catch (error) {
      console.error(error);
      toast.error("Login failed, please try again.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "20px" }}>
      <form onSubmit={loginUser} style={{ display: "flex", flexDirection: "column", width: "300px" }}>
        <label style={{ textAlign: "center", marginBottom: "10px" }}>Email</label>
        <input
          type="email"
          placeholder="Enter email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          style={{ marginBottom: "10px", textAlign: "center" }}
        />
        <label style={{ textAlign: "center", marginBottom: "10px" }}>Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
          style={{ marginBottom: "20px", textAlign: "center" }}
        />
        <button
          type="submit"
        >
          Log In
        </button>
      </form>
    </div>
  );
}
