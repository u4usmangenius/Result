import React, { useEffect } from "react";
import "../styles/AddForm.css";
import { IoMdAddCircle } from "react-icons/io";
import { observer } from "mobx-react";
import { addSubjectStore } from "../../store/subjectsStore/addsubjectstore";
import { validations } from "../../helper.js/SubjectValidationStore";
import InputMask from "react-input-mask";
import { subjectStore } from "../../store/subjectsStore/SubjectStore";

const AddSubjects = observer(({ onClose }) => {
  useEffect(() => {
    if (
      addSubjectStore.formData.subjectName ||
      addSubjectStore.formData.courseCode.length > 0
    ) {
      addSubjectStore.editORsubmit = true;
      addSubjectStore.RestrictAddAnother = true;
      addSubjectStore.RestrictImportCSV = true;
      subjectStore.fetchData();
    } else {
      addSubjectStore.RestrictAddAnother = false;
      addSubjectStore.RestrictImportCSV = false;
    }
    addSubjectStore.fetchSubjects();
  }, []);

  const handleAddAnotherClick = () => {
    if (addSubjectStore.RestrictAddAnother) {
      return;
    }
    validations.errors.subjectName = false;
    validations.errors.courseCode = false;
    addSubjectStore.clearFormFields();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !addSubjectStore.formData.subjectName.trim() ||
      !addSubjectStore.formData.courseCode.trim()
    ) {
      validations.errors.subjectName = true;
      validations.errors.courseCode = true;
      return;
    }
    if (!validations.validateForm()) {
      return;
    } else {
      if (addSubjectStore.editORsubmit) {
        subjectStore.handleSaveEdit();
      } else {
        addSubjectStore.handleSubmit();
      }
      onClose();
    }
  };

  return (
    <div className="add-form-content">
      <h2 className="add-form-heading">Add Subjects</h2>
      {addSubjectStore.selectedOption === "add-subjects" ? (
        <form onSubmit={handleSubmit}>
          <div className="add-form-row">
            <div className="add-form-group">
              <label
                className={`addForm-input-label ${
                  validations.errors.subjectName &&
                  addSubjectStore.formData.subjectName.trim() === ""
                    ? "steric-error-msg"
                    : "normal-label"
                }`}
              >
                Subject Name
                {validations.errors.subjectName &&
                  addSubjectStore.formData.subjectName.trim() === "" && (
                    <span className="steric-error-msg"> *</span>
                  )}
              </label>
              <input
                type="text"
                className="addForm-input-type-text"
                placeholder="Subject"
                value={addSubjectStore.formData.subjectName}
                onChange={(e) => {
                  const value = e.target.value;
                  addSubjectStore.setFormData({
                    ...addSubjectStore.formData,
                    subjectName: e.target.value,
                  });
                  validations.setEditedFields({
                    ...validations.editedFields,
                    subjectName: value,
                  });
                }}
              />
            </div>
            <div className="add-form-group">
              <label
                className={`addForm-input-label ${
                  validations.errors.courseCode &&
                  addSubjectStore.formData.courseCode.trim() === ""
                    ? "steric-error-msg"
                    : "normal-label"
                }`}
              >
                Course Code{" "}
                {validations.errors.courseCode &&
                  addSubjectStore.formData.courseCode.trim() === "" && (
                    <span className="steric-error-msg">*</span>
                  )}
              </label>
              <InputMask
                mask="***-999"
                maskChar=""
                type="text"
                className="addForm-input-type-text"
                placeholder="CSC-321"
                value={addSubjectStore.formData.courseCode}
                onChange={(e) => {
                  const value = e.target.value;
                  addSubjectStore.setFormData({
                    ...addSubjectStore.formData,
                    courseCode: e.target.value,
                  });
                  validations.setEditedFields({
                    ...validations.editedFields,
                    courseCode: value,
                  });
                }}
              />
            </div>
          </div>
          <div className="addForm-another-btn">
            <button
              className="add-another-form-text"
              onClick={handleAddAnotherClick}
              disabled={addSubjectStore.RestrictAddAnother === true}
            >
              <div className="add-another-text-icon-btn">
                <IoMdAddCircle />
              </div>
              Add Another
            </button>
            <button type="submit" className="add-form-button">
              {addSubjectStore.RestrictAddAnother === true
                ? "Update Now"
                : "Add Now"}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
});

export default AddSubjects;
