import React, { useState } from "react";
import "./AddResult.css";
import { IoMdAddCircle } from "react-icons/io";
import Papa from "papaparse"; // Import PapaParse library
import axios from "axios";
import Swal from 'sweetalert2';

const AddResult = ({ onClose }) => {
  const [showAddButton, setShowAddButton] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const [selectedOption, setSelectedOption] = useState("manually");
  const [resultData, setresultData] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [multiplerowbtn, setmultiplerowbtn] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    TestName: "",
    ObtainedMarks: "",
  });

  const showAlert = (message) => {
    Swal.fire(message);
  };
  
  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setShowAddButton(false);
    setmultiplerowbtn(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsedData = result.data;

        if (parsedData.length === 1) {
          const singleRowData = parsedData[0];
          setFormData({
            userName: singleRowData["userName"] || "",
            TestName: singleRowData["TestName"] || "",
            ObtainedMarks: singleRowData["ObtainedMarks"] || "",
          });
          setSelectedOption("manually");
          setShowAddButton(false);
        } else if (parsedData.length > 1) {
          setresultData(parsedData);
          setSelectedOption("import-csv");
          setShowAddButton(false);
          setmultiplerowbtn(true);
        } else {
          showAlert("The CSV file is empty.");
          setShowAddButton(false);
        }
      },
    });
  };
  const handleMultiRowUpload = async () => {
    if (window.confirm(`Continue to Insert All results?`)) {
      try {
        const token = localStorage.getItem("bearer token");
        const headers = {
          Authorization: `${token}`,
        };
        const response = await axios.post(
          "http://localhost:8080/api/results/upload-csv",
          { csvData: resultData },
          { headers }
        );

        if (response.status === 200) {
          showAlert("results uploaded successfully");
          // Optionally, you can clear the resultData state if needed
          setresultData([]);
        } else {
          showAlert("Failed to upload results. Please try again.");
        }
      } catch (error) {
        console.error("Error uploading results:", error);
        showAlert("An error occurred while processing the request.");
      }
    }
  };
  const addresultToBackend = async (result) => {
    try {
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };
      const response = await axios.post(
        "http://localhost:8080/api/results",
        result,
        { headers }
      );
      console.log("response.status");
      console.log(response.status);
      if (response.status === 200) {
        return true; // result added successfully
      } else if (response.status === 409) {
        // Data already exists
        console.log("Data already exists");
        showAlert("Username with the same test name already exists.");
        return false;
      } else {
        return false; // Failed to add result for other reasons
      }
    } catch (error) {
      console.error("Error adding result:", error);
      return false; // Error occurred while adding result
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingIndex !== -1) {
        // Handle editing existing result
        const updatedresultData = [...resultData];
        const updatedresult = {
          ...formData,
          id: updatedresultData[editingIndex].id,
        };
        updatedresultData[editingIndex] = updatedresult;
        setresultData(updatedresultData);

        const success = await addresultToBackend(updatedresult);

        if (success) {
          showAlert("result updated successfully");
          setFormData({
            userName: "",
            TestName: "",
            ObtainedMarks: "",
          });
          setEditingIndex(-1);
        } else {
          showAlert("Failed to update result. Please try again.");
        }
      } else {
        // Handle adding a new result
        const newresult = {
          userName: formData.userName,
          TestName: formData.TestName,
          ObtainedMarks: formData.ObtainedMarks,
        };

        const success = await addresultToBackend(newresult);
        if (success) {
          showAlert("result added successfully");
          onClose(); // Close the form
          setFormData({
            userName: "",
            TestName: "",
            ObtainedMarks: "",
          });
        } else {
          showAlert("Something went wrong, check username or test name exist.");
        }
      }
    } catch (error) {
      console.error("Error handling submit:", error);
      showAlert("An error occurred while processing the request.");
    }
  };
  return (
    <div className="add-subject-content">
      <h2 className="add-result-heading">Add Result</h2>
      <div className="add-result-options"></div>
      <form>
        <div className="result-form-row">
          <div className="form-group">
            <label className="result-input-label">User Name:</label>
            <input
              type="text"
              className="result-input-type-text"
              placeholder="User Name"
              value={formData.userName}
              onChange={(e) =>
                setFormData({ ...formData, userName: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label className="result-input-label">Test Name:</label>
            <input
              type="text"
              className="result-input-type-text"
              placeholder="Test Name"
              value={formData.TestName}
              onChange={(e) =>
                setFormData({ ...formData, TestName: e.target.value })
              }
            />
          </div>
        </div>
      </form>
      <div className="result-form-row">
        <div className="form-group">
          <label className="result-input-label">Obtained Marks:</label>
          <input
            type="number"
            className="result-input-type-text"
            placeholder="Obtained Marks"
            value={formData.ObtainedMarks}
            onChange={(e) =>
              setFormData({ ...formData, ObtainedMarks: e.target.value })
            }
          />
        </div>
      </div>
      <div className="add-another-result">
        <div className="add-another-result-text">
          <div className="add-another-text-icon-subject">
            <IoMdAddCircle />
          </div>
          Add Another
        </div>
        {/* Add result Button */}

        <div className="add-result-button" onClick={handleSubmit}>
          <button className="add-results-button">
            {editingIndex !== -1 ? "Save Edit" : "Add Result"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddResult;
