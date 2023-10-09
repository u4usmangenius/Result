import React, { useState } from "react";
import "./Subject.css";
import Modal from "../model/Modal.js";
import Header from "../header/Header";
import SubjectList from "./SubjectList";
import AddSubjects from "./AddSubjects";

const Subject = () => {
  const [isPopupOpen,setPopupOpen] = useState(false);

  const openAddStudentsModal = () => {
    setPopupOpen(true);
  };

  const closeAddStudentsModal = () => {
    setPopupOpen(false);
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

      <Modal isOpen={isPopupOpen} onClose={closeAddStudentsModal}>
        <AddSubjects onClose={closeAddStudentsModal} />
      </Modal>

      <SubjectList
        openAddstudentsModal={openAddStudentsModal}
        closeAddStudentsModal={closeAddStudentsModal}
      />
    </>
  );
};

export default Subject;
