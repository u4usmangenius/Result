import { makeObservable, observable, action } from "mobx";
import Swal from "sweetalert2"; // Import Swal (SweetAlert)
import axios from "axios";
import Papa from "papaparse";
import { studentsStore } from "./studentsStore";

class AddStudentStore {
  showAddButton = false;
  currentPage = 1;
  rowsPerPage = 8;
  selectedOption = "manually";
  studentData = [];
  editingIndex = -1;
  multiplerowbtn = false;
  subjectOptions = [];
  formData = {
    fullName: "",
    stdRollNo: "",
    stdPhone: "",
    guard_Phone: "",
    gender: "Select Gender",
    className: "Select Subject",
    Batch: "",
  };

  constructor() {
    this.studentData = [];
    makeObservable(this, {
      handleOptionChange: action.bound, // Bind the action
      showAddButton: observable,
      currentPage: observable,
      selectedOption: observable,
      studentData: observable,
      editingIndex: observable,
      multiplerowbtn: observable,
      subjectOptions: observable,
      formData: observable,
      //   handleOptionChange: action,
      handleFileUpload: action,
      handleMultiRowUpload: action,
      handleSubmit: action,
      showAlert: action, // Add the showAlert action
      fetchSubjects: action,
    });
  }

  // Define the showAlert action
  showAlert(message) {
    Swal.fire(message);
  }

