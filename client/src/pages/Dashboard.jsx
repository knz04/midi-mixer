import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import PresetList from "../components/PresetList";

const Dashboard = () => {
  const { user } = useContext(UserContext);

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <div style={{ height: "100vh", width: "100vw " }}>
      <div style={{ position: "absolute", top: 20, right: 140 }}>
        {!!user && <h1>Hi, {user.name}!</h1>}
      </div>
      <PresetList />
    </div>
  );
};

export default Dashboard;
