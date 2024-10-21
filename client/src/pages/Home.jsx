import React, { useContext } from "react";
import { Link, Navigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import signup from "../assets/signup.png";
import login from "../assets/login2.png";

export default function Home() {
  const { user } = useContext(UserContext);

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <Link to="/login">
          <button className="w-36 h-18" style={{ border: "none", borderBottom: "1px solid" }}>
            Log In
          </button>
        </Link>
      </div>
      <div>
        <Link to="/register">
          <button className="w-36 h-18" style={{ border: "none", borderBottom: "1px solid" }}>
            Sign In
          </button>
        </Link>
      </div>
    </div>
  );
}
