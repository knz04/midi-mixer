import { React, useState } from "react";
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
    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px', margin: '0 auto' }}>
      <form onSubmit={registerUser} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label>Name</label>
        <input
          type="text"
          placeholder="Enter name"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />
        <label>Email</label>
        <input
          type="email"
          placeholder="Enter email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
        />
        <label>Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
        />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button type="submit" style={{ background: 'none', border: 'none', padding: 0, width: '100px', height: '50px' }}>
            <img src="src/assets/signup.png" alt="Login" style={{ width: '100%', height: '100%' }} />
          </button>
          </div>
      </form>
    </div>
  );
}  
