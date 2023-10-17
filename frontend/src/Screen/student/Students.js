import React, { useState } from "react";
import Modal from "../model/Modal.js";
import Header from "../header/Header";
import StudentList from "./StudentList";
import AddStudents from "./AddStudents";
import StudentSearchInput from "./StudentSearchInput.js";
import SendDate from "./SendDate.js";

const Students = () => {
  const [isAddStudentsModalOpen, setIsAddStudentsModalOpen] = useState(false);
  const [isReportsModal, setIsReportsModal] = useState(false);

  const openAddStudentsModal = () => {
    setIsAddStudentsModalOpen(true);
  };

  const closeAddStudentsModal = () => {
    setIsAddStudentsModalOpen(false);
  };

  const openReportsModal = () => {
    setIsReportsModal(true);
  };
  const closeReportsModal = () => {
    setIsReportsModal(false);
  };

  return (
    <>
      <Header />
      <div className="formlist-list-container">
        <div className="formlist-header-row">
          <h1>Students</h1>
          <StudentSearchInput />
          <button
            className="formlist-click-add-button"
            onClick={openAddStudentsModal}
          >
            Add Students
          </button>
        </div>
      </div>

      <Modal isOpen={isAddStudentsModalOpen} onClose={closeAddStudentsModal}>
        <AddStudents onClose={closeAddStudentsModal} />
      </Modal>
      <Modal isOpen={isReportsModal} onClose={closeReportsModal}>
        <SendDate onClose={closeReportsModal} />
      </Modal>

      {/* <StudentList
        openAddStudentsModal={openAddStudentsModal}
        closeAddStudentsModal={closeAddStudentsModal}
      /> */}
      <StudentList
        openAddstudentsModal={openAddStudentsModal}
        closeAddstudentsModal={closeAddStudentsModal}
        openReportModal={openReportsModal}
      />
    </>
  );
};

export default Students;
