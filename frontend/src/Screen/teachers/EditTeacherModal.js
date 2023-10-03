// EditTeacherModal.js
import React, { useState, useEffect } from "react";
import "../styles/EditModal.css";

const EditTeacherModal = ({ teacher, onSave, onCancel }) => {
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
    <div className="editmodal">
      <div className="editmodal-content">
        <h2>Edit Teacher</h2>
        <div className="editform">
          <div className="editmodal-row">
            <div className="editform-group">
              <label>Name:</label>
              <input
                type="text"
                name="fullName"
                value={editedTeacher.fullName}
                onChange={handleInputChange}
              />
            </div>
            <div className="editform-group">
              <label>Subject:</label>
              <input
                type="text"
                name="subject"
                value={editedTeacher.subject}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="editmodal-row">
            <div className="editform-group">
              <label>Gender:</label>
              <input
                type="text"
                name="gender"
                value={editedTeacher.gender}
                onChange={handleInputChange}
              />
            </div>
            <div className="editform-group">
              <label>Phone Number:</label>
              <input
                type="text"
                name="phone"
                value={editedTeacher.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        <div className="editmodal-buttons">
          <button onClick={handleSave}>Save</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditTeacherModal;
