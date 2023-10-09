// EditSubjectModel.js
import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import "../styles/ScreenStyle.css";
import { validations } from "../../helper.js/SubjectValidationStore";
import InputMask from "react-input-mask";
import { addSubjectStore } from "../../store/subjectsStore/addsubjectstore";

const EditSubjectModel = observer(({ teacher, onSave, onCancel }) => {
  useEffect(() => {
    // Update the editedFields in the MobX store when the teacher prop changes
    validations.setEditedFields(teacher);
  }, [teacher]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedTeacher = {
      ...validations.editedFields,
      [name]: value,
    };
    validations.setEditedFields(updatedTeacher);
    if (value.trim() !== "") {
      validations.errors[name] = false;
    } else {
      validations.errors[name] = true;
    }
  };

  const onClose = () => {
    validations.setEditedFields({ subjectName: "", courseCode: "" });
    validations.errors.subjectName = false;
    validations.errors.courseCode = false;
    onCancel();
  };

  const handleSave = () => {
    if (validations.validateForm()) {
      onSave(validations.editedFields);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !validations.editedFields.subjectName.trim() ||
      !validations.editedFields.courseCode.trim()
    ) {
      return;
    }

    if (!validations.validateForm()) {
      return;
    }
    handleSave();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="editmodal">
        <div className="editmodal-content">
          <h2>Edit Subject</h2>
          <div className="editform">
            <div className="editmodal-row">
              <div className="editform-group">
                <label
                  className={`${
                    validations.errors.subjectName
                      ? "steric-error-msg"
                      : "normal-label"
                  }`}
                >
                  Subject Name
                  {validations.errors.subjectName && (
                    <span className="steric-error-msg"> *</span>
                  )}
                </label>
                <input
                  type="text"
                  name="subjectName"
                  value={validations.editedFields.subjectName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="editform-group">
                <label
                  className={`${
                    validations.errors.courseCode
                      ? "steric-error-msg"
                      : "normal-label"
                  }`}
                >
                  CourseCode{" "}
                  {validations.errors.courseCode && (
                    <span className="steric-error-msg">*</span>
                  )}
                </label>
                <InputMask
                  mask="***-999"
                  maskChar=""
                  type="text"
                  name="courseCode"
                  value={validations.editedFields.courseCode}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <div className="editmodal-buttons">
            <button type="submit">Save</button>
            <button onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </form>
  );
});

export default EditSubjectModel;
