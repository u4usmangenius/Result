import React, { useEffect, useRef } from "react";
import { IoMdTrash } from "react-icons/io";
import { BiEditAlt } from "react-icons/bi";
import { observer } from "mobx-react-lite";
import { subjectStore } from "../../store/subjectsStore/SubjectStore";
import LoadingSpinner from "../../components/loaders/Spinner";
import Modal from "../model/Modal";
import "../styles/FormList.css";
import { addSubjectStore } from "../../store/subjectsStore/addsubjectstore";
const SubjectList = ({ openAddstudentsModal, closeAddsubjectsModal }) => {
  const inputRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      subjectStore.setLoading(true);
      try {
        await subjectStore.fetchData();
        subjectStore.setDataNotFound(false);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        subjectStore.setDataNotFound(true);
      } finally {
        subjectStore.setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (subject) => {
    // subjectStore.handleEdit(subject);
    addSubjectStore.setFormData(subject);
    openAddstudentsModal();
  };

  const handleSaveEdit = (editedSubject) => {
    subjectStore.handleSaveEdit(editedSubject);
  };

  const handleCancelEdit = () => {
    subjectStore.handleCancelEdit();
  };

  const handleDelete = (subject) => {
    subjectStore.handleDelete(subject);
  };
  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = parseInt(e.target.value);
    subjectStore.setRowsPerPage(newRowsPerPage);
    subjectStore.setCurrentPage(1);
    subjectStore.fetchData();
  };
  const handlePageChange = (page) => {
    subjectStore.setCurrentPage(page);
    subjectStore.fetchData();
  };
  const handleSearchTextChange = (text) => {
    subjectStore.setSearchText(text);
  };

  const handleFilterChange = (filter) => {
    subjectStore.setSelectedFilter(filter);
  };
  const handleSearch = () => {
    subjectStore.handleSearch();
  };

  return (
    <div className="Form-list-container">
      <div className="Form-search-bar">
        <select
          className="Form-search-category"
          value={subjectStore.selectedFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
        >
          <option value="all">All</option>
          <option value="subjectName">subject</option>
          <option value="courseCode">courseCode</option>
        </select>
        <input
          type="text"
          className="FormList-text-input"
          placeholder="Search for a subject"
          value={subjectStore.searchText}
          onChange={(e) => {
            subjectStore.setSearchText(e.target.value);
            if (e.target.value === "") {
              subjectStore.fetchData();
            } else {
              subjectStore.handleSearch();
            }
          }}
          ref={inputRef}
        />
        <button
          className="Form-List-search-button"
          onClick={() => {
            handleSearchTextChange("");
            inputRef.current.focus();
            subjectStore.fetchData();
          }}
        >
          Clear
        </button>
      </div>
      {subjectStore.isLoading ? (
        <LoadingSpinner />
      ) : subjectStore.dataNotFound ? (
        <div>Could not get data</div>
      ) : (
        <div className="FormList-table">
          <table>
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>CourseCode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjectStore.filteredSubjects.map((teacher) => (
                <tr key={teacher.subjectId}>
                  <td>{teacher.subjectName}</td>
                  <td>{teacher.courseCode}</td>
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
        </div>
      )}

      <div className="FormList-pagination-header">
        <button
          onClick={() => handlePageChange(subjectStore.currentPage - 1)}
          disabled={subjectStore.currentPage === 1}
          className="FormList-pagination-button"
        >
          Prev
        </button>{" "}
        <div className="page-count">{subjectStore.currentPage}</div>
        <button
          onClick={() => handlePageChange(subjectStore.currentPage + 1)}
          className="FormList-pagination-button"
          disabled={subjectStore.currentPage === subjectStore.totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default observer(SubjectList);
