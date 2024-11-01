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

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <form
        onSubmit={registerUser}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "20px",
        }}
      >
        <label style={{ marginBottom: "10px" }}>Name</label>
        <input
          type="text"
          placeholder="Enter Name"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          style={{ textAlign: "center", marginBottom: "10px" }}
        />
        <label style={{ marginBottom: "10px" }}>Email</label>
        <input
          type="email"
          placeholder="Enter Email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          style={{ textAlign: "center", marginBottom: "10px" }}
        />
        <label style={{ marginBottom: "10px" }}>Password</label>
        <input
          type="password"
          placeholder="Enter Password"
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
          style={{ textAlign: "center", marginBottom: "10px" }}
        />
        <button
          type="submit"
          style={{ marginTop: "20px", padding: "10px 20px", cursor: "pointer" }}
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
