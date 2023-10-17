// AddResultStore.js
import { makeObservable, observable, action } from "mobx";
import axios from "axios";
import Swal from "sweetalert2";
import { resultStore } from "./ResultStore";
import { validations } from "../../helper.js/ResultValidationStore";

class AddResultStore {
  currentPage = 1;
  rowsPerPage = 8;
  resultData = [];
  editingIndex = -1;
  tempTotalMarks = "";
  resultId = "";
  editORsubmit = false;
  RestrictAddAnother = false;
  formData = {
    stdRollNo: null,
    TestName: "",
    ClassName: "Select Class",
    ObtainedMarks: null,
    stdTestPercentage: null,
  };
  StudentArrayData = [];
  TestsArrayData = [];
  constructor() {
    makeObservable(this, {
      currentPage: observable,
      resultData: observable,
      editingIndex: observable,
      formData: observable,
      StudentArrayData: observable,
      tempTotalMarks: observable,
      TestsArrayData: observable,
      editORsubmit: observable,
      RestrictAddAnother: observable,
      setCurrentPage: action,
      setResultData: action,
      setEditingIndex: action,
      setFormData: action,
      addResultToBackend: action,
      fetchStudentTestDataByClassName: action,
      handleSubmit: action,
      clearFormFields: action,
    });
  }

  setCurrentPage(page) {
    this.currentPage = page;
  }

  setResultData(result) {
    this.resultData = result;
    const data = { ...result };
    this.formData.stdRollNo = data.stdRollNo;
    this.formData.ClassName = data.ClassName;
    this.formData.ObtainedMarks = data.ObtainedMarks;
    this.formData.TestName = data.TestName;
    this.resultId = result.resultId;

    validations.errors.stdRollNo = false;
    validations.errors.TestName = false;
    validations.errors.ClassName = false;
    validations.errors.ObtainedMarks = false;
    console.log(this.formData);
    console.log("........?///", this.resultId);
  }

  setEditingIndex(index) {
    this.editingIndex = index;
  }
  clearFormFields() {
    this.formData.stdRollNo = null;
    this.formData.TestName = "";
    this.formData.ClassName = "Select Class";
    this.formData.ObtainedMarks = null;
    validations.errors.stdRollNo = false;
    validations.errors.TestName = false;
    validations.errors.ClassName = false;
    validations.errors.ObtainedMarks = false;
  }

  setFormData(data) {
    this.formData = { ...this.formData, ...data };
    const d = { ...data };
    console.log("first", d);
    console.log("Total Marks", this.tempTotalMarks);
  }
  async fetchStudentTestDataByClassName(ClassName) {
    try {
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };
      const response = await axios.post(
        "http://localhost:8080/api/results/data",
        { ClassName },
        {
          headers,
        }
      );

      if (response.status === 200) {
        const { studentData, testsData, studentSubject } = response.data;
        console.log("usman kesys ho", response.data);
        // this.StudentArrayData = [...studentData];
        this.StudentArrayData = studentData;
        this.TestsArrayData = [...testsData];
        console.log("studentSubject==>", studentSubject);
        // testsData.map((TotalMarks) => {
        //   // <h1>{TotalMarks}</h1>;
        //   console.log(TotalMarks.TotalMarks,"-")
        // });
        // console.log("this.TestsArrayData",);
      } else {
        console.error("Error:", response.data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async addResultToBackend(result) {
    try {
      console.log(result, `"""""""""""""'''`);
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };
      const response = await axios.post(
        "http://localhost:8080/api/results",
        result,
        { headers }
      );

      if (response.status === 200) {
        return true; // Result added successfully
      } else if (response.status === 409) {
        // Data already exists
        this.showAlert("stdRollNo with the same test name already exists.");
        return false;
      } else {
        return false; // Failed to add result for other reasons
      }
    } catch (error) {
      console.error("Error adding result:", error);
      return false; // Error occurred while adding result
    }
  }

  async handleSubmit() {
    try {
      let percentage =
        (this.formData.ObtainedMarks / this.tempTotalMarks) * 100;
      this.formData.stdTestPercentage = percentage.toFixed(1);
      const newResult = {
        stdRollNo: this.formData.stdRollNo,
        TestName: this.formData.TestName,
        ObtainedMarks: this.formData.ObtainedMarks,
        ClassName: this.formData.ClassName,
        stdTestPercentage: this.formData.stdTestPercentage,
      };
      console.log("->>>>>>>>>>>>>>.", newResult);
      if (
        this.formData.stdRollNo === null ||
        this.formData.TestName === "" ||
        this.formData.ClassName === "Select Class" ||
        this.formData.ObtainedMarks === null
      ) {
        this.showAlert("Please fill all fields.");
        this.clearFormFields();
        return;
      }

      const success = await this.addResultToBackend(newResult);
      if (success) {
        const fetchData = async () => {
          resultStore.setLoading(true);
          try {
            await resultStore.fetchDataFromBackend(this.currentPage);
          } catch (error) {
            console.error("Error fetching subjects:", error);
          } finally {
            resultStore.setLoading(false);
          }
        };
        this.clearFormFields();
        this.showAlert("Result added successfully");
        this.setFormData({
          stdRollNo: null,
          TestName: "",
          ObtainedMarks: null,
          ClassName: "Select Class",
        });
        this.clearFormFields();
        validations.errors.stdRollNo = false;
        validations.errors.TestName = false;
        validations.errors.ClassName = false;
        validations.errors.ObtainedMarks = false;
        fetchData();
        if (this.onClose) {
          this.onClose();
        }
      } else {
        this.showAlert("Failed to add Result. Please try again.");
        this.clearFormFields();
      }
    } catch (error) {
      console.error("Error handling submit:", error);
      this.showAlert("An error occurred while processing the request.");
      this.clearFormFields();
    }
  }

  showAlert(message) {
    Swal.fire(message);
  }
}

export const addResultStore = new AddResultStore();
