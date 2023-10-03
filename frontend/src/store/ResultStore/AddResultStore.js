// AddResultStore.js
import { makeObservable, observable, action } from "mobx";
import axios from "axios";
import Swal from "sweetalert2";
import { resultStore } from "./ResultStore";

class AddResultStore {
  currentPage = 1;
  rowsPerPage = 8;
  selectedOption = "manually";
  resultData = [];
  editingIndex = -1;
  formData = {
    stdRollNo: "",
    TestName: "",
    ObtainedMarks: "",
  };

  constructor() {
    makeObservable(this, {
      currentPage: observable,
      selectedOption: observable,
      resultData: observable,
      editingIndex: observable,
      formData: observable,
      setCurrentPage: action,
      setSelectedOption: action,
      setResultData: action,
      setEditingIndex: action,
      setFormData: action,
      addResultToBackend: action,
      handleSubmit: action,
    });
  }

  setCurrentPage(page) {
    this.currentPage = page;
  }

  setSelectedOption(option) {
    this.selectedOption = option;
  }

  setResultData(data) {
    this.resultData = data;
  }

  setEditingIndex(index) {
    this.editingIndex = index;
  }

  setFormData(data) {
    this.formData = { ...this.formData, ...data };
  }

  async addResultToBackend(result) {
    try {
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
        console.log("Data already exists");
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
      if (this.editingIndex !== -1) {
        // Handle editing existing result
        const updatedResultData = [...this.resultData];
        const updatedResult = {
          ...this.formData,
          id: updatedResultData[this.editingIndex].id,
        };
        updatedResultData[this.editingIndex] = updatedResult;
        this.setResultData(updatedResultData);

        const success = await this.addResultToBackend(updatedResult);

        if (success) {
          this.showAlert("Result updated successfully");
          this.setFormData({
            stdRollNo: "",
            TestName: "",
            ObtainedMarks: "",
          });
          this.setEditingIndex(-1);
        } else {
          this.showAlert("Failed to update result. Please try again.");
        }
      } else {
        // Handle adding a new result
        const newResult = {
          stdRollNo: this.formData.stdRollNo,
          TestName: this.formData.TestName,
          ObtainedMarks: this.formData.ObtainedMarks,
        };

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

          fetchData();

          this.showAlert("Result added successfully");
          this.setFormData({
            stdRollNo: "",
            TestName: "",
            ObtainedMarks: "",
          });
        } else {
          this.showAlert(
            "Something went wrong, check stdRollNo or test name exist."
          );
        }
      }
    } catch (error) {
      console.error("Error handling submit:", error);
      this.showAlert("An error occurred while processing the request.");
    }
  }

  showAlert(message) {
    Swal.fire(message);
  }
}

export const addResultStore = new AddResultStore();
