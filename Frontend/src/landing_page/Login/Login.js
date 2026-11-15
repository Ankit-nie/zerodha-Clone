import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const Login = () => {
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
  });
  const { email, password } = inputValue;

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
  };

  const handleError = (err) =>
    toast.error(err, { position: "bottom-left" });
  const handleSuccess = (msg) =>
    toast.success(msg, { position: "bottom-left" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isLocal = window.location.hostname === "localhost";
    const backendUrl = isLocal
      ? "http://localhost:3002"
      : "https://zerodha-backend-7kup.onrender.com";
    const dashboardUrl = isLocal
      ? "http://localhost:3001"
      : "https://zerodha-dashboard-3fwn.onrender.com";

    try {
      const { data } = await axios.post(
        `${backendUrl}/login`,
        { ...inputValue },
        { withCredentials: true }
      );
      const { success, message, user } = data;
      if (success) {
        handleSuccess(message);
        const params = new URLSearchParams({
          username: user?.username || email.split("@")[0],
          email: user?.email || email,
        }).toString();
        setTimeout(() => {
          window.location.href = `${dashboardUrl}?${params}`;
        }, 1000);
      } else {
        handleError(message);
      }
    } catch (error) {
      console.log(error);
      handleError(
        error.response?.data?.message ||
          "Cannot connect to server (it may be waking up, try again in 30s)"
      );
    }
    setInputValue({
      email: "",
      password: "",
    });
  };

  return (
    <div className="auth_wrapper">
      <div className="form_container">
        <h2>Login Account</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              placeholder="Enter your email"
              onChange={handleOnChange}
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              placeholder="Enter your password"
              onChange={handleOnChange}
            />
          </div>
          <button type="submit">Submit</button>
          <span>
            Already have an account? <Link to={"/signup"}>Signup</Link>
          </span>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Login;
