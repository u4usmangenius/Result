import React, { useEffect } from "react";
import { IoMdAddCircle } from "react-icons/io";
import { observer } from "mobx-react"; // Import MobX observer
import { addTestStore } from "../../store/TestStore/AddTestStore";
import { validations } from "../../helper.js/TestsValidationStore";
import { testStore } from "../../store/TestStore/TestStore";
import InputMask from "react-input-mask";

const AddTest = ({ onClose }) => {
  useEffect(() => {
    if (
      addTestStore.formData.TestName ||
      addTestStore.formData.TotalMarks ||
      (addTestStore.formData.SubjectName &&
        addTestStore.formData.SubjectName !== "Select Subject") ||
      (addTestStore.formData.ClassName &&
        addTestStore.formData.ClassName !== "Select Class")
    ) {
      addTestStore.editORsubmit = true;
      addTestStore.RestrictAddAnother = true;
    } else {
      addTestStore.editORsubmit = false;
      addTestStore.RestrictAddAnother = false;
    }
    // addTestStore.fetchData();
    addTestStore.fetchSubjects();
  }, []);
  const handleAddAnotherClick = () => {
    if (addTestStore.RestrictAddAnother) {
      return;
    }
    validations.errors.ClassName = false;
    validations.errors.SubjectName = false;
    validations.errors.TestName = false;
    validations.errors.TotalMarks = false;
    addTestStore.clearFormFields();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !addTestStore.formData.TestName.trim() ||
      !addTestStore.formData.ClassName.trim() ||
      !addTestStore.formData.SubjectName.trim()
      //  ||
      // !addTestStore.formData.TotalMarks?.toString().trim()
      // Total Marks is integer, trim is used with string,so dont use below line, nor i can use toString as i need it as integer
      //  || !addTestStore.formData.TotalMarks.trim()
    ) {
      validations.errors.TestName = true;
      validations.errors.SubjectName = true;
      validations.errors.ClassName = true;
      validations.errors.TotalMarks = true;
      return;
    }
    if (
      addTestStore.formData.SubjectName === "Select Subject" ||
      addTestStore.formData.ClassName === "Select Class"
    ) {
      validations.errors.SubjectName = true;
      validations.errors.ClassName = true;
      return;
    } else {
      if (addTestStore.editORsubmit) {
        testStore.handleSaveEdit();
      } else {
        addTestStore.handleSubmit();
      }
      onClose();
    }
  };

  return (
    <div className="add-form-content">
      <h2 className="add-form-heading">Add Test</h2>
      <div className="add-form-options"></div>
      <form onSubmit={handleSubmit}>
        <div className="add-form-row">
          <div className="add-form-group">
            <label
              className={`addForm-input-label ${
                validations.errors.SubjectName &&
                addTestStore.formData.SubjectName.trim() === "Select Subject"
                  ? "steric-error-msg"
                  : "normal-label"
              }`}
            >
              Subject
              {validations.errors.SubjectName &&
                addTestStore.formData.SubjectName.trim() ===
                  "Select Subject" && (
                  <span className="steric-error-msg"> *</span>
                )}
            </label>
            <select
              value={addTestStore.formData.SubjectName}
              className="addForm-input-select"
              onChange={(e) =>
                addTestStore.setFormData({ SubjectName: e.target.value })
              }
            >
              <option>Select Subject</option>
              {addTestStore.subjectOptions.map((subject, index) => (
                <option key={index} value={subject.subjectName}>
                  {subject.subjectName}
                </option>
              ))}
            </select>
          </div>
          <div className="add-form-group">
            <label
              className={`addForm-input-label ${
                validations.errors.TestName &&
                addTestStore.formData.TestName.trim() === ""
                  ? "steric-error-msg"
                  : "normal-label"
              }`}
            >
              Test Name
              {validations.errors.TestName &&
                addTestStore.formData.TestName.trim() === "" && (
                  <span className="steric-error-msg"> *</span>
                )}
            </label>
            <InputMask
              mask="**-***"
              maskChar=""
              type="text"
              className="addForm-input-type-text"
              placeholder="T1-CSI"
              value={addTestStore.formData.TestName}
              onChange={(e) =>
                addTestStore.setFormData({ TestName: e.target.value })
              }
            />
          </div>
        </div>
        <div className="add-form-row">
          <div className="add-form-group">
            <label
              className={`addForm-input-label ${
                validations.errors.TotalMarks &&
                addTestStore.formData.TotalMarks === null
                  ? "steric-error-msg"
                  : "normal-label"
              }`}
            >
              Total Marks
              {validations.errors.TotalMarks &&
                addTestStore.formData.TotalMarks === null && (
                  <span className="steric-error-msg"> *</span>
                )}
            </label>
            <input
              type="number"
              className="addForm-input-type-text"
              placeholder="Total Marks"
              value={addTestStore.formData.TotalMarks}
              onChange={(e) => {
                let value = parseInt(e.target.value);
                if (!isNaN(value)) {
                  addTestStore.setFormData({ TotalMarks: value });
                } else {
                  if (e.target.value <= 999999999999999)
                    addTestStore.setFormData({ TotalMarks: null });
                }
              }}
            />
          </div>

          <div className="add-form-group">
            <label
              className={`addForm-input-label ${
                validations.errors.ClassName &&
                addTestStore.formData.ClassName.trim() === "Select Class"
                  ? "steric-error-msg"
                  : "normal-label"
              }`}
            >
              ClassName
              {validations.errors.ClassName &&
                addTestStore.formData.ClassName.trim() === "Select Class" && (
                  <span className="steric-error-msg"> *</span>
                )}
            </label>
            <select
              value={addTestStore.formData.ClassName}
              className="addForm-input-select"
              onChange={(e) =>
                addTestStore.setFormData({ ClassName: e.target.value })
              }
            >
              <option value="">Select Class</option>
              <option>1st Year</option>
              <option>2nd Year</option>
              {/* {addTestStore.classnameOptions.map((className, index) => (
              <option key={index} value={className}>
                {className}
              </option>
            ))} */}
            </select>
          </div>
        </div>
        <div className="addForm-another-btn">
          <div
            className="add-another-form-text"
            onClick={handleAddAnotherClick}
            disabled={addTestStore.RestrictAddAnother === true}
          >
            <div className="add-another-text-icon-btn">
              <IoMdAddCircle />
            </div>
            Add Another
          </div>
          <button
            type="submit"
            className="add-form-button"
            onClick={handleSubmit}
          >
            {addTestStore.RestrictAddAnother === true
              ? "Update Now"
              : "Add Now"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default observer(AddTest);
