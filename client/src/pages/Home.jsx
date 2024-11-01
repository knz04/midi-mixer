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
      <div className="text-4xl font-bold mb-5">Midi Mixer</div>
      <div className="mb-5">
        <Link to="/login">
          <button className="w-36 h-12 border-b-2 border-black">
            Log In
          </button>
        </Link>
      </div>
      <div>
        <Link to="/register">
          <button className="w-36 h-12 border-b-2 border-black">
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
}
