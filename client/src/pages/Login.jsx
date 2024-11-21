import { useContext, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";

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

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <form onSubmit={loginUser} className="flex flex-col w-72 space-y-4">
        <label className="text-center mb-1">Email</label>
        <input
          type="email"
          placeholder="Enter email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          className="mb-2 text-center"
          style={{ border: "none", borderBottom: "1px solid" }}
        />
        <label className="text-center mb-1">Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
          className="mb-5 text-center"
          style={{ border: "none", borderBottom: "1px solid" }}
        />
        <div className="flex justify-between space-x-4">
          <button type="button" onClick={goBack}>
            Back
          </button>
          <button type="submit">Log In</button>
        </div>
      </form>
    </div>
  );
}
