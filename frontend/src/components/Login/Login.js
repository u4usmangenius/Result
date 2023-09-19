import React, { useEffect, useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { loginstore } from "../../store/LoginStore/LoginStore";
import { observer } from "mobx-react-lite";
import "./Login.css";
import img from "../../assests/character.png";
import { toJS } from "mobx";
import { handleLogin, handleForgotPassword } from "./LoginModules";
import { Navigate, useNavigate } from "react-router-dom";
import { validateForm } from "./ValidateForm";
import Swal from 'sweetalert2';

const Login = observer(() => {
  const { formFields, setFormField } = loginstore;
  const navigate = useNavigate();
  const showAlert = () => {
    Swal.fire("Invalid credentials");
  }
  useEffect(() => {
    const auth = localStorage.getItem("auth");
    const tokenExpiration = localStorage.getItem("tokenExpiration");
    document.getElementsByTagName('input')[0].focus();

    if (auth) {
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

      // Check if the token has expired
      if (tokenExpiration && currentTime > parseInt(tokenExpiration, 10)) {
        // Token has expired, navigate to the login page
        localStorage.removeItem("auth");
        localStorage.removeItem("user");
        localStorage.removeItem("tokenExpiration");
        navigate("/login"); // Redirect to the login page
      } else {
        // Token is still valid, navigate to the dashboard
        navigate("/sidebar/dashboard");
      }
    }
    console.log("login re rendering");
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    loginstore.setFormField(name, value);
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const loginResult = await handleLogin();
      if (loginResult) {
        window.location.reload();
        if (localStorage) {
          navigate("/sidebar/dashboard");
        }
      } else {
        showAlert();
        return;
      }
    } else {
      console.log(
        "Your Validate Form is not Working, Please fill all the fields"
      );
      return;
    }
  };
  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Welcome Back!</h2>
        <p>Start managing your result faster and better</p>
        <div className="login-input-group">
          <label>UserName</label>
          <div className="login-input-icon">
            <FaUser className="login-profile-icon" />{" "}
            <input
              type="text"
              name="username"
              autoComplete="none"
              value={formFields.username}
              onChange={handleInputChange}
              className="login-input"
              placeholder="Enter Your UserName"
            />
          </div>
          {loginstore.errors.username && (
            <p className="login-error-design">
              {toJS(loginstore.errors).username}
            </p>
          )}
        </div>

        <div className="login-input-group">
          <label>Password</label>
          <div className="login-input-icon">
            <FaLock className="login-lock-icon" />
            <input
              name="password"
              type="password"
              value={formFields.password}
              onChange={handleInputChange}
              className="login-input"
              placeholder="Enter Your Password"
            />
          </div>
          {loginstore.errors.password && (
            <p className="login-error-design">
              {toJS(loginstore.errors).password}
            </p>
          )}
          <p className="login-forgot-password">Forgotten Password?</p>
        </div>

        <button className="login-button" onClick={handleSubmit}>
          Login
        </button>
      </div>

      <div className="login-background-image">
        <img src={img} alt="image"></img>
      </div>
    </div>
  );
});

export default Login;
