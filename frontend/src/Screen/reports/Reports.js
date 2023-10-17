import React, { useEffect } from "react";
import "./reports.css";
import Header from "../header/Header";
import { reportsStore } from "../../store/ReportStore/ReportsStore";
import ProgressChart from "./ProgressChart";
import "../styles/Charts.css"
const Reports = () => {
  return (
    <>
      <Header />
      <div className="">
        <div className="formlist-header-row" style={{ marginTop: "-30px" }}>
          <h1>Reports</h1>
        </div>
        <div className="ProgressChart">
        <h2>Progress Chart</h2>
        <ProgressChart />
        </div>
      </div>
    </>
  );
};

export default Reports;
