// EditresultModal.js
import React, { useState, useEffect } from "react";
import "./EditResultModel.css";

const EditResultModel = ({ result, onSave, onCancel }) => {
  const [editedresult, setEditedresult] = useState(result);

  useEffect(() => {
    // Update the editedresult state when the result prop changes
    setEditedresult(result);
  }, [result]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedresult({
      ...editedresult,
      [name]: value,
    });
  };

  const handleSave = () => {
    onSave(editedresult);
  };

  return (
    <div className="edit-result-modal">
      <div className="edit-result-modal-content">
        <h2>Edit result</h2>
        <div className="edit-result-form">
          <div className="edit-result-form-group">
            <label>Name:</label>
            <input
              type="text"
              name="fullName"
              value={editedresult.fullName}
              onChange={handleInputChange}
            />
          </div>
          <div className="edit-result-form-group">
            <label>Roll No:</label>
            <input
              type="text"
              name="stdRollNo"
              value={editedresult.stdRollNo}
              onChange={handleInputChange}
            />
          </div>
          <div className="edit-result-form-group">
            <label>Test Name:</label>
            <input
              type="text"
              name="TestName"
              value={editedresult.TestName}
              onChange={handleInputChange}
            />
          </div>
          <div className="edit-result-form-group">
            <label>Subject Name:</label>
            <input
              type="text"
              name="SubjectName"
              value={editedresult.SubjectName}
              onChange={handleInputChange}
            />
          </div>
          <div className="edit-result-form-group">
            <label>Class Name:</label>
            <input
              type="text"
              name="ClassName"
              value={editedresult.ClassName}
              onChange={handleInputChange}
            />
          </div>
          <div className="edit-result-form-group">
            <label>Batch:</label>
            <input
              type="text"
              name="Batch"
              value={editedresult.Batch}
              onChange={handleInputChange}
            />
          </div>
          <div className="edit-result-form-group">
            <label>Obtained Marks:</label>
            <input
              type="text"
              name="ObtainedMarks"
              value={editedresult.ObtainedMarks}
              onChange={handleInputChange}
            />
          </div>
          <div className="edit-result-form-group">
            <label>Total Marks:</label>
            <input
              type="text"
              name="TotalMarks"
              value={editedresult.TotalMarks}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="edit-result-modal-buttons">
          <button onClick={handleSave}>Save</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditResultModel;
