// EditstudentModal.js
import React, { useState, useEffect } from "react";
import "./EditstudentModal.css";

const EditStudentModal = ({ student, onSave, onCancel }) => {
  const [editedStudent, setEditedStudent] = useState(student);

  useEffect(() => {
    // Update the editedStudent state when the Student prop changes
    setEditedStudent(student);
  }, [student]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedStudent({
      ...editedStudent,
      [name]: value,
    });
  };

  const handleSave = () => {
    onSave(editedStudent);
  };

  return (
    <div className="edit-student-modal">
      <div className="edit-student-modal-content">
        <h2>Edit Student</h2>
        <div className="edit-student-form">
          <div className="edit-student-form-group">
            <label>Name:</label>
            <input
              type="text"
              name="fullName"
              value={editedStudent.fullName}
              onChange={handleInputChange}
            />
          </div>
          <div className="edit-student-form-group">
            <label>Class Name:</label>
            <input
              type="text"
              name="className"
              value={editedStudent.className}
              onChange={handleInputChange}
            />
          </div>
          <div className="edit-student-form-group">
            <label>Roll No:</label>
            <input
              type="text"
              name="stdRollNo"
              value={editedStudent.stdRollNo}
              onChange={handleInputChange}
            />
          </div>
          <div className="edit-student-form-group">
            <label>Gender:</label>
            <input
              type="text"
              name="gender"
              value={editedStudent.gender}
              onChange={handleInputChange}
            />
          </div>
          <div className="edit-student-form-group">
            <label>Student Phone.No:</label>
            <input
              type="text"
              name="stdPhone"
              value={editedStudent.stdPhone}
              onChange={handleInputChange}
            />
          </div>
          <div className="edit-student-form-group">
            <label>Guardian Phone.No:</label>
            <input
              type="text"
              name="guard_Phone"
              value={editedStudent.guard_Phone}
              onChange={handleInputChange}
            />
          </div>
          <div className="edit-student-form-group">
            <label>Batch:</label>
            <input
              type="text"
              name="Batch"
              value={editedStudent.Batch}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="edit-student-modal-buttons">
          <button onClick={handleSave}>Save</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditStudentModal;
