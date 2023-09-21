import React, { createContext, useState } from "react";
import "./Teacher.css";
import AddTeachers from "./AddTeachers";
import Modal from "../model/Modal.js";
import TeacherList from "./TeacherList";
import Header from "../header/Header";
export const TeachersContext = createContext(); // Create the context
const Teachers = () => {
  const [isAddTeachersModalOpen, setIsAddTeachersModalOpen] = useState(false);
  const [teachersData, setTeachersData] = useState([]);

  const openAddTeachersModal = () => {
    setIsAddTeachersModalOpen(true);
  };

  const closeAddTeachersModal = () => {
    setIsAddTeachersModalOpen(false);
  };
  const addNewTeacher = (newTeacher) => {
    setTeachersData([...teachersData, newTeacher]);
  };
  return (
    <TeachersContext.Provider value={{ teachersData, addNewTeacher }}>
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
    </TeachersContext.Provider>
  );
};

export default Teachers;
