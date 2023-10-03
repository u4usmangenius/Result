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
      handleSearch: action,
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

  handleSearch = async () => {
    try {
      this.setLoading(true);
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };

      const response = await axios.post(
        "http://localhost:8080/api/tests/search",
        {
          searchText: this.searchText,
          selectedFilter: this.selectedFilter,
        },
        {
          headers,
        }
      );

      if (response.data.success) {
        this.tests = response.data.tests;
      } else {
        console.error("Error searching tests:", response.data.message);
      }
    } catch (error) {
      console.error("Error searching tests:", error);
    } finally {
      this.setLoading(false);
    }
  };

  get filteredTests() {
    const searchTextLower = this.searchText?.toLowerCase();
    return this.tests.filter((test) => {
      if (this.selectedFilter === "all") {
        return (
          (test.TestName &&
            test.TestName.toString()
              ?.toLowerCase()
              .includes(searchTextLower)) ||
          (test.SubjectName &&
            test.SubjectName.toString()
              .toLowerCase()
              .includes(searchTextLower)) ||
          (test.TotalMarks &&
            test.TotalMarks.toString()
              .toLowerCase()
              .includes(searchTextLower)) ||
          (test.ClassName &&
            test.ClassName.toString().toLowerCase().includes(searchTextLower))
        );
      } else {
        return (
          test[this.selectedFilter] &&
          test[this.selectedFilter]
            .toString()
            .toLowerCase()
            .includes(searchTextLower)
        );
      }
    });
  }

  get getCurrentPageData() {
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    console.log("startIndex:", startIndex);
    console.log("endIndex:", endIndex);
    console.log("filteredTests:", this.filteredTests);
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

  async fetchDataFromBackend(page) {
    try {
      this.setLoading(true);
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };
      const response = await axios.post(
        "http://localhost:8080/api/test",
        {
          page: this.currentPage,
          pageSize: this.rowsPerPage,
          filter: this.selectedFilter,
          search: this.searchText,
          sortColumn: "TestName",
          sortOrder: "asc",
        },
        { headers }
      );

      if (this.currentPage === 1) {
        this.tests = response.data.tests;
      } else {
        this.tests = [];
        this.tests = [...this.tests, ...response.data.tests];
      }
      this.totalPages = response.data.totalPages;
      this.loading = false;
    } catch (error) {
      console.error("Error fetching tests:", error);
      this.setLoading(false);
    }
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
    const confirmed = await this.showConfirm(
      `Are you sure you want to delete ${test.fullName}?`
    );
    if (confirmed) {
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };
      axios
        .delete(`http://localhost:8080/api/tests/${test.testId}`, { headers })
        .then((response) => {
          if (response.status === 200) {
            const updatedTests = this.tests.filter(
              (t) => t.testId !== test.testId
            );
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
}

export const testStore = new TestStore();
