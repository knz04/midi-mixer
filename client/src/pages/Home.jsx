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
      <div>
        <Link to="/login">
          <button style={{ width: "150px", height: "75px" }}>
            Log In
          </button>
        </Link>
      </div>
      <div>
        <Link to="/register">
          <button style={{ width: "150px", height: "75px" }}>
            Sign In
          </button>
        </Link>
      </div>
    </div>
  );
}
