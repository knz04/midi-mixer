import React, { useContext } from "react";
import { Link, Navigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";

export default function Home() {
  const { user } = useContext(UserContext);

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div>
      <h2>Welcome to MIDI Mixer</h2>
      <div>
        <Link to="/login">
          <button>Login</button>
        </Link>
        <Link to="/register">
          <button>Register</button>
        </Link>
      </div>
    </div>
  );
}
