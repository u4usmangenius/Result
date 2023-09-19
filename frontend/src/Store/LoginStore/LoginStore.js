// store.js
import { makeObservable, observable, action } from "mobx";

class LoginStore {
  formFields = {
    username: "",
    password: "",
  };

  errors = {
    username: "",
    password: "",
  };

  constructor() {
    makeObservable(this, {
      formFields: observable,
      errors: observable,
      setFormField: action,
      clearFormFields: action,
      setError: action,
    });
  }

  setFormField(field, value) {
    this.formFields[field] = value;
  }

  clearFormFields() {
    this.formFields = {
      username: "",
      password: "",
    };
  }

  setError(field, error) {
    this.errors[field] = error;
  }
}

export const loginstore = new LoginStore();
