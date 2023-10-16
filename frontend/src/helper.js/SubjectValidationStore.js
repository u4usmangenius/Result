import { makeObservable, observable, action, computed } from "mobx";
import { addSubjectStore } from "../store/subjectsStore/addsubjectstore";

class Validations {
  errors = {
    subjectName: false,
    courseCode: false,
    hasError: false,
  };

  constructor() {
    makeObservable(this, {
      errors: observable,
      validateForm: action,
    });
  }
  validateForm() {
    let isValid = true;
    this.errors = {
      subjectName: false,
      courseCode: false,
      hasError: false,
    };
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
