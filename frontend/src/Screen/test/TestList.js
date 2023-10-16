import React, { useEffect, useRef } from "react";
import { IoMdTrash } from "react-icons/io";
import { BiEditAlt } from "react-icons/bi";
import LoadingSpinner from "../../components/loaders/Spinner";
import { observer } from "mobx-react-lite";
import { testStore } from "../../store/TestStore/TestStore";
import "../styles/FormList.css";
import { addTestStore } from "../../store/TestStore/AddTestStore";

const TestList = ({ openAddtestsModal, closeAddtestsModal }) => {
  const { FiltreClassName } = { ...testStore };

  useEffect(() => {
    if (testStore.FiltreClassName !== "") {
      testStore.getDataByClassName();
    } else {
      testStore.fetchDataFromBackend(1);
    }
  }, [FiltreClassName]);

  const handleEdit = (test) => {
    addTestStore.setTestsData(test);
    console.log(test.testId, "asd");
    openAddtestsModal();
  };
  const handleDelete = (test) => {
    testStore.handleDelete(test);
  };
  const handlePageChange = (page) => {
    testStore.setCurrentPage(page);
    testStore.fetchDataFromBackend();
  };

  const handleSearchTextChange = (text) => {
    testStore.setSearchText(text);
  };

  const handleFilterChange = (filter) => {
    testStore.setSelectedFilter(filter);
  };
  return (
    <div className="Form-list-container">
      <div className="Formlist-align-filtre-pagebtn">
        <div className="Form-search-bar">
          <select
            className="Form-filter-ClassName"
            value={testStore.FiltreClassName}
            onChange={(e) => (testStore.FiltreClassName = e.target.value)}
          >
            <option value="">Show All</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
          </select>
        </div>
        
      </div>

      {testStore.isLoading ? (
        <LoadingSpinner />
      ) : testStore.dataNotFound ? (
        <div>Could not get data</div>
      ) : (
        <div className="FormList-table">
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
              {testStore.filteredTests.map((test) => (
                <tr key={test.testId}>
                  <td>{test.TestName}</td>
                  <td>{test.SubjectName}</td>
                  <td>{test.ClassName}</td>
                  <td>{test.TotalMarks}</td>
                  <td className="FormList-edit-icon">
                    <div
                      onClick={() => handleEdit(test)}
                      className="FormList-edit-icons"
                    >
                      <BiEditAlt className="FormList-edit-icons" />
                    </div>
                    <IoMdTrash
                      onClick={() => handleDelete(test)}
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
            onClick={() => handlePageChange(testStore.currentPage - 1)}
            disabled={testStore.currentPage === 1}
            className="FormList-pagination-button"
          >
            Prev
          </button>
          <div className="page-count">{testStore.currentPage}</div>
          <button
            className="FormList-pagination-button"
            onClick={() => handlePageChange(testStore.currentPage + 1)}
            disabled={testStore.currentPage === testStore.totalPages}
          >
            Next
          </button>
        </div>
    </div>
  );
};

export default observer(TestList);
