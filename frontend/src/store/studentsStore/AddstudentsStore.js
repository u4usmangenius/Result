import { makeObservable, observable, action, toJS } from "mobx";
import Swal from "sweetalert2"; // Import Swal (SweetAlert)
import axios from "axios";
import Papa from "papaparse";
import { studentsStore } from "./studentsStore";
import { validations } from "../../helper.js/StudentsValidationStore";

class AddStudentStore {
  selectedSubjects = [];
  StudentID = "";
  subjectsToSend = [];
  showAddButton = false;
  editORsubmit = false;
  RestrictAddAnother = false;
  RestrictImportCSV = false;
  currentPage = 1;
  rowsPerPage = 8;
  selectedOption = "manually";
  studentData = [];
  multiplerowbtn = false;
  subjectOptions = [];
  editingSubjects = [];

  formData = {
    fullName: "",
    stdRollNo: "",
    stdPhone: "",
    guard_Phone: "",
    gender: "Select Gender",
    className: "Select Class",
    Batch: "",
    Subject1: "",
    Subject2: "",
    Subject3: "",
    Subject4: "",
    Subject5: "",
    Subject6: "",
  };
  clearFormFields() {
    this.formData.fullName = "";
    this.formData.stdRollNo = "";
    this.formData.stdPhone = "";
    this.formData.guard_Phone = "";
    this.formData.gender = "Select Gender";
    this.formData.className = "Select Class";
    this.formData.Batch = "";
    validations.errors.Name = false;
    validations.errors.rollNo = false;
    validations.errors.gender = false;
    validations.errors.className = false;
    validations.errors.Batch = false;
    validations.errors.subjects = false;
    this.selectedSubjects = [];
    this.formData.Subject1 = "";
    this.formData.Subject2 = "";
    this.formData.Subject3 = "";
    this.formData.Subject4 = "";
    this.formData.Subject5 = "";
    this.formData.Subject6 = "";
  }

  constructor() {
    this.selectedSubjects = [];
    this.studentData = [];
    makeObservable(this, {
      handleOptionChange: action.bound, // Bind the action
      showAddButton: observable,
      editORsubmit: observable,
      RestrictAddAnother: observable,
      RestrictImportCSV: observable,
      currentPage: observable,
      selectedOption: observable,
      studentData: observable,
      multiplerowbtn: observable,
      subjectOptions: observable,
      formData: observable,
      selectedSubjects: observable,
      toggleSubjectSelection: action,
      handleFileUpload: action,
      handleMultiRowUpload: action,
      handleSubmit: action,
      showAlert: action,
      clearFormFields: action,
      fetchSubjects: action,
    });
  }

  // Define the showAlert action
  showAlert(message) {
    Swal.fire(message);
  }

  toggleSubjectSelection(subjectName) {
    if (this.selectedSubjects.includes(subjectName)) {
      this.selectedSubjects.splice(
        this.selectedSubjects.indexOf(subjectName),
        1
      );
    } else {
      if (this.selectedSubjects.length < 6) {
        this.selectedSubjects.push(subjectName);
      }
    }

    if (this.selectedSubjects.length === 6) {
      validations.errors.subjects = false;
    } else {
      validations.errors.subjects = true;
    }
  }

