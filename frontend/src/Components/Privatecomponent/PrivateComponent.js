import React from "react";
import { Navigate, Outlet } from "react-router-dom";
const PrivateComponent = () => {
  const auth = localStorage.getItem("data");
  return auth ? (
    <>
      <Outlet /> {/* Render the child components */}
    </>
  ) : (
    <Navigate to="/login" />
  );
};

export default PrivateComponent;
