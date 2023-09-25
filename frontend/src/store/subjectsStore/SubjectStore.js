import { makeObservable, observable, action, computed } from "mobx";
import Swal from "sweetalert2";
import axios from "axios";

class SubjectStore {
  subjects = [];
  currentPage = 1;
  rowsPerPage = 5;
  searchText = "";
  selectedFilter = "all";
  showEditModal = false;
  editingSubject = null;
  totalPages = 1;
  loading = false;
  isLoading = false;
  dataNotFound = false;

  constructor() {
    makeObservable(this, {
      subjects: observable,
      currentPage: observable,
      rowsPerPage: observable,
      searchText: observable,
      selectedFilter: observable,
      showEditModal: observable,
      editingSubject: observable,
      totalPages: observable,
      loading: observable,
      isLoading: observable,
      dataNotFound: observable,
      filteredSubjects: computed,
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
  // New action to update dataNotFound state
  setDataNotFound(dataNotFound) {
    this.dataNotFound = dataNotFound;
  }
  setLoading(isLoading) {
    this.loading = isLoading; // Update the observable directly
  }

  async fetchData() {
    try {
      this.setLoading(true);
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };
      const response = await axios.get(
        `http://localhost:8080/api/subjects?page=${this.currentPage}&pageSize=${this.rowsPerPage}&filter=${this.selectedFilter}&search=${this.searchText}`,
        { headers }
      );
     if (this.currentPage === 1) {
        this.subjects = response.data.subjects;
      } else {
        this.subjects = [];
        this.subjects = [...this.subjects, ...response.data.subjects];
      }
      this.totalPages = response.data.totalPages;
      this.loading = false;
    } catch (error) {
      console.error("Error fetching subjects:", error);
      this.setLoading(false);
    }
    console.log("currentPage", this.currentPage);
    console.log("totalPages", this.totalPages);
    console.log("rowsPerPage", this.rowsPerPage);
  }
  handleEdit(subject) {
    this.showEditModal = true;
    this.editingSubject = subject;
  }

  handleSaveEdit(editedSubject) {
    // Send a PUT request to edit the subject data on the backend
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };
    axios
      .put(
        `http://localhost:8080/api/subjects/${editedSubject.subjectId}`,
        editedSubject,
        { headers }
      )
      .then((response) => {
        if (response.status === 200) {
          const editedSubjectIndex = this.subjects.findIndex(
            (t) => t.subjectId === editedSubject.subjectId
          );
          const updatedSubjects = [...this.subjects];
          updatedSubjects[editedSubjectIndex] = response.data;
          this.subjects = updatedSubjects;
          this.showEditModal = false;
          this.fetchData();
        }
      })
      .catch((error) => {
        console.error("Error editing subject:", error);
      });
  }

  handleCancelEdit() {
    this.showEditModal = false;
    this.editingSubject = null;
  }

  handleDelete = async (subject) => {
    const confirmed = await this.showConfirm(
      `Are you sure you want to delete ${subject.fullName}?`
    );
    if (confirmed) {
      try {
        const token = localStorage.getItem("bearer token");
        const headers = {
          Authorization: `${token}`,
        };
        // Send a DELETE request to the API endpoint for deletion
        await axios.delete(
          `http://localhost:8080/api/subjects/${subject.subjectId}`,
          { headers }
        );

        // Assuming the delete request is successful, you can remove the subject from your MobX store
        this.subjects = this.subjects.filter(
          (t) => t.subjectId !== subject.subjectId
        );
      } catch (error) {
        console.error("Error deleting subject:", error);
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

  get filteredSubjects() {
    // const searchTextLower = this.searchText?.toLowerCase();
    const searchTextLower = this.searchText?.toLowerCase() || "";
    return this.subjects.filter((subject) => {
      if (this.selectedFilter === "all") {
        return (
          subject.subjectName?.toLowerCase().includes(searchTextLower) ||
          subject.courseCode?.toLowerCase().includes(searchTextLower)
        );
      } else {
        return subject[this.selectedFilter]
          ?.toLowerCase()
          .includes(searchTextLower);
      }
    });
  }
}
export const subjectStore = new SubjectStore();

export default SubjectStore;
// export const loginstore = new LoginStore();
