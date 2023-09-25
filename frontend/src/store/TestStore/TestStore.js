// teststore.js
import { makeObservable, observable, action, computed } from "mobx";
import axios from "axios";
import Swal from "sweetalert2";

class TestStore {
  currentPage = 1;
  rowsPerPage = 5;
  searchText = "";
  selectedFilter = "all";
  tests = [];
  showEditModal = false;
  editingTest = null;
  loading = false;
  totalPages = 1;

  constructor() {
    makeObservable(this, {
      currentPage: observable,
      rowsPerPage: observable,
      searchText: observable,
      selectedFilter: observable,
      tests: observable,
      showEditModal: observable,
      editingTest: observable,
      loading: observable,
      totalPages: observable,
      filteredTests: computed,
      getCurrentPageData: computed,
      setSearchText: action,
      setSelectedFilter: action,
      setCurrentPage: action,
      setShowEditModal: action,
      setEditingTest: action,
      setLoading: action,
      setTests: action,
      setTotalPages: action,
      fetchDataFromBackend: action,
      handleEdit: action,
      handleSaveEdit: action,
      handleCancelEdit: action,
      handleDelete: action,
    });
  }

  get filteredTests() {
    const searchTextLower = this.searchText?.toLowerCase();
    return this.tests.filter((test) => {
      if (this.selectedFilter === "all") {
        return (
          (test.TestName &&
            test.TestName.toString()?.toLowerCase().includes(searchTextLower)) ||
          (test.SubjectName &&
            test.SubjectName.toString()
              .toLowerCase()
              .includes(searchTextLower)) ||
          (test.TotalMarks &&
            test.TotalMarks.toString().toLowerCase().includes(searchTextLower)) ||
          (test.ClassName &&
            test.ClassName.toString().toLowerCase().includes(searchTextLower))
        );
      } else {
        return (
          test[this.selectedFilter] &&
          test[this.selectedFilter].toString().toLowerCase().includes(searchTextLower)
        );
      }
    });
  }

  get getCurrentPageData() {
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    return this.filteredTests.slice(startIndex, endIndex);
  }

  setSearchText(text) {
    this.searchText = text;
  }

  setSelectedFilter(filter) {
    this.selectedFilter = filter;
  }

  setCurrentPage(page) {
    this.currentPage = page;
    this.searchText = ""; // Reset searchText when currentPage changes
  }

  setShowEditModal(show) {
    this.showEditModal = show;
  }

  setEditingTest(test) {
    this.editingTest = test;
  }

  setLoading(loading) {
    this.loading = loading;
  }

  setTests(tests) {
    this.tests = tests;
  }

  setTotalPages(totalPages) {
    this.totalPages = totalPages;
  }

  fetchDataFromBackend(page) {
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };
    this.setLoading(true);
    axios
      .get(
        `http://localhost:8080/api/tests?page=${page}&pageSize=${this.rowsPerPage}`,
        { headers }
      )
      .then((response) => {
        this.setTests(response.data.tests);
        this.setTotalPages(response.data.totalPages);
        this.setCurrentPage(page);
        this.setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tests:", error);
        this.setLoading(false);
      });
  }

  handleEdit(test) {
    this.setShowEditModal(true);
    this.setEditingTest(test);
  }

  handleSaveEdit(editedTest) {
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };
    axios
      .put(`http://localhost:8080/api/tests/${editedTest.testId}`, editedTest, {
        headers,
      })
      .then((response) => {
        if (response.status === 200) {
          const editedTestIndex = this.tests.findIndex(
            (t) => t.testId === editedTest.testId
          );
          const updatedTests = [...this.tests];
          updatedTests[editedTestIndex] = response.data;
          this.setTests(updatedTests);
          this.setShowEditModal(false);
          this.fetchDataFromBackend(1);
        }
      })
      .catch((error) => {
        console.error("Error editing test:", error);
      });
  }

  handleCancelEdit() {
    this.setShowEditModal(false);
    this.setEditingTest(null);
  }

  async handleDelete(test) {
    const confirmed = await this.showConfirm(`Are you sure you want to delete ${test.fullName}?`);
    if (confirmed) {
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };
      axios
        .delete(`http://localhost:8080/api/tests/${test.testId}`, { headers })
        .then((response) => {
          if (response.status === 200) {
            const updatedTests = this.tests.filter((t) => t.testId !== test.testId);
            this.setTests(updatedTests);
            this.fetchDataFromBackend(1);
          } else {
            console.error("Error deleting test:", response.data.message);
          }
        })
        .catch((error) => {
          console.error("Error deleting test:", error);
        });
    }
  }

  showConfirm(message) {
    return Swal.fire({
      title: 'Confirm',
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      return result.isConfirmed;
    });
  }
}

export const testStore = new TestStore();
