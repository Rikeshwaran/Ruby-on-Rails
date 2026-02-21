import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";




import Login from "./auth/Login";
import Register from "./auth/Register";
import AdminMainRoute from "./admin/AdminMain";
import StoreOwnerMainRoute from "./storeowner/StoreOwnerMain";
import UserMainRoute from "./user/UserMain";

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.clear();
      return <Navigate to="/login" replace />;
    }
    if (allowedRole && decoded.role !== allowedRole) {
      return <Navigate to="/login" replace />;
    }
    return children;
  } catch (error) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }
}

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const decoded = jwtDecode(token);
      if (decoded.role === "admin") return <Navigate to="/admin" replace />;
      if (decoded.role === "storeowner") return <Navigate to="/storeowner" replace />;
      return <Navigate to="/user" replace />;

    } catch {
      localStorage.clear();
    }
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminMainRoute />
            </ProtectedRoute>
          }
        />

        <Route
          path="/storeowner/*"
          element={
            <ProtectedRoute allowedRole="storeowner">
              <StoreOwnerMainRoute />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/*"
          element={
            <ProtectedRoute allowedRole="user">
              <UserMainRoute />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </Router>
  );
}

export default App;