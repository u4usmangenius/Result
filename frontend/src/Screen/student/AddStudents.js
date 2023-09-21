import React, { useState } from "react";
import "./AddStudent.css";
import { IoMdAddCircle } from "react-icons/io";
import Papa from "papaparse"; // Import PapaParse library
import axios from "axios";
import Swal from "sweetalert2";

const AddStudents = ({ onClose }) => {
  const [showAddButton, setShowAddButton] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const [selectedOption, setSelectedOption] = useState("manually");
  const [studentData, setstudentData] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [multiplerowbtn, setmultiplerowbtn] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    stdRollNo: "",
    stdPhone: "",
    guard_Phone: "",
    gender: "Select Gender",
    className: "Select Subject",
    Batch: "",
  });
  const showAlert = (message) => {
    Swal.fire(message);
  };
  const showConfirm = (message) => {
    return Swal.fire({
      title: "Confirm",
      text: message,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      return result.isConfirmed;
    });
  };

  const addstudentToBackend = async (student) => {
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };

    try {
      const response = await axios.post(
        "http://localhost:8080/api/students",
        student,
        { headers }
      );

      if (response.status === 200) {
        return true; // student added successfully
      } else {
        return false; // Failed to add student
      }
    } catch (error) {
      console.error("Error adding student:", error);
      return false; // Error occurred while adding student
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
            stdRollNo: singleRowData["stdRollNo"] || "",
            stdPhone: singleRowData["stdPhone"] || "",
            guard_Phone: singleRowData["guard_Phone"] || "",
            gender: singleRowData["gender"] || "Select Gender",
            className: singleRowData["className"] || "",
            Batch: singleRowData["Batch"] || "",
          });
          setSelectedOption("manually");
          setShowAddButton(false);
        } else if (parsedData.length > 1) {
          setstudentData(parsedData);
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
    const confirmed = await showConfirm(`Continue to Insert All Students?`);

    if (confirmed) {
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };

      try {
        const response = await axios.post(
          "http://localhost:8080/api/students/upload-csv",
          { csvData: studentData },
          { headers }
        );

        if (response.status === 200) {
          showAlert("students uploaded successfully");
          // Optionally, you can clear the studentData state if needed
          setstudentData([]);
        } else {
          showAlert("Failed to upload students. Please try again.");
        }
      } catch (error) {
        console.error("Error uploading students:", error);
        showAlert("An error occurred while processing the request.");
      }
    }
  };
  const handleSubmit = async () => {
    try {
      if (editingIndex !== -1) {
        // Handle editing existing student
        const updatedstudentData = [...studentData];
        const updatedstudent = {
          ...formData,
          id: updatedstudentData[editingIndex].id,
        };
        updatedstudentData[editingIndex] = updatedstudent;
        setstudentData(updatedstudentData);

        const success = await addstudentToBackend(updatedstudent);

        if (success) {
          showAlert("student updated successfully");
          setFormData({
            fullName: "",
            stdRollNo: "",
            stdPhone: "",
            guard_Phone: "",
            gender: "Select Gender",
            className: "",
            Batch: "",
          });
          setEditingIndex(-1);
        } else {
          showAlert("Failed to update student. Please try again.");
        }
      } else {
        if (
          formData.fullName === "" ||
          formData.stdRollNo === "" ||
          formData.guard_Phone === "" ||
          formData.stdPhone === "" ||
          formData.Batch === "" ||
          formData.className === "Select Class" ||
          formData.gender === "Select Gender"
        ) {
          showAlert("All fields are required.");
          return; // Don't proceed if default values are selected
        }
        // Handle adding a new student
        const newstudent = {
          fullName: formData.fullName,
          stdRollNo: formData.stdRollNo,
          stdPhone: formData.stdPhone,
          guard_Phone: formData.guard_Phone,
          gender: formData.gender,
          className: formData.className,
          Batch: formData.Batch,
        };

        const success = await addstudentToBackend(newstudent);

        if (success) {
          showAlert("student added successfully");
          onClose(); // Close the form
          setFormData({
            fullName: "",
            stdRollNo: "",
            stdPhone: "",
            guard_Phone: "",
            gender: formData.gender,
            className: formData.className,
            Batch: formData.Batch,
          });
        } else {
          showAlert("Failed to add student. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error handling submit:", error);
      showAlert("An error occurred while processing the request.");
    }
  };

  return (
    <div className="add-students-content">
      <h2 className="add-students-heading">Add students</h2>
      <div className="add-students-options">
        <div
          className={`student-container-option ${
            selectedOption === "manually" ? "student-form-active" : ""
          }`}
          onClick={() => handleOptionChange("manually")}
        >
          Manually
        </div>
        <div
          className={`student-container-option ${
            selectedOption === "import-csv" ? "student-form-active" : ""
          }`}
          onClick={() => handleOptionChange("import-csv")}
        >
          Import CSV
        </div>
      </div>
      {selectedOption === "manually" ? (
        <form>
          <div className="add-student-form-row">
            <div className="add-student-form-group">
              <label className="students-input-label">Roll No</label>
              <input
                type="text"
                className="student-text-input"
                placeholder="RollNo"
                value={formData.stdRollNo}
                onChange={(e) =>
                  setFormData({ ...formData, stdRollNo: e.target.value })
                }
              />
            </div>
            <div className="add-student-form-group">
              <label className="students-input-label">fullName</label>
              <input
                type="text"
                className="student-text-input"
                placeholder="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>
          </div>
          <div className="add-student-form-row">
            <div className="add-student-form-group">
              <label className="students-input-label">Phone Number </label>
              <input
                type="phone"
                className="student-input-password"
                placeholder="Student Phone Number"
                value={formData.stdPhone}
                onChange={(e) =>
                  setFormData({ ...formData, stdPhone: e.target.value })
                }
              />
            </div>
            <div className="add-student-form-group">
              <label className="students-input-label">Guardian Phone.No</label>
              <input
                type="text"
                className="student-text-input"
                placeholder="Guardian Phone Number"
                value={formData.guard_Phone}
                onChange={(e) =>
                  setFormData({ ...formData, guard_Phone: e.target.value })
                }
              />
            </div>
          </div>
          <div className="add-student-form-row">
            <div className="add-student-form-group">
              <label className="students-input-label">Gender:</label>
              <select
                className="students-input-select"
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
            <div className="add-student-form-group">
              <label className="students-input-label">ClassName:</label>
              <select
                className="students-input-select"
                value={formData.className}
                onChange={(e) =>
                  setFormData({ ...formData, className: e.target.value })
                }
              >
                <option>Select Class</option>
                <option>1st Year</option>
                <option>2nd Year</option>
              </select>
            </div>
          </div>
          <div className="add-student-form-row">
            <div className="add-student-form-group">
              <label className="students-input-label">Batch</label>
              <input
                type="text"
                className="student-text-input"
                placeholder="Phone"
                value={formData.Batch}
                onChange={(e) =>
                  setFormData({ ...formData, Batch: e.target.value })
                }
              />
            </div>
          </div>
          <div className="add-another-student-student">
            <div className="add-another-student-text">
              <div className="add-another-student-text-icon">
                <IoMdAddCircle />
              </div>
              Add Another
            </div>
            {/* Add student Button */}
            <div className="add-student-button add-student-side-button">
              <button className="add-students-button" onClick={handleSubmit}>
                {editingIndex !== -1 ? "Save Edit" : "Add student"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div>
          <input
            className="student-import-button"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
          />
          {multiplerowbtn && (
            <button
              id="add-multiple-students"
              className="add-student-button"
              onClick={handleMultiRowUpload}
            >
              Add Multiple students
            </button>
          )}
        </div>
      )}
      {showAddButton && studentData.length > rowsPerPage && (
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
              currentPage === Math.ceil(studentData.length / rowsPerPage)
            }
          >
            Next
          </button>
        </div>
      )}
      {showAddButton && (
        <div className="add-another-student-student">
          <div className="add-student-button">
            <button className="add-students-button" onClick={handleSubmit}>
              {editingIndex !== -1 ? "Save Edit" : "Add student"}
            </button>
          </div>
        </div>
      )}
      {/* <button className="add-students-close-button" onClick={onClose}>
        Close
      </button> */}
    </div>
  );
};

export default AddStudents;
