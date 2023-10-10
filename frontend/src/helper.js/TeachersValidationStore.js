import { makeObservable, observable, action } from "mobx";

class Validations {
  editedFields = {
    phone: "",
    fullName: "",
    gender: "Select Gender",
    subject: "Select Subject",
  };

  errors = {
    phone: false,
    gender: false,
    subject: false,
    hasError: false,
    fullName: false,
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
      phone: false,
      gender: false,
      subject: false,
      hasError: false,
      fullName: false,
    };
    if (!this.editedFields.fullName.trim()) {
      this.errors.fullName = true;
      this.errors.hasError = true;
      isValid = false;
    }
    if (!this.editedFields.phone.trim()) {
      this.errors.phone = true;
      this.errors.hasError = true;
      isValid = false;
    }
    if (this.editedFields.gender.trim() === "Select Gender") {
      this.errors.gender = true;
      this.errors.hasError = true;
      isValid = false;
    }
    if (this.editedFields.subject.trim() === "Select Subject") {
      this.errors.subject = true;
      this.errors.hasError = true;
      isValid = false;
    }
    this.errors.hasError = !isValid;
    return isValid;
  }
}

export const validations = new Validations();
