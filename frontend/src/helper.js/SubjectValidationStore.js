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

    this.errors.hasError = !isValid;

    return isValid;
  }
}

export const validations = new Validations();