  handleOptionChange(option) {
    this.selectedOption = option;
    this.showAddButton = false;
    this.multiplerowbtn = false;
  }
  setFormData(field, value) {
    this.formData[field] = value;
  }
  async showConfirm(message) {
    try {
      const result = await Swal.fire({
        title: "Confirmation",
        text: message,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      });

      return result.isConfirmed;
    } catch (error) {
      console.error("Error showing confirmation:", error);
      return false;
    }
  }
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
        this.subjectOptions.replace(subjects);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };
  async addstudentToBackend(studentData) {
    try {
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };

      if (this.editingIndex !== -1) {
        // Handle updating an existing student
        const response = await axios.put(
          `http://localhost:8080/api/students/${studentData.id}`,
          studentData,
          {
            headers,
          }
        );

        if (response.status === 200) {
          return true; // student updated successfully
        } else {
          return false; // Failed to update student
        }
      } else {
        // Handle adding a new student
        const response = await axios.post(
          "http://localhost:8080/api/students",
          studentData,
          {
            headers,
          }
        );

        if (response.status === 200) {
          return true; // student added successfully
        } else {
          return false; // Failed to add student
        }
      }
    } catch (error) {
      console.error("Error adding/updating student:", error);
      return false; // An error occurred while processing the request
    }
  }

  handleFileUpload = (event) => {
    const file = event.target.files[0];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsedData = result.data;
        console.log("Parsed data:", result.data);
        console.log("Current studentData:", this.studentData);

        if (parsedData.length === 1) {
          const singleRowData = parsedData[0];

          // Check if the fields in the CSV match the expected fields

          const expectedFields = [
            "fullName",
            "stdPhone",
            "gender",
            "className",
            "guard_Phone",
            "Batch",
          ];
          const csvFields = Object.keys(singleRowData);

          if (expectedFields.every((field) => csvFields.includes(field))) {
            this.formData = {
              fullName: singleRowData["fullName"] || "",
              stdRollNo: singleRowData["stdRollNo"] || "",
              stdPhone: singleRowData["stdPhone"] || "",
              guard_Phone: singleRowData["guard_Phone"] || "",
              gender: singleRowData["gender"] || "Select Gender",
              className: singleRowData["className"] || "",
              Batch: singleRowData["Batch"] || "",
            };
            this.selectedOption = "manually";
            this.showAddButton = false;
            this.multiplerowbtn = false;
          } else {
            this.showAlert("CSV fields do not match the expected fields.");
          }
        } else if (parsedData.length > 1) {
          this.studentData.replace(parsedData); // Use replace to update the observable array
          //   this.studentData = parsedData;
          this.selectedOption = "import-csv";
          this.showAddButton = false;
          this.multiplerowbtn = true;
        } else {
          this.showAlert("The CSV file is empty.");
          this.showAddButton = false;
          this.multiplerowbtn = false;
        }
      },
    });
  };

  handleMultiRowUpload = async () => {
    const confirmed = await this.showConfirm(
      `Continue to Insert All students?`
    );

    if (confirmed) {
      try {
        const token = localStorage.getItem("bearer token");
        const headers = {
          Authorization: `${token}`,
        };

        // Check for duplicates in the CSV data
        const duplicates = this.findDuplicates(this.studentData);

        if (duplicates.length > 0) {
          // Display an alert with the duplicate entries
          this.multiplerowbtn = false;
          this.showAlert(`Duplicate entries found: ${duplicates.join(", ")}`);
          return;
        }

        const response = await axios.post(
          "http://localhost:8080/api/students/upload-csv",
          { csvData: this.studentData },
          {
            headers,
          }
        );

        if (response.status === 200) {
          const { success, message } = response.data;

          if (success) {
            this.showAlert("students uploaded successfully");
            const fetchData = async () => {
              studentsStore.setLoading(true);
              try {
                await studentsStore.fetchData();
                studentsStore.setDataNotFound(false);
              } catch (error) {
                console.error("Error fetching subjects:", error);
                studentsStore.setDataNotFound(true);
              } finally {
                studentsStore.setLoading(false);
              }
            };
            fetchData();
            this.studentData = [];
            this.multiplerowbtn = false;
          } else {
            // Check the message returned from the backend
            if (message.includes("redundant")) {
              this.showAlert(`Redundant rows found: ${message}`);
            } else {
              this.showAlert(`Failed to upload students: ${message}`);
            }
          }
        } else {
          this.showAlert("Failed to upload students. Please try again.");
        }
      } catch (error) {
        console.error("Error uploading students:", error);
        this.showAlert("An error occurred while processing the request.");
      }
    }
  };
  findDuplicates(arr) {
    const seen = {};
    const duplicates = [];

    for (const item of arr) {
      const key = JSON.stringify(item);
      if (seen[key]) {
        duplicates.push(key);
      } else {
        seen[key] = true;
      }
    }

    return duplicates;
  }

  handleSubmit = async () => {
    try {
      if (this.editingIndex !== -1) {
        // Handle editing existing student
        const updatedstudentData = [...this.studentData];
        const updatedstudent = {
          ...this.formData,
          id: updatedstudentData[this.editingIndex].id,
        };
        updatedstudentData[this.editingIndex] = updatedstudent;
        this.studentData = updatedstudentData;

        const success = await this.addstudentToBackend(updatedstudent);

        if (success) {
          this.showAlert("student updated successfully");
          this.formData = {
            fullName: "",
            stdRollNo: "",
            stdPhone: "",
            guard_Phone: "",
            gender: "Select Gender",
            className: "Select Class",
            Batch: "",
          };
          this.editingIndex = -1;
        } else {
          this.showAlert("Failed to update student. Please try again.");
        }
      } else {
        if (
          this.formData.fullName === "" ||
          this.formData.stdRollNo === "" ||
          this.formData.guard_Phone === "" ||
          this.formData.stdPhone === "" ||
          this.formData.Batch === "" ||
          this.formData.className === "Select Class" ||
          this.formData.gender === "Select Gender"
        ) {
          this.showAlert("Please fill all fields.");
          return; // Don't proceed if default values are selected
        }
        // Handle adding a new student
        const newstudent = {
          fullName: this.formData.fullName,
          stdRollNo: this.formData.stdRollNo,
          stdPhone: this.formData.stdPhone,
          guard_Phone: this.formData.guard_Phone,
          gender: this.formData.gender,
          className: this.formData.className,
          Batch: this.formData.Batch,
        };

        const success = await this.addstudentToBackend(newstudent);

        if (success) {
          this.showAlert("student added successfully");
          //   onClose(); // Close the form
          this.formData = {
            fullName: "",
            stdRollNo: "",
            stdPhone: "",
            guard_Phone: "",
            gender: this.formData.gender,
            className: this.formData.className,
            Batch: this.formData.Batch,
          };
          const fetchData = async () => {
            studentsStore.setLoading(true);
            try {
              await studentsStore.fetchData();
              studentsStore.setDataNotFound(false);
            } catch (error) {
              console.error("Error fetching subjects:", error);
              studentsStore.setDataNotFound(true);
            } finally {
              studentsStore.setLoading(false);
            }
          };
          fetchData();
          if (this.onClose) {
            this.onClose();
          }
        } else {
          this.showAlert("Failed to add student. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error handling submit:", error);
      this.showAlert("An error occurred while processing the request.");
    }
  };
}

export const addstudentStore = new AddStudentStore();
