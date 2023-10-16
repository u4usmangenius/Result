import React, { useState } from "react";
import Modal from "../model/Modal.js";
import Header from "../header/Header";
import AddResult from "./AddResult";
import ResultList from "./ResultList";
import ResultSearchInput from "./ResultSearchInput.js";

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
      <div className="formlist-list-container">
        <div className="formlist-header-row">
          <h1>Result</h1>
          <ResultSearchInput />
          <button
            className="formlist-click-add-button"
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
        openAddresultsModal={openAddStudentsModal}
        closeAddresultsModal={closeAddStudentsModal}
      />
    </>
  );
};

export default Result;
