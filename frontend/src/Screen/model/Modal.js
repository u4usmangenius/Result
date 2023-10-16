import React from "react";
import "./Modal.css";
import { AiFillCloseCircle } from "react-icons/ai";
import { addSubjectStore } from "../../store/subjectsStore/addsubjectstore";
import { validations } from "../../helper.js/SubjectValidationStore";
import { addstudentStore } from "../../store/studentsStore/AddstudentsStore.js";
import { addTeacherStore } from "../../store/teachersStore/AddTeacherStore";
import { addTestStore } from "../../store/TestStore/AddTestStore";
import { addResultStore } from "../../store/ResultStore/AddResultStore";
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  const handleOnClose = () => {
    addSubjectStore.clearFormFields();
    addstudentStore.clearFormFields();
    addTeacherStore.clearFormFields();
    addTestStore.clearFormFields();
    addResultStore.clearFormFields();

    onClose();
  };
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-modal-button" onClick={handleOnClose}>
          <div className="teacher-close-icon">
            <AiFillCloseCircle />
          </div>
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
