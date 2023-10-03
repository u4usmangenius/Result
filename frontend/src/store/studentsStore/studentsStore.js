import { makeObservable, observable, action, computed } from "mobx";
import Swal from "sweetalert2";
import axios from "axios";

class StudentsStore {
  students = [];
  currentPage = 1;
  rowsPerPage = 5;
  searchText = "";
  selectedFilter = "all";
  showEditModal = false;
  editingstudent = null;
  totalPages = 1;
  loading = false;

  constructor() {
    makeObservable(this, {
      students: observable,
      currentPage: observable,
      rowsPerPage: observable,
      searchText: observable,
      selectedFilter: observable,
      showEditModal: observable,
      editingstudent: observable,
      totalPages: observable,
      loading: observable,
      filteredstudents: computed,
      handleSearch:action,
      setCurrentPage: action,
      setSearchText: action,
      setSelectedFilter: action,
      fetchData: action,
      handleEdit: action,
      handleSaveEdit: action,
      handleCancelEdit: action,
      handleDelete: action,
      setLoading: action,
    });
  }

  setCurrentPage(page) {
    this.currentPage = page;
  }

  setSearchText(text) {
    this.searchText = text;
  }

  setSelectedFilter(filter) {
    this.selectedFilter = filter;
  }

  setLoading(isLoading) {
    this.loading = isLoading;
  }
  setDataNotFound(dataNotFound) {
    this.dataNotFound = dataNotFound;
  }
  handleSearch = async () => {
    try {
      this.setLoading(true);
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };

      const response = await axios.post(
        "http://localhost:8080/api/students/search",
        {
          searchText: this.searchText,
          selectedFilter: this.selectedFilter,
        },
        {
          headers,
        }
      );

      if (response.data.success) {
        this.students = response.data.students;
      } else {
        console.error("Error searching teachers:", response.data.message);
      }
    } catch (error) {
      console.error("Error searching teachers:", error);
    } finally {
      this.setLoading(false);
    }
  };

 
  async fetchData() {
    try {
      this.setLoading(true);
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };
      const response = await axios.post(
        "http://localhost:8080/api/student",
        {
          page: this.currentPage,
          pageSize: this.rowsPerPage,
          filter: this.selectedFilter,
          search: this.searchText,
          sortColumn: "fullName", // Default sorting column
          sortOrder: "asc", // Default sorting order (ascending)
        },
        { headers }
      );

      if (this.currentPage === 1) {
        this.students = response.data.students;
      } else {
        this.students = [];
        this.students = [...this.students, ...response.data.students];
      }

      this.totalPages = response.data.totalPages;
      this.loading = false;
    } catch (error) {
      console.error("Error fetching students:", error);
      this.setLoading(false);
    }
  }

  handleEdit(student) {
    this.showEditModal = true;
    this.editingstudent = student;
  }

  handleSaveEdit(editedstudent) {
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };
    axios
      .put(
        `http://localhost:8080/api/students/${editedstudent.studentId}`,
        editedstudent,
        { headers }
      )
      .then((response) => {
        if (response.status === 200) {
          const editedstudentIndex = this.students.findIndex(
            (t) => t.studentId === editedstudent.studentId
          );
          const updatedstudents = [...this.students];
          updatedstudents[editedstudentIndex] = response.data;
          this.students = updatedstudents;
          this.showEditModal = false;
          this.fetchData();
        }
      })
      .catch((error) => {
        console.error("Error editing student:", error);
      });
  }

  handleCancelEdit() {
    this.showEditModal = false;
    this.editingstudent = null;
  }
  showAlert(message) {
    Swal.fire(message);
  }

  handleDelete = async (student) => {
    const confirmed = await this.showConfirm(
      `Are you sure you want to delete ${student.fullName}?`
    );
    if (confirmed) {
      try {
        const token = localStorage.getItem("bearer token");
        const headers = {
          Authorization: `${token}`,
        };
        await axios.delete(
          `http://localhost:8080/api/students/${student.studentId}`,
          { headers }
        );

        this.students = this.students.filter(
          (t) => t.studentId !== student.studentId
        );
        this.fetchData();
      } catch (error) {
        console.error("Error deleting student:", error);
      }
    }
  };

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

  get filteredstudents() {
    const searchTextLower = this.searchText?.toLowerCase() || "";
    return this.students.filter((student) => {
      if (this.selectedFilter === "all") {
        return (
          student.fullName?.toLowerCase().includes(searchTextLower) ||
          student.subject?.toLowerCase().includes(searchTextLower) ||
          student.gender?.toLowerCase().includes(searchTextLower) ||
          student.stdRollNo?.toLowerCase().includes(searchTextLower) ||
          student.guard_Phone?.toLowerCase().includes(searchTextLower) ||
          student.stdPhone?.toLowerCase().includes(searchTextLower)
        );
      } else {
        return student[this.selectedFilter]
          ?.toLowerCase()
          .includes(searchTextLower);
      }
    });
  }
}

export const studentsStore = new StudentsStore();
