import React, { useState } from "react";
import "./Student.css";
import Modal from "../Model/Modal.js";
import Header from "../Header/Header";
import StudentList from "./StudentList";
import AddStudents from "./AddStudents";

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
      <div className="student-container">
        <div className="student-header-row">
          <h1>Students</h1>
          <button className="add-student-button" onClick={openAddStudentsModal}>
            Add Students
          </button>
        </div>
      </div>

      <Modal isOpen={isAddStudentsModalOpen} onClose={closeAddStudentsModal}>
        <AddStudents onClose={closeAddStudentsModal} />
      </Modal>

      <StudentList
        openAddStudentsModal={openAddStudentsModal}
        closeAddStudentsModal={closeAddStudentsModal}
      />
    </>
  );
};

export default Students;
