import React from "react";
import "./ProgressBar.css";
const CustomProgressBar = ({
  totalStudents,
  passedStudents,
  failedStudents,
}) => {
  const passedPercentage = (passedStudents / totalStudents) * 30;
  const failedPercentage = (failedStudents / totalStudents) * 80;

  return (
    <div className="custom-progress-bar">
      <h2>Progress</h2>
      <div className="progress-container">
        <div className="progress">
          <div
            className="progress-passed"
            style={{ width: `${passedPercentage}%` }}
          ></div>
          <div
            className="progress-failed"
            style={{ width: `${failedPercentage}%` }}
          ></div>
        </div>
      </div>
      <div className="progress-heading">
        {totalStudents} total&nbsp;
        {passedStudents} students passed&nbsp;
        {failedStudents} students failed
      </div>
    </div>
  );
};

export default CustomProgressBar;
