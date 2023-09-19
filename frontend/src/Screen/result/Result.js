import React, { useState } from "react";
import "./Result.css";
import Modal from "../model/Modal.js";
import Header from "../header/Header";
import AddResult from "./AddResult";
import ResultList from "./ResultList";

const Result = () => {
  const [isAddStudentsModalOpen, setIsAddStudentsModalOpen] = useState(false);

  const openAddStudentsModal = () => {
    setIsAddStudentsModalOpen(true);
  };

  const closeAddStudentsModal = () => {
    setIsAddStudentsModalOpen(false);
  };

  return (
    <>
      <Header />
      <div className="result-container">
        <div className="result-header-row">
          <h1>Result</h1>
          <button
            className="add-result-button"
            onClick={openAddStudentsModal}
          >
            Add Result
          </button>
        </div>
      </div>

      <Modal isOpen={isAddStudentsModalOpen} onClose={closeAddStudentsModal}>
        <AddResult onClose={closeAddStudentsModal} />
      </Modal>

      <ResultList
        openAddStudentsModal={openAddStudentsModal}
        closeAddStudentsModal={closeAddStudentsModal}
      />
    </>
  );
};

export default Result;
