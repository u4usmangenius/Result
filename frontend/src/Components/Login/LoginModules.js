import axios from "axios";
import { loginstore } from "../../Store/LoginStore/LoginStore";
import { useEffect } from "react";
import jwt_decode from "jwt-decode";

export const handleLogin = async () => {
  const { formFields } = loginstore;

  const data = {
    username: formFields.username,
    password: formFields.password,
  };

  try {
    const response = await axios.post("http://localhost:8080/api/login", data);

    if (response.data.success) {
      const bearerToken = `Bearer ${response.data.token}`;
      localStorage.setItem("bearer token", bearerToken); // Store the bearer token in localStorage
      localStorage.setItem("user", response.data.username);

      const decodedToken = jwt_decode(response.data.token);
      const tokenExpiration = decodedToken.exp; // Expiration time in seconds

      localStorage.setItem("tokenExpiration", tokenExpiration);

      // const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      // const timeUntilExpiration = tokenExpiration - currentTime;

      // setTimeout(() => {
      //   // Clear local storage and log out when the token expires
      //   localStorage.removeItem("auth");
      //   localStorage.removeItem("user");
      //   localStorage.removeItem("tokenExpiration");
      // }, timeUntilExpiration * 1000); // Convert time to milliseconds
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error:", error);
    return false; // An error occurred
  }
};

