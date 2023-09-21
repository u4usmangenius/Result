// usman do something about select subject input field

import React, { useState, useRef, useEffect } from "react";
import "./TeacherList.css";
import { IoMdTrash } from "react-icons/io";
import axios from "axios";
import { BiEditAlt, BiSave } from "react-icons/bi";
import EditTeacherModal from "./EditTeacherModal";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
const TeacherList = ({ openAddTeachersModal, closeAddTeachersModal }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const inputRef = useRef(null);
  const [teachers, setTeachers] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false); // Manage edit modal visibility
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [totalPages, setTotalPages] = useState(1); // Track total number of pages
  
  useEffect(()=>{

    navigate("/sidebar/studens")
    navigate("/sidebar/teachers")
  },[])
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
    setLoading(true);
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };
    axios
      .get(
        `http://localhost:8080/api/teachers?page=${currentPage}&pageSize=${rowsPerPage}&filter=${selectedFilter}&search=${searchText}`,
        { headers }
      )
      .then((response) => {
        if (currentPage === 1) {
          setTeachers(response.data.teachers);
        } else {
          // Append the data to the existing teachers list
          setTeachers((prevTeachers) => [
            ...prevTeachers,
            ...response.data.teachers,
          ]);
        }
        setTotalPages(response.data.totalPages);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching teachers:", error);
        setLoading(false);
      });
  }, [currentPage, rowsPerPage, selectedFilter, searchText]);

    const getCurrentPageData = () => {
    
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    console.log("filtered tachrs.slice")
    console.log(filteredTeachers.slice(startIndex,endIndex))
    return filteredTeachers.slice(startIndex, endIndex);
  };

  // useEffect(() => {
  //   setSearchText(""); // Reset searchText when currentPage changes
  // }, [currentPage]);
  const handleEdit = (teacher) => {
    setShowEditModal(true);
    setEditingTeacher(teacher);
  };

  const handleSaveEdit = (editedTeacher) => {
    // Send a PUT request to edit the teacher data on the backend
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };

    axios
      .put(
        `http://localhost:8080/api/teachers/${editedTeacher.teacherId}`,
        editedTeacher,
        { headers }
      )
      .then((response) => {
        // Update the teacher in the state based on the response from the server
        if (response.status === 200) {
          // Find the index of the edited teacher in the teachers array
          const editedTeacherIndex = teachers.findIndex(
            (t) => t.teacherId === editedTeacher.teacherId
          );

          // Create a copy of the teachers  array with the updated teacher
          setTeachers((prevTeachers) => [
            ...prevTeachers.slice(0, editedTeacherIndex),
            response.data,
            ...prevTeachers.slice(editedTeacherIndex + 1),
          ]);
          const updatedTeachers = [...teachers];
          updatedTeachers[editedTeacherIndex] = response.data;

          // Update the state with the updated teachers array

          setTeachers(updatedTeachers);
          setShowEditModal(false); // Close the edit modal after a successful edit

          axios
            .get(
              `http://localhost:8080/api/teachers?page=${currentPage}&pageSize=${rowsPerPage}&filter=${selectedFilter}&search=${searchText}`,
              { headers }
            )
            .then((response) => {
              if (currentPage === 1) {
                setTeachers(response.data.teachers);
              } else {
                // Append the data to the existing teachers list
                setTeachers((prevTeachers) => [
                  ...prevTeachers,
                  ...response.data.teachers,
                ]);
              }
              setTotalPages(response.data.totalPages);
              setLoading(false);
            })
            .catch((error) => {
              console.error("Error fetching teachers:", error);
              setLoading(false);
            });
        }
      })
      .catch((error) => {
        console.error("Error editing teacher:", error);
      });
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingTeacher(null);
  };
  const fetchDataFromBackend = (page) => {
    setLoading(true);
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };
    axios
      .get(
        `http://localhost:8080/api/teachers?page=${page}&pageSize=${rowsPerPage}`,
        { headers }
      )
      .then((response) => {
        setTeachers(response.data.teachers);
        setTotalPages(response.data.totalPages);
        setCurrentPage(page);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching teachers:", error);
        setLoading(false);
      });
  };
  const handleDelete = async (teacher) => {
    const confirmed = await showConfirm(
      `Are you sure you want to delete ${teacher.fullName}?`
    );
    // Display a confirmation dialog
    if (confirmed) {
      console.log("User confirmed!");
      // User confirmed, send DELETE request to the backend
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };

      axios
        .delete(`http://localhost:8080/api/teachers/${teacher.teacherId}`, {
          headers, // Include the headers with the bearer token
        })
        .then((response) => {
          if (response.status === 200) {
            // Teacher deleted successfully, update the state
            const updatedTeachers = teachers.filter(
              (t) => t.teacherId !== teacher.teacherId
            );
            setTeachers(updatedTeachers);
            fetchDataFromBackend(1);
          } else {
            console.error("Error deleting teacher:", response.data.message);
          }
        })
        .catch((error) => {
          console.error("Error deleting teacher:", error);
        });
    }
  };
  const filteredTeachers = teachers.filter((teacher) => {
    const searchTextLower = searchText?.toLowerCase();
    if (selectedFilter === "all") {
      return (
        teacher.fullName?.toLowerCase().includes(searchTextLower) ||
        teacher.subject?.toLowerCase().includes(searchTextLower) ||
        teacher.gender?.toLowerCase().includes(searchTextLower) ||
        teacher.phone?.toLowerCase().includes(searchTextLower)
      );
    } else {
      return teacher[selectedFilter]?.toLowerCase().includes(searchTextLower);
    }
  });

  return (
    <div className="teacher-list-container">
      <div className="search-bar">
        <select
          className="category"
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="fullName">Name</option>
          <option value="subject">Subject</option>
          <option value="gender">Gender</option>
          <option value="phone">Phone Number</option>
        </select>

        <input
          type="text"
          placeholder="Search for a teacher "
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          ref={inputRef}
        />
        <button
          className="search-button"
          onClick={() => {
            setCurrentPage(1); // Reset currentPage to 1 when searching
          }}
        >
          Search
        </button>
      </div>

      <div className="teacher-table">
        {loading ? (
          <div className="custom-loader"></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Subject</th>
                <th>Gender</th>
                <th>Phone Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentPageData().map((teacher) => (
                <tr key={teacher.teacherId}>
                  <td>{teacher.fullName}</td>
                  <td>{teacher.subject}</td>
                  <td>{teacher.gender}</td>
                  <td>{teacher.phone}</td>
                  <td className="set-teacher-icon">
                    <div
                      onClick = {() => handleEdit(teacher)}
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
        )}
        <div className="pagination-header">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Prev
          </button>
          <div className="page-count">{currentPage}</div>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="pagination-button"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>{" "}
      </div>
      {showEditModal && (
        <EditTeacherModal
          teacher={editingTeacher}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default TeacherList;
