  import React, { useState } from "react";
import "./Teacher.css";
import AddTeachers from "./AddTeachers";
import Modal from "../model/Modal.js";
import TeacherList from "./TeacherList";
import Header from "../header/Header";

const Teachers = () => {
  const [isAddTeachersModalOpen, setIsAddTeachersModalOpen] = useState(false);

  const openAddTeachersModal = () => {
    setIsAddTeachersModalOpen(true);
  };

  const closeAddTeachersModal = () => {
    setIsAddTeachersModalOpen(false);
  };

  return (
    <>
      <Header />
      <div className="teachers-container">
        <div className="teachers-header-row">
          <h1>Teachers</h1>
          <button
            className="add-teachers-button"
            onClick={openAddTeachersModal}
          >
            Add Teachers
          </button>
        </div>
      </div>

      <Modal isOpen={isAddTeachersModalOpen} onClose={closeAddTeachersModal}>
        <AddTeachers onClose={closeAddTeachersModal} />
      </Modal>

      <TeacherList
        openAddTeachersModal={openAddTeachersModal}
        closeAddTeachersModal={closeAddTeachersModal}
      />
    </>
  );
};

export default Teachers;
