import React, { useEffect } from "react";
import "./TeacherList.css";
import { IoMdTrash } from "react-icons/io";
import { BiEditAlt } from "react-icons/bi";
import { observer } from "mobx-react";
import EditTeacherModal from "./EditTeacherModal";
import Swal from "sweetalert2";
import { teachersStore } from "../../store/teachersStore/TeachersStore";
import LoadingSpinner from "../../components/loaders/Spinner";

const TeacherList = ({ openAddTeachersModal, closeAddTeachersModal }) => {
  useEffect(() => {
    const fetchData = async () => {
      teachersStore.setLoading(true);
      try {
        await teachersStore.fetchData();
        teachersStore.setDataNotFound(false);
      } catch (error) {
        console.error("Error fetching teachers:", error);
        teachersStore.setDataNotFound(true);
      } finally {
        teachersStore.setLoading(false);
      }
    };
    // Fetch data when the component mounts
    fetchData();
  }, []);

  const handleSort = (column, order) => {
    teachersStore.setSort(column, order);
    teachersStore.fetchData();
  };
  const showAlert = (message) => {
    Swal.fire(message);
  };

  const handleEdit = (teacher) => {
    teachersStore.handleEdit(teacher);
  };

  const handleSaveEdit = (editedTeacher) => {
    teachersStore.handleSaveEdit(editedTeacher);
  };

  const handleCancelEdit = () => {
    teachersStore.handleCancelEdit();
  };

  const handleDelete = (teacher) => {
    teachersStore.handleDelete(teacher);
  };

  const handleSearch = () => {
    teachersStore.handleSearch(); // Use handleSearchAll to search across all rows
  };

  const handlePrevPage = () => {
    if (teachersStore.currentPage > 1) {
      teachersStore.setCurrentPage(teachersStore.currentPage - 1);
      teachersStore.fetchData();
    }
  };

  const handleNextPage = () => {
    if (
      teachersStore.currentPage < teachersStore.totalPages &&
      !teachersStore.loading
    ) {
      teachersStore.setCurrentPage(teachersStore.currentPage + 1);
      teachersStore.fetchData();
    }
  };

  return (
    <div className="teacher-list-container">
      <div className="search-bar">
        <select
          className="category"
          value={teachersStore.selectedFilter}
          onChange={(e) => teachersStore.setSelectedFilter(e.target.value)}
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
          value={teachersStore.searchText}
          onChange={(e) => {
            teachersStore.setSearchText(e.target.value);
            if (e.target.value === "") {
              teachersStore.fetchData(); // Retrieve original data when search input is empty
            } else {
              teachersStore.handleSearch(); // Trigger search as the input changes
            }
          }}
        />
        <button className="search-button" onClick={handleSearch}>
          Search
        </button>
      </div>

      <div className="teacher-table">
        {teachersStore.loading ? (
          <LoadingSpinner />
        ) : teachersStore.dataNotFound ? (
          <div>No data found</div>
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
              {teachersStore.filteredTeachers.map((teacher) => (
                <tr key={teacher.teacherId}>
                  <td>{teacher.fullName}</td>
                  <td>{teacher.subject}</td>
                  <td>{teacher.gender}</td>
                  <td>{teacher.phone}</td>
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
        )}
        <div className="pagination-header">
          <button
            className="pagination-button"
            onClick={handlePrevPage}
            disabled={teachersStore.currentPage === 1 || teachersStore.loading}
          >
            Prev
          </button>
          <div className="page-count">{teachersStore.currentPage}</div>
          <button
            className="pagination-button"
            onClick={handleNextPage}
            disabled={
              teachersStore.currentPage === teachersStore.totalPages ||
              teachersStore.loading
            }
          >
            Next
          </button>
        </div>{" "}
      </div>
      {teachersStore.showEditModal && (
        <EditTeacherModal
          teacher={teachersStore.editingTeacher}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default observer(TeacherList);
