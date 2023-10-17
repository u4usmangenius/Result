// ResultStore.js
import axios from "axios";
import { makeObservable, observable, action } from "mobx";
import Swal from "sweetalert2";

class ReportsStore {
  loading = false;
  reports = [];
  constructor() {
    makeObservable(this, {
      loading: observable,
      setLoading: action,
      showConfirm: action,
      showAlert: action,
    });
  }
  setLoading(loading) {
    this.loading = loading;
  }
  showAlert(message) {
    Swal.fire({ text: message /*, icon: "error"*/ });
  }
  showConfirm(message) {
    return Swal.fire({
      title: "Confirm",
      text: message,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      return result.isConfirmed;
    });
  }
}

export const reportsStore = new ReportsStore();
