import { makeObservable, observable, action, computed } from "mobx";
import Swal from "sweetalert2";
import axios from "axios";
import { addTeacherStore } from "./AddTeacherStore";

class TeachersStore {
  teachers = [];
  currentPage = 1;
  rowsPerPage = 10;
  searchText = "";
  selectedFilter = "all";
  showEditModal = false;
  editingTeacher = null;
  totalPages = 1;
  loading = false;
  FiltreClassName = "";
  mouseHover = false;

  constructor() {
    makeObservable(this, {
      teachers: observable,
      currentPage: observable,
      rowsPerPage: observable,
      searchText: observable,
      selectedFilter: observable,
      showEditModal: observable,
      editingTeacher: observable,
      totalPages: observable,
      FiltreClassName: observable,
      mouseHover: observable,
      loading: observable,
      filteredTeachers: computed,
      setCurrentPage: action,
      setSearchText: action,
      setrowsPerPage: action,
      setSelectedFilter: action,
      fetchData: action,
      handleEdit: action,
      handleSaveEdit: action,
      handleSearch: action,
      handleCancelEdit: action,
      handleDelete: action,
      setLoading: action,
      showAlert: action,
    });
  }

  setCurrentPage(page) {
    this.currentPage = page;
  }

  setSearchText(text) {
    this.searchText = text;
    this.FiltreClassName = false;
  }

  setrowsPerPage(page) {
    this.rowsPerPage = page;
    this.fetchData();
    console.log(this.rowsPerPage);
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
  // Add a new action to handle searching teachers
  handleSearch = async () => {
    try {
      this.setLoading(true);
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };

      const response = await axios.post(
        "http://localhost:8080/api/teachers/search",
        {
          searchText: this.searchText,
          selectedFilter: this.selectedFilter,
        },
        {
          headers,
        }
      );

      if (response.data.success) {
        this.teachers = response.data.teachers;
        console.log("first....................", this.teachers);
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
        "http://localhost:8080/api/teacher",
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
        this.teachers = response.data.teachers;
      } else {
        this.teachers = [];
        this.teachers = [...this.teachers, ...response.data.teachers];
      }

      this.totalPages = response.data.totalPages;
      this.loading = false;
    } catch (error) {
      console.error("Error fetching teachers:", error);
      this.setLoading(false);
    }
  }

  handleEdit(teacher) {
    this.showEditModal = true;
    this.editingTeacher = teacher;
  }

  handleSaveEdit() {
    const teachersInfo = {
      fullName: addTeacherStore.formData.fullName,
      gender: addTeacherStore.formData.gender,
      phone: addTeacherStore.formData.phone,
      subject: addTeacherStore.formData.subject,
    };

    const teacherId = addTeacherStore.StudentID;
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };
    axios
      .put(
        `http://localhost:8080/api/teachers/${teacherId}`,
        {
          teacher: teachersInfo,
        },
        {
          headers,
        }
      )
      .then((response) => {
        if (response.status === 200) {
          const editedTeacherIndex = this.teachers.findIndex(
            (t) => t.teacherId === teacherId
          );
          const updatedTeachers = [...this.teachers];
          updatedTeachers[editedTeacherIndex] = response.data;
          this.teachers = updatedTeachers;
          this.showEditModal = false;
          this.fetchData();
          addTeacherStore.clearFormFields();
          this.showAlert("Updated Successfully...");
        }
      })
      .catch((error) => {
        this.showAlert("Something went wrong");
        console.error("Error editing teacher:", error);
        addTeacherStore.clearFormFields();
      });
  }

  handleCancelEdit() {
    this.showEditModal = false;
    this.editingTeacher = null;
  }
  showAlert(message) {
    Swal.fire(message);
  }

  handleDelete = async (teacher) => {
    const confirmed = await this.showConfirm(
      `Are you sure you want to delete ${teacher.fullName}?`
    );
    if (confirmed) {
      try {
        const token = localStorage.getItem("bearer token");
        const headers = {
          Authorization: `${token}`,
        };
        await axios.delete(
          `http://localhost:8080/api/teachers/${teacher.teacherId}`,
          { headers }
        );

        this.teachers = this.teachers.filter(
          (t) => t.teacherId !== teacher.teacherId
        );
        this.fetchData();
        this.showAlert(`Student Deleted Successfully`);
      } catch (error) {
        console.error("Error deleting teacher:", error);
        this.showAlert(`Error While Deleting Student`);
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

  get filteredTeachers() {
    const searchTextLower = this.searchText?.toLowerCase() || "";
    return this.teachers.filter((teacher) => {
      if (this.selectedFilter === "all") {
        return (
          teacher.fullName?.toLowerCase().includes(searchTextLower) ||
          teacher.subject?.toLowerCase().includes(searchTextLower) ||
          teacher.gender?.toLowerCase().includes(searchTextLower) ||
          teacher.phone?.toLowerCase().includes(searchTextLower)
        );
      } else {
        return teacher[this.selectedFilter]
          ?.toLowerCase()
          .includes(searchTextLower);
      }
    });
  }
}

export const teachersStore = new TeachersStore();
