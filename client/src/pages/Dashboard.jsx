import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import PresetList from "../components/PresetList";
import DeviceList from "../components/DeviceList";

const Dashboard = () => {
  const { user } = useContext(UserContext);

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen w-screen">
      {/* <div className="absolute top-[20px] right-0 1" style={{ position: "absolute", top: 20, right: 140 }}>
        {!!user && <h1>Hi, {user.name}!</h1>}
      </div> */}
      <div className="flex flex-col flex-1 gap-16">
        <DeviceList />
        <PresetList />
      </div>
    </div>
  );
};

export default Dashboard;
