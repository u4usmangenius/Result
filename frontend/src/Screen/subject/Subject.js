import React, { useState } from "react";
import Modal from "../model/Modal.js";
import Header from "../header/Header";
import SubjectList from "./SubjectList";
import AddSubjects from "./AddSubjects";
import SubjectSearchInput from "./SubjectSearchInput.js";

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
      <div className="formlist-list-container">
        <div className="formlist-header-row">
          <h1>Subjects</h1>
          <SubjectSearchInput/>
          <button
            className="formlist-click-add-button"
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
