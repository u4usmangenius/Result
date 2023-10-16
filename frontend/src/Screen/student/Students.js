import React, { useState } from "react";
import Modal from "../model/Modal.js";
import Header from "../header/Header";
import StudentList from "./StudentList";
import AddStudents from "./AddStudents";
import StudentSearchInput from "./StudentSearchInput.js";

const Students = () => {
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
          <h1>Students</h1>
          <StudentSearchInput/>
          <button className="formlist-click-add-button" onClick={openAddStudentsModal}>
            Add Students
          </button>
        </div>
      </div>

      <Modal isOpen={isAddStudentsModalOpen} onClose={closeAddStudentsModal}>
        <AddStudents onClose={closeAddStudentsModal} />
      </Modal>

      {/* <StudentList
        openAddStudentsModal={openAddStudentsModal}
        closeAddStudentsModal={closeAddStudentsModal}
      /> */}
      <StudentList
        openAddstudentsModal={openAddStudentsModal}
        closeAddstudentsModal={closeAddStudentsModal}
      />
    </>
  );
};

export default Students;
