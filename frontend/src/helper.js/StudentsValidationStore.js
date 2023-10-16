import { makeObservable, observable, action, computed } from "mobx";

class Validations {
  errors = {
    Name: false,
    rollNo: false,
    gender: false,
    className: false,
    Batch: false,
    hasError: false,
    subjects: false,
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
      Name: false,
      rollNo: false,
      gender: false,
      className: false,
      Batch: false,
      hasError: false,
    };
    this.errors.hasError = !isValid;

    return isValid;
  }
}

export const validations = new Validations();
