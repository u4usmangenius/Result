import React, { useEffect, useRef } from "react";
import { IoMdTrash } from "react-icons/io";
import { BiEditAlt } from "react-icons/bi";
import { observer } from "mobx-react-lite";
import { FaFilePdf } from "react-icons/fa";
import { resultStore } from "../../store/ResultStore/ResultStore";
import { addResultStore } from "../../store/ResultStore/AddResultStore";

const ResultList = ({ openAddresultsModal }) => {
  const { FiltreClassName } = { ...resultStore };
  useEffect(() => {
    if (resultStore.FiltreClassName !== "") {
      resultStore.getDataByClassName();
    } else {
      resultStore.fetchDataFromBackend(1);
      console.log("--->", resultStore.fetchDataFromBackend(1));
    }
  }, [FiltreClassName]);

  const handleEdit = (result) => {
    addResultStore.setResultData(result);
    console.log(result.resultId, "<<<--->>>");
    openAddresultsModal();
  };
  const handleDelete = async (result) => {
    resultStore.handleDelete(result);
  };
  const handleDownloadPdf = (result) => {
    resultStore.downloadPdf(result);
  };
  return (
    <div className="Form-list-container">
      <div className="Formlist-align-filtre-pagebtn">
        <div className="Form-search-bar">
          <select
            className="Form-filter-ClassName"
            value={resultStore.FiltreClassName}
            onChange={(e) => (resultStore.FiltreClassName = e.target.value)}
          >
            <option value="">Show All</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
          </select>
        </div>
      </div>

      <div className="FormList-table">
        <table>
          <thead>
            <tr>
              <th>RollNo</th>
              <th>Name</th>
              <th>Test Name</th>
              <th>SubjectName</th>
              <th>ClassName</th>
              <th>Obt. Marks</th>
              <th>Tot. Marks</th>
              <th>Percentage</th>
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
                <td>{result.ObtainedMarks}</td>
                <td>{result.TotalMarks}</td>
                <td>{result.stdTestPercentage}</td>
                <td style={{ fontSize: "22px" }}>
                  <div
                    className="FormList-edit-icon"
                    onClick={() => handleDownloadPdf(result)}
                  >
                    <FaFilePdf className="FormList-edit-icons" />
                  </div>
                </td>
                <td className="FormList-edit-icon">
                  <div
                    onClick={() => handleEdit(result)}
                    className="FormList-edit-icons"
                  >
                    <BiEditAlt className="FormList-edit-icons" />
                  </div>
                  <IoMdTrash
                    onClick={() => handleDelete(result)}
                    className="FormList-delete-icon"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="FormList-pagination-header">
        <button
          onClick={() =>
            resultStore.setCurrentPage(resultStore.currentPage - 1)
          }
          disabled={resultStore.currentPage === 1}
          className="FormList-pagination-button"
        >
          Prev
        </button>
        <div className="page-count">{resultStore.currentPage}</div>
        <button
          onClick={() =>
            resultStore.setCurrentPage(resultStore.currentPage + 1)
          }
          disabled={resultStore.currentPage === resultStore.totalPages}
          className="FormList-pagination-button"
        >
          Next
        </button>{" "}
      </div>
    </div>
  );
};

export default observer(ResultList);
