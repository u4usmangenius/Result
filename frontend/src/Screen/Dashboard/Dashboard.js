import React, { useState, useEffect, useRef } from "react";
import "./Dashboard.css";
import {
  FaSearch,
  FaBell,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaInfoCircle,
} from "react-icons/fa";
import { IoIosArrowDropdown } from "react-icons/io";
import StudentProgressChart from "./StudentProgressChart";

import logo from "../../assests/logo2.png";
import { useNavigate } from "react-router-dom";
const Dashboard = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [searchText, setSearchText] = useState("");

  const inputRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

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

  // Close the dropdown when clicking anywhere outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="dashboard-container">
        <div className="dashboard-top-bar">
          <div className="dashboard-top-left">
            <div className="dashboard-search-bar">
              <div className="dashboard-search-icon">
                <button
                  className="dashboard-ref-search-btn"
                  onClick={() => {
                    setSearchText("");
                    inputRef.current.focus();
                  }}
                >
                  <FaSearch />
                </button>
              </div>
              <input type="text" ref={inputRef} placeholder="Search..." />
            </div>
          </div>
          <div className="dahboard-top-right">
            <div
              className="dashboard-notification-icon-orange"
              style={{ marginRight: "41px" }} // Add margin to the right
            >
              <FaBell />
            </div>
            <div
              className={`profile-icon ${isDropdownOpen ? "active" : ""}`}
              onClick={toggleDropdown}
            >
              <img src={logo} alt="Logo" className="dashboard-logo" />
              <span className="dashboard-profile-name">
                Usman Chaudhary
                {/* &gt; */}
                <IoIosArrowDropdown />
              </span>
              <div
                ref={dropdownRef}
                className={`profile-dropdown ${isDropdownOpen ? "open" : ""}`}
              >
                <ul>
                  <li>
                    <FaUser />
                    Profile
                  </li>
                  <li>
                    <FaCog />
                    Settings
                  </li>
                  <li onClick={Logout}>
                    <FaSignOutAlt />
                    Logout
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="dashboard-heading">
          <span className="dashboard-selected-color">Dashboard</span>
          <span>&gt;</span>
          <span>Statistics</span>
        </div>

        <div className="dashboard-cards-container">
          <div className="dashboard-card">
            <div className="dashboard-card-heading">Students</div>
            <div className="dashboard-card-text">100</div>
            <div className="dashboard-info-row">
              <div className="dashboard-info-text">More Info</div>
              <div className="dashboard-info-icon">
                <FaInfoCircle />
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-heading">Students</div>
            <div className="dashboard-card-text">100</div>
            <div className="dashboard-info-row">
              <div className="dashboard-info-text">More Info</div>
              <div className="dashboard-info-icon">
                <FaInfoCircle />
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-heading">Students</div>
            <div className="dashboard-card-text">100</div>
            <div className="dashboard-info-row">
              <div className="dashboard-info-text">More Info</div>
              <div className="dashboard-info-icon">
                <FaInfoCircle />
              </div>
            </div>
          </div>
        </div>
        <StudentProgressChart />

        {/* Rest of your dashboard content */}
      </div>
    </>
  );
};

export default Dashboard;
