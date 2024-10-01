import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";


const Dashboard = () => {
  const { user } = useContext(UserContext);

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <div style={{ position: "absolute", top: 18, right: 120 }}>
      {!!user && <h1>Hi, {user.name}!</h1>}
    </div>
  );
};

export default Dashboard;
