import React, { useState } from "react";
import "./Test.css";
import Modal from "../Model/Modal.js";
import Header from "../Header/Header";
import AddTest from "./AddTest";
import TestList from "./TestList";

const Test = () => {
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
      <div className="test-container">
        <div className="test-header-row">
          <h1>Test</h1>
          <button
            className="add-test-button"
            onClick={openAddStudentsModal}
          >
            Add Test
          </button>
        </div>
      </div>

      <Modal isOpen={isAddStudentsModalOpen} onClose={closeAddStudentsModal}>
        <AddTest onClose={closeAddStudentsModal} />
      </Modal>

      <TestList
        openAddStudentsModal={openAddStudentsModal}
        closeAddStudentsModal={closeAddStudentsModal}
      />
    </>
  );
};

export default Test;
