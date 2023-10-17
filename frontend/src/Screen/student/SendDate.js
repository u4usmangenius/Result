import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { validations } from "../../helper.js/ResultValidationStore";

const handleSubmit = () => {};
const SendDate = ({ onClose }) => {
  return (
    <div className="add-form-content">
      <h2 className="add-form-heading">Send Date</h2>
      <form onSubmit={handleSubmit}>
        <div className="add-form-row">
          <div className="add-form-group">
            <label className={`addForm-input-label `}>ClassName</label>
            <select
              value="" //value is empty usman
              className="addForm-input-select"
              onChange={(e) => console.log(e, "usman check code missing")}
            >
              <option value="">Select Class</option>
              <option>1st Year</option>
              <option>2nd Year</option>
            </select>
          </div>
          <div className="add-form-group">
            <label className={`addForm-input-label `}>ClassName</label>
            <select
              value="" //value is empty usman
              className="addForm-input-select"
              onChange={(e) => console.log(e, "usman check code missing")}
            >
              <option value="">Select Class</option>
              <option>1st Year</option>
              <option>2nd Year</option>
            </select>
          </div>
        </div>

        <div className="addForm-another-btn">
          <button className="add-form-button" type="submit">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default observer(SendDate);
