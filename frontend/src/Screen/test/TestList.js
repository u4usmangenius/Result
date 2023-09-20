import React, { useState, useRef, useEffect } from "react";
import "./TestList.css";
import { IoMdTrash } from "react-icons/io";
import axios from "axios";
import { BiEditAlt, BiSave } from "react-icons/bi";
import EditTestModel from "./EditTestModel";
import { useNavigate } from "react-router-dom";
import { MdCancelPresentation } from "react-icons/md";
import Swal from "sweetalert2";
const TestList = ({ openAddtestsModal, closeAddtestsModal }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const inputRef = useRef(null);
  const [tests, settests] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false); // Manage edit modal visibility
  const [editingtest, setEditingtest] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [totalPages, setTotalPages] = useState(1); // Track total number of pages
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredtests.slice(startIndex, endIndex);
  };
  const showConfirm = (message) => {
    return Swal.fire({
      title: 'Confirm',
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      return result.isConfirmed;
    });
  };
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };
    axios
      .get(
        `http://localhost:8080/api/tests?page=${currentPage}&pageSize=${rowsPerPage}&filter=${selectedFilter}&search=${searchText}`,
        { headers }
      )
      .then((response) => {
        if (currentPage === 1) {
          settests(response.data.tests);
        } else {
          // Append the data to the existing tests list
          settests((prevtests) => [...prevtests, ...response.data.tests]);
        }
        setTotalPages(response.data.totalPages);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tests:", error);
        setLoading(false);
      });
  }, [currentPage, rowsPerPage, selectedFilter, searchText]);

  useEffect(() => {
    setSearchText(""); // Reset searchText when currentPage changes
  }, [currentPage]);

  const handleEdit = (test) => {
    setShowEditModal(true);
    setEditingtest(test);
  };

  const handleSaveEdit = (editedtest) => {
    // Send a PUT request to edit the test data on the backend
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };
    axios
      .put(`http://localhost:8080/api/tests/${editedtest.testId}`, editedtest, {
        headers,
      })
      .then((response) => {
        // Update the test in the state based on the response from the server
        if (response.status === 200) {
          // Find the index of the edited test in the tests array
          const editedtestIndex = tests.findIndex(
            (t) => t.testId === editedtest.testId
          );

          // Create a copy of the tests array with the updated test
          const updatedtests = [...tests];
          updatedtests[editedtestIndex] = response.data;

          // Update the state with the updated tests array
          settests(updatedtests);
          setShowEditModal(false); // Close the edit modal after a successful edit
          navigate("/sidebar/dashboard");
          navigate("/sidebar/test");
        }
      })
      .catch((error) => {
        console.error("Error editing test:", error);
      });
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingtest(null);
  };
  const fetchDataFromBackend = (page) => {
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };
    setLoading(true);
    axios
      .get(
        `http://localhost:8080/api/tests?page=${page}&pageSize=${rowsPerPage}`,
        { headers }
      )
      .then((response) => {
        settests(response.data.tests);
        setTotalPages(response.data.totalPages);
        setCurrentPage(page);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tests:", error);
        setLoading(false);
      });
  };
  const handleDelete = async (test) => {
    const confirmed = await showConfirm(`Are you sure you want to delete ${test.fullName}?`);
    // Display a confirmation dialog
    if (confirmed) {
      console.log("User confirmed!");
      // User confirmed, send DELETE request to the backend
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      }; axios
        .delete(`http://localhost:8080/api/tests/${test.testId}`, { headers })
        .then((response) => {
          if (response.status === 200) {
            // test deleted successfully, update the state
            const updatedtests = tests.filter((t) => t.testId !== test.testId);
            settests(updatedtests);
            fetchDataFromBackend(1);
          } else {
            console.error("Error deleting test:", response.data.message);
          }
        })
        .catch((error) => {
          console.error("Error deleting test:", error);
        });
    }
  };
  const filteredtests = tests.filter((test) => {
    const searchTextLower = searchText?.toLowerCase();
    if (selectedFilter === "all") {
      return (
        (test.TestName &&
          test.TestName.toString()?.toLowerCase().includes(searchTextLower)) ||
        (test.SubjectName &&
          test.SubjectName.toString()
            .toLowerCase()
            .includes(searchTextLower)) ||
        (test.TotalMarks &&
          test.TotalMarks.toString().toLowerCase().includes(searchTextLower)) ||
        (test.ClassName &&
          test.ClassName.toString().toLowerCase().includes(searchTextLower))
      );
    } else {
      return (
        test[selectedFilter] &&
        test[selectedFilter].toString().toLowerCase().includes(searchTextLower)
      );
    }
  });

  return (
    <div className="test-list-container">
      <div className="test-search-bar">
        <select
          className="test-category"
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="TestName">TestName</option>
          <option value="ClassName">ClassName</option>
          <option value="TotalMarks">TotalMarks</option>
          <option value="SubjectName">SubjectName</option>
        </select>
        <input
          type="text"
          className="subject-text-input"
          placeholder="Search for a test"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          ref={inputRef}
        />
        <button
          className="test-search-button"
          onClick={() => {
            setSearchText("");
            inputRef.current.focus();
          }}
        >
          Search
        </button>
      </div>
      <div className="test-table">
        <table>
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Subject Name</th>
              <th>Class Name</th>
              <th>Total Marks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentPageData().map((test) => (
              <tr key={test.testId}>
                <td>{test.TestName}</td>
                <td>{test.SubjectName}</td>
                <td>{test.ClassName}</td>
                <td>{test.TotalMarks}</td>
                <td className="set-test-icon">
                  <div
                    onClick={() => handleEdit(test)}
                    className="edit-test-icon"
                  >
                    <BiEditAlt className="edit-test-icon" />
                  </div>
                  <IoMdTrash
                    onClick={() => handleDelete(test)}
                    className="delete-test-icon"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="result-pagination-button"
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) =>
          currentPage === i + 1 ? ( // Check if the current button should be active
            <button
              id="result-count-btn"
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className=""
            >
              {i + 1}
            </button>
          ) : null
        )}
        <button
          className="result-pagination-button"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages} // Disable when on the last page
        >
          Next
        </button>
      </div>
      {showEditModal && (
        <EditTestModel
          test={editingtest}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default TestList;
