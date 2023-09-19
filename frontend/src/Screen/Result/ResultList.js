import React, { useEffect, useState, useRef } from "react";
import "./ResultList.css";
import { IoMdTrash } from "react-icons/io";

import axios from "axios";
import { BiEditAlt, BiSave } from "react-icons/bi";

import EditResultModel from "./EditResultModel";

import { useNavigate } from "react-router-dom";
import { MdCancelPresentation } from "react-icons/md";
import Swal from "sweetalert2";
const ResultList = ({ openAddresultsModal, closeAddresultsModal }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const inputRef = useRef(null);
  const [results, setresults] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false); // Manage edit modal visibility
  const [editingresult, setEditingresult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [totalPages, setTotalPages] = useState(1); // Track total number of pages


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
  };  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredresults.slice(startIndex, endIndex);
  };
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };
    axios
      .get(
        `http://localhost:8080/api/results?page=${currentPage}&pageSize=${rowsPerPage}&filter=${selectedFilter}&search=${searchText}`,
        { headers }
      )
      .then((response) => {
        if (currentPage === 1) {
          setresults(response.data.results);
        } else {
          // Append the data to the existing results list
          setresults((prevresults) => [
            ...prevresults,
            ...response.data.results,
          ]);
        }
        setTotalPages(response.data.totalPages);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching results:", error);
        setLoading(false);
      });
  }, [currentPage, rowsPerPage, selectedFilter, searchText]);

  useEffect(() => {
    setSearchText(""); // Reset searchText when currentPage changes
  }, [currentPage]);

  const handleEdit = (result) => {
    setShowEditModal(true);
    setEditingresult(result);
  };

  const handleSaveEdit = (editedresult) => {
    // Send a PUT request to edit the result data on the backend
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };
    axios
      .put(
        `http://localhost:8080/api/results/${editedresult.resultId}`,
        editedresult,
        {
          headers,
        }
      )
      .then((response) => {
        // Update the result in the state based on the response from the server
        if (response.status === 200) {
          // Find the index of the edited result in the results array
          const editedresultIndex = results.findIndex(
            (t) => t.resultId === editedresult.resultId
          );

          // Create a copy of the results array with the updated result
          const updatedresults = [...results];
          updatedresults[editedresultIndex] = response.data;

          // Update the state with the updated results array
          setresults(updatedresults);
          setShowEditModal(false); // Close the edit modal after a successful edit
          navigate("/sidebar/dashboard");
          navigate("/sidebar/result");
        }
      })
      .catch((error) => {
        console.error("Error editing result:", error);
      });
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingresult(null);
  };
  const fetchDataFromBackend = (page) => {
    setLoading(true);
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };
    axios
      .get(
        `http://localhost:8080/api/results?page=${page}&pageSize=${rowsPerPage}`,
        { headers }
      )
      .then((response) => {
        setresults(response.data.results);
        setTotalPages(response.data.totalPages);
        // setTotalPages(Math.ceil(filteredresults.length / rowsPerPage));
        setCurrentPage(page);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching results:", error);
        setLoading(false);
      });
  };
  const handleDelete =async (result) => {
    const confirmed = await showConfirm(`Are you sure you want to delete ${result.fullName}?`);
    // Display a confirmation dialog
    if (confirmed) {
      console.log("User confirmed!");
      // User confirmed, send DELETE request to the backend
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };
      axios
        .delete(`http://localhost:8080/api/results/${result.resultId}`, {
          headers,
        })
        .then((response) => {
          if (response.status === 200) {
            // result deleted successfully, update the state
            const updatedresults = results.filter(
              (t) => t.resultId !== result.resultId
            );
            setresults(updatedresults);
            fetchDataFromBackend(1);
          } else {
            console.error("Error deleting result:", response.data.message);
          }
        })
        .catch((error) => {
          console.error("Error deleting result:", error);
        });
    }
  };
  const filteredresults = results.filter((result) => {
    const searchTextLower = searchText?.toLowerCase();
    if (selectedFilter === "all") {
      return (
        (result.resultName &&
          result.resultName
            .toString()
            ?.toLowerCase()
            .includes(searchTextLower)) ||
        (result.SubjectName &&
          result.SubjectName.toString()
            .toLowerCase()
            .includes(searchTextLower)) ||
        (result.Batch &&
          result.Batch.toString().toLowerCase().includes(searchTextLower)) ||
        (result.TotalMarks &&
          result.TotalMarks.toString()
            .toLowerCase()
            .includes(searchTextLower)) ||
        (result.ClassName &&
          result.ClassName.toString().toLowerCase().includes(searchTextLower))
      );
    } else {
      return (
        result[selectedFilter] &&
        result[selectedFilter]
          .toString()
          .toLowerCase()
          .includes(searchTextLower)
      );
    }
  });

  return (
    <div className="result-list-container">
      <div className="result-search-bar">
        <select
          className="result-category"
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="userName">userName</option>
          <option value="fullName">Name</option>
          <option value="TestName">TestName</option>
          <option value="SubjectName">Subject Name</option>
          <option value="ClassName">Class Name</option>
          <option value="ObtainedMarks">Obtained Marks</option>
          <option value="Batch">Batch</option>
        </select>

        <input
          type="text"
          className="subject-text-input"
          placeholder="Search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          ref={inputRef}
        />
        <button
          className="result-search-button"
          onClick={() => {
            setSearchText("");
            inputRef.current.focus();
          }}
        >
          Search
        </button>
      </div>
      <div className="result-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Test Name</th>
              <th>SubjectName</th>
              <th>ClassName</th>
              <th>Batch</th>
              <th>Obt. Marks</th>
              <th>Tot. Marks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentPageData().map((result) => (
              <tr key={result.resultId}>
                <td>{result.fullName}</td>
                <td>{result.userName}</td>
                <td>{result.TestName}</td>
                <td>{result.SubjectName}</td>
                <td>{result.ClassName}</td>
                <td>{result.Batch}</td>
                <td>{result.ObtainedMarks}</td>
                <td>{result.TotalMarks}</td>
                <td className="set-result-icon">
                  <div
                    onClick={() => handleEdit(result)}
                    className="edit-result-icon"
                  >
                    <BiEditAlt className="edit-result-icon" />
                  </div>
                  <IoMdTrash
                    onClick={() => handleDelete(result)}
                    className="delete-result-icon"
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
        <EditResultModel
          result={editingresult}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default ResultList;
