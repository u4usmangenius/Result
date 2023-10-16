import { makeObservable, observable, action } from "mobx";

class Validations {
  errors = {
    TestName: false,
    SubjectName: false,
    ClassName: false,
    TotalMarks: false,
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
      TestName: false,
      SubjectName: false,
      ClassName: false,
      TotalMarks: false,
      hasError: false,
    };
    this.errors.hasError = !isValid;
    return isValid;
  }
}

export const validations = new Validations();
