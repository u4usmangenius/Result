import { makeObservable, observable, action, computed } from "mobx";
import { addSubjectStore } from "../store/subjectsStore/addsubjectstore";

class Validations {
  editedFields = {
    subjectName: "",
    courseCode: "",
  };

  errors = {
    subjectName: false,
    courseCode: false,
    hasError: false,
  };

  constructor() {
    makeObservable(this, {
      errors: observable,
      editedFields: observable,
      setEditedFields: action,
      validateForm: action,
    });
  }
  setEditedFields(newFields) {
    this.editedFields = newFields;
  }

  validateForm() {
    let isValid = true;
    this.errors = {
      subjectName: false,
      courseCode: false,
      hasError: false,
    };
    if (!this.editedFields.subjectName.trim()) {
      this.errors.subjectName = true;
      this.errors.hasError = true;
      isValid = false;
    }
    if (!this.editedFields.courseCode.trim()) {
      this.errors.courseCode = true;
      this.errors.hasError = true;
    }
    const courseCodeRegex = /^[A-Za-z]{3}-\d{3}$/;

    if (!courseCodeRegex.test(this.editedFields.courseCode.trim())) {
      this.errors.courseCode = true;
      isValid = false;
      addSubjectStore.showAlert("Invalid CourseCode Format");
    }

    this.errors.hasError = !isValid;

    return isValid;
  }
}

export const validations = new Validations();
