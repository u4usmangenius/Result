import React, { useState } from "react";
import "./Subject.css";
import Modal from "../Model/Modal.js";
import Header from "../Header/Header";
import SubjectList from "./SubjectList";
import AddSubjects from "./AddSubjects";

const Subject = () => {
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
      <div className="subject-container">
        <div className="subject-header-row">
          <h1>Subjects</h1>
          <button
            className="add-subject-button"
            onClick={openAddStudentsModal}
          >
            Add Subjects
          </button>
        </div>
      </div>

      <Modal isOpen={isAddStudentsModalOpen} onClose={closeAddStudentsModal}>
        <AddSubjects onClose={closeAddStudentsModal} />
      </Modal>

      <SubjectList
        openAddStudentsModal={openAddStudentsModal}
        closeAddStudentsModal={closeAddStudentsModal}
      />
    </>
  );
};

export default Subject;
