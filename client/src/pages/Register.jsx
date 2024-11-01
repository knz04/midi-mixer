import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

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

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <form
        onSubmit={registerUser}
        className="flex flex-col items-center mt-5 gap-4"
      >
        <label className="mb-2">Name</label>
        <input
          type="text"
          placeholder="Enter Name"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          className="text-center mb-2 border-b"
          style={{ border: "none", borderBottom: "1px solid" }}
        />
        <label className="mb-2">Email</label>
        <input
          type="email"
          placeholder="Enter Email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          className="text-center mb-2 border-b"
          style={{ border: "none", borderBottom: "1px solid" }}
        />
        <label className="mb-2">Password</label>
        <input
          type="password"
          placeholder="Enter Password"
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
          className="text-center mb-2 border-b"
          style={{ border: "none", borderBottom: "1px solid" }}
        />
        <div className="flex gap-2 mt-5">
          <button
            type="button"
            onClick={goBack}
            className="px-5 py-2 cursor-pointer"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-5 py-2 cursor-pointer"
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}
