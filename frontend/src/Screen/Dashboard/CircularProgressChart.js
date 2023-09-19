import React from "react";
import Circle from "react-circle";
import "./CircularProgressChart.css"
const CircularProgressChart = ({ percentage, passed, failed }) => {
  const completedText = `${percentage}% completed`;
  const passedText = `${passed} passed`;
  const failedText = `${failed} failed`;

  // Define a color for failed students (e.g., red)
  const failedColor = "#FF0000"; // Red color

  // Set the progressColor conditionally based on the percentage
  const progressColor = percentage >= 50 ? "#00CDEF" : failedColor;

  return (
    <div className="circular-progress-chart">
      <h2 className="chart-heading">Progress Circle</h2>
      <div className="chart-container">
        <Circle
          animate={true}
          animationDuration="2s"
          responsive={false}
          size={200}
          lineWidth={35}
          progress={percentage}
          progressColor={progressColor} // Use the conditional color
          bgColor="#2232FF" // Blue
          roundedStroke={true}
          showPercentage={true}
          textColor="#22acbb"
          textStyle={{
            fontSize: "44px",
            fontWeight: "bold",
            fontFamily: "Arial, sans-serif",
          }}
        />
      </div>
      {/* <div className="status-text">{completedText}</div>
      <div className="result-text">
        {passedText}
        <br />
        {failedText}
      </div> */}
    </div>
  );
};

export default CircularProgressChart;
