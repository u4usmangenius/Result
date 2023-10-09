// EditstudentModal.js
import React, { useState, useEffect } from "react";
const EditStudentModal = ({ student, onSave, onCancel }) => {
  const [editedStudent, setEditedStudent] = useState(student.student);
  const [editedSubjects, setEditedSubjects] = useState(student.subjects);
  const subjectsPerRow = 3; // Define the number of subjects per row

  useEffect(() => {
    // Update the editedStudent state when the Student prop changes
    setEditedStudent(student.student);
    setEditedSubjects(student.subjects);
  }, [student]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedStudent({
      ...editedStudent,
      [name]: value,
    });
  };
  const handleSubjectChange = (index, value) => {
    const newSubjects = [...editedSubjects];
    newSubjects[index] = value;
    setEditedSubjects(newSubjects);
  };
  // const handleSave = () => {
  //   // onSave(editedStudent);
  //   onSave({ student: editedStudent, subjects: editedSubjects });
  // };
  const handleSave = () => {
    onSave({
      studentId: editedStudent.studentId,
      student: editedStudent,
      subjects: editedSubjects,
    });
  };

  const groupSubjectsIntoRows = () => {
    const rows = [];
    const subjectsPerRow = 3; // Define the number of subjects per row

    for (let i = 0; i < editedSubjects.length; i += subjectsPerRow) {
      const row = editedSubjects.slice(i, i + subjectsPerRow);
      rows.push(row);
    }
    return rows;
  };
  return (
    <div className="editmodal">
      <div className="editmodal-content">
        <h2>Edit Student</h2>
        <div className="editform">
          <div className="editmodal-row">
            <div className="editmodal-group">
              <label>Roll No:</label>
              <input
                type="text"
                name="stdRollNo"
                value={editedStudent.stdRollNo}
                onChange={handleInputChange}
              />
            </div>
            <div className="editmodal-group">
              <label>Name:</label>
              <input
                type="text"
                name="fullName"
                value={editedStudent.fullName}
                onChange={handleInputChange}
              />
            </div>

            <div className="editmodal-group">
              <label>Class Name:</label>
              <select
                name="className"
                value={editedStudent.className}
                onChange={handleInputChange}
                className="Edit-Modal-Select"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
              </select>
            </div>
          </div>
          <div className="editmodal-row">
            <div className="editmodal-group">
              <label>Gender:</label>
              <input
                type="text"
                name="gender"
                value={editedStudent.gender}
                onChange={handleInputChange}
              />
            </div>
            <div className="editmodal-group">
              <label>Student Phone.No:</label>
              <input
                type="text"
                name="stdPhone"
                value={editedStudent.stdPhone}
                onChange={handleInputChange}
              />
            </div>
            <div className="editmodal-group">
              <label>Guardian Phone.No:</label>
              <input
                type="text"
                name="guard_Phone"
                value={editedStudent.guard_Phone}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="editmodal-row">
            <div className="editmodal-group">
              <label>Batch:</label>
              <input
                type="text"
                name="Batch"
                value={editedStudent.Batch}
                onChange={handleInputChange}
              />
            </div>
          </div>
          {/* <div className="editmodal-row"> */}
          {groupSubjectsIntoRows().map((row, rowIndex) => (
            <div className="editmodal-row" key={rowIndex}>
              {row.map((subject, subjectIndex) => (
                <div className="editmodal-group" key={subjectIndex}>
                  <label>{`Subject${
                    rowIndex * subjectsPerRow + subjectIndex + 1
                  }:`}</label>
                  <input
                    type="text"
                    name={`Subject${
                      rowIndex * subjectsPerRow + subjectIndex + 1
                    }`}
                    value={subject}
                    onChange={(e) =>
                      handleSubjectChange(
                        rowIndex * subjectsPerRow + subjectIndex,
                        e.target.value
                      )
                    }
                  />
                </div>
              ))}
            </div>
          ))}
          {/* </div> */}
        </div>
        <div className="editmodal-buttons">
          <button onClick={handleSave}>Save</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditStudentModal;
