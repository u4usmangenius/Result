import React, { useEffect } from "react";
import { observer } from "mobx-react";
import "../styles/AddForm.css";
import { IoMdAddCircle } from "react-icons/io";
import { addstudentStore } from "../../store/studentsStore/AddstudentsStore";
import InputMask from "react-input-mask";
import { validations } from "../../helper.js/StudentsValidationStore";
import { studentsStore } from "../../store/studentsStore/studentsStore";

const AddStudents = ({ onClose }) => {
  const {
    selectedOption,
    studentData,
    multiplerowbtn,
    formData,
    subjectOptions,
    handleOptionChange,
    handleFileUpload,
    handleMultiRowUpload,
    handleSubmit,
  } = addstudentStore;
  useEffect(() => {
    if (
      addstudentStore.formData.stdRollNo ||
      addstudentStore.formData.fullName ||
      addstudentStore.formData.stdPhone ||
      addstudentStore.formData.guard_Phone ||
      addstudentStore.formData.Batch ||
      addstudentStore.selectedSubjects.length > 0
    ) {
      addstudentStore.editORsubmit = true;
      addstudentStore.RestrictAddAnother = true;
      addstudentStore.RestrictImportCSV = true;
    } else {
      addstudentStore.RestrictAddAnother = false;
      addstudentStore.RestrictImportCSV = false;
    }
    addstudentStore.selectedOption = "manually";
    addstudentStore.fetchSubjects();
  }, []);
  const handleAddAnotherClick = () => {
    if (addstudentStore.RestrictAddAnother) {
      return;
    } else {
      validations.errors.subjectName = false;
      validations.errors.courseCode = false;
      addstudentStore.clearFormFields();
    }
  };
  const handleCSV = () => {
    if (addstudentStore.RestrictImportCSV) {
      return;
    } else {
      handleMultiRowUpload();
    }
    onClose();
  };
  const handleSubmitNewStudenet = async (e) => {
    e.preventDefault();
    // Validate form fields
    if (
      !addstudentStore.formData.stdRollNo.trim() ||
      !addstudentStore.formData.fullName.trim() ||
      !addstudentStore.formData.gender.trim() ||
      !addstudentStore.formData.className.trim() ||
      !addstudentStore.formData.Batch.trim()
    ) {
      // Set validation errors
      validations.errors.Name = true;
      validations.errors.rollNo = true;
      validations.errors.gender = true;
      validations.errors.className = true;
      validations.errors.Batch = true;
      validations.errors.subjects = true;
      return;
    }
    if (
      addstudentStore.formData.gender === "Select Gender" ||
      addstudentStore.formData.className === "Select Class"
    ) {
      validations.errors.gender = true;
      validations.errors.className = true;
      return;
    } else {
      if (addstudentStore.selectedSubjects.length < 6) {
        validations.errors.subjects = true;
        return;
      }
      if (addstudentStore.editORsubmit) {
        studentsStore.handleSaveEdit();
      } else {
        handleSubmit();
      }
      onClose();
    }
  };
  return (
    <div className="add-form-content">
      <h2 className="add-form-heading">Add students</h2>
      <div className="add-form-options">
        <button
          className={`addForm-container-option ${
            selectedOption === "manually" ? "addForm-form-active" : ""
          }`}
          onClick={() => handleOptionChange("manually")}
        >
          Manually
        </button>
        <button
          className={`addForm-container-option ${
            selectedOption === "import-csv" ? "addForm-form-active" : ""
          }`}
          onClick={() => handleOptionChange("import-csv")}
          disabled={addstudentStore.RestrictImportCSV === true}
        >
          Import CSV
        </button>
      </div>
      {selectedOption === "manually" ? (
        <form onSubmit={handleSubmitNewStudenet}>
          <div className="add-form-row">
            <div className="add-form-group">
              <label
                className={`addForm-input-label ${
                  validations.errors.rollNo &&
                  addstudentStore.formData.stdRollNo.trim() === ""
                    ? "steric-error-msg"
                    : "normal-label"
                }`}
              >
                Roll No
                {validations.errors.rollNo &&
                  addstudentStore.formData.stdRollNo.trim() === "" && (
                    <span className="steric-error-msg"> *</span>
                  )}
              </label>
              <input
                type="text"
                className="addForm-input-type-text"
                placeholder="RollNo"
                value={formData.stdRollNo}
                onChange={(e) =>
                  addstudentStore.setFormData("stdRollNo", e.target.value)
                }
              />
            </div>
            <div className="add-form-group">
              <label
                className={`addForm-input-label ${
                  validations.errors.Name &&
                  addstudentStore.formData.fullName.trim() === ""
                    ? "steric-error-msg"
                    : "normal-label"
                }`}
              >
                Name
                {validations.errors.Name &&
                  addstudentStore.formData.fullName.trim() === "" && (
                    <span className="steric-error-msg"> *</span>
                  )}
              </label>

              <input
                type="text"
                className="addForm-input-type-text"
                placeholder="Name"
                value={formData.fullName}
                onChange={(e) =>
                  addstudentStore.setFormData("fullName", e.target.value)
                }
              />
            </div>
            <div className="add-form-group">
              <label className="addForm-input-label">Phone Number</label>
              <InputMask
                mask="+92-999-9999999"
                maskChar=""
                type="text"
                className="addForm-input-type-text"
                placeholder="+92-999-9999999"
                value={
                  formData.stdPhone.startsWith("+92-")
                    ? formData.stdPhone
                    : "+92-" + formData.stdPhone
                }
                onChange={(e) =>
                  addstudentStore.setFormData("stdPhone", e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Backspace") {
                    e.preventDefault();
                    const updatedValue = formData.stdPhone.slice(0, -1);
                    addstudentStore.setFormData("stdPhone", updatedValue);
                  }
                }}
              />
            </div>
          </div>
          <div className="add-form-row">
            <div className="add-form-group">
              <label className="addForm-input-label">Guardian Phone</label>
              <InputMask
                mask="+92-999-9999999"
                maskChar=""
                type="text"
                className="addForm-input-type-text"
                placeholder="+92-999-9999999"
                value={
                  formData.guard_Phone.startsWith("+92-")
                    ? formData.guard_Phone
                    : "+92-" + formData.guard_Phone
                }
                onChange={(e) =>
                  addstudentStore.setFormData("guard_Phone", e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Backspace") {
                    e.preventDefault();
                    const updatedValue = formData.guard_Phone.slice(0, -1);
                    addstudentStore.setFormData("guard_Phone", updatedValue);
                  }
                }}
              />
            </div>
            <div className="add-form-group">
              <label
                className={`addForm-input-label ${
                  validations.errors.gender &&
                  addstudentStore.formData.gender.trim() === "Select Gender"
                    ? "steric-error-msg"
                    : "normal-label"
                }`}
              >
                Gender
                {validations.errors.gender &&
                  addstudentStore.formData.gender.trim() ===
                    "Select Gender" && (
                    <span className="steric-error-msg"> *</span>
                  )}
              </label>

              <select
                className="addForm-input-select"
                value={formData.gender}
                onChange={(e) =>
                  addstudentStore.setFormData("gender", e.target.value)
                }
              >
                <option>Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="add-form-group">
              <label
                className={`addForm-input-label ${
                  validations.errors.className &&
                  addstudentStore.formData.className.trim() === "Select Class"
                    ? "steric-error-msg"
                    : "normal-label"
                }`}
              >
                Class Name
                {validations.errors.className &&
                  addstudentStore.formData.className.trim() ===
                    "Select Class" && (
                    <span className="steric-error-msg"> *</span>
                  )}
              </label>
              <select
                className="addForm-input-select"
                value={formData.className}
                onChange={(e) =>
                  addstudentStore.setFormData("className", e.target.value)
                }
              >
                <option>Select Class</option>
                <option>1st year</option>
                <option>2nd year</option>
              </select>
            </div>
          </div>
          <div className="add-form-row">
            <div className="add-form-group">
              <label
                className={`addForm-input-label ${
                  validations.errors.Batch &&
                  addstudentStore.formData.Batch.trim() === ""
                    ? "steric-error-msg"
                    : "normal-label"
                }`}
              >
                Batch
                {validations.errors.Batch &&
                  addstudentStore.formData.Batch.trim() === "" && (
                    <span className="steric-error-msg"> *</span>
                  )}
              </label>

              <InputMask
                mask="9999-9999"
                maskChar=""
                type="text"
                className="addForm-input-type-text"
                placeholder="2021-2025"
                value={formData.Batch}
                onChange={(e) =>
                  addstudentStore.setFormData("Batch", e.target.value)
                }
              />
            </div>
          </div>
          {/* <h3 className="addForm-h3">Select Subjects</h3> */}
          <h3 className="addForm-h3">Select Subjects</h3>
          <div
            className={`addForm-h3 select-6-subjects ${
              validations.errors.subjects ? "steric-error-msg" : "normal-label"
            }`}
          >
            {validations.errors.subjects &&
              addstudentStore.formData.Subject1.trim() === "" && (
                <span className="steric-error-msg"> *</span>
              ) && (
                <div className="select-6-subjects-error">
                  Please select exactly 6 subjects..{" "}
                </div>
              )}
          </div>
          <div className="select-addForm-list">
            <div className="addForm-list-enlist">
              {subjectOptions.map((subject, index) => (
                <div key={index} className="index-addForm-list-enlist">
                  <label className="addForm-list-content">
                    <input
                      type="checkbox"
                      className="addFrom-list-checkbox"
                      value={subject.subjectName}
                      checked={addstudentStore.selectedSubjects.includes(
                        subject.subjectName
                      )}
                      onChange={() =>
                        addstudentStore.toggleSubjectSelection(
                          subject.subjectName
                        )
                      }
                    />
                    {subject.subjectName}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="addForm-another-btn">
            <button
              className="add-another-form-text"
              onClick={handleAddAnotherClick}
              disabled={addstudentStore.RestrictAddAnother === true}
            >
              <div className="add-another-text-icon-btn">
                <IoMdAddCircle />
              </div>
              Add Another
            </button>
            {/* Add student Button */}
            <button className="add-form-button" type="submit">
              <button className="add-Forms-button">
                {addstudentStore.RestrictAddAnother === true
                  ? "Update Now"
                  : "Add Now"}
              </button>
            </button>
          </div>
        </form>
      ) : (
        <div>
          <input
            className="addForm-import-button"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
          />
          {multiplerowbtn && (
            <button
              className="add-form-button addForm-import-csv-btn"
              onClick={handleCSV}
            >
              Add Now
            </button>
          )}
        </div>
      )}
      {addstudentStore.showAddButton &&
        studentData.length > addstudentStore.rowsPerPage && (
          <div className="pagination">
            <button
              onClick={() =>
                addstudentStore.setCurrentPage(addstudentStore.currentPage - 1)
              }
              disabled={addstudentStore.currentPage === 1}
            >
              Previous
            </button>
            <button
              onClick={() =>
                addstudentStore.setCurrentPage(addstudentStore.currentPage + 1)
              }
              disabled={
                addstudentStore.currentPage ===
                Math.ceil(studentData.length / addstudentStore.rowsPerPage)
              }
            >
              Next
            </button>
          </div>
        )}
      {addstudentStore.showAddButton && (
        <div className="addForm-another-btn">
          <div className="add-form-button">
            <button
              className="add-Forms-button"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            ></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default observer(AddStudents);
