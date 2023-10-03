import { makeObservable, observable, action } from "mobx";
import axios from "axios";
import Swal from "sweetalert2";
import { subjectStore } from "./SubjectStore";
import { validations } from "../../helper.js/SubjectValidationStore";

class AddSubjectStore {
  formData = {
    subjectName: "",
    courseCode: "",
  };

  subjectData = [];
  selectedOption = "add-subjects";
  subjectOptions = [];
  rollnoOption = [];
  showAddButton = false;
  multiplerowbtn = false;
  clearFormFields() {
    this.formData.subjectName = "";
    this.formData.courseCode = "";
    validations.errors.subjectName = false;
    validations.errors.courseCode = false;
  }
  constructor() {
    makeObservable(this, {
      formData: observable,
      subjectData: observable,
      selectedOption: observable,
      subjectOptions: observable,
      rollnoOption: observable,
      showAddButton: observable,
      multiplerowbtn: observable,
      setSelectedOption: action,
      showAlert: action,
      setFormData: action,
      setShowAddButton: action,
      fetchSubjects: action,
      // fetchRollNo: action,
      addSubject: action,
      clearFormFields: action,
    });
  }
  setSelectedOption(option) {
    this.selectedOption = option;
  }
  showAlert(message) {
    Swal.fire(message);
  }

  setFormData(data) {
    this.formData = data;
  }

  setShowAddButton(value) {
    this.showAddButton = value;
  }

  async fetchSubjects() {
    try {
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };
      const response = await axios.get("http://localhost:8080/api/subjects", {
        headers,
      });
      if (response.status === 200) {
        this.subjectOptions = response.data.subjects;
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  }

  // async fetchRollNo() {
  //   try {
  //     const token = localStorage.getItem("bearer token");
  //     const headers = {
  //       Authorization: `${token}`,
  //     };
  //     const response = await axios.get("http://localhost:8080/api/students", {
  //       headers,
  //     });
  //     if (response.status === 200) {
  //       this.rollnoOption = response.data.students;
  //     }
  //   } catch (error) {
  //     console.error("Error fetching roll number:", error);
  //   }
  // }

  async addSubject(newSubject) {
    try {
      // Handle adding a new subject
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };
      const response = await axios.post(
        "http://localhost:8080/api/subjects",
        newSubject,
        { headers }
      );

      if (response.status === 200) {
        Swal.fire("Subject added successfully");
        this.formData = {
          subjectName: "",
          courseCode: "",
        };
        validations.errors.subjectName = false;
        validations.errors.courseCode = false;
        this.fetchSubjects();

        const fetchData = async () => {
          subjectStore.setLoading(true);
          try {
            await subjectStore.fetchData();
            subjectStore.setDataNotFound(false);
          } catch (error) {
            console.error("Error fetching subjects:", error);
            subjectStore.setDataNotFound(true);
          } finally {
            subjectStore.setLoading(false);
          }
        };

        fetchData();

        // subjectStore.fetchSubjects();
        return true;
      } else {
        Swal.fire("Failed to add subject. Please try again.");
        return false;
      }
    } catch (error) {
      console.error("Error handling submit:", error);
      Swal.fire("An error occurred while processing the request.");
      return false;
    }
  }
}

export const addSubjectStore = new AddSubjectStore();
