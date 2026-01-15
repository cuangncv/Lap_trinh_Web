import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import { useForm } from "react-hook-form";

export default function LoginRegister({ onLogin }) {
  const [login_name, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signUp, setSignUp] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const navigate = useNavigate();

  async function onSubmit(data) {
    if (data.password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Form submitted:", data);
    const res = await fetch("http://localhost:8080/api/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      alert("Register succesfully");
      setSignUp(false);
      reset();
    } else {
      const err = await res.text();
      alert(err);
    }
  }

  async function handleLogin() {
    if (!login_name || !password) {
      alert("Please fill username and password!");
      return;
    }
    const response = await fetch("http://localhost:8080/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ login_name: login_name, password: password }),
      credentials: "include",
    });
    if (response.ok) {
      const userData = await response.json();
      onLogin(userData);
      navigate(`/user/${userData._id}`);
    } else {
      const err = await response.text();
      alert(err);
    }
  }

  function handleRegister() {
    setSignUp(true);
  }

  function backLogin() {
    setSignUp(false);
  }

  if (signUp) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="register-container">
        <h2 className="form-title">Create Account</h2>

        <div className="grid-2">
          <div className="input-group">
            <input {...register("first_name", { required: true })} required />
            <label>First name</label>
            {errors.first_name && <span className="error">Required</span>}
          </div>

          <div className="input-group">
            <input {...register("last_name", { required: true })} required />
            <label>Last name</label>
            {errors.last_name && <span className="error">Required</span>}
          </div>

          <div className="input-group">
            <input {...register("location", { required: true })} required />
            <label>Location</label>
          </div>

          <div className="input-group">
            <input {...register("occupation", { required: true })} required />
            <label>Occupation</label>
          </div>
        </div>

        <div className="input-group">
          <input {...register("description", { required: true })} required />
          <label>Description</label>
        </div>

        <div className="input-group">
          <input {...register("login_name", { required: true })} required />
          <label>Login name</label>
        </div>

        <div className="input-group">
          <input
            type="password"
            {...register("password", { required: true })}
            required
          />
          <label>Password</label>
        </div>

        <div className="input-group">
          <input
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <label>Confirm password</label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Create Account
          </button>
          <button type="button" className="btn-secondary" onClick={backLogin}>
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="login-container">
      <h2 className="form-title">Login</h2>

      <div className="input-group">
        <input
          type="text"
          required
          onChange={(e) => setLoginName(e.target.value)}
        />
        <label>Username</label>
      </div>

      <div className="input-group">
        <input
          type="password"
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <label>Password</label>
      </div>

      <div className="form-actions">
        <button className="btn-primary" onClick={handleLogin}>
          Login
        </button>
        <button className="btn-secondary" onClick={handleRegister}>
          Register
        </button>
      </div>
    </div>
  );
}
