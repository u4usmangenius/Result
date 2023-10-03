import { makeObservable, observable, action, computed } from "mobx";
import { addSubjectStore } from "../store/subjectsStore/addsubjectstore";

class Validations {
  editedFields = {
    Name: "",
    rollNo: "",
    gender: "Select Gender",
    className: "Select Class",
    Batch: "",
  };

  errors = {
    Name: false,
    rollNo: false,
    gender: false,
    className: false,
    Batch: false,
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
      Name: false,
      rollNo: false,
      gender: false,
      className: false,
      Batch: false,
      hasError: false,
    };
    if (!this.editedFields.Name.trim()) {
      this.errors.Name = true;
      this.errors.hasError = true;
      isValid = false;
    }
    if (!this.editedFields.rollNo.trim()) {
      this.errors.rollNo = true;
      this.errors.hasError = true;
    }
    if (this.editedFields.gender.trim() === "Select Gender") {
      this.errors.gender = true;
      this.errors.hasError = true;
      isValid = false;
    }
    if (this.editedFields.className.trim() === "Select Class") {
      this.errors.className = true;
      this.errors.hasError = true;
      isValid = false;
    }
    if (!this.editedFields.Batch.trim()) {
      this.errors.Batch = true;
      this.errors.hasError = true;
    }

    this.errors.hasError = !isValid;

    return isValid;
  }
}

export const validations = new Validations();
