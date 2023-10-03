import React, { useEffect } from "react";
import "./AddTest.css";
import { IoMdAddCircle } from "react-icons/io";
import { observer } from "mobx-react"; // Import MobX observer
import { addTestStore } from "../../store/TestStore/AddTestStore";

const AddTest = ({ onClose }) => {
  const store = addTestStore;
  useEffect(() => {
    store.fetchData();
    store.fetchSubjects();
  }, [store]);

  const handleSubmit = async () => {
    try {
      await store.handleSubmit();
      onClose();
    } catch (error) {
      console.error("Error handling submit:", error);
    }
  };

  return (
    <div className="add-test-content">
      <h2 className="add-test-heading">Add Test</h2>
      <div className="add-test-options"></div>
      <form>
        <div className="test-form-row">
          <div className="test-form-group">
            <label className="test-input-label">Subject:</label>
            <select
              value={store.formData.SubjectName}
              className="test-input-select-subject"
              onChange={(e) =>
                store.setFormData({ SubjectName: e.target.value })
              }
            >
              <option>Select Subject</option>
              {store.subjectOptions.map((subject, index) => (
                <option key={index} value={subject.subjectName}>
                  {subject.subjectName}
                </option>
              ))}
            </select>
          </div>
          <div className="test-form-group">
            <label className="test-input-label">Test Name:</label>
            <input
              type="text"
              className="test-input-type-text"
              placeholder="Test Name"
              value={store.formData.TestName}
              onChange={(e) => store.setFormData({ TestName: e.target.value })}
            />
          </div>
        </div>
      </form>
      <div className="test-form-row">
        <div className="test-form-group">
          <label className="test-input-label">Total Marks:</label>
          <input
            type="number"
            className="test-input-type-text"
            placeholder="Total Marks"
            value={store.formData.TotalMarks}
            onChange={(e) => store.setFormData({ TotalMarks: e.target.value })}
          />
        </div>

        <div className="test-form-group">
          <label className="test-input-label">ClassName:</label>
          <select
            value={store.formData.ClassName}
            className="test-input-select-subject"
            onChange={(e) => store.setFormData({ ClassName: e.target.value })}
          >
            <option value="">Select ClassName</option>
            {store.classnameOptions.map((className, index) => (
              <option key={index} value={className}>
                {className}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="add-another-test">
        <div className="add-another-test-text">
          <div className="add-another-text-icon-test">
            <IoMdAddCircle />
          </div>
          Add Another
        </div>
        {/* Add test Button */}
        <div className="add-test-button" onClick={handleSubmit}>
          <button className="add-tests-button">
            {store.editingIndex !== -1 ? "Save Edit" : "Add Subjects"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default observer(AddTest);
