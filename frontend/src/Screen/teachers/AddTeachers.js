import React, { useEffect } from "react";
import { observer } from "mobx-react";
import InputMask from "react-input-mask";
import { IoMdAddCircle } from "react-icons/io";
import { addTeacherStore } from "../../store/teachersStore/AddTeacherStore";
import { validations } from "../../helper.js/TeachersValidationStore";
import { teachersStore } from "../../store/teachersStore/TeachersStore";

const AddTeachers = ({ onClose }) => {
  const {
    selectedOption,
    teacherData,
    multiplerowbtn,
    formData,
    subjectOptions,
    handleOptionChange,
    handleFileUpload,
    handleMultiRowUpload,
    handleSubmit,
    showAlert,
  } = addTeacherStore;
  useEffect(() => {
    if (
      addTeacherStore.formData.fullName ||
      addTeacherStore.formData.phone ||
      (addTeacherStore.formData.gender &&
        addTeacherStore.formData.gender !== "Select Gender") ||
      (addTeacherStore.formData.subject &&
        addTeacherStore.formData.subject !== "Select Subject")
    ) {
      addTeacherStore.editORsubmit = true;
      addTeacherStore.RestrictAddAnother = true;
      addTeacherStore.RestrictImportCSV = true;
    } else {
      addTeacherStore.RestrictAddAnother = false;
      addTeacherStore.RestrictImportCSV = false;
    }
    addTeacherStore.selectedOption = "manually";
    addTeacherStore.fetchSubjects();
  }, []);

  const handleAddAnotherClick = () => {
    if (addTeacherStore.RestrictAddAnother) {
      return;
    } else {
      validations.errors.subjectName = false;
      validations.errors.courseCode = false;
      addTeacherStore.clearFormFields();
    }
  };

  const handleCSV = () => {
    if (addTeacherStore.RestrictImportCSV) {
      return;
    } else {
      handleMultiRowUpload();
    }
    onClose();
  };
  const handleSubmitTeacher = async (e) => {
    e.preventDefault();
    if (
      !addTeacherStore.formData.fullName.trim() ||
      !addTeacherStore.formData.gender.trim() ||
      !addTeacherStore.formData.phone.trim() ||
      !addTeacherStore.formData.subject.trim()
    ) {
      // Set validation errors
      validations.errors.fullName = true;
      validations.errors.gender = true;
      validations.errors.phone = true;
      validations.errors.subject = true;
      return;
    }
    if (
      addTeacherStore.formData.gender === "Select Gender" ||
      addTeacherStore.formData.subject === "Select Subject"
    ) {
      validations.errors.gender = true;
      validations.errors.subject = true;
      return;
    } else {
      if (addTeacherStore.editORsubmit) {
        teachersStore.handleSaveEdit();
      } else {
        handleSubmit();
      }
      onClose();
    }
  };
  return (
    <div className="add-form-content">
      <h2 className="add-form-heading">Add Teachers</h2>
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
          disabled={addTeacherStore.RestrictImportCSV === true}
        >
          Import CSV
        </button>
      </div>
      {selectedOption === "manually" ? (
        <form onSubmit={handleSubmitTeacher}>
          <div className="add-form-row">
            <div className="add-form-group">
              <label
                className={`addForm-input-label ${
                  validations.errors.fullName &&
                  addTeacherStore.formData.fullName.trim() === ""
                    ? "steric-error-msg"
                    : "normal-label"
                }`}
              >
                fullName
                {validations.errors.fullName &&
                  addTeacherStore.formData.fullName.trim() === "" && (
                    <span className="steric-error-msg"> *</span>
                  )}
              </label>
              <input
                type="text"
                className="addForm-input-type-text"
                placeholder="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  addTeacherStore.setFormData(
                    "fullName",
                    e.target.value.charAt(0).toUpperCase() +
                      e.target.value.slice(1)
                  )
                }
              />
            </div>

            <div className="add-form-group">
              <label
                className={`addForm-input-label ${
                  validations.errors.phone &&
                  addTeacherStore.formData.phone.trim() === ""
                    ? "steric-error-msg"
                    : "normal-label"
                }`}
              >
                Phone
                {validations.errors.phone &&
                  addTeacherStore.formData.phone.trim() === "" && (
                    <span className="steric-error-msg"> *</span>
                  )}
              </label>
              <InputMask
                mask="+92-999-9999999"
                maskChar=""
                type="text"
                className="addForm-input-type-text"
                placeholder="+92-999-9999999"
                // value={formData.phone}
                value={
                  formData.phone.startsWith("+92-")
                    ? formData.phone
                    : "+92-" + formData.phone
                }
                onChange={(e) =>
                  addTeacherStore.setFormData("phone", e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Backspace") {
                    e.preventDefault();
                    const updatedValue = formData.phone.slice(0, -1);
                    addTeacherStore.setFormData("phone", updatedValue);
                  }
                }}
              />
            </div>
          </div>
          <div className="add-form-row">
            <div className="add-form-group">
              <label
                className={`addForm-input-label ${
                  validations.errors.gender &&
                  addTeacherStore.formData.gender.trim() === "Select Gender"
                    ? "steric-error-msg"
                    : "normal-label"
                }`}
              >
                Gender
                {validations.errors.gender &&
                  addTeacherStore.formData.gender.trim() ===
                    "Select Gender" && (
                    <span className="steric-error-msg"> *</span>
                  )}
              </label>
              <select
                className="addForm-input-select"
                value={formData.gender}
                onChange={(e) =>
                  addTeacherStore.setFormData("gender", e.target.value)
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
                  validations.errors.subject &&
                  addTeacherStore.formData.subject.trim() === "Select Subject"
                    ? "steric-error-msg"
                    : "normal-label"
                }`}
              >
                Subject
                {validations.errors.subject &&
                  addTeacherStore.formData.subject.trim() ===
                    "Select Subject" && (
                    <span className="steric-error-msg"> *</span>
                  )}
              </label>
              <select
                className="addForm-input-select"
                value={formData.subject}
                onChange={(e) =>
                  addTeacherStore.setFormData("subject", e.target.value)
                }
              >
                <option>Select Subject</option>
                {subjectOptions.map((subject, index) => (
                  <option key={index} value={subject.subjectName}>
                    {subject.subjectName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="addForm-another-btn">
            <button
              className="add-another-form-text"
              onClick={handleAddAnotherClick}
              disabled={addTeacherStore.RestrictAddAnother === true}
            >
              <div className="add-another-text-icon-btn">
                <IoMdAddCircle />
              </div>
              Add Another
            </button>
            <button className="add-form-button" type="submit">
              <button className="add-Forms-button">
                {addTeacherStore.RestrictAddAnother === true
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
      {addTeacherStore.showAddButton &&
        teacherData.length > addTeacherStore.rowsPerPage && (
          <div className="pagination">
            <button
              onClick={() =>
                addTeacherStore.setCurrentPage(addTeacherStore.currentPage - 1)
              }
              disabled={addTeacherStore.currentPage === 1}
            >
              Previous
            </button>
            <button
              onClick={() =>
                addTeacherStore.setCurrentPage(addTeacherStore.currentPage + 1)
              }
              disabled={
                addTeacherStore.currentPage ===
                Math.ceil(teacherData.length / addTeacherStore.rowsPerPage)
              }
            >
              Next
            </button>
          </div>
        )}
      {addTeacherStore.showAddButton && (
        <div className="addForm-another-btn">
          <div className="add-form-button">
            <button
              className="add-form-button"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              {addTeacherStore.editingIndex !== -1 ? "Save Edit" : "Add Now"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default observer(AddTeachers); // Wrap the component with the observer from mobx-react
