// teststore.js
import { makeObservable, observable, action, computed } from "mobx";
import axios from "axios";
import Swal from "sweetalert2";
import { addTestStore } from "./AddTestStore";

class TestStore {
  currentPage = 1;
  rowsPerPage = 5;
  searchText = "";
  selectedFilter = "all";
  tests = [];
  showEditModal = false;
  editingTest = null;
  loading = false;
  isLoading = false;
  dataNotFound = false;
  totalPages = 1;
  mouseHover = false;
  FiltreClassName = "";

  constructor() {
    makeObservable(this, {
      currentPage: observable,
      rowsPerPage: observable,
      searchText: observable,
      selectedFilter: observable,
      FiltreClassName: observable,
      tests: observable,
      showEditModal: observable,
      editingTest: observable,
      mouseHover: observable,
      loading: observable,
      isLoading: observable,
      dataNotFound: observable,
      totalPages: observable,
      filteredTests: computed,
      getCurrentPageData: computed,
      getDataByClassName: action,
      setrowsPerPage: action,
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
  async getDataByClassName() {
    const ClassName = this.FiltreClassName;
    try {
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };
      const response = await axios.post(
        "http://localhost:8080/api/tests/ClassName",
        { ClassName },
        {
          headers,
        }
      );

      if (response.status === 200) {
        this.setTests(response.data.data);
      } else {
        console.error("Error:", response.data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
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
    this.FiltreClassName = false;
  }

  setSelectedFilter(filter) {
    this.selectedFilter = filter;
  }

  setrowsPerPage(page) {
    this.rowsPerPage = page;
    this.fetchDataFromBackend();
    console.log(this.rowsPerPage);
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

  setTests(tests) {
    this.tests = tests;
  }

  setTotalPages(totalPages) {
    this.totalPages = totalPages;
  }
  setDataNotFound(dataNotFound) {
    this.dataNotFound = dataNotFound;
  }
  setLoading(isLoading) {
    this.loading = isLoading;
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

  handleSaveEdit() {
    const testsInfo = {
      TestName: addTestStore.formData.TestName,
      SubjectName: addTestStore.formData.SubjectName,
      ClassName: addTestStore.formData.ClassName,
      TotalMarks: addTestStore.formData.TotalMarks,
    };
    const testId = addTestStore.testId;
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };
    axios
      .put(
        `http://localhost:8080/api/tests/${testId}`,
        {
          TestName: testsInfo.TestName,
          ClassName: testsInfo.ClassName,
          SubjectName: testsInfo.SubjectName,
          TotalMarks: testsInfo.TotalMarks,
        },
        {
          headers,
        }
      )
      .then((response) => {
        if (response.status === 200) {
          const editedTestIndex = this.tests.findIndex(
            (t) => t.testId === testId
          );
          const updatedTests = [...this.tests];
          updatedTests[editedTestIndex] = response.data;
          this.setTests(updatedTests);
          // addTestStore.fetchData();
          addTestStore.showAlert("Updated Successfully...");
          this.fetchDataFromBackend(1);
          addTestStore.clearFormFields();
        }
      })
      .catch((error) => {
        addTestStore.showAlert("Error while Updating...");
        addTestStore.clearFormFields();
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
            addTestStore.showAlert("Test Deleted Successfully..");
          } else {
            console.error("Error deleting test:", response.data.message);
            addTestStore.showAlert("Error while deleting Test..");
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
