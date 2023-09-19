import { loginstore } from "../../Store/LoginStore/LoginStore";

export const validateForm = () => {
  const { username, password } = loginstore.formFields;
  loginstore.setError("username", "");
  loginstore.setError("password", "");
  if (!username) {
    loginstore.setError("username", "Please Enter Your Name");
    return false;
  }

  if (!password) {
    loginstore.setError("password", "Please Enter Your Password");
    return false;
  }
  return true;
};
