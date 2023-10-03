import React, { useEffect, useRef } from "react";
import "./ResultList.css";
import { IoMdTrash } from "react-icons/io";
import { BiEditAlt } from "react-icons/bi";
import { observer } from "mobx-react-lite";
import EditResultModel from "./EditResultModel";
import { useNavigate } from "react-router-dom";
import { MdCancelPresentation } from "react-icons/md";
import { FaFilePdf } from "react-icons/fa";
import Swal from "sweetalert2";
import { resultStore } from "../../store/ResultStore/ResultStore";

const ResultList = observer(() => {
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    resultStore.fetchDataFromBackend(resultStore.currentPage); // Pass the currentPage to fetchDataFromBackend
  }, [resultStore.currentPage]);

  const handleEdit = (result) => {
    resultStore.handleEdit(result);
  };

  const handleSaveEdit = (editedResult) => {
    resultStore.handleSaveEdit(editedResult);
  };

  const handleCancelEdit = () => {
    resultStore.handleCancelEdit();
  };

  const handleDelete = async (result) => {
    const confirmed = await resultStore.showConfirm(
      `Are you sure you want to delete ${result.fullName}?`
    );
    if (confirmed) {
      resultStore.handleDelete(result);
    }
  };
  const handleSearch = () => {
    resultStore.handleSearch();
  };

  const handleDownloadPdf = (result) => {
    resultStore.downloadPdf(result);
  };
  return (
    <div className="result-list-container">
      <div className="result-search-bar">
        <select
          className="result-category"
          value={resultStore.selectedFilter}
          onChange={(e) => resultStore.setSelectedFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="stdRollNo">RollNo</option>
          <option value="fullName">Name</option>
          <option value="TestName">TestName</option>
          <option value="SubjectName">Subject Name</option>
          <option value="ClassName">Class Name</option>
          {/* <option value="ObtainedMarks">Obtained Marks</option> */}
          <option value="Batch">Batch</option>
        </select>

        <input
          type="text"
          className="subject-text-input"
          placeholder="Search for a result"
          value={resultStore.searchText}
          onChange={(e) => {
            resultStore.setSearchText(e.target.value);
            if (e.target.value === "") {
              resultStore.fetchDataFromBackend(1);
            } else {
              resultStore.handleSearch();
            }
          }}
          ref={inputRef}
        />
        <button
          className="result-search-button"
          onClick={() => {
            // resultStore.setSearchText("");
            inputRef.current.focus();
          }}
        >
          Search
        </button>
      </div>
      <div className="result-table">
        <table>
          <thead>
            <tr>
              <th>RollNo</th>
              <th>Name</th>
              <th>Test Name</th>
              <th>SubjectName</th>
              <th>ClassName</th>
              <th>Batch</th>
              <th>Obt. Marks</th>
              <th>Tot. Marks</th>
              <th>PDF</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resultStore.filteredResults.map((result) => (
              <tr key={result.resultId}>
                <td>{result.stdRollNo}</td>
                <td>{result.fullName}</td>
                <td>{result.TestName}</td>
                <td>{result.SubjectName}</td>
                <td>{result.ClassName}</td>
                <td>{result.Batch}</td>
                <td>{result.ObtainedMarks}</td>
                <td>{result.TotalMarks}</td>
                <td style={{ fontSize: "22px" }}>
                  <div
                    className="pdf-result-icon"
                    onClick={() => handleDownloadPdf(result)}
                  >
                    <FaFilePdf className="edit-result-icon" />
                  </div>
                </td>
                <td className="set-result-icon">
                  <div
                    onClick={() => handleEdit(result)}
                    className="edit-result-icon"
                  >
                    <BiEditAlt className="edit-result-icon" />
                  </div>
                  <IoMdTrash
                    onClick={() => handleDelete(result)}
                    className="delete-result-icon"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <button
          onClick={() =>
            resultStore.setCurrentPage(resultStore.currentPage - 1)
          }
          disabled={resultStore.currentPage === 1}
          className="result-pagination-button"
        >
          Prev
        </button>
        {Array.from({ length: resultStore.totalPages }, (_, i) =>
          resultStore.currentPage === i + 1 ? (
            <button
              id="result-count-btn"
              key={i}
              onClick={() => resultStore.setCurrentPage(i + 1)}
              className=""
            >
              {i + 1}
            </button>
          ) : null
        )}
        <button
          onClick={() =>
            resultStore.setCurrentPage(resultStore.currentPage + 1)
          }
          disabled={resultStore.currentPage === resultStore.totalPages}
          className="result-pagination-button"
        >
          Next
        </button>{" "}
      </div>
      {resultStore.showEditModal && (
        <EditResultModel
          result={resultStore.editingResult}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
});

export default ResultList;
