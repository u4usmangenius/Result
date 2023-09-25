import React, { useEffect } from "react";
import { observer } from "mobx-react";
import "./AddTeachers.css";
import { IoMdAddCircle } from "react-icons/io";
import { addTeacherStore } from "../../store/teachersStore/AddTeacherStore";

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
  } = addTeacherStore; // Use MobX store

  // getting subjects from subject module
  useEffect(() => {
    addTeacherStore.fetchSubjects(); // Call the fetchSubjects action from MobX store
  }, []);

  return (
    <div className="add-teachers-content">
      <h2 className="add-teachers-heading">Add Teachers</h2>
      <div className="add-teachers-options">
        <div
          className={`teacher-container-option ${
            selectedOption === "manually" ? "teacher-form-active" : ""
          }`}
          onClick={() => handleOptionChange("manually")}
        >
          Manually
        </div>
        <div
          className={`teacher-container-option ${
            selectedOption === "import-csv" ? "teacher-form-active" : ""
          }`}
          onClick={() => handleOptionChange("import-csv")}
        >
          Import CSV
        </div>
      </div>
      {selectedOption === "manually" ? (
        <form>
          <div className="add-teacher-form-row">
            <div className="add-teacher-form-group">
              <label className="teachers-input-label">fullName:</label>
              <input
                type="text"
                className="teacher-text-input"
                placeholder="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  addTeacherStore.setFormData("fullName", e.target.value)
                }
              />
            </div>

            <div className="add-teacher-form-group">
              <label className="teachers-input-label">Phone:</label>
              <input
                type="text"
                className="teacher-text-input"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                  addTeacherStore.setFormData("phone", e.target.value)
                }
              />
            </div>
          </div>
          <div className="add-teacher-form-row">
            <div className="add-teacher-form-group">
              <label className="teachers-input-label">Gender:</label>
              <select
                className="teachers-input-select"
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
            <div className="add-teacher-form-group">
              <label className="teachers-input-label">Subject:</label>
              <select
                className="teachers-input-select"
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
          <div className="add-another-teacher-teacher">
            <div className="add-another-teacher-text">
              <div className="add-another-teacher-text-icon">
                <IoMdAddCircle />
              </div>
              Add Another
            </div>
            {/* Add Teacher Button */}
            <div className="add-teacher-button">
              <button className="add-teachers-button" 
              onClick={handleSubmit}
              >
                {addTeacherStore.editingIndex !== -1
                  ? "Save Edit"
                  : "Add Teacher"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div>
          <input
            className="teacher-import-button"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
          />
          {multiplerowbtn && (
            <button
              id="add-multiple-teachers"
              className="add-teachers-button"
              onClick={handleMultiRowUpload}
            >
              Add Multiple Teachers
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
        <div className="add-another-teacher-teacher">
          <div className="add-teacher-button">
            <button
              className="add-teachers-button"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              {addTeacherStore.editingIndex !== -1
                ? "Save Edit"
                : "Add Teacher"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default observer(AddTeachers); // Wrap the component with the observer from mobx-react
