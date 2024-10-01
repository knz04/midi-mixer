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
      <div>
        <Link to="/login">
        <button><img src="src/assets/login.png" alt="Sign Up" style={{ width: "150px", height: "75px" }} /></button>
        </Link>
      </div>
      <div>
        <Link to="/register">
        <button><img src="src/assets/signup.png" alt="Sign Up" style={{ width: "150px", height: "75px" }} /></button>
        </Link>
      </div>
    </div>
  );
}
