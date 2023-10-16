import React, { useEffect } from "react";
import { IoMdAddCircle } from "react-icons/io";
import { observer } from "mobx-react";
import { addResultStore } from "../../store/ResultStore/AddResultStore";
import { validations } from "../../helper.js/ResultValidationStore";
import { resultStore } from "../../store/ResultStore/ResultStore";

const AddResult = ({ onClose }) => {
  const { formData } = { ...addResultStore };
  useEffect(() => {
    // fetch Total Marks for related subject for update
    if (
      formData.ClassName &&
      formData.ObtainedMarks &&
      formData.stdRollNo &&
      formData.TestName
    ) {
      const fun = async () => {
        await addResultStore.fetchStudentTestDataByClassName(
          addResultStore.formData.ClassName
        );
        const selectedTest = addResultStore.TestsArrayData.find(
          (test) => test.TestName === formData.TestName
        );

        if (selectedTest) {
          addResultStore.tempTotalMarks = selectedTest.TotalMarks;
        }
      };
      fun();
      resultStore.loading = false;
    }
  }, []);

  useEffect(() => {
    if (
      addResultStore.formData.ClassName &&
      addResultStore.formData.ClassName !== "Select Class"
    ) {
      addResultStore.fetchStudentTestDataByClassName(
        addResultStore.formData.ClassName
      );
    }
    if (addResultStore.formData.ClassName === "") {
      addResultStore.TestsArrayData = [];
      addResultStore.StudentArrayData = [];
    }
  }, [formData.ClassName]);
  useEffect(() => {
    if (
      (addResultStore.formData.stdRollNo &&
        addResultStore.formData.stdRollNo !== "Select RollNo") ||
      (addResultStore.formData.TestName &&
        addResultStore.formData.TestName !== "Select Test") ||
      addResultStore.formData.ObtainedMarks ||
      (addResultStore.formData.ClassName &&
        addResultStore.formData.ClassName !== "Select Class")
    ) {
      addResultStore.editORsubmit = true;
      addResultStore.RestrictAddAnother = true;
    } else {
      addResultStore.editORsubmit = false;
      addResultStore.RestrictAddAnother = false;
    }
  }, []);
  const handleAddAnotherClick = () => {
    if (addResultStore.RestrictAddAnother) {
      return;
    } else {
      validations.errors.ClassName = false;
      validations.errors.ObtainedMarks = false;
      validations.errors.TestName = false;
      validations.errors.stdRollNo = false;
      addResultStore.clearFormFields();
    }
  };
  const handleSubmitResult = async (e) => {
    console.log("asd");
    e.preventDefault();
    if (
      addResultStore.formData.stdRollNo === null ||
      !addResultStore.formData.TestName.trim() ||
      !addResultStore.formData.ClassName.trim() ||
      addResultStore.formData.ObtainedMarks === null
    ) {
      validations.errors.ClassName = true;
      validations.errors.ObtainedMarks = true;
      validations.errors.TestName = true;
      validations.errors.stdRollNo = true;
      return;
    }
    if (addResultStore.formData.ClassName === "Select Class") {
      validations.errors.ClassName = true;
      return;
    } else {
      if (addResultStore.editORsubmit) {
        resultStore.handleSaveEdit();
      } else {
        addResultStore.handleSubmit();
      }
      onClose();
    }
  };

  return (
    <div className="add-form-content">
      <h2 className="add-form-heading">Add Result</h2>
      <div className="add-form-options"></div>
      <form onSubmit={handleSubmitResult}>
        <div className="add-form-row">
          <div className="add-form-group">
            <label
              className={`addForm-input-label ${
                (validations.errors.ClassName &&
                  addResultStore.formData.ClassName === "Select Class") ||
                !addResultStore.formData.ClassName
                  ? "steric-error-msg"
                  : "normal-label"
              }`}
            >
              ClassName
              {((validations.errors.ClassName &&
                addResultStore.formData.ClassName === "Select Class") ||
                !addResultStore.formData.ClassName) && (
                <span className="steric-error-msg"> *</span>
              )}
            </label>
            <select
              value={addResultStore.formData.ClassName}
              className="addForm-input-select"
              onChange={(e) =>
                addResultStore.setFormData({ ClassName: e.target.value })
              }
            >
              <option value="">Select Class</option>
              <option>1st Year</option>
              <option>2nd Year</option>
            </select>
          </div>
          <div className="add-form-group">
            <label
              className={`addForm-input-label ${
                validations.errors.TestName &&
                addResultStore.formData.TestName.trim() === ""
                  ? "steric-error-msg"
                  : "normal-label"
              }`}
            >
              Test Name
              {validations.errors.TestName &&
                addResultStore.formData.TestName.trim() === "" && (
                  <span className="steric-error-msg"> *</span>
                )}
            </label>
            <select
              value={addResultStore.formData.TestName}
              className="addForm-input-select"
              onChange={(e) => {
                const selectedTestName = e.target.value;
                addResultStore.setFormData({ TestName: selectedTestName });
                const selectedTest = addResultStore.TestsArrayData.find(
                  (test) => test.TestName === selectedTestName
                );
                if (selectedTest) {
                  addResultStore.tempTotalMarks = selectedTest.TotalMarks;
                  console.log(
                    "selectedTest.TotalMarks",
                    addResultStore.tempTotalMarks
                  );
                }
              }}
            >
              <option value="">Select Test</option>
              {addResultStore.TestsArrayData.map((test) => (
                <option key={test.testId} value={test.TestName}>
                  {test.TestName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="add-form-row">
          <div className="add-form-group">
            <label
              className={`addForm-input-label ${
                validations.errors.stdRollNo &&
                !addResultStore.formData.stdRollNo
                  ? "steric-error-msg"
                  : "normal-label"
              }`}
            >
              Roll No
              {validations.errors.stdRollNo &&
                !addResultStore.formData.stdRollNo && (
                  <span className="steric-error-msg"> *</span>
                )}
            </label>
            <select
              value={addResultStore.formData.stdRollNo}
              className="addForm-input-select"
              onChange={(e) =>
                addResultStore.setFormData({
                  stdRollNo: parseInt(e.target.value),
                })
              }
            >
              <option value="">Select RollNo</option>
              {addResultStore.StudentArrayData.map((test) => (
                <option key={test.testId} value={test.stdRollNo}>
                  {test.stdRollNo}
                </option>
              ))}
            </select>
          </div>
          <div className="add-form-group">
            <label
              className={`addForm-input-label ${
                validations.errors.ObtainedMarks &&
                !addResultStore.formData.ObtainedMarks
                  ? "steric-error-msg"
                  : "normal-label"
              }`}
            >
              Obtained Marks
              {validations.errors.ObtainedMarks &&
                !addResultStore.formData.ObtainedMarks && (
                  <span className="steric-error-msg"> *</span>
                )}
            </label>
            <input
              type="number"
              className="addForm-input-type-text"
              placeholder="Obtained Marks"
              value={addResultStore.formData.ObtainedMarks}
              onChange={(e) => {
                let value = e.target.value;
                if (
                  value === "" ||
                  (parseInt(value) >= 0 &&
                    parseInt(value) <= 1251 &&
                    value % 10 >= 0 &&
                    parseInt(value) <= addResultStore.tempTotalMarks)
                ) {
                  addResultStore.setFormData({
                    ObtainedMarks: parseInt(value),
                  });
                }
              }}
            />
          </div>
        </div>
        <div className="addForm-another-btn">
          <div
            className="add-another-form-text"
            onClick={handleAddAnotherClick}
            disabled={addResultStore.RestrictAddAnother === true}
          >
            <div className="add-another-text-icon-btn">
              <IoMdAddCircle />
            </div>
            Add Another
          </div>
          <button className="add-form-button" type="submit">
            {addResultStore.RestrictAddAnother ? "Update Now" : "Add Now"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default observer(AddResult);
