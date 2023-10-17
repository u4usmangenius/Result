import React, { useEffect, useState } from "react";
import { IoMdTrash } from "react-icons/io";
import { BiEditAlt } from "react-icons/bi";
import { observer } from "mobx-react";
import { studentsStore } from "../../store/studentsStore/studentsStore";
import LoadingSpinner from "../../components/loaders/Spinner";
import "../styles/FormList.css";
import { addstudentStore } from "../../store/studentsStore/AddstudentsStore";
import { FaChartBar } from "react-icons/fa";

const StudentList = ({ openAddstudentsModal, openReportModal }) => {
  const [studentSubjects, setStudentSubjects] = useState({});
  const { FiltreClassName, filteredstudents } = { ...studentsStore };
  useEffect(() => {
    // Fetch student subjects when the component mounts
    const fetchStudentSubjects = async (studentId) => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/students/${studentId}/subjects`
        );

        if (response.ok) {
          const subjects = await response.json();
          setStudentSubjects((prev) => ({ ...prev, [studentId]: subjects }));
        } else {
          console.error("Failed to fetch subjects for student");
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    // Iterate over your students and fetch subjects for each student
    studentsStore.filteredstudents.forEach((student) => {
      fetchStudentSubjects(student.studentId);
    });
  }, [studentsStore.filteredstudents]);

  useEffect(() => {
    if (studentsStore.FiltreClassName !== "") {
      studentsStore.getDataByClassName();
    } else {
      studentsStore.fetchData();
    }
  }, [FiltreClassName]);

  useEffect(() => {
    const fetchData = async () => {
      studentsStore.setLoading(true);
      try {
        await studentsStore.fetchData();
        studentsStore.setDataNotFound(false);
      } catch (error) {
        console.error("Error fetching students:", error);
        studentsStore.setDataNotFound(true);
      } finally {
        studentsStore.setLoading(false);
      }
    };
    // Fetch data when the component mounts
    fetchData();
  }, []);
  const handleEdit = (student) => {
    const subjects = studentSubjects[student.studentId];
    addstudentStore.setStudentData(student, subjects);
    openAddstudentsModal();
  };
  const handleDelete = (student) => {
    studentsStore.handleDelete(student);
  };
  const handlePrevPage = () => {
    if (studentsStore.currentPage > 1) {
      studentsStore.setCurrentPage(studentsStore.currentPage - 1);
      studentsStore.fetchData();
    }
  };

  const handleNextPage = () => {
    if (
      studentsStore.currentPage < studentsStore.totalPages &&
      !studentsStore.loading
    ) {
      studentsStore.setCurrentPage(studentsStore.currentPage + 1);
      studentsStore.fetchData();
    }
  };
  const handleGetReportByStudent = async (student) => {
    studentsStore.getReportByStudent(student);
    openReportModal();
  };

  return (
    <div className="Form-list-container">
      <div className="Formlist-align-filtre-pagebtn">
        <div className="Form-search-bar">
          <select
            className="Form-filter-ClassName"
            value={studentsStore.FiltreClassName}
            onChange={(e) => (studentsStore.FiltreClassName = e.target.value)}
          >
            <option value="">Show All</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
          </select>
        </div>
      </div>

      <div className="FormList-table">
        {studentsStore.loading ? (
          <LoadingSpinner />
        ) : studentsStore.dataNotFound ? (
          <div>No data found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>ClassName</th>
                <th>Std.PhoneNo</th>
                <th>Guardian PhoneNo</th>
                <th>Gender</th>
                <th>Batch</th>
                <th>Subjects</th>
                <th>Reports</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {studentsStore.filteredstudents.map((student) => (
                <tr key={student.studentId}>
                  <td>{student.stdRollNo}</td>
                  <td>{student.fullName}</td>
                  <td>{student.className}</td>
                  <td>{student.stdPhone}</td>
                  <td>{student.guard_Phone}</td>
                  <td>{student.gender}</td>
                  <td>{student.Batch}</td>
                  <td>
                    <div
                      className={`FormList-dropdown ${
                        studentSubjects[student.studentId] ? "above" : ""
                      }`}
                    >
                      {/* <span className="FormList-Form-label">Subjects</span> */}
                      <div className="FormList-list">
                        {studentSubjects[student.studentId] ? (
                          studentSubjects[student.studentId].map(
                            (subject, index) => (
                              <div key={index} className="FormList-list-item">
                                {subject}
                              </div>
                            )
                          )
                        ) : (
                          <div>Loading subjects...</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td onClick={() => handleGetReportByStudent(student)}>
                    <div className="FormList-edit-icon">
                      <FaChartBar className="FormList-edit-icons" />
                    </div>
                  </td>

                  {/* <td>Report</td> */}

                  <td className="FormList-edit-icon">
                    <div
                      onClick={() => handleEdit(student)}
                      className="FormList-edit-icons"
                    >
                      <BiEditAlt className="FormList-edit-icons" />
                    </div>
                    <IoMdTrash
                      onClick={() => handleDelete(student)}
                      className="FormList-delete-icon"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="FormList-pagination-header">
          <button
            className="FormList-pagination-button"
            onClick={handlePrevPage}
            disabled={studentsStore.currentPage === 1 || studentsStore.loading}
          >
            Prev
          </button>
          <div className="page-count">{studentsStore.currentPage}</div>
          <button
            className="FormList-pagination-button"
            onClick={handleNextPage}
            disabled={
              studentsStore.currentPage === studentsStore.totalPages ||
              studentsStore.loading
            }
          >
            Next
          </button>
        </div>{" "}
      </div>
    </div>
  );
};

export default observer(StudentList);
