import React, { useEffect, useState } from "react";
import "./AddSubject.css";
import { IoMdAddCircle } from "react-icons/io";
import Papa from "papaparse"; // Import PapaParse library
import axios from "axios";
import Swal from "sweetalert2";

const AddSubjects = ({ onClose }) => {
  const [showAddButton, setShowAddButton] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const [subjectData, setsubjectData] = useState([]);
  const [selectedOption, setSelectedOption] = useState("add-subjects");
  const [editingIndex, setEditingIndex] = useState(-1);
  const [multiplerowbtn, setmultiplerowbtn] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState([]); // Initialize as an empty array
  const [rollnoOption, setRollnoOption] = useState([]); // Initialize as an empty array
  const showAlert = (message) => {
    Swal.fire(message);
  };

  useEffect(() => {
    // Fetch subjects from your backend API
    const fetchSubjects = async () => {
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };
      try {
        const response = await axios.get("http://localhost:8080/api/subjects", {
          headers,
        });
        if (response.status === 200) {
          // Extract the subjects array from the response
          const { subjects } = response.data;
          console.log("subject", subjects);
          setSubjectOptions(subjects); // Set subjects in the state
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
        return;
      }
    };

    fetchSubjects(); // Call the fetchSubjects function when the component mounts
  }, []);
  useEffect(() => {
    // Fetch subjects from your backend API
    const fetchRollNo = async () => {
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };
      try {
        const response = await axios.get("http://localhost:8080/api/students", {
          headers,
        });
        if (response.status === 200) {
          // Extract the roll number from the response
          const { students } = await response.data;
          setRollnoOption(students);
        }
      } catch (error) {
        console.error("Error fetching roll number:", error);
        showAlert("Error fetching roll number:", error);
        return;
      }
    };

    fetchRollNo(); // Call the fetchRollNo function when the component mounts
  }, []);
  const [formData, setFormData] = useState({
    subjectName: "",
    courseCode: "",
    stdRollNo: "",
    userSubject: "",
  });
  const addUsersubjectToBackend = async (subject) => {
    try {
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };
      const response = await axios.post(
        "http://localhost:8080/api/student_subject",
        subject,
        { headers }
      );

      if (response.status === 200) {
        return true; // subject added successfully
      } else {
        return false; // Failed to add subject
      }
    } catch (error) {
      console.error("Error adding subject:", error);
      return false; // Error occurred while adding subject
    }
  };

  const addsubjectToBackend = async (subject) => {
    try {
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };
      const response = await axios.post(
        "http://localhost:8080/api/subjects",
        subject,
        { headers }
      );

      if (response.status === 200) {
        return true; // subject added successfully
      } else {
        return false; // Failed to add subject
      }
    } catch (error) {
      console.error("Error adding subject:", error);
      return false; // Error occurred while adding subject
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
            subjectName: singleRowData["subjectName"] || "",
            courseCode: singleRowData["courseCode"] || "",
            stdRollNo: singleRowData["stdRollNo"] || "",
            userSubject: singleRowData["userSubject"] || "",
          });
          setSelectedOption("manually");
          setShowAddButton(false);
        } else if (parsedData.length > 1) {
          setsubjectData(parsedData);
          setSelectedOption("add-subjects");
          setShowAddButton(false);
          setmultiplerowbtn(true);
        } else {
          showAlert("The CSV file is empty.");
          setShowAddButton(false);
        }
      },
    });
  };
  const handlesubmitUserSubject = async () => {
    try {
      // Handle adding a new subject
      const newsubject = {
        stdRollNo: formData.stdRollNo,
        userSubject: formData.userSubject,
      };

      const success = await addUsersubjectToBackend(newsubject);

      if (success) {
        showAlert("subject added successfully");
        onClose(); // Close the form
        setFormData({
          stdRollNo: "",
          userSubject: "",
        });
        const token = localStorage.getItem("bearer token");
        const headers = {
          Authorization: `${token}`,
        };
        try {
          const response = await axios.get(
            "http://localhost:8080/api/students",
            {
              headers,
            }
          );
          if (response.status === 200) {
            // Extract the roll number from the response
            const { students } = await response.data;
            setRollnoOption(students);
          }
        } catch (error) {
          console.error("Error fetching roll number:", error);
          showAlert("Error fetching roll number:", error);
          return;
        }
      } else {
        showAlert("Failed to Add Subject.");
      }
    } catch (error) {
      console.error("Error handling submit:", error);
      showAlert("An error occurred while processing the request.");
    }
  };
  const handleSubmit = async () => {
    try {
      console.log(selectedOption, "asd");
      if (selectedOption !== "add-subjects") {
        handlesubmitUserSubject();
        return;
      }
      if (editingIndex !== -1) {
        // Handle editing existing subject
        const updatedsubjectData = [...subjectData];
        const updatedsubject = {
          ...formData,
          id: updatedsubjectData[editingIndex].id,
        };
        updatedsubjectData[editingIndex] = updatedsubject;
        setsubjectData(updatedsubjectData);

        const success = await addsubjectToBackend(updatedsubject);

        if (success) {
          showAlert("subject updated successfully");
          setFormData({
            subjectName: "",
            courseCode: "",
          });
          setEditingIndex(-1);
        } else {
          showAlert("Subject Already exist.");
        }
      } else {
        // Handle adding a new subject
        const newsubject = {
          subjectName: formData.subjectName,
          courseCode: formData.courseCode,
        };

        const success = await addsubjectToBackend(newsubject);

        if (success) {
          showAlert("subject added successfully");
          onClose(); // Close the form
          setFormData({
            subjectName: "",
            courseCode: "",
          });
          const token = localStorage.getItem("bearer token");
          const headers = {
            Authorization: `${token}`,
          };
          try {
            const response = await axios.get(
              "http://localhost:8080/api/students",
              {
                headers,
              }
            );
            if (response.status === 200) {
              // Extract the roll number from the response
              const { students } = await response.data;
              setRollnoOption(students);
            }
          } catch (error) {
            console.error("Error fetching roll number:", error);
            showAlert("Error fetching roll number:", error);
            return;
          }
        } else {
          showAlert("Failed to add subject. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error handling submit:", error);
      showAlert("An error occurred while processing the request.");
    }
  };
  return (
    <div className="add-subject-content">
      <h2 className="add-subject-heading">Add Subjects</h2>
      <div className="add-subject-options">
        <div
          className={`option ${
            selectedOption === "add-subjects" ? "form-active" : ""
          }`}
          onClick={() => handleOptionChange("add-subjects")}
        >
          Add Subjects
        </div>
        <div
          className={`option ${
            selectedOption === "student-subject" ? "form-active" : ""
          }`}
          onClick={() => handleOptionChange("student-subject")}
        >
          Student Subject
        </div>
      </div>
      {selectedOption === "add-subjects" ? (
        <form>
          <div className="subject-form-row">
            <div className="form-group">
              <label className="subject-input-label">Subject Name</label>
              <input
                type="text"
                className="subject-input-type-text"
                placeholder="Full Name"
                value={formData.subjectName}
                onChange={(e) =>
                  setFormData({ ...formData, subjectName: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label className="subject-input-label">Course Code</label>
              <input
                type="text"
                className="subject-input-type-text"
                placeholder="Course Code"
                value={formData.courseCode}
                onChange={(e) =>
                  setFormData({ ...formData, courseCode: e.target.value })
                }
              />
            </div>
          </div>
        </form>
      ) : (
        <div className="subject-form-row">
          <div className="form-group">
            <label className="subject-input-label">Roll No</label>
            <select
              type="text"
              className="subject-input-type-text"
              placeholder="User Name"
              value={formData.stdRollNo}
              onChange={(e) =>
                setFormData({ ...formData, stdRollNo: e.target.value })
              }
            >
              <option>Select Roll No</option>
              {rollnoOption &&
                rollnoOption.map((student) => (
                  <option key={student.stdRollNo} value={student.stdRollNo}>
                    {student.stdRollNo}
                  </option>
                ))}
            </select>
          </div>
          <div className="form-group">
            <label className="subject-input-label">Subject</label>
            <select
              value={formData.userSubject}
              className="subject-input-select-subject"
              onChange={(e) =>
                setFormData({ ...formData, userSubject: e.target.value })
              }
            >
              <option>Select Subject</option>
              {subjectOptions.map((subject) => (
                <option key={subject.subjectName} value={subject.subjectName}>
                  {subject.subjectName}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      <div className="add-another-subject">
        <div className="add-another-subject-text">
          <div className="add-another-text-icon-subject">
            <IoMdAddCircle />
          </div>
          Add Another
        </div>
        {/* Add subject Button */}
        <div className="add-subject-button addsubbtn" onClick={handleSubmit}>
          <button className="add-subjects-button">
            {editingIndex !== -1 ? "Save Edit" : "Add Subjects"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSubjects;
