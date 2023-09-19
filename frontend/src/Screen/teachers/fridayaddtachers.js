import React, { useState } from "react";
import "./AddTeachers.css";
import { IoMdTrash } from "react-icons/io";
import { BiEditAlt, BiSave } from "react-icons/bi";
import { IoMdAddCircle } from "react-icons/io";
import Papa from "papaparse"; // Import PapaParse library
import axios from "axios";

const AddTeachers = ({ onClose }) => {
  const [editModes, setEditModes] = useState({});
  const [showAddButton, setShowAddButton] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const [selectedOption, setSelectedOption] = useState("manually");
  const [teacherData, setTeacherData] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    password: "",
    phone: "",
    gender: "Select Gender",
    subject: "Select Subject",
  });
  const addTeachersToBackend = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/teachers",
        teacherData // Assuming teacherData contains the data you want to store
      );

      if (response.status === 200) {
        alert("Teachers added successfully.");
        // Optionally, you can reset the teacherData state or take other actions.
      } else {
        alert("Failed to add teachers.");
      }
    } catch (error) {
      console.error("Error adding teachers:", error);
      alert("Error adding teachers.");
    }
  };

  const [defaultFormData, setDefaultFormData] = useState({
    fullName: "",
    userName: "",
    password: "",
    phone: "",
    gender: "Select Gender",
    subject: "Select Subject",
  });

  const handleOptionChange = (option) => {
    setSelectedOption(option);
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
            fullName: singleRowData["Full Name"] || "",
            userName: singleRowData["User Name"] || "",
            phone: singleRowData["Phone"] || "",
            password: singleRowData["Password"] || "",
            gender: singleRowData["Gender"] || "Select Gender",
            subject: singleRowData["Subject"] || "Select Subject",
          });
          setSelectedOption("manually");
          // setShowAddButton(true);
          setShowAddButton(false);
        } else if (parsedData.length > 1) {
          setTeacherData(parsedData);
          setSelectedOption("import-csv");
          setShowAddButton(true);
        } else {
          alert("The CSV file is empty.");
          setShowAddButton(false);
        }
      },
    });
  };

  const handleEdit = (index) => {
    const teacherToEdit = teacherData[index];
    setFormData({
      fullName: teacherToEdit["Full Name"] || "",
      userName: teacherToEdit["User Name"] || "",
      password: teacherToEdit["Password"] || "",
      phone: teacherToEdit["Phone"] || "",
      gender: teacherToEdit["Gender"] || "Select Gender",
      subject: teacherToEdit["Subject"] || "Select Subject",
    });
    setEditingIndex(index);
  };

  const handleSave = (index) => {
    const updatedTeacherData = [...teacherData];
    const updatedFormData = { ...formData };

    for (const key in updatedFormData) {
      if (updatedFormData[key] === undefined || updatedFormData[key] === null) {
        updatedFormData[key] = "";
      }
    }

    updatedTeacherData[index]["Full Name"] = updatedFormData.fullName;
    updatedTeacherData[index]["User Name"] = updatedFormData.userName;
    updatedTeacherData[index]["Password"] = updatedFormData.password;
    updatedTeacherData[index]["Phone"] = updatedFormData.phone;
    updatedTeacherData[index]["Gender"] = updatedFormData.gender;
    updatedTeacherData[index]["Subject"] = updatedFormData.subject;

    setTeacherData(updatedTeacherData);

    setFormData({ ...defaultFormData });

    const updatedEditModes = { ...editModes };
    updatedEditModes[index] = false;
    setEditModes(updatedEditModes);
    setEditingIndex(-1);
  };
  const updateTeacherData = (updatedData) => {
    setTeacherData(updatedData);
  };

  const handleSubmit = async () => {
    if (editingIndex !== -1) {
      handleSave(editingIndex);
    } else {
      const isGenderDefault = formData.gender === "Select Gender";
      const isSubjectDefault = formData.subject === "Select Subject";
      // if (isGenderDefault || isSubjectDefault) {
      //   alert("Please select a valid Gender and Subject.");
      //   return;
      // }

      const newTeacher = {
        fullName: formData.fullName,
        userName: formData.userName,
        phone: formData.phone,
        password: formData.password,
        gender: formData.gender,
        subject: formData.subject,
      };

      try {
        // Create an array with a single teacher object
        const teachersArray = [newTeacher];

        const response = await axios.post(
          // Use axios.post
          "http://localhost:8080/api/teachers",
          teachersArray, // Send an array of teachers
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          // Teacher added successfully
          alert("Teacher added successfully");
          onClose(); // Close the form
          setFormData({ ...defaultFormData }); // Clear the form

          const totalPagesWithNewTeacher = Math.ceil(
            (teacherData.length + 1) / rowsPerPage
          );

          setCurrentPage(totalPagesWithNewTeacher); // Update currentPage
          updateTeacherData([...teacherData, newTeacher]);

          // Call the function to send data to the backend
          addTeachersToBackend(); // Add this line
        } else {
          // Handle error cases here
          alert("Failed to add teacher. Please try again.");
        }
      } catch (error) {
        console.error("Error adding teacher:", error);
        // alert("An error occurred while adding the teacher.");
      }
    }
  };

  const handlesubmitmanuallyfield = () => {
    alert("Enter data in above fields");
    return;
  };

  const paginatedData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return teacherData.slice(startIndex, endIndex);
  };

  const handleDelete = (index) => {
    const updatedTeacherData = [...teacherData];
    updatedTeacherData.splice(index, 1);
    setTeacherData(updatedTeacherData);
  };
  return (
    <div className="add-teachers-content">
      <h2 className="add-teachers-heading">Add Teachers</h2>
      <div className="add-teachers-options">
        <div
          className={`teacher-container-option ${
            selectedOption === "manually" ? "teacher-form-active" : ""
          }`}
          onClick={() => handleOptionChange("manually")}
        >
          Manually
        </div>
        <div
          className={`teacher-container-option ${
            selectedOption === "import-csv" ? "teacher-form-active" : ""
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
              <label className="teachers-input-label">Full Name:</label>
              <input
                type="text"
                className="teacher-text-input"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>
            <div className="add-teacher-form-group">
              <label className="teachers-input-label">User Name:</label>
              <input
                type="text"
                className="teacher-text-input"
                placeholder="User Name"
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
        <div className="import-csv-section">
          {teacherData.length > 0 ? (
            <div className="teacher-list">
              <h3>Teacher List</h3>
              <table className="teacherlist-frontend-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>User Name</th>
                    <th>Password</th>
                    <th>Phone</th>
                    <th>Gender</th>
                    <th>Subject</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherData.map((teacher, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          className="teacher-text-input"
                          value={
                            editingIndex === index
                              ? formData.fullName
                              : teacher["Full Name"] || defaultFormData.fullName
                          }
                          onChange={(e) => {
                            if (editingIndex === index) {
                              setFormData({
                                ...formData,
                                fullName: e.target.value,
                              });
                            }
                          }}
                          readOnly={editingIndex !== index}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="teacher-text-input"
                          value={
                            editingIndex === index
                              ? formData.userName
                              : teacher["User Name"] || defaultFormData.userName
                          }
                          onChange={(e) => {
                            if (editingIndex === index) {
                              setFormData({
                                ...formData,
                                userName: e.target.value,
                              });
                            }
                          }}
                          readOnly={editingIndex !== index}
                        />
                      </td>
                      <td>
                        <input
                          type="password"
                          className="teacher-input-password"
                          value={
                            editingIndex === index
                              ? formData.password
                              : teacher["Password"] || defaultFormData.password
                          }
                          onChange={(e) => {
                            if (editingIndex === index) {
                              setFormData({
                                ...formData,
                                password: e.target.value,
                              });
                            }
                          }}
                          readOnly={editingIndex !== index}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="teacher-text-input"
                          value={
                            editingIndex === index
                              ? formData.phone
                              : teacher["Phone"] || defaultFormData.phone
                          }
                          onChange={(e) => {
                            if (editingIndex === index) {
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              });
                            }
                          }}
                          readOnly={editingIndex !== index}
                        />
                      </td>
                      <td>
                        <select
                          className="teachers-input-select"
                          value={
                            editingIndex === index
                              ? formData.gender
                              : teacher["Gender"] || defaultFormData.gender
                          }
                          onChange={(e) => {
                            if (editingIndex === index) {
                              setFormData({
                                ...formData,
                                gender: e.target.value,
                              });
                            }
                          }}
                          disabled={editingIndex !== index}
                        >
                          <option>Select Gender</option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </td>
                      <td>
                        <select
                          className="teachers-input-select"
                          value={
                            editingIndex === index
                              ? formData.subject
                              : teacher["Subject"] || defaultFormData.subject
                          }
                          onChange={(e) => {
                            if (editingIndex === index) {
                              setFormData({
                                ...formData,
                                subject: e.target.value,
                              });
                            }
                          }}
                          disabled={editingIndex !== index}
                        >
                          <option>Select Subject</option>
                          <option>Math</option>
                          <option>Science</option>
                          <option>History</option>
                        </select>
                      </td>
                      <td>
                        {editingIndex === index ? (
                          <button onClick={() => handleSave(index)}>
                            <BiSave />
                          </button>
                        ) : (
                          <button onClick={() => handleEdit(index)}>
                            <BiEditAlt />
                          </button>
                        )}
                        <button onClick={() => handleDelete(index)}>
                          <IoMdTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <input
              className="teacher-import-button"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
            />
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
      <button className="add-teachers-close-button" onClick={onClose}>
        Close
      </button>
    </div>
  );
};

export default AddTeachers;
