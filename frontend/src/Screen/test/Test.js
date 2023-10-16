import React, { useState } from "react";
import Modal from "../model/Modal.js";
import Header from "../header/Header";
import AddTest from "./AddTest";
import TestList from "./TestList";
import TestSearchInput from "./TestSearchInput.js";

const Test = () => {
  const [isAddTestsModalOpen, setIsAddTestsModalOpen] = useState(false);

  const openAddTestsModal = () => {
    setIsAddTestsModalOpen(true);
  };

  const closeAddTestsModal = () => {
    setIsAddTestsModalOpen(false);
  };

  return (
    <>
      <Header />
      <div className="formlist-list-container">
        <div className="formlist-header-row">
          <h1>Test</h1>
          <TestSearchInput/>
          <button
            className="formlist-click-add-button"
            onClick={openAddTestsModal}
          >
            Add Test
          </button>
        </div>
      </div>

      <Modal isOpen={isAddTestsModalOpen} onClose={closeAddTestsModal}>
        <AddTest onClose={closeAddTestsModal} />
      </Modal>

      <TestList
        openAddtestsModal={openAddTestsModal}
        closeAddtestsModal={closeAddTestsModal}
      />
    </>
  );
};

export default Test;
