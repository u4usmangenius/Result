import React, { useEffect } from "react";
import { observer } from "mobx-react";
import "./AddStudent.css";
import { IoMdAddCircle } from "react-icons/io";
import { addstudentStore } from "../../store/studentsStore/AddstudentsStore";

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
    showAlert,
  } = addstudentStore; // Use MobX store

  // getting subjects from subject module
  useEffect(() => {
    addstudentStore.fetchSubjects(); // Call the fetchSubjects action from MobX store
  }, []);

  return (
    <div className="add-students-content">
      <h2 className="add-students-heading">Add students</h2>
      <div className="add-students-options">
        <div
          className={`student-container-option ${
            selectedOption === "manually" ? "student-form-active" : ""
          }`}
          onClick={() => handleOptionChange("manually")}
        >
          Manually
        </div>
        <div
          className={`student-container-option ${
            selectedOption === "import-csv" ? "student-form-active" : ""
          }`}
          onClick={() => handleOptionChange("import-csv")}
        >
          Import CSV
        </div>
      </div>
      {selectedOption === "manually" ? (
        <form>
          <div className="add-student-form-row">
            <div className="add-student-form-group">
              <label className="students-input-label">Roll No:</label>
              <input
                type="text"
                className="student-text-input"
                placeholder="RollNo"
                value={formData.stdRollNo}
                onChange={(e) =>
                  addstudentStore.setFormData("stdRollNo", e.target.value)
                }
              />
            </div>
            <div className="add-student-form-group">
              <label className="students-input-label">fullName:</label>
              <input
                type="text"
                className="student-text-input"
                placeholder="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  addstudentStore.setFormData("fullName", e.target.value)
                }
              />
            </div>
          </div>
          <div className="add-student-form-row">
            <div className="add-student-form-group">
              <label className="students-input-label">Phone Number:</label>
              <input
                type="text"
                className="student-text-input"
                placeholder="Phone"
                value={formData.stdPhone}
                onChange={(e) =>
                  addstudentStore.setFormData("stdPhone", e.target.value)
                }
              />
            </div>
            <div className="add-student-form-group">
              <label className="students-input-label">Guardian Phone:</label>
              <input
                type="text"
                className="student-text-input"
                placeholder="Phone"
                value={formData.guard_Phone}
                onChange={(e) =>
                  addstudentStore.setFormData("guard_Phone", e.target.value)
                }
              />
            </div>
          </div>
          <div className="add-student-form-row">
            <div className="add-student-form-group">
              <label className="students-input-label">Gender:</label>
              <select
                className="students-input-select"
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
            <div className="add-student-form-group">
              <label className="students-input-label">ClassName:</label>
              <select
                className="students-input-select"
                value={formData.className}
                onChange={(e) =>
                  addstudentStore.setFormData("className", e.target.value)
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
          <div className="add-student-form-row">
            <div className="add-student-form-group">
              <label className="students-input-label">Batch:</label>
              <input
                type="text"
                className="student-text-input"
                placeholder="Batch"
                value={formData.Batch}
                onChange={(e) =>
                  addstudentStore.setFormData("Batch", e.target.value)
                }
              />
            </div>
          </div>

          <div className="add-another-student-student">
            <div className="add-another-student-text">
              <div className="add-another-student-text-icon">
                <IoMdAddCircle />
              </div>
              Add Another
            </div>
            {/* Add student Button */}
            <div className="add-student-button">
              <button className="add-students-button" onClick={handleSubmit}>
                {addstudentStore.editingIndex !== -1
                  ? "Save Edit"
                  : "Add student"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div>
          <input
            className="student-import-button"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
          />
          {multiplerowbtn && (
            <button
              id="add-multiple-students"
              className="add-student-button"
              onClick={handleMultiRowUpload}
            >
              Add Multiple students
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
        <div className="add-another-student-student">
          <div className="add-students-button">
            <button
              className="add-students-button"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              {addstudentStore.editingIndex !== -1
                ? "Save Edit"
                : "Add student"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default observer(AddStudents); // Wrap the component with the observer from mobx-react
