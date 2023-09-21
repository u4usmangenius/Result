import React, { useState, useRef, useEffect } from "react";
import "./StudentList.css";
import { IoMdEdit, IoMdTrash } from "react-icons/io";
import { BiEditAlt, BiSave } from "react-icons/bi";
import EditStudentModal from "./EditedStudentModel";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdCancelPresentation } from "react-icons/md";
import Swal from "sweetalert2";
const StudentList = ({ openAddTeachersModal, closeAddTeachersModal }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const inputRef = useRef(null);
  const [students, setstudents] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false); // Manage edit modal visibility
  const [editingstudent, setEditingstudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [totalPages, setTotalPages] = useState(1); // Track total number of pages
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredstudents.slice(startIndex, endIndex);
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
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };
    setLoading(true);
    axios
      .get(
        `http://localhost:8080/api/students?page=${currentPage}&pageSize=${rowsPerPage}&filter=${selectedFilter}&search=${searchText}`,
        { headers }
      )
      .then((response) => {
        if (currentPage === 1) {
          setstudents(response.data.students);
        } else {
          // Append the data to the existing students list
          setstudents((prevstudents) => [
            ...prevstudents,
            ...response.data.students,
          ]);
        }
        setTotalPages(response.data.totalPages);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching students:", error);
        setLoading(false);
      });
  }, [currentPage, rowsPerPage, selectedFilter, searchText]);

  // useEffect(() => {
  //   setSearchText(""); // Reset searchText when currentPage changes
  // }, [currentPage]);

  const handleEdit = (student) => {
    setShowEditModal(true);
    setEditingstudent(student);
  };

  const handleSaveEdit = (editedstudent) => {
    // Send a PUT request to edit the student data on the backend
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };
    axios
      .put(
        `http://localhost:8080/api/students/${editedstudent.studentId}`,
        editedstudent,
        { headers }
      )
      .then((response) => {
        // Update the student in the state based on the response from the server
        if (response.status === 200) {
          // Find the index of the edited student in the students array
          const editedstudentIndex = students.findIndex(
            (t) => t.studentId === editedstudent.studentId
          );

          // Create a copy of the students array with the updated student
          setstudents((prevTeachers) => [
            ...prevTeachers.slice(0, editedstudentIndex),
            response.data,
            ...prevTeachers.slice(editedstudentIndex + 1),
          ]);
          const updatedstudents = [...students];
          updatedstudents[editedstudentIndex] = response.data;

          // Update the state with the updated students array
          setstudents(updatedstudents);
          setShowEditModal(false); // Close the edit modal after a successful edit
          axios
            .get(
              `http://localhost:8080/api/students?page=${currentPage}&pageSize=${rowsPerPage}&filter=${selectedFilter}&search=${searchText}`,
              { headers }
            )
            .then((response) => {
              if (currentPage === 1) {
                setstudents(response.data.students);
              } else {
                // Append the data to the existing students list
                setstudents((prevstudents) => [
                  ...prevstudents,
                  ...response.data.students,
                ]);
              }
              setTotalPages(response.data.totalPages);
              setLoading(false);
            })
            .catch((error) => {
              console.error("Error fetching students:", error);
              setLoading(false);
            });
        }
      })
      .catch((error) => {
        console.error("Error editing student:", error);
      });
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingstudent(null);
  };
  const fetchDataFromBackend = (page) => {
    setLoading(true);
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };

    axios
      .get(
        `http://localhost:8080/api/students?page=${page}&pageSize=${rowsPerPage}`,
        { headers }
      )
      .then((response) => {
        setstudents(response.data.students);
        setTotalPages(response.data.totalPages);
        setCurrentPage(page);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching students:", error);
        setLoading(false);
      });
  };
  const handleDelete = async (student) => {
    // Display a confirmation dialog
    const confirmed = await showConfirm(
      `Are you sure you want to delete ${student.fullName}?`
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
        .delete(`http://localhost:8080/api/students/${student.studentId}`, {
          headers,
        })
        .then((response) => {
          if (response.status === 200) {
            // student deleted successfully, update the state
            const updatedstudents = students.filter(
              (t) => t.studentId !== student.studentId
            );
            setstudents(updatedstudents);
            fetchDataFromBackend(1);
          } else {
            console.error("Error deleting student:", response.data.message);
          }
        })
        .catch((error) => {
          console.error("Error deleting student:", error);
        });
    }
  };
  const filteredstudents = students.filter((student) => {
    const searchTextLower = searchText?.toLowerCase();
    if (selectedFilter === "all") {
      return (
        student.fullName?.toLowerCase().includes(searchTextLower) ||
        student.subject?.toLowerCase().includes(searchTextLower) ||
        student.gender?.toLowerCase().includes(searchTextLower) ||
        student.stdRollNo?.toLowerCase().includes(searchTextLower) ||
        student.guard_Phone?.toLowerCase().includes(searchTextLower) ||
        student.stdPhone?.toLowerCase().includes(searchTextLower)
      );
    } else {
      return student[selectedFilter]?.toLowerCase().includes(searchTextLower);
    }
  });

  return (
    <div className="student-list-container">
      <div className="student-search-bar">
        <select
          className="student-category"
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="fullName">Name</option>
          <option value="className">ClassName</option>
          <option value="stdRollNo">RollNo</option>
          <option value="gender">Gender</option>
          <option value="stdPhone">Std.PhoneNo</option>
          <option value="guard_Phone">Guardian PhoneNo</option>
        </select>

        <input
          type="text"
          placeholder="Search for a student"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          ref={inputRef}
        />
        <button
          className="student-search-button"
          onClick={() => {
            setCurrentPage(1); // Reset currentPage to 1 when searching
          }}
        >
          Search
        </button>
      </div>
      <div className="student-student-table">
        <table>
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>ClassName</th>
              <th>Std.PhoneNo</th>
              <th>Guardian PhoneNor</th>
              <th>Gender</th>
              <th>Batch</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentPageData().map((student) => (
              <tr key={student.studentId}>
                <td>{student.stdRollNo}</td>
                <td>{student.fullName}</td>
                <td>{student.className}</td>
                <td>{student.stdPhone}</td>
                <td>{student.guard_Phone}</td>
                <td>{student.gender}</td>
                <td>{student.Batch}</td>
                <td className="set-student-icon">
                  <div
                    onClick={() => handleEdit(student)}
                    className="edit-student-icon"
                  >
                    <BiEditAlt className="edit-student-icon" />
                  </div>
                  <IoMdTrash
                    onClick={() => handleDelete(student)}
                    className="delete-student-icon"
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
      {showEditModal && (
        <EditStudentModal
          student={editingstudent}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default StudentList;
