import { makeObservable, observable, action } from "mobx";

class Validations {
  errors = {
    stdRollNo: false,
    TestName: false,
    ClassName: false,
    ObtainedMarks: false,
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
      stdRollNo: false,
      ObtainedMarks: false,
      ClassName: false,
      hasError: false,
    };
    this.errors.hasError = !isValid;
    return isValid;
  }
}

export const validations = new Validations();
