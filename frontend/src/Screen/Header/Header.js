import React, { useEffect, useState } from "react";
import { FaBell, FaSignOutAlt } from "react-icons/fa";
import "./Header.css";
import { useNavigate } from "react-router-dom";
const Header = () => {
  const [auth, setAuth] = useState(localStorage.getItem("bearer token"));
  const navigate = useNavigate();
  const Logout = async () => {
    await localStorage.clear();
    const data = await localStorage.getItem("auth");
    if (!data) {
      await window.location.reload();
      navigate("/login");
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("bearer token");
    setAuth(token);
  }, [auth]);
  return (
    <div className="teachers-header">
      <div className="notification-icon-orange" style={{ marginRight: "10px" }}>
        <FaBell />
      </div>
      <div className="logout-button" onClick={Logout}>
        Logout
        <span className="logout-icon">
          <FaSignOutAlt />
        </span>
      </div>
    </div>
  );
};

export default Header;
