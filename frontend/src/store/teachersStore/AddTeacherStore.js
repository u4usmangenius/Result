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
  clearFormFields() {
    this.formData.fullName = "";
    this.formData.phone = "";
    this.formData.gender = "Select Gender";
    this.formData.subject = "";
  }
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
      const formattedData = [
        {
          fullName: teacherData.fullName,
          gender: teacherData.gender,
          phone: teacherData.phone,
          subject: teacherData.subject,
        },
      ];
      console.log(formattedData);
      const response = await axios.post(
        "http://localhost:8080/api/teachers",
        { csvData: formattedData },
        {
          headers,
        }
      );

      if (response.status === 200) {
        return true; // Teacher added successfully
      } else {
        return false; // Failed to add teacher
      }
    } catch (error) {
      console.error("Error adding/updating teacher:", error);
      return false; // An error occurred while processing the request
    }
  }
  handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsedData = result.data;
        console.log("Parsed data:", result.data);
        console.log("Current teacherData:", this.teacherData);

        if (parsedData.length > 0) {
          const filteredData = parsedData.filter((rowData) => {
            const requiredFields = ["fullName", "phone", "gender", "subject"];
            return requiredFields.every((field) => rowData[field]);
          });

          if (filteredData.length === 0) {
            this.showAlert("No valid rows found with all required fields.");
            return;
          }
          this.teacherData.replace(filteredData);
          console.log("Filtered teacherData:", this.teacherData);
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
      `Continue to Insert All teachers?`
    );

    if (confirmed) {
      try {
        const token = localStorage.getItem("bearer token");
        const headers = {
          Authorization: `${token}`,
        };
        const duplicates = this.findDuplicates(this.teacherData);

        if (duplicates.length > 0) {
          // Filter out duplicates from teacherData
          this.teacherData = this.teacherData.filter(
            (item) => !duplicates.includes(JSON.stringify(item))
          );
        }
        const formattedArray = this.teacherData
          .map((item) => {
            if (item.fullName && item.gender && item.phone && item.subject) {
              return {
                fullName: item.fullName,
                phone: item.phone || "",
                gender: item.gender,
                subject: item.subject,
              };
            }
            return null;
          })
          .filter(Boolean);
        console.log("formattedArray===>", formattedArray);
        if (formattedArray.length === 0) {
          this.showAlert("No rows with all required fields found.");
          return;
        }
        const response = await axios.post(
          "http://localhost:8080/api/teachers",
          { csvData: formattedArray },
          {
            headers,
          }
        );
        if (response.status === 200) {
          if (response.data.success) {
            this.showAlert("Teachers uploaded successfully");
            this.clearFormFields();
            const fetchData = async () => {
              teachersStore.setLoading(true);
              try {
                await teachersStore.fetchData();
                teachersStore.setDataNotFound(false);
              } catch (error) {
                console.error("Error fetching Teachers:", error);
                teachersStore.setDataNotFound(true);
              } finally {
                teachersStore.setLoading(false);
              }
            };
            fetchData();
          } else {
            if (response.data.message) {
              console.error("Error:", response.data.message);
            } else {
              console.error("Unknown error occurred");
            }
          }
        }
      } catch (error) {
        console.error("Error uploading teachers:", error);
        this.showAlert("An error occurred while processing the request.");
        this.clearFormFields();
      }
    }
  };

  findDuplicates(arr) {
    const seen = {};
    const duplicates = [];

    for (const item of arr) {
      const key = JSON.stringify(item);
      if (seen[key]) {
        duplicates.push(item);
      } else {
        seen[key] = true;
      }
    }
    return duplicates;
  }

  handleSubmit = async () => {
    try {
      if (
        this.formData.fullName === "" ||
        this.formData.phone === "" ||
        this.formData.gender === "Select Gender" ||
        this.formData.subject === "Select Subject"
      ) {
        this.showAlert("Please fill all fields.");
        return;
      }
      const newTeacher = {
        fullName: this.formData.fullName,
        phone: this.formData.phone,
        gender: this.formData.gender,
        subject: this.formData.subject,
      };
      const success = await this.addTeacherToBackend(newTeacher);
      if (success) {
        this.showAlert("Teacher added successfully");
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
    } catch (error) {
      console.error("Error handling submit:", error);
      this.showAlert("An error occurred while processing the request.");
    }
  };
}

export const addTeacherStore = new AddTeacherStore();
