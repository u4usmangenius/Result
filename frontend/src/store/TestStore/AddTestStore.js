// AddTestStore.js
import { makeObservable, observable, action } from "mobx";
import axios from "axios";
import Papa from "papaparse";
import Swal from "sweetalert2";
import { testStore } from "./TestStore";
import { validations } from "../../helper.js/TestsValidationStore";

class AddTestStore {
  showAddButton = false;
  currentPage = 1;
  rowsPerPage = 8;
  selectedOption = "manually";
  testId = "";
  testData = [];
  editingIndex = -1;
  subjectOptions = [];
  classnameOptions = [];
  editORsubmit = false;
  RestrictAddAnother = false;
  formData = {
    TestName: "",
    SubjectName: "Select Subject",
    ClassName: "Select Class",
    TotalMarks: null,
  };
  clearFormFields() {
    this.formData.TestName = "";
    this.formData.ClassName = "Select Class";
    this.formData.TotalMarks = null;
    this.formData.SubjectName = "Select Subject";
    validations.errors.SubjectName = false;
    validations.errors.ClassName = false;
    validations.errors.TestName = false;
    validations.errors.TotalMarks = false;
    // subjectStore.fetchData();
  }
  constructor() {
    makeObservable(this, {
      showAddButton: observable,
      currentPage: observable,
      selectedOption: observable,
      testData: observable,
      editingIndex: observable,
      subjectOptions: observable,
      classnameOptions: observable,
      formData: observable,
      editORsubmit: observable,
      RestrictAddAnother: observable,
      fetchData: action,
      setFormData: action,
      setSubjectOptions: action,
      setClassNameOptions: action,
      handleOptionChange: action,
      addTestToBackend: action,
      fetchSubjects: action,
      handleSubmit: action,
      clearFormFields: action,
    });
  }

  setClassNameOptions(classNames) {
    this.classnameOptions = classNames;
  }

  setSubjectOptions(subjects) {
    this.subjectOptions = subjects;
  }
  setFormData(data) {
    this.formData = { ...this.formData, ...data };
    console.log("<______________",{...this.formData.TotalMarks})
  }
  setTestsData(test) {
    const data = { ...test };
    this.formData.TestName = data.TestName;
    this.formData.SubjectName = data.SubjectName;
    this.formData.ClassName = data.ClassName;
    this.formData.TotalMarks = data.TotalMarks;
    this.testId = test.testId;

    validations.errors.TestName = false;
    validations.errors.SubjectName = false;
    validations.errors.ClassName = false;
    validations.errors.TotalMarks = false;
  }

  // Define the showAlert action
  showAlert(message) {
    Swal.fire(message);
  }

  fetchData = async () => {
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };

    try {
      const response = await axios.get("http://localhost:8080/api/students", {
        headers,
      });
      if (response.status === 200) {
        const { students } = response.data;
        const uniqueClassNames = [
          ...new Set(students.map((student) => student.className)),
        ];
        this.setClassNameOptions(uniqueClassNames);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  fetchSubjects = async () => {
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };
    try {
      const response = await axios.get("http://localhost:8080/api/subjects", {
        headers,
      });
      if (response.status === 200) {
        const { subjects } = response.data;
        this.setSubjectOptions(subjects);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  addTestToBackend = async (test) => {
    try {
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };
      const response = await axios.post(
        "http://localhost:8080/api/tests",
        test,
        { headers }
      );

      if (response.status === 200) {
        return true; // test added successfully
      } else {
        return false; // Failed to add test
      }
    } catch (error) {
      console.error("Error adding test:", error);
      return false; // Error occurred while adding test
    }
  };

  handleOptionChange = (option) => {
    this.setSelectedOption(option);
    this.setShowAddButton(false);
  };

  handleSubmit = async () => {
    try {
      const newtest = {
        TestName: this.formData.TestName,
        SubjectName: this.formData.SubjectName,
        ClassName: this.formData.ClassName,
        TotalMarks: this.formData.TotalMarks,
      };
      console.log(newtest);
      const success = await this.addTestToBackend(newtest);
      console.log("await ");
      if (success) {
        const fetchData = async () => {
          testStore.setLoading(true);
          try {
            //   await testStore.fetchDataFromBackend(this.currentPage);
            await testStore.fetchDataFromBackend(this.currentPage);
          } catch (error) {
            console.error("Error fetching subjects:", error);
          } finally {
            testStore.setLoading(false);
          }
        };

        fetchData();

        this.clearFormFields();
        this.showAlert("Test added successfully");
      } else {
        this.clearFormFields();
        this.showAlert("Failed to add test. Please try again.");
      }
    } catch (error) {
      console.error("Error handling submit:", error);
      this.showAlert("An error occurred while processing the request.");
      this.clearFormFields();
    }
  };

  showAlert = (message) => {
    Swal.fire(message);
  };

  showConfirm = (message) => {
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
  };
}

export const addTestStore = new AddTestStore();
