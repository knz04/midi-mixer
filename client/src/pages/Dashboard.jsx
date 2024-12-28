import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
// import PresetList from "../components/PresetList";
import DeviceList from "../components/DeviceList";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="min-h-screen w-screen">
      <Navbar />
      {/* <div className="absolute top-[20px] right-0 1" style={{ position: "absolute", top: 20, right: 140 }}>
        {!!user && <h1>Hi, {user.name}!</h1>}
      </div> */}
      <div className="flex flex-col flex-1 gap-16">
        <DeviceList />
      </div>
    </div>
  );
};

export default Dashboard;
