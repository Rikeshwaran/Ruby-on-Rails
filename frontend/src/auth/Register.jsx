import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apilink } from "../api/ApiLink";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (form.name.length < 20) {
      newErrors.name = "Name must be at least 20 characters long";
    } else if (form.name.length > 60) {
      newErrors.name = "Name must not exceed 60 characters";
    }




    const emailvalidation = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailvalidation.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }



    const passwordvalidation = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,16})/;
    if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (form.password.length > 16) {
      newErrors.password = "Password must not exceed 16 characters";
    } else if (!passwordvalidation.test(form.password)) {
      newErrors.password = "Password must contain at least 1 uppercase letter and 1 special character (!@#$%^&*)";
    }



    if (form.address && form.address.length > 400) {
      newErrors.address = "Address must not exceed 400 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const query = `
      mutation Register($input: RegisterInput!) {
        register(input: $input)
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

      alert(result.data.register);
      navigate("/login");

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="container vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="p-4" style={{ width: "500px" }}>
        <h3 className="text-center m-4">Create Account</h3>
        <form onSubmit={handleRegister} noValidate>
          <div className="m-3">
            <label className="form-label">Full Name *</label>
            <input
              name="name"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              placeholder="Enter your name (20-60 characters)"
              value={form.name}
              onChange={handleChange}
              required
            />
            {errors.name && (
              <div className="invalid-feedback">{errors.name}</div>
            )}
          </div>
          <div className="m-3">
            <label className="form-label">Email address *</label>
            <input
              name="email"
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="Enter email"
              value={form.email}
              onChange={handleChange}
              required
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </div>



          <div className="m-3">
            <label className="form-label">Password *</label>
            <input
              name="password"
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Enter password (8-16 chars, 1 uppercase, 1 special char)"
              value={form.password}
              onChange={handleChange}
              required
            />
            {errors.password && (
              <div 
              className="invalid-feedback
              ">{errors.password}</div>
            )}
          </div>

          <div className="m-3">
            <label className="form-label">Address</label>
            <textarea
              name="address"
              className={`form-control ${errors.address ? 'is-invalid' : ''}`}
              placeholder="Enter address (max 400 characters)"
              value={form.address}
              onChange={handleChange}
              rows="3"
            />
            {errors.address && (
              <div className="invalid-feedback">{errors.address}</div>
            )}
            <small className="text-muted">
              {form.address.length}/400
            </small>
          </div>

          <button 
            type="submit" 
            className="btn btn-success"
            style={{
              width: "120px",
              display: "block",
              margin: "20px auto 0 auto"
            }}
          >
            Register
          </button>
        </form>

        <div className="text-center mt-3">
          <small>
            Already have an account?{" "}
            <Link to="/login" className="text-decoration-none">
              Login
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
}

export default Register;