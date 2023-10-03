import React from "react";
import "./AddResult.css";
import { IoMdAddCircle } from "react-icons/io";
import { observer } from "mobx-react"; 
import { addResultStore } from "../../store/ResultStore/AddResultStore";

const AddResult = ({ onClose }) => {
  const handleSubmit = () => {
    addResultStore.handleSubmit();
  };

  return (
    <div className="add-subject-content">
      <h2 className="add-result-heading">Add Result</h2>
      <div className="add-result-options"></div>
      <form>
        <div className="result-form-row">
          <div className="form-group">
            <label className="result-input-label">Roll No:</label>
            <input
              type="text"
              className="result-input-type-text"
              placeholder="Roll No"
              value={addResultStore.formData.stdRollNo}
              onChange={(e) =>
                addResultStore.setFormData({ stdRollNo: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label className="result-input-label">Test Name:</label>
            <input
              type="text"
              className="result-input-type-text"
              placeholder="Test Name"
              value={addResultStore.formData.TestName}
              onChange={(e) =>
                addResultStore.setFormData({ TestName: e.target.value })
              }
            />
          </div>
        </div>
      </form>
      <div className="result-form-row">
        <div className="form-group">
          <label className="result-input-label">Obtained Marks:</label>
          <input
            type="number"
            className="result-input-type-text"
            placeholder="Obtained Marks"
            value={addResultStore.formData.ObtainedMarks}
            onChange={(e) =>
              addResultStore.setFormData({ ObtainedMarks: e.target.value })
            }
          />
        </div>
      </div>
      <div className="add-another-result">
        <div className="add-another-result-text">
          <div className="add-another-text-icon-subject">
            <IoMdAddCircle />
          </div>
          Add Another
        </div>
        {/* Add result Button */}
        <div className="add-result-button" onClick={handleSubmit}>
          <button className="add-results-button">
            {addResultStore.editingIndex !== -1 ? "Save Edit" : "Add Result"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default observer(AddResult);
