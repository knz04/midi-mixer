import { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import COVER_IMAGE from "../assets/home.jpeg";
import "../styles/Login.css";

export default function Register() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext); // Access the setUser function from context
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  const registerUser = async (e) => {
    e.preventDefault();
    const { name, email, password } = data;
    try {
      const { data } = await axios.post("/register", { name, email, password });
      if (data.error) {
        toast.error(data.error);
      } else {
        setData({});
        toast.success("Registered successfully.");
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
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
        <img src={COVER_IMAGE} className="w-full h-full object-cover" />
      </div>

      <div className="w-1/2 h-full bg-[#FFFFFF] flex flex-col p-28 justify-between">
        <form onSubmit={registerUser}>
          <div className="w-full mt-[60px] flex flex-col max-w-[500px]">
            <div className="w-full flex flex-col mb-[43px]">
              <h3 className="text-2x1 font-semibold mb-2">Sign Up</h3>
              <p className="text-base mb-2">Create a new account.</p>
            </div>

            <div className="w-full flex flex-col">
              <input
                type="text"
                placeholder="Name"
                value={data.email}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />
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
                Sign Up
              </button>
              <Link to="/">
                <button className="w-full text-black bg-white border-2 border-black my-2 rounded-md p-4 text-center flex items-center justify-center">
                  Already have an account? Login.
                </button>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
