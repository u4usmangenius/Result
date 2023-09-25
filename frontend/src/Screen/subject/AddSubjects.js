import React, { useEffect } from "react";
import "./AddSubject.css";
import { IoMdAddCircle } from "react-icons/io";
import { observer } from "mobx-react";
import { addSubjectStore } from "../../store/subjectsStore/addsubjectstore";
import axios from "axios";
import { parsePath } from "react-router-dom";

const AddSubjects = observer(({ onClose }) => {
  useEffect(() => {
    addSubjectStore.fetchSubjects();
    addSubjectStore.fetchRollNo();
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    parsePath.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsedData = result.data;

        if (parsedData.length === 1) {
          const singleRowData = parsedData[0];
          addSubjectStore.setFormData({
            subjectName: singleRowData["subjectName"] || "",
            courseCode: singleRowData["courseCode"] || "",
            stdRollNo: singleRowData["stdRollNo"] || "",
            userSubject: singleRowData["userSubject"] || "",
          });
          addSubjectStore.setSelectedOption("manually");
          addSubjectStore.setShowAddButton(false);
        } else if (parsedData.length > 1) {
          addSubjectStore.setsubjectData(parsedData);
          addSubjectStore.setSelectedOption("add-subjects");
          addSubjectStore.setShowAddButton(false);
          addSubjectStore.setMultiplerowbtn(true);
        } else {
          addSubjectStore.showAlert("The CSV file is empty.");
          addSubjectStore.setShowAddButton(false);
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      if (addSubjectStore.selectedOption !== "add-subjects") {
        addSubjectStore.addUsersubject();
        return;
      } else {
        const newSubject = {
          subjectName: addSubjectStore.formData.subjectName,
          courseCode: addSubjectStore.formData.courseCode,
        };

        const success = await addSubjectStore.addSubject(newSubject);

        if (success) {
          addSubjectStore.showAlert("Subject added successfully");
          onClose(); // Close the form
          addSubjectStore.setFormData({
            subjectName: "",
            courseCode: "",
          });
        } else {
          addSubjectStore.showAlert("Failed to add subject. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error handling submit:", error);
      addSubjectStore.showAlert(
        "An error occurred while processing the request."
      );
    }
  };
  const handleOptionChange = (option) => {
    addSubjectStore.setSelectedOption(option);
  };

  return (
    <div className="add-subject-content">
      <h2 className="add-subject-heading">Add Subjects</h2>
      <div className="add-subject-options">
        <div
          className={`option ${
            addSubjectStore.selectedOption === "add-subjects"
              ? "form-active"
              : ""
          }`}
          onClick={() => handleOptionChange("add-subjects")}
        >
          Add Subjects
        </div>
        <div
          className={`option ${
            addSubjectStore.selectedOption === "student-subject"
              ? "form-active"
              : ""
          }`}
          onClick={() => handleOptionChange("student-subject")}
        >
          Student Subject
        </div>
      </div>
      {addSubjectStore.selectedOption === "add-subjects" ? (
        <form>
          <div className="subject-form-row">
            <div className="form-group">
              <label className="subject-input-label">Subject Name</label>
              <input
                type="text"
                className="subject-input-type-text"
                placeholder="Full Name"
                value={addSubjectStore.formData.subjectName}
                onChange={(e) =>
                  addSubjectStore.setFormData({
                    ...addSubjectStore.formData,
                    subjectName: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label className="subject-input-label">Course Code</label>
              <input
                type="text"
                className="subject-input-type-text"
                placeholder="Course Code"
                value={addSubjectStore.formData.courseCode}
                onChange={(e) =>
                  addSubjectStore.setFormData({
                    ...addSubjectStore.formData,
                    courseCode: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </form>
      ) : (
        <div className="subject-form-row">
          <div className="form-group">
            <label className="subject-input-label">Roll No</label>
            <select
              type="text"
              className="subject-input-type-text"
              placeholder="User Name"
              value={addSubjectStore.formData.stdRollNo}
              onChange={(e) =>
                addSubjectStore.setFormData({
                  ...addSubjectStore.formData,
                  stdRollNo: e.target.value,
                })
              }
            >
              <option>Select Roll No</option>
              {addSubjectStore.rollnoOption &&
                addSubjectStore.rollnoOption.map((student) => (
                  <option key={student.stdRollNo} value={student.stdRollNo}>
                    {student.stdRollNo}
                  </option>
                ))}
            </select>
          </div>
          <div className="form-group">
            <label className="subject-input-label">Subject</label>
            <select
              value={addSubjectStore.formData.userSubject}
              className="subject-input-select-subject"
              onChange={(e) =>
                addSubjectStore.setFormData({
                  ...addSubjectStore.formData,
                  userSubject: e.target.value,
                })
              }
            >
              <option>Select Subject</option>
              {addSubjectStore.subjectOptions.map((subject) => (
                <option key={subject.subjectName} value={subject.subjectName}>
                  {subject.subjectName}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      <div className="add-another-subject">
        <div className="add-another-subject-text">
          <div className="add-another-text-icon-subject">
            <IoMdAddCircle />
          </div>
          Add Another
        </div>
        {/* Add subject Button */}
        <div className="add-subject-button addsubbtn" onClick={handleSubmit}>
          <button className="add-subjects-button">Add Subjects</button>
        </div>
      </div>
    </div>
  );
});

export default AddSubjects;
