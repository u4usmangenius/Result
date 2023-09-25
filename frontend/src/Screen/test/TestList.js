import React, { useEffect } from "react";
import "./TestList.css";
import { IoMdTrash } from "react-icons/io";
import { BiEditAlt } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { MdCancelPresentation } from "react-icons/md";
import { observer } from "mobx-react-lite";
import EdittestModal from "./EditTestModel";
import { testStore } from "../../store/TestStore/TestStore";

const TestList = observer(() => {
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch data from the backend when the component mounts
    testStore.fetchDataFromBackend(1);
  }, []);

  const handleEdit = (test) => {
    testStore.handleEdit(test);
  };

  const handleSaveEdit = (editedTest) => {
    testStore.handleSaveEdit(editedTest);
  };

  const handleCancelEdit = () => {
    testStore.handleCancelEdit();
  };

  const handleDelete = (test) => {
    testStore.handleDelete(test);
  };

  const handlePageChange = (page) => {
    testStore.setCurrentPage(page);
  };

  const handleSearchTextChange = (text) => {
    testStore.setSearchText(text);
  };

  const handleFilterChange = (filter) => {
    testStore.setSelectedFilter(filter);
  };

  const getCurrentPageData = () => testStore.getCurrentPageData;

  return (
    <div className="test-list-container">
      <div className="test-search-bar">
        <select
          className="test-category"
          value={testStore.selectedFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
        >
          <option value="all">All</option>
          <option value="TestName">TestName</option>
          <option value="ClassName">ClassName</option>
          <option value="TotalMarks">TotalMarks</option>
          <option value="SubjectName">SubjectName</option>
        </select>
        <input
          type="text"
          className="subject-text-input"
          placeholder="Search for a test"
          value={testStore.searchText}
          onChange={(e) => handleSearchTextChange(e.target.value)}
        />
        <button
          className="test-search-button"
          onClick={() => handleSearchTextChange("")}
        >
          Search
        </button>
      </div>
      <div className="test-table">
        <table>
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Subject Name</th>
              <th>Class Name</th>
              <th>Total Marks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentPageData().map((test) => (
              <tr key={test.testId}>
                <td>{test.TestName}</td>
                <td>{test.SubjectName}</td>
                <td>{test.ClassName}</td>
                <td>{test.TotalMarks}</td>
                <td className="set-test-icon">
                  <div
                    onClick={() => handleEdit(test)}
                    className="edit-test-icon"
                  >
                    <BiEditAlt className="edit-test-icon" />
                  </div>
                  <IoMdTrash
                    onClick={() => handleDelete(test)}
                    className="delete-test-icon"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <button
          onClick={() => handlePageChange(testStore.currentPage - 1)}
          disabled={testStore.currentPage === 1}
          className="result-pagination-button"
        >
          Prev
        </button>
        {Array.from({ length: testStore.totalPages }, (_, i) =>
          testStore.currentPage === i + 1 ? (
            <button
              id="result-count-btn"
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className=""
            >
              {i + 1}
            </button>
          ) : null
        )}
        <button
          className="result-pagination-button"
          onClick={() => handlePageChange(testStore.currentPage + 1)}
          disabled={testStore.currentPage === testStore.totalPages}
        >
          Next
        </button>
      </div>
      {testStore.showEditModal && (
        <EdittestModal
          test={testStore.editingTest}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
});

export default TestList;
