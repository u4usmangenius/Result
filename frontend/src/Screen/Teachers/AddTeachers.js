import React, { useState } from "react";
import "./AddTeachers.css";
import { IoMdAddCircle } from "react-icons/io";
import Papa from "papaparse"; // Import PapaParse library
import Swal from 'sweetalert2';
import axios from "axios";

const AddTeachers = ({ onClose }) => {
  const [showAddButton, setShowAddButton] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const [selectedOption, setSelectedOption] = useState("manually");
  const [teacherData, setTeacherData] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [multiplerowbtn, setmultiplerowbtn] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    password: "",
    phone: "",
    gender: "Select Gender",
    subject: "Select Subject",
  });

  const showAlert = (message) => {
    Swal.fire(message);
  };

  const addTeacherToBackend = async (teacher) => {
    try {
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };

      const response = await axios.post(
        "http://localhost:8080/api/teachers",
        teacher,
        { headers }
      );

      if (response.status === 200) {
        return true; // Teacher added successfully
      } else {
        return false; // Failed to add teacher
      }
    } catch (error) {
      console.error("Error adding teacher:", error);
      return false; // Error occurred while adding teacher
    }
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
            fullName: singleRowData["fullName"] || "",
            userName: singleRowData["userName"] || "",
            phone: singleRowData["phone"] || "",
            password: singleRowData["password"] || "",
            gender: singleRowData["gender"] || "Select Gender",
            subject: singleRowData["subject"] || "Select Subject",
          });
          setSelectedOption("manually");
          setShowAddButton(false);
        } else if (parsedData.length > 1) {
          setTeacherData(parsedData);
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
    if (window.confirm(`Continue to Insert All Teachers?`)) {
      try {
        const token = localStorage.getItem("bearer token");
        const headers = {
          Authorization: `${token}`,
        };

        const response = await axios.post(
          "http://localhost:8080/api/teachers/upload-csv",
          { csvData: teacherData },
          {
            headers,
          }
        );

        if (response.status === 200) {
          showAlert("Teachers uploaded successfully");
          // Optionally, you can clear the teacherData state if needed
          setTeacherData([]);
        } else {
          showAlert("Failed to upload teachers. Please try again.");
        }
      } catch (error) {
        console.error("Error uploading teachers:", error);
        showAlert("An error occurred while processing the request.");
      }
    }
  };
  const handleSubmit = async () => {
    try {
      if (editingIndex !== -1) {
        // Handle editing existing teacher
        const updatedTeacherData = [...teacherData];
        const updatedTeacher = {
          ...formData,
          id: updatedTeacherData[editingIndex].id,
        };
        updatedTeacherData[editingIndex] = updatedTeacher;
        setTeacherData(updatedTeacherData);

        const success = await addTeacherToBackend(updatedTeacher);

        if (success) {
          showAlert("Teacher updated successfully");
          setFormData({
            fullName: "",
            userName: "",
            password: "",
            phone: "",
            gender: "Select Gender",
            subject: "Select Subject",
          });
          setEditingIndex(-1);
        } else {
          showAlert("Failed to update teacher. Please try again.");
        }
      } else {
        if (
          formData.gender === "Select Gender" ||
          formData.subject === "Select Subject"
        ) {
          showAlert("Please select a valid gender and subject.");
          return; // Don't proceed if default values are selected
        }
        // Handle adding a new teacher
        const newTeacher = {
          fullName: formData.fullName,
          userName: formData.userName,
          password: formData.password,
          phone: formData.phone,
          gender: formData.gender,
          subject: formData.subject,
        };

        const success = await addTeacherToBackend(newTeacher);

        if (success) {
          showAlert("Teacher added successfully");
          onClose(); // Close the form
          setFormData({
            fullName: "",
            userName: "",
            password: "",
            phone: "",
            gender: "Select Gender",
            subject: "Select Subject",
          });
        } else {
          showAlert("Failed to add teacher. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error handling submit:", error);
      showAlert("An error occurred while processing the request.");
    }
  };

  return (
    <div className="add-teachers-content">
      <h2 className="add-teachers-heading">Add Teachers</h2>
      <div className="add-teachers-options">
        <div
          className={`teacher-container-option ${selectedOption === "manually" ? "teacher-form-active" : ""
            }`}
          onClick={() => handleOptionChange("manually")}
        >
          Manually
        </div>
        <div
          className={`teacher-container-option ${selectedOption === "import-csv" ? "teacher-form-active" : ""
            }`}
          onClick={() => handleOptionChange("import-csv")}
        >
          Import CSV
        </div>
      </div>
      {selectedOption === "manually" ? (
        <form>
          <div className="add-teacher-form-row">
            <div className="add-teacher-form-group">
              <label className="teachers-input-label">fullName:</label>
              <input
                type="text"
                className="teacher-text-input"
                placeholder="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>
            <div className="add-teacher-form-group">
              <label className="teachers-input-label">userName:</label>
              <input
                type="text"
                className="teacher-text-input"
                placeholder="userName"
                value={formData.userName}
                onChange={(e) =>
                  setFormData({ ...formData, userName: e.target.value })
                }
              />
            </div>
          </div>
          <div className="add-teacher-form-row">
            <div className="add-teacher-form-group">
              <label className="teachers-input-label">Password:</label>
              <input
                type="password"
                className="teacher-input-password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <div className="add-teacher-form-group">
              <label className="teachers-input-label">Phone:</label>
              <input
                type="text"
                className="teacher-text-input"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>
          <div className="add-teacher-form-row">
            <div className="add-teacher-form-group">
              <label className="teachers-input-label">Gender:</label>
              <select
                className="teachers-input-select"
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
              >
                <option>Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="add-teacher-form-group">
              <label className="teachers-input-label">Subject:</label>
              <select
                className="teachers-input-select"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
              >
                <option>Select Subject</option>
                <option>Math</option>
                <option>Science</option>
                <option>History</option>
              </select>
            </div>
          </div>
          <div className="add-another-teacher-teacher">
            <div className="add-another-teacher-text">
              <div className="add-another-teacher-text-icon">
                <IoMdAddCircle />
              </div>
              Add Another
            </div>
            {/* Add Teacher Button */}
            <div className="add-teacher-button">
              <button className="add-teachers-button" onClick={handleSubmit}>
                {editingIndex !== -1 ? "Save Edit" : "Add Teacher"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div>
          <input
            className="teacher-import-button"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
          />
          {multiplerowbtn && (
            <button
              id="add-multiple-teachers"
              className="add-teachers-button"
              onClick={handleMultiRowUpload}
            >
              Add Multiple Teachers
            </button>
          )}
        </div>
      )}
      {showAddButton && teacherData.length > rowsPerPage && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={
              currentPage === Math.ceil(teacherData.length / rowsPerPage)
            }
          >
            Next
          </button>
        </div>
      )}
      {showAddButton && (
        <div className="add-another-teacher-teacher">
          <div className="add-teacher-button">
            <button className="add-teachers-button" onClick={handleSubmit}>
              {editingIndex !== -1 ? "Save Edit" : "Add Teacher"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AddTeachers;
