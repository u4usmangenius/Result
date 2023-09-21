import React, { useEffect, useState } from "react";
import "./AddTest.css";
import { IoMdAddCircle } from "react-icons/io";
import Papa from "papaparse"; // Import PapaParse library
import axios from "axios";
import Swal from "sweetalert2";

const AddTest = ({ onClose }) => {
  const [showAddButton, setShowAddButton] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const [selectedOption, setSelectedOption] = useState("manually");
  const [testData, settestData] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [multiplerowbtn, setmultiplerowbtn] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState([]); 
  const [classnameOptions, setClassNameOptions] = useState([]);
  const [formData, setFormData] = useState({
    TestName: "",
    SubjectName: "",
    ClassName: "",
    TotalMarks: "",
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

  useEffect(() => {
    // Fetch data from your backend API
    const fetchData = async () => {
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };

      try {
        const response = await axios.get("http://localhost:8080/api/students", {
          headers,
        });
        if (response.status === 200) {
          const { students } = response.data;
          // Extract unique class names from the fetched data
          const uniqueClassNames = [
            ...new Set(students.map((student) => student.className)),
          ];
          setClassNameOptions(uniqueClassNames);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(); // Call the fetchData function when the component mounts
  }, []);
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
          setSubjectOptions(subjects); // Set subjects in the state
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects(); // Call the fetchSubjects function when the component mounts
  }, []);

  const addtestToBackend = async (test) => {
    try {
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };
      const response = await axios.post(
        "http://localhost:8080/api/tests",
        test,
        { headers }
      );

      if (response.status === 200) {
        return true; // test added successfully
      } else {
        return false; // Failed to add test
      }
    } catch (error) {
      console.error("Error adding test:", error);
      return false; // Error occurred while adding test
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
            TestName: singleRowData["TestName"] || "",
            SubjectName: singleRowData["SubjectName"] || "",
            TotalMarks: singleRowData["TotalMarks"] || "",
            ClassName: singleRowData["ClassName"] || "",
          });
          setSelectedOption("manually");
          setShowAddButton(false);
        } else if (parsedData.length > 1) {
          settestData(parsedData);
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
      try {
        const token = localStorage.getItem("bearer token");
        const headers = {
          Authorization: `${token}`,
        };
        const response = await axios.post(
          "http://localhost:8080/api/tests/upload-csv",
          { csvData: testData },
          { headers }
        );

        if (response.status === 200) {
          showAlert("tests uploaded successfully");
          // Optionally, you can clear the testData state if needed
          settestData([]);
        } else {
          showAlert("Failed to upload tests. Please try again.");
        }
      } catch (error) {
        console.error("Error uploading tests:", error);
        showAlert("An error occurred while processing the request.");
      }
    }
  };
  const handleSubmit = async () => {
    try {
      if (editingIndex !== -1) {
        // Handle editing existing test
        const updatedtestData = [...testData];
        const updatedtest = {
          ...formData,
          id: updatedtestData[editingIndex].id,
        };
        updatedtestData[editingIndex] = updatedtest;
        settestData(updatedtestData);

        const success = await addtestToBackend(updatedtest);

        if (success) {
          showAlert("test updated successfully");
          setFormData({
            TestName: "",
            SubjectName: "",
            ClassName: "",
            TotalMarks: "",
          });
          setEditingIndex(-1);
        } else {
          showAlert("Failed to update test. Please try again.");
        }
      } else {
        // Handle adding a new test
        const newtest = {
          TestName: formData.TestName,
          SubjectName: formData.SubjectName,
          ClassName: formData.ClassName,
          TotalMarks: formData.TotalMarks,
        };

        const success = await addtestToBackend(newtest);

        if (success) {
          showAlert("test added successfully");
          onClose(); // Close the form
          setFormData({
            TestName: "",
            SubjectName: "",
            ClassName: "",
            TotalMarks: "",
          });
        } else {
          showAlert("Failed to add test. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error handling submit:", error);
      showAlert("An error occurred while processing the request.");
    }
  };

  return (
    <div className="add-test-content">
      <h2 className="add-test-heading">Add Test</h2>
      <div className="add-test-options"></div>
      <form>
        <div className="test-form-row">
          <div className="test-form-group">
            <label className="test-input-label">Subject:</label>
            <select
              value={formData.SubjectName}
              className="test-input-select-subject"
              onChange={(e) =>
                setFormData({ ...formData, SubjectName: e.target.value })
              }
            >
              <option>Select Subject</option>
              {subjectOptions.map((subject, index) => (
                <option key={index} value={subject.subjectName}>
                  {subject.subjectName}
                </option>
              ))}
            </select>
          </div>
          <div className="test-form-group">
            <label className="test-input-label">Test Name:</label>
            <input
              type="text"
              className="test-input-type-text"
              placeholder="User Name"
              value={formData.TestName}
              onChange={(e) =>
                setFormData({ ...formData, TestName: e.target.value })
              }
            />
          </div>
        </div>
      </form>
      <div className="test-form-row">
        <div className="test-form-group">
          <label className="test-input-label">Total Marks:</label>
          <input
            type="number"
            className="test-input-type-text"
            placeholder="User Name"
            value={formData.TotalMarks}
            onChange={(e) =>
              setFormData({ ...formData, TotalMarks: e.target.value })
            }
          />
        </div>

        <div className="test-form-group">
          <label className="test-input-label">ClassName:</label>
          <select
            value={formData.ClassName}
            className="test-input-select-subject"
            onChange={(e) =>
              setFormData({ ...formData, ClassName: e.target.value })
            }
          >
            <option value="">Select ClassName</option>
            {classnameOptions.map((className, index) => (
              <option key={index} value={className}>
                {className}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="add-another-test">
        <div className="add-another-test-text">
          <div className="add-another-text-icon-test">
            <IoMdAddCircle />
          </div>
          Add Another
        </div>
        {/* Add test Button */}
        <div className="add-test-button" onClick={handleSubmit}>
          <button className="add-tests-button">
            {editingIndex !== -1 ? "Save Edit" : "Add Subjects"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTest;
