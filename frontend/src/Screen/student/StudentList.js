import React, { useEffect } from "react";
import "./StudentList.css";
import { IoMdTrash } from "react-icons/io";
import { BiEditAlt } from "react-icons/bi";
import { observer } from "mobx-react";
import Swal from "sweetalert2";
import { studentsStore } from "../../store/studentsStore/studentsStore";
import LoadingSpinner from "../../components/loaders/Spinner";
import EditStudentModal from "./EditedStudentModel";

const StudentList = ({ openAddstudentsModal, closeAddstudentsModal }) => {
  useEffect(() => {
    const fetchData = async () => {
      studentsStore.setLoading(true);
      try {
        await studentsStore.fetchData();
        studentsStore.setDataNotFound(false);
      } catch (error) {
        console.error("Error fetching students:", error);
        studentsStore.setDataNotFound(true);
      } finally {
        studentsStore.setLoading(false);
      }
    };
    // Fetch data when the component mounts
    fetchData();
  }, []);

  const showAlert = (message) => {
    Swal.fire(message);
  };

  const handleEdit = (student) => {
    studentsStore.handleEdit(student);
  };

  const handleSaveEdit = (editedstudent) => {
    studentsStore.handleSaveEdit(editedstudent);
  };

  const handleCancelEdit = () => {
    studentsStore.handleCancelEdit();
  };

  const handleDelete = (student) => {
    studentsStore.handleDelete(student);
  };

  const handleSearch = () => {
    studentsStore.handleSearch();
  };

  const handlePrevPage = () => {
    if (studentsStore.currentPage > 1) {
      studentsStore.setCurrentPage(studentsStore.currentPage - 1);
      studentsStore.fetchData();
    }
  };

  const handleNextPage = () => {
    if (
      studentsStore.currentPage < studentsStore.totalPages &&
      !studentsStore.loading
    ) {
      studentsStore.setCurrentPage(studentsStore.currentPage + 1);
      studentsStore.fetchData();
    }
  };

  return (
    <div className="student-list-container">
      <div className="student-search-bar">
        <select
          className="student-category"
          value={studentsStore.selectedFilter}
          onChange={(e) => studentsStore.setSelectedFilter(e.target.value)}
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
          placeholder="Search for a student "
          value={studentsStore.searchText}
          onChange={(e) =>{
            studentsStore.setSearchText(e.target.value);
            if (e.target.value === "") {
              studentsStore.fetchData(); // Retrieve original data when search input is empty
            } else {
              studentsStore.handleSearch(); // Trigger search as the input changes
            }
          }}
        />
        <button className="student-search-button" onClick={handleSearch}>
          Search
        </button>
      </div>

      <div className="student-student-table">
        {studentsStore.loading ? (
          <LoadingSpinner />
        ) : studentsStore.dataNotFound ? (
          <div>No data found</div>
        ) : (
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
              {studentsStore.filteredstudents.map((student) => (
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
        )}
        <div className="pagination-header">
          <button
            className="pagination-button"
            onClick={handlePrevPage}
            disabled={studentsStore.currentPage === 1 || studentsStore.loading}
          >
            Prev
          </button>
          <div className="page-count">{studentsStore.currentPage}</div>
          <button
            className="pagination-button"
            onClick={handleNextPage}
            disabled={
              studentsStore.currentPage === studentsStore.totalPages ||
              studentsStore.loading
            }
          >
            Next
          </button>
        </div>{" "}
      </div>
      {studentsStore.showEditModal && (
        <EditStudentModal
          student={studentsStore.editingstudent}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default observer(StudentList);
