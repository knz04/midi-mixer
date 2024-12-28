import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";

export default function Home() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="text-4xl font-bold">SketchMIDI</div>
      <div className="mb-5">
        <Link to="/login">
          <button className="w-36 h-12 border-b-2 border-black">Log In</button>
        </Link>
      </div>
      <div>
        <Link to="/register">
          <button className="w-36 h-12 border-b-2 border-black">Sign Up</button>
        </Link>
      </div>
    </div>
  );
}
