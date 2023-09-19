import React, { useState, useRef, useEffect } from "react";
import "./SubjectList.css";
import { IoMdTrash } from "react-icons/io";
import axios from "axios";
import { BiEditAlt, BiSave } from "react-icons/bi";
import EditSubjectModel from "./EditSubjectModel";
import { useNavigate } from "react-router-dom";
import { MdCancelPresentation } from "react-icons/md";
import Swal from "sweetalert2";
const SubjectList = ({ openAddsubjectsModal, closeAddsubjectsModal }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const inputRef = useRef(null);
  const [subjects, setsubjects] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false); // Manage edit modal visibility
  const [editingsubject, setEditingsubject] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [totalPages, setTotalPages] = useState(1); // Track total number of pages
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredsubjects.slice(startIndex, endIndex);
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
        `http://localhost:8080/api/subjects?page=${currentPage}&pageSize=${rowsPerPage}&filter=${selectedFilter}&search=${searchText}`,
        { headers }
      )
      .then((response) => {
        if (currentPage === 1) {
          setsubjects(response.data.subjects);
        } else {
          // Append the data to the existing subjects list
          setsubjects((prevsubjects) => [
            ...prevsubjects,
            ...response.data.subjects,
          ]);
        }
        setTotalPages(response.data.totalPages);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching subjects:", error);
        setLoading(false);
      });
  }, [currentPage, rowsPerPage, selectedFilter, searchText]);

  // useEffect(() => {
  //   setSearchText(""); // Reset searchText when currentPage changes
  // }, [currentPage]);

  const handleEdit = (subject) => {
    setShowEditModal(true);
    setEditingsubject(subject);
  };

  const handleSaveEdit = (editedsubject) => {
    // Send a PUT request to edit the subject data on the backend
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };
    axios
      .put(
        `http://localhost:8080/api/subjects/${editedsubject.subjectId}`,
        editedsubject,
        { headers }
      )
      .then((response) => {
        // Update the subject in the state based on the response from the server
        if (response.status === 200) {
          // Find the index of the edited subject in the subjects array
          const editedsubjectIndex = subjects.findIndex(
            (t) => t.subjectId === editedsubject.subjectId
          );

          // Create a copy of the subjects array with the updated subject
          const updatedsubjects = [...subjects];
          updatedsubjects[editedsubjectIndex] = response.data;

          // Update the state with the updated subjects array
          setsubjects(updatedsubjects);
          setShowEditModal(false); // Close the edit modal after a successful edit
          navigate("/sidebar/dashboard");
          navigate("/sidebar/subject");
        }
      })
      .catch((error) => {
        console.error("Error editing subject:", error);
      });
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingsubject(null);
  };
  const fetchDataFromBackend = (page) => {
    setLoading(true);
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };
    axios
      .get(
        `http://localhost:8080/api/subjects?page=${page}&pageSize=${rowsPerPage}`,
        { headers }
      )
      .then((response) => {
        setsubjects(response.data.subjects);
        setTotalPages(response.data.totalPages);
        setCurrentPage(page);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching subjects:", error);
        setLoading(false);
      });
  };
  const handleDelete = async (subject) => {
    const confirmed = await showConfirm(`Are you sure you want to delete ${subject.fullName}?`);
    if (confirmed) {
      console.log("User confirmed!");
      // User confirmed, send DELETE request to the backend
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };
      axios
        .delete(`http://localhost:8080/api/subjects/${subject.subjectId}`, {
          headers,
        })
        .then((response) => {
          if (response.status === 200) {
            // subject deleted successfully, update the state
            const updatedsubjects = subjects.filter(
              (t) => t.subjectId !== subject.subjectId
            );
            setsubjects(updatedsubjects);
            fetchDataFromBackend(1);
          } else {
            console.error("Error deleting subject:", response.data.message);
          }
        })
        .catch((error) => {
          console.error("Error deleting subject:", error);
        });
    }
  };
  const filteredsubjects = subjects.filter((subject) => {
    const searchTextLower = searchText?.toLowerCase();
    if (selectedFilter === "all") {
      return (
        subject.subjectName?.toLowerCase().includes(searchTextLower) ||
        subject.courseCode?.toLowerCase().includes(searchTextLower)
      );
    } else {
      return subject[selectedFilter]?.toLowerCase().includes(searchTextLower);
    }
  });

  return (
    <div className="subject-list-container">
      <div className="subject-search-bar">
        <select
          className="subject-category"
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="subjectName">subject</option>
          <option value="courseCode">courseCode</option>
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
          className="subject-search-button"
          onClick={() => {
            setSearchText("");
            inputRef.current.focus();
          }}
        >
          Search
        </button>
      </div>
      <div className="subject-table">
        <table>
          <thead>
            <tr>
              <th>Subject Name</th>
              <th>CourseCode</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentPageData().map((teacher) => (
              <tr key={teacher.teacherId}>
                <td>{teacher.subjectName}</td>
                <td>{teacher.courseCode}</td>
                <td className="set-teacher-icon">
                  <div
                    onClick={() => handleEdit(teacher)}
                    className="edit-teacher-icon"
                  >
                    <BiEditAlt className="edit-teacher-icon" />
                  </div>
                  <IoMdTrash
                    onClick={() => handleDelete(teacher)}
                    className="delete-teacher-icon"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination-header">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          Prev
        </button>{" "}
        <div className="page-count">{currentPage}</div>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          className="pagination-button"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
      {showEditModal && (
        <EditSubjectModel
          teacher={editingsubject}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default SubjectList;
