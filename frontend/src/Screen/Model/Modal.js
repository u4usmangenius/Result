import React from "react";
import "./Modal.css";
import { AiFillCloseCircle } from "react-icons/ai";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-modal-button" onClick={onClose}>
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
