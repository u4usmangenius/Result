import React, { useEffect, useState } from "react";
import { FaBell, FaSignOutAlt } from "react-icons/fa";
import "./Header.css";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios"; // Import Axios

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

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };
      // Make an Axios GET request to the export API
      await axios.get("http://localhost:8080/api/export", {
        headers,
        responseType: "blob", // Set the response type to blob to handle file download
      });

      // Handle the file download in the browser
    } catch (error) {
      console.error("Export failed:", error);
      // Handle error here
    }
  };

  const handleImport = async () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".sqlite";

    fileInput.addEventListener("change", async (event) => {
      const file = event.target.files[0];

      if (file) {
        const formData = new FormData();
        formData.append("database", file);

        try {
          const token = localStorage.getItem("bearer token");
          const headers = {
            Authorization: `${token}`,
          };

          // Make an Axios POST request to the import API
          await axios.post("http://localhost:8080/api/import", formData, {
            headers,
          });

          // Handle successful import
          window.alert("Database imported successfully");
          // You can perform additional actions here as needed
        } catch (error) {
          console.error("Import failed:", error);
          // Handle error here
        }
      }
    });

    fileInput.click();
  };

  useEffect(() => {
    const token = localStorage.getItem("bearer token");
    setAuth(token);
  }, [auth]);

  return (
    <>
      <div className="teachers-header">
        <div className="left-elements">
          {/* <span onClick={handleExport}>Export</span>
          <span onClick={handleImport}>Import</span> */}
        </div>
        <div className="right-elements">
          <div className="notification-icon-orange">
            <FaBell />
          </div>
          <div className="logout-button" onClick={Logout}>
            Logout
            <span className="logout-icon">
              <FaSignOutAlt />
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
