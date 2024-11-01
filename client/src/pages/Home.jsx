import { useContext } from "react";
import { Link, Navigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";

export default function Home() {
  const { user } = useContext(UserContext);

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div style={{ marginBottom: "20px" }}>
        <Link to="/login">
          <button
            className="w-36 h-18"
            style={{ border: "none", borderBottom: "1px solid" }}
          >
            Log In
          </button>
        </Link>
      </div>
      <div>
        <Link to="/register">
          <button
            className="w-36 h-18"
            style={{ border: "none", borderBottom: "1px solid" }}
          >
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
}
