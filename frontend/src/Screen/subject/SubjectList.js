import React, { useEffect, useRef, useState } from "react";
import "./SubjectList.css";
import { IoMdTrash } from "react-icons/io";
import { BiEditAlt } from "react-icons/bi";
import EditSubjectModel from "./EditSubjectModel";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite"; // Import MobX observer
import { subjectStore } from "../../store/subjectsStore/SubjectStore";
import LoadingSpinner from "../../components/loaders/Spinner";
import Modal from "../model/Modal";

const SubjectList = ({ openAddsubjectsModal, closeAddsubjectsModal }) => {
  const navigate = useNavigate();
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
    subjectStore.handleEdit(subject);
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
    subjectStore.setCurrentPage(1); // Reset to page 1 when changing rowsPerPage
    subjectStore.fetchData(); // No need to pass rowsPerPage here
  };
  // const handleSearchTextChange = (text) => {
  //   store.setSearchTerm(text);
  // };

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
    <div className="subject-list-container">
      <div className="subject-search-bar">
        <select
          className="subject-category"
          value={subjectStore.selectedFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
        >
          <option value="all">All</option>
          <option value="subjectName">subject</option>
          <option value="courseCode">courseCode</option>
        </select>
        <input
          type="text"
          className="subject-text-input"
          placeholder="Search for a subject"
          value={subjectStore.searchText}
          onChange={(e) => {
            subjectStore.setSearchText(e.target.value);
            if (e.target.value === "") {
              subjectStore.fetchData(); // Retrieve original data when search input is empty
            } else {
              subjectStore.handleSearch(); // Trigger search as the input changes
            }
          }}
          ref={inputRef}
        />
        <button
          className="subject-search-button"
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
              {subjectStore.filteredSubjects.map((teacher) => (
                <tr key={teacher.subjectId}>
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
      )}

      <div className="pagination-header">
        <button
          onClick={() => handlePageChange(subjectStore.currentPage - 1)}
          disabled={subjectStore.currentPage === 1}
          className="pagination-button"
        >
          Prev
        </button>{" "}
        <div className="page-count">{subjectStore.currentPage}</div>
        <button
          onClick={() => handlePageChange(subjectStore.currentPage + 1)}
          className="pagination-button"
          disabled={subjectStore.currentPage === subjectStore.totalPages}
        >
          Next
        </button>
      </div>
      {subjectStore.showEditModal && (
        <EditSubjectModel
          teacher={subjectStore.editingSubject}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default observer(SubjectList); // Wrap the component with MobX observer
