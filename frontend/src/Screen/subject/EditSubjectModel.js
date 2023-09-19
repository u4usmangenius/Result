// EditSubjectModel.js
import React, { useState, useEffect } from "react";
import "./EditSubjectModel.css";

const EditSubjectModel = ({ teacher, onSave, onCancel }) => {
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
            <label>Subject Name:</label>
            <input
              type="text"
              name="subjectName"
              value={editedTeacher.subjectName}
              onChange={handleInputChange}
            />
          </div>
          <div className="edit-teacher-form-group">
            <label>CourseCode:</label>
            <input
              type="text"
              name="courseCode"
              value={editedTeacher.courseCode}
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

export default EditSubjectModel;
