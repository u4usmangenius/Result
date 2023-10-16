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

  const handleDelete = (subject) => {
    subjectStore.handleDelete(subject);
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
  return (
    <div className="Form-list-container">
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
              {subjectStore.filteredSubjects.map((subject) => (
                <tr key={subject.subjectId}>
                  <td>{subject.subjectName}</td>
                  <td>{subject.courseCode}</td>
                  <td className="FormList-edit-icon">
                    <div
                      onClick={() => handleEdit(subject)}
                      className="FormList-edit-icons"
                    >
                      <BiEditAlt className="FormList-edit-icons" />
                    </div>
                    <IoMdTrash
                      onClick={() => handleDelete(subject)}
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
