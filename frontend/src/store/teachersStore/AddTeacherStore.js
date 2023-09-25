import axios from "axios";
import { makeObservable, observable, action } from "mobx";
import Swal from "sweetalert2"; // Import Swal (SweetAlert)
import Papa from "papaparse";
import { teachersStore } from "./TeachersStore";

class AddTeacherStore {
  showAddButton = false;
  currentPage = 1;
  rowsPerPage = 8;
  selectedOption = "manually";
  teacherData = [];
  editingIndex = -1;
  multiplerowbtn = false;
  subjectOptions = [];
  formData = {
    fullName: "",
    phone: "",
    gender: "Select Gender",
    subject: "Select Subject",
  };

  constructor() {
    this.teacherData = [];
    makeObservable(this, {
      handleOptionChange: action.bound, // Bind the action
      showAddButton: observable,
      currentPage: observable,
      selectedOption: observable,
      teacherData: observable,
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
  async addTeacherToBackend(teacherData) {
    try {
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };

      if (this.editingIndex !== -1) {
        // Handle updating an existing teacher
        const response = await axios.put(
          `http://localhost:8080/api/teachers/${teacherData.id}`,
          teacherData,
          {
            headers,
          }
        );

        if (response.status === 200) {
          return true; // Teacher updated successfully
        } else {
          return false; // Failed to update teacher
        }
      } else {
        // Handle adding a new teacher
        const response = await axios.post(
          "http://localhost:8080/api/teachers",
          teacherData,
          {
            headers,
          }
        );

        if (response.status === 200) {
          return true; // Teacher added successfully
        } else {
          return false; // Failed to add teacher
        }
      }
    } catch (error) {
      console.error("Error adding/updating teacher:", error);
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
        console.log("Current teacherData:", this.teacherData);

        if (parsedData.length === 1) {
          const singleRowData = parsedData[0];

          // Check if the fields in the CSV match the expected fields
          const expectedFields = ["fullName", "phone", "gender", "subject"];
          const csvFields = Object.keys(singleRowData);

          if (expectedFields.every((field) => csvFields.includes(field))) {
            this.formData = {
              fullName: singleRowData["fullName"] || "",
              phone: singleRowData["phone"] || "",
              gender: singleRowData["gender"] || "Select Gender",
              subject: singleRowData["subject"] || "Select Subject",
            };
            this.selectedOption = "manually";
            this.showAddButton = false;
            this.multiplerowbtn = false;
          } else {
            this.showAlert("CSV fields do not match the expected fields.");
          }
        } else if (parsedData.length > 1) {
          this.teacherData.replace(parsedData); // Use replace to update the observable array
          //   this.teacherData = parsedData;
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
      `Continue to Insert All Teachers?`
    );

    if (confirmed) {
      try {
        const token = localStorage.getItem("bearer token");
        const headers = {
          Authorization: `${token}`,
        };

        // Check for duplicates in the CSV data
        const duplicates = this.findDuplicates(this.teacherData);

        if (duplicates.length > 0) {
          // Display an alert with the duplicate entries
          this.multiplerowbtn = false;
          this.showAlert(`Duplicate entries found: ${duplicates.join(", ")}`);
          return;
        }

        const response = await axios.post(
          "http://localhost:8080/api/teachers/upload-csv",
          { csvData: this.teacherData },
          {
            headers,
          }
        );

        if (response.status === 200) {
          const { success, message } = response.data;

          if (success) {
            this.showAlert("Teachers uploaded successfully");
            const fetchData = async () => {
              teachersStore.setLoading(true);
              try {
                await teachersStore.fetchData();
                teachersStore.setDataNotFound(false);
              } catch (error) {
                console.error("Error fetching subjects:", error);
                teachersStore.setDataNotFound(true);
              } finally {
                teachersStore.setLoading(false);
              }
            };
            fetchData();

            // Optionally, you can clear the teacherData state if needed
            this.teacherData = [];
            this.multiplerowbtn = false;
          } else {
            // Check the message returned from the backend
            if (message.includes("redundant")) {
              this.showAlert(`Redundant rows found: ${message}`);
            } else {
              this.showAlert(`Failed to upload teachers: ${message}`);
            }
          }
        } else {
          this.showAlert("Failed to upload teachers. Please try again.");
        }
      } catch (error) {
        console.error("Error uploading teachers:", error);
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
        // Handle editing existing teacher
        const updatedTeacherData = [...this.teacherData];
        const updatedTeacher = {
          ...this.formData,
          id: updatedTeacherData[this.editingIndex].id,
        };
        updatedTeacherData[this.editingIndex] = updatedTeacher;
        this.teacherData = updatedTeacherData;

        const success = await this.addTeacherToBackend(updatedTeacher);

        if (success) {
          this.showAlert("Teacher updated successfully");
          this.formData = {
            fullName: "",
            phone: "",
            gender: "Select Gender",
            subject: "Select Subject",
          };
          this.editingIndex = -1;
        } else {
          this.showAlert("Failed to update teacher. Please try again.");
        }
      } else {
        if (
          this.formData.fullName === "" ||
          this.formData.phone === "" ||
          this.formData.gender === "Select Gender" ||
          this.formData.subject === "Select Subject"
        ) {
          this.showAlert("Please fill all fields.");
          return; // Don't proceed if default values are selected
        }
        // Handle adding a new teacher
        const newTeacher = {
          fullName: this.formData.fullName,
          phone: this.formData.phone,
          gender: this.formData.gender,
          subject: this.formData.subject,
        };

        const success = await this.addTeacherToBackend(newTeacher);

        if (success) {
          this.showAlert("Teacher added successfully");
          //   onClose(); // Close the form
          this.formData = {
            fullName: "",
            phone: "",
            gender: "Select Gender",
            subject: "Select Subject",
          };
          const fetchData = async () => {
            teachersStore.setLoading(true);
            try {
              await teachersStore.fetchData();
              teachersStore.setDataNotFound(false);
            } catch (error) {
              console.error("Error fetching subjects:", error);
              teachersStore.setDataNotFound(true);
            } finally {
              teachersStore.setLoading(false);
            }
          };
          fetchData();

          if (this.onClose) {
            this.onClose();
          }
        } else {
          this.showAlert("Failed to add teacher. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error handling submit:", error);
      this.showAlert("An error occurred while processing the request.");
    }
  };
}

export const addTeacherStore = new AddTeacherStore();
