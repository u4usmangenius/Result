import React, { useEffect, useRef } from "react";
import { IoMdTrash } from "react-icons/io";
import { BiEditAlt } from "react-icons/bi";
import { observer } from "mobx-react";
import Swal from "sweetalert2";
import { teachersStore } from "../../store/teachersStore/TeachersStore";
import LoadingSpinner from "../../components/loaders/Spinner";
import "../styles/FormList.css";
import { addTeacherStore } from "../../store/teachersStore/AddTeacherStore";

const TeacherList = ({ openAddstudentsModal, closeAddTeachersModal }) => {
  const inputRef = useRef();

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
  const handleSearchTextChange = (text) => {
    teachersStore.setSearchText(text);
  };
  const handleEdit = (teacher) => {
    // teachersStore.handleEdit(teacher);
    addTeacherStore.setTeacherData(teacher);
    openAddstudentsModal();
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
    <div className="Form-list-container">
      <div className="Form-search-bar">
        <select
          className="Form-search-category"
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
          ref={inputRef}
        />
        <button
          className="Form-List-search-button"
          onClick={() => {
            handleSearchTextChange("");
            inputRef.current.focus();
            teachersStore.fetchData();
          }}
        >
          Clear
        </button>
      </div>

      <div className="FormList-table">
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
                  <td className="FormList-edit-icon">
                    <div
                      onClick={() => handleEdit(teacher)}
                      className="FormList-edit-icons"
                    >
                      <BiEditAlt className="FormList-edit-icons" />
                    </div>
                    <IoMdTrash
                      onClick={() => handleDelete(teacher)}
                      className="FormList-delete-icon"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="FormList-pagination-header">
          <button
            className="FormList-pagination-button"
            onClick={handlePrevPage}
            disabled={teachersStore.currentPage === 1 || teachersStore.loading}
          >
            Prev
          </button>
          <div className="page-count">{teachersStore.currentPage}</div>
          <button
            className="FormList-pagination-button"
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
    </div>
  );
};

export default observer(TeacherList);
