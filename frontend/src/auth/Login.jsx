import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apilink } from "../api/ApiLink";
import { jwtDecode } from "jwt-decode";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  
  const navigate = useNavigate();
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    const query = `
      mutation Login($input: LoginInput!) {
        login(input: $input)
      }
    `;
    try {
      const response = await fetch(apilink, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables: {
            input: form,
          },
        }),
      });
      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }




      const token = result.data.login;
      const decoded = jwtDecode(token);

      localStorage.setItem("token", token);
      localStorage.setItem("role", decoded.role);
      if (decoded.role === "admin") navigate("/admin");
      else if (decoded.role === "storeowner") navigate("/storeowner");
      else navigate("/user");

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="container vh-100 d-flex justify-content-center align-items-center">
      <div className="p-4" style={{ width: "500px" }}>
        <h3 className="text-center m-4">Login</h3>

        <form onSubmit={handleLogin}>
          <div className="m-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter email"
              onChange={handleChange}
              required
            />
          </div>

          <div className="m-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter password"
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{
                width : "90px",
                display : "block",
                margin : "20px auto 0 auto"
            }}>
            Login
          </button>
        </form>

        <div className="text-center mt-3">
          <small>
            Don't have an account?{" "}
            <Link to="/register" className="text-decoration-none">
              Register
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
}

export default Login;