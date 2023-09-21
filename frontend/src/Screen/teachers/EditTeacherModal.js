// EditTeacherModal.js
import React, { useState, useEffect } from "react";
import "./EditTeacherModal.css";

const   EditTeacherModal = ({ teacher, onSave, onCancel }) => {
  const [editedTeacher, setEditedTeacher] = useState(teacher);

  useEffect(() => {
    // Update the editedTeacher state when the teacher prop changes
    setEditedTeacher(teacher);
  }, [teacher]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTeacher({
      ...editedTeacher,
      [name]: value,
    });
  };

  const handleSave = () => {
    onSave(editedTeacher);
  };

  return (
    <div className="edit-teacher-modal">
      <div className="edit-teacher-modal-content">
        <h2>Edit Teacher</h2>
        <div className="edit-teacher-form">
          <div className="edit-teacher-form-group">
            <label>Name:</label>
            <input
              type="text"
              name="fullName"
              value={editedTeacher.fullName}
              onChange={handleInputChange}
            />
          </div>
          <div className="edit-teacher-form-group">
            <label>Subject:</label>
            <input
              type="text"
              name="subject"
              value={editedTeacher.subject}
              onChange={handleInputChange}
            />
          </div>
          <div className="edit-teacher-form-group">
            <label>Gender:</label>
            <input
              type="text"
              name="gender"
              value={editedTeacher.gender}
              onChange={handleInputChange}
            />
          </div>
          <div className="edit-teacher-form-group">
            <label>Phone Number:</label>
            <input
              type="text"
              name="phone"
              value={editedTeacher.phone}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="edit-teacher-modal-buttons">
          <button onClick={handleSave}>Save</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditTeacherModal;
