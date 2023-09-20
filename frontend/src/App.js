import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import PrivateComponent from "./Components/Privatecomponent/PrivateComponent";
import Home from "./Screen/home/Home";
import Dashboard from "./Screen/dashboard/Dashboard";
import Login from "./Components/Login/Login";
import Error from "./Screen/error/Error";
import "./App.css";
import "./global.css";
import Teachers from "./Screen/teachers/Teachers";
import AddTeachers from "./Screen/teachers/AddTeachers";
import Students from "./Screen/student/Students";
import Subject from "./Screen/subject/Subject";
import Test from "./Screen/test/Test";
import Result from "./Screen/result/Result";
import Setting from "./Screen/setting/Setting";
import Reports from "./Screen/reports/Reports";
import Features from "./Screen/features/Features";
import Sidebar from "./components/Sidebar/Sidebar";
function App() {
  const [auth, setAuth] = useState(localStorage.getItem("bearer token"));
  useEffect(() => {
    const token = localStorage.getItem("bearer token");
    setAuth(token);
    console.log("re rendering")
  }, []);
  return (
    <div>
      <Routes>
        {auth && (
          <Route
            path="/"
            element={<Navigate to="/sidebar/dashboard" replace />}
          />
        )}
        {!auth && <Route path="/" element={<Login />} />}
        {auth && (
          <Route path="sidebar" element={<Sidebar />}>
            <Route path="/sidebar/dashboard" element={<Dashboard />} />
            <Route path="/sidebar/teachers" element={<Teachers />} />
            <Route path="/sidebar/students" element={<Students />} />
            <Route path="/sidebar/subject" element={<Subject />} />
            <Route path="/sidebar/test" element={<Test />} />
            <Route path="/sidebar/result" element={<Result />} />
            <Route path="/sidebar/setting" element={<Setting />} />
            <Route path="/sidebar/reports" element={<Reports />} />
            <Route path="/sidebar/features" element={<Features />} />
            {/* <Route path="/sidebar/add-teachers
            " element={<AddTeachers />} /> */}
            <Route path="/sidebar/home" element={<Home />} />
            <Route path="*" element={<Error />} />
          </Route>
        )}
        {!auth && <Route path="*" element={<Navigate to="/" />} />}
      </Routes>
    </div>
  );
}

export default App;
