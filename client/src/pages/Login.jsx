import { useContext, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import "../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext); // Access the setUser function from context
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  if (user) {
    return <Navigate to="/" />;
  }

  const loginUser = async (e) => {
    e.preventDefault();
    const { email, password } = data;
    try {
      const { data } = await axios.post("https://api.sketchmidi.cc/login", {
        email,
        password,
      });
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
    <div className="w-full min-h-screen flex items-start">
      <div className="relative w-1/2 h-full flex flex-col">
        <div className="typewriter absolute top-1/2 left-[10%] flex flex-col -translate-y-1/2">
          <h1 className="text-4xl text-black bg-white pt-4 font-extrabold my-4">
            SketchMIDI
          </h1>
        </div>
        <img src="/assets/home.jpeg" className="w-full h-full object-cover" />
      </div>

      <div className="w-1/2 h-full bg-[#FFFFFF] flex flex-col p-20 justify-between">
        <form onSubmit={loginUser}>
          <div className="w-full my-[100px] flex flex-col max-w-[500px]">
            <div className="w-full flex flex-col mb-[100px]">
              <h3 className="text-2x1 font-semibold mb-2">Login</h3>
              <p className="text-base mb-2">Welcome back!</p>
            </div>

            <div className="w-full flex flex-col">
              <input
                type="email"
                placeholder="Email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />
              <input
                type="password"
                placeholder="Password"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />
            </div>

            <div className="w-full flex flex-col my-4">
              <button
                type="submit"
                className="w-full text-white bg-black my-2 border-2 border-black rounded-md p-4 text-center flex items-center justify-center"
              >
                Login
              </button>
              <Link to="/register">
                <button className="w-full text-black bg-white border-2 border-black my-2 rounded-md p-4 text-center flex items-center justify-center">
                  Don't have an account? Sign Up.
                </button>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
