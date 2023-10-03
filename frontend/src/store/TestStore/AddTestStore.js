// AddTestStore.js
import { makeObservable, observable, action } from "mobx";
import axios from "axios";
import Papa from "papaparse";
import Swal from "sweetalert2";
import { testStore } from "./TestStore";

class AddTestStore {
  showAddButton = false;
  currentPage = 1;
  rowsPerPage = 8;
  selectedOption = "manually";
  testData = [];
  editingIndex = -1;
  subjectOptions = [];
  classnameOptions = [];
  formData = {
    TestName: "",
    SubjectName: "",
    ClassName: "",
    TotalMarks: "",
  };
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
      setClassNameOptions: action,
      setFormData: action,
      setSubjectOptions: action,
      fetchData: action,
      fetchSubjects: action,
      addTestToBackend: action,
      handleOptionChange: action,
      handleSubmit: action,
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
      if (this.editingIndex !== -1) {
        const updatedtestData = [...this.testData];
        const updatedtest = {
          ...this.formData,
          id: updatedtestData[this.editingIndex].id,
        };
        updatedtestData[this.editingIndex] = updatedtest;
        this.setTestData(updatedtestData);

        const success = await this.addTestToBackend(updatedtest);

        if (success) {
          this.showAlert("test updated successfully");
          this.setFormData({
            TestName: "",
            SubjectName: "",
            ClassName: "",
            TotalMarks: "",
          });
          this.setEditingIndex(-1);
        } else {
          this.showAlert("Failed to update test. Please try again.");
        }
      } else {
        const newtest = {
          TestName: this.formData.TestName,
          SubjectName: this.formData.SubjectName,
          ClassName: this.formData.ClassName,
          TotalMarks: this.formData.TotalMarks,
        };

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

          this.showAlert("test added successfully");
          // onClose(); // You may need to pass onClose as a parameter
          this.setFormData({
            TestName: "",
            SubjectName: "",
            ClassName: "",
            TotalMarks: "",
          });
        } else {
          this.showAlert("Failed to add test. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error handling submit:", error);
      this.showAlert("An error occurred while processing the request.");
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
