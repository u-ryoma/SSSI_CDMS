import React, { useState, useEffect } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const role = sessionStorage.getItem("role");
    if (role) {
      if (role === "admin" || role === "owner") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/admin/customer", { replace: true });
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.email || !credentials.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem("name", data.name);
        sessionStorage.setItem("username", data.username);

        sessionStorage.setItem("role", data.role);
        sessionStorage.setItem("activeUser", data.username);
        sessionStorage.setItem("activeName", data.name);
        sessionStorage.setItem("userRole", data.role);

        await fetch(`${import.meta.env.VITE_API_URL}/api/heartbeat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: data.username }),
        });

        await fetch(`${import.meta.env.VITE_API_URL}/api/logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: data.username,
            name: data.name,
            role: data.role,
            action: "logged in",
            timestamp: new Date().toISOString(),
          }),
        });

        if (data.role === "admin" || data.role === "owner") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/admin/customer", { replace: true });
        }
      } else {
        setError(data.message || "Invalid email or password.");
      }
    } catch (err) {
      setError("Cannot connect to server.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        <p className="subtitle">Scientific Standard Services</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="login-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={credentials.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="login-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
