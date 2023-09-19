// EdittestModal.js
import React, { useState, useEffect } from "react";
import "./EditTestModel.css";

const EdittestModal = ({ test, onSave, onCancel }) => {
  const [editedtest, setEditedtest] = useState(test);

  useEffect(() => {
    // Update the editedtest state when the test prop changes
    setEditedtest(test);
  }, [test]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedtest({
      ...editedtest,
      [name]: value,
    });
  };

  const handleSave = () => {
    onSave(editedtest);
  };

  return (
    <div className="edit-test-modal">
      <div className="edit-test-modal-content">
        <h2>Edit test</h2>
        <div className="edit-test-form">
          <div className="edit-test-form-group">
            <label>Test Name:</label>
            <input
              type="text"
              name="TestName"
              value={editedtest.TestName}
              onChange={handleInputChange}
            />
          </div>
          <div className="edit-test-form-group">
            <label>Subject Name:</label>
            <input
              type="text"
              name="SubjectName"
              value={editedtest.SubjectName}
              onChange={handleInputChange}
            />
          </div>
          <div className="edit-test-form-group">
            <label>Total Marks:</label>
            <input
              type="text"
              name="TotalMarks"
              value={editedtest.TotalMarks}
              onChange={handleInputChange}
            />
          </div>
          <div className="edit-test-form-group">
            <label>ClassName:</label>
            <input
              type="text"
              name="ClassName"
              value={editedtest.ClassName}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="edit-test-modal-buttons">
          <button onClick={handleSave}>Save</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EdittestModal;
