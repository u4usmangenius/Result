import { makeObservable, observable, action, computed } from "mobx";
import Swal from "sweetalert2";
import axios from "axios";

class TeachersStore {
  teachers = [];
  currentPage = 1;
  rowsPerPage = 5;
  searchText = "";
  selectedFilter = "all";
  showEditModal = false;
  editingTeacher = null;
  totalPages = 1;
  loading = false;

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
      loading: observable,
      filteredTeachers: computed,
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
  async fetchData() {
    try {
      this.setLoading(true);
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };
      const response = await axios.get(
        `http://localhost:8080/api/teachers?page=${this.currentPage}&pageSize=${this.rowsPerPage}&filter=${this.selectedFilter}&search=${this.searchText}`,
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

  handleSaveEdit(editedTeacher) {
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };
    axios
      .put(
        `http://localhost:8080/api/teachers/${editedTeacher.teacherId}`,
        editedTeacher,
        { headers }
      )
      .then((response) => {
        if (response.status === 200) {
          const editedTeacherIndex = this.teachers.findIndex(
            (t) => t.teacherId === editedTeacher.teacherId
          );
          const updatedTeachers = [...this.teachers];
          updatedTeachers[editedTeacherIndex] = response.data;
          this.teachers = updatedTeachers;
          this.showEditModal = false;
          this.fetchData();
        }
      })
      .catch((error) => {
        console.error("Error editing teacher:", error);
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
      } catch (error) {
        console.error("Error deleting teacher:", error);
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
        return teacher[this.selectedFilter]?.toLowerCase().includes(searchTextLower);
      }
    });
  }
}

export const teachersStore = new TeachersStore();
