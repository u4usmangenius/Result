// ResultStore.js
import { makeObservable, observable, action, computed } from "mobx";
import axios from "axios";
import Swal from "sweetalert2";

class ResultStore {
  currentPage = 1;
  rowsPerPage = 5;
  searchText = "";
  selectedFilter = "all";
  results = [];
  showEditModal = false;
  editingResult = null;
  loading = false;
  totalPages = 1;
  downloadingPdf = false;
  constructor() {
    makeObservable(this, {
      currentPage: observable,
      rowsPerPage: observable,
      searchText: observable,
      selectedFilter: observable,
      results: observable,
      showEditModal: observable,
      editingResult: observable,
      loading: observable,
      totalPages: observable,
      filteredResults: computed,
      getCurrentPageData: computed,
      handleSearch: action,
      setSearchText: action,
      setSelectedFilter: action,
      setCurrentPage: action,
      setShowEditModal: action,
      setEditingResult: action,
      setLoading: action,
      setResults: action,
      setTotalPages: action,
      fetchDataFromBackend: action,
      handleEdit: action,
      handleSaveEdit: action,
      handleCancelEdit: action,
      handleDelete: action,
      showConfirm: action,
      downloadPdf: action,
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
        "http://localhost:8080/api/results/search",
        {
          searchText: this.searchText,
          selectedFilter: this.selectedFilter,
        },
        {
          headers,
        }
      );

      if (response.data.success) {
        this.results = response.data.results;
      } else {
        console.error("Error searching results:", response.data.message);
      }
    } catch (error) {
      console.error("Error searching results:", error);
    } finally {
      this.setLoading(false);
    }
  };

  get filteredResults() {
    const searchTextLower = this.searchText?.toLowerCase();
    return this.results.filter((result) => {
      if (this.selectedFilter === "all") {
        return (
          (result.fullName &&
            result.fullName.toLowerCase().includes(searchTextLower)) ||
          (result.stdRollNo &&
            result.stdRollNo.toLowerCase().includes(searchTextLower)) ||
          (result.TestName &&
            result.TestName.toLowerCase().includes(searchTextLower)) ||
          (result.SubjectName &&
            result.SubjectName.toLowerCase().includes(searchTextLower)) ||
          (result.ClassName &&
            result.ClassName.toLowerCase().includes(searchTextLower)) ||
          (result.Batch &&
            result.Batch.toLowerCase().includes(searchTextLower)) ||
          (result.TotalMarks &&
            result.TotalMarks.toLowerCase().includes(searchTextLower)) ||
          (result.ObtainedMarks &&
            result.ObtainedMarks.toString()
              .toLowerCase()
              .includes(searchTextLower))
        );
      } else {
        return (
          result[this.selectedFilter] &&
          result[this.selectedFilter].toLowerCase().includes(searchTextLower)
        );
      }
    });
  }
  async fetchDataFromBackend(page) {
    try {
      this.setLoading(true);
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };
      const response = await axios.post(
        "http://localhost:8080/api/result",
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
        this.results = response.data.results;
      } else {
        this.results = [];
        this.results = [...this.results, ...response.data.results];
      }
      this.totalPages = response.data.totalPages;
      this.loading = false;
    } catch (error) {
      console.error("Error fetching results:", error);
      this.setLoading(false);
    }
  }

  get getCurrentPageData() {
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    return this.filteredResults.slice(startIndex, endIndex);
  }

  setSearchText(text) {
    this.searchText = text;
  }

  setSelectedFilter(filter) {
    this.selectedFilter = filter;
  }

  setCurrentPage(page) {
    this.currentPage = page;
    this.searchText = "";
    this.fetchDataFromBackend(1); // Fetch data for the new page
  }

  setShowEditModal(show) {
    this.showEditModal = show;
  }

  setEditingResult(result) {
    this.editingResult = result;
  }

  setLoading(loading) {
    this.loading = loading;
  }

  setResults(results) {
    this.results = results;
  }

  setTotalPages(totalPages) {
    this.totalPages = totalPages;
  }

  handleEdit(result) {
    this.setShowEditModal(true);
    this.setEditingResult(result);
  }

  handleSaveEdit(editedResult) {
    const token = localStorage.getItem("bearer token");
    const headers = {
      Authorization: `${token}`,
    };
    axios
      .put(
        `http://localhost:8080/api/results/${editedResult.resultId}`,
        editedResult,
        {
          headers,
        }
      )
      .then((response) => {
        if (response.status === 200) {
          const editedResultIndex = this.results.findIndex(
            (r) => r.resultId === editedResult.resultId
          );
          const updatedResults = [...this.results];
          updatedResults[editedResultIndex] = response.data;
          this.setResults(updatedResults);
          this.setShowEditModal(false);
          this.fetchDataFromBackend(1);
        }
      })
      .catch((error) => {
        console.error("Error editing result:", error);
      });
  }

  handleCancelEdit() {
    this.setShowEditModal(false);
    this.setEditingResult(null);
  }

  async handleDelete(result) {
    const confirmed = await this.showConfirm(
      `Are you sure you want to delete ${result.fullName}?`
    );
    if (confirmed) {
      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };
      axios
        .delete(`http://localhost:8080/api/results/${result.resultId}`, {
          headers,
        })
        .then((response) => {
          if (response.status === 200) {
            const updatedResults = this.results.filter(
              (r) => r.resultId !== result.resultId
            );
            this.setResults(updatedResults);
            this.fetchDataFromBackend(1);
          } else {
            console.error("Error deleting result:", response.data.message);
          }
        })
        .catch((error) => {
          console.error("Error deleting result:", error);
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
  async downloadPdf(result) {
    try {
      // Set downloadingPdf to true to indicate that a download is in progress
      this.downloadingPdf = true;

      const token = localStorage.getItem("bearer token");
      const headers = {
        Authorization: `${token}`,
      };

      const response = await axios.get(
        `/api/results/download/pdf/${result.stdRollNo}`,
        {
          headers,
          responseType: "blob", // Set the response type to blob
        }
      );

      if (response.status === 200) {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${result.stdRollNo}_results.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // Handle any errors here
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to download PDF",
        });
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while downloading the PDF",
      });
    } finally {
      // Set downloadingPdf back to false when the download is complete or fails
      this.downloadingPdf = false;
    }
  }
}

export const resultStore = new ResultStore();