  handleOptionChange(option) {
    this.selectedOption = option;
    this.showAddButton = false;
    this.multiplerowbtn = false;
    this.selectedSubjects = [];
    this.formData.Subject1 = "";
    this.formData.Subject2 = "";
    this.formData.Subject3 = "";
    this.formData.Subject4 = "";
    this.formData.Subject5 = "";
    this.formData.Subject6 = "";
  }
  setFormData(field, value) {
    this.formData[field] = value;
  }
  setEditingSubjects(subjects) {
    this.editingSubjects = subjects;
  }
  setEditingStudent(student) {
    this.editingStudent = student;
  }
  setSelectedSubjects(subjects) {
    this.selectedSubjects = subjects;
  }
  setStudentData(student, subjects) {
    this.formData.fullName = student.fullName;
    this.formData.stdRollNo = student.stdRollNo;
    this.formData.stdPhone = student.stdPhone;
    this.formData.guard_Phone = student.guard_Phone;
    this.formData.gender = student.gender;
    this.formData.className = student.className;
    this.formData.Batch = student.Batch;

    this.StudentID = student.studentId;
    console.log("this", student.studentId);
    this.selectedSubjects = subjects;
    validations.errors.Name = false;
    validations.errors.rollNo = false;
    validations.errors.gender = false;
    validations.errors.className = false;
    validations.errors.Batch = false;
    validations.errors.subjects = false;
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
      const formattedData = [
        {
          Batch: studentData.Batch,
          className: studentData.className,
          fullName: studentData.fullName,
          gender: studentData.gender,
          guard_Phone: studentData.guard_Phone,
          stdPhone: studentData.stdPhone,
          stdRollNo: studentData.stdRollNo,
          subjects: studentData.subjects,
        },
      ];

      const response = await axios.post(
        "http://localhost:8080/api/students",
        { csvData: formattedData },
        {
          headers,
        }
      );

      if (response.status === 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error adding/updating student:", error);
      return false;
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
        console.log("Current studentData:", this.studentData);

        if (parsedData.length > 0) {
          const filteredData = parsedData.filter((rowData) => {
            const requiredFields = [
              "fullName",
              "stdRollNo",
              "gender",
              "className",
              "Batch",
              "Subject1",
              "Subject2",
              "Subject3",
              "Subject4",
              "Subject5",
              "Subject6",
            ];
            return requiredFields.every((field) => rowData[field]);
          });

          if (filteredData.length === 0) {
            this.showAlert("No valid rows found with all required fields.");
            return;
          }
          this.studentData.replace(filteredData);
          console.log("Filtered studentData:", this.studentData);
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
        const duplicates = this.findDuplicates(this.studentData);

        if (duplicates.length > 0) {
          // Filter out duplicates from studentData
          this.studentData = this.studentData.filter(
            (item) => !duplicates.includes(JSON.stringify(item))
          );
        }
        const formattedArray = this.studentData
          .map((item) => {
            if (
              item.fullName &&
              item.stdRollNo &&
              item.gender &&
              item.className &&
              item.Batch &&
              item.Subject1 &&
              item.Subject2 &&
              item.Subject3 &&
              item.Subject4 &&
              item.Subject5 &&
              item.Subject6
            ) {
              const subjects = [
                item.Subject1,
                item.Subject2,
                item.Subject3,
                item.Subject4,
                item.Subject5,
                item.Subject6,
              ];
              return {
                fullName: item.fullName,
                stdRollNo: item.stdRollNo,
                stdPhone: item.stdPhone || "",
                guard_Phone: item.guard_Phone || "",
                gender: item.gender,
                className: item.className,
                Batch: item.Batch,
                subjects: subjects,
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
          "http://localhost:8080/api/students",
          { csvData: formattedArray },
          {
            headers,
          }
        );
        if (response.status === 200) {
          if (response.data.success) {
            this.showAlert("Students uploaded successfully");
            this.clearFormFields();
            this.selectedSubjects = [];
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
          } else {
            if (response.data.message) {
              console.error("Error:", response.data.message);
            } else {
              console.error("Unknown error occurred");
            }
          }
        }
      } catch (error) {
        console.error("Error uploading students:", error);
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
      this.subjectsToSend = toJS(this.selectedSubjects);
      if (this.subjectsToSend.length !== 6) {
        validations.errors.subjects = true;
        return;
      }
      if (
        this.formData.fullName === "" ||
        this.formData.stdRollNo === "" ||
        this.formData.Batch === "" ||
        this.formData.className === "Select Class" ||
        this.formData.gender === "Select Gender"
      ) {
        this.showAlert("Please fill all fields.");
        return;
      }
      if (this.formData.stdPhone === "") {
        this.formData.stdPhone = "-";
      }
      if (this.formData.guard_Phone === "") {
        this.formData.guard_Phone = "-";
      }
      const newstudent = {
        fullName: this.formData.fullName,
        stdRollNo: this.formData.stdRollNo,
        stdPhone: this.formData.stdPhone,
        guard_Phone: this.formData.guard_Phone,
        gender: this.formData.gender,
        className: this.formData.className,
        Batch: this.formData.Batch,
        subjects: this.subjectsToSend,
      };
      const success = await this.addstudentToBackend(newstudent);
      if (success) {
        this.showAlert("student added successfully");
        this.formData = {
          fullName: "",
          stdRollNo: "",
          stdPhone: "",
          guard_Phone: "",
          gender: this.formData.gender,
          className: this.formData.className,
          Batch: this.formData.Batch,
        };
        this.selectedSubjects = [];
        this.clearFormFields();
        validations.errors.Name = false;
        validations.errors.stdRollNo = false;
        validations.errors.stdPhone = false;
        validations.errors.guard_Phone = false;
        validations.errors.gender = false;
        validations.errors.className = false;
        validations.errors.Batch = false;
        validations.errors.subjects = false;
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
        this.clearFormFields();
        validations.errors.subjects = false;
      }
    } catch (error) {
      console.error("Error handling submit:", error);
      this.showAlert("An error occurred while processing the request.");
    }
  };
}

export const addstudentStore = new AddStudentStore();
