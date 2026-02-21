import { Routes, Route, useNavigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminStores from "./AdminStores";

export default function AdminMainRoute() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="container-fluid">
      <nav className="navbar navbar-expand-lg mb-4"
        style={{ 
          backgroundColor: "#18bfce"
        }}>
        <div className="container-fluid">
          <span className="navbar-brand text-white">Admin Panel</span>
          <div className="navbar-nav ms-auto">
            <button 
              className="btn btn-outline-light" 
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="row">
        <div className="col-m-2 mb-5">
          <div className="list-group d-flex">
            <a href="/admin" className="list-group-item list-group-item-action">
              Dashboard
            </a>
            <a href="/admin/users" className="list-group-item list-group-item-action">
              Users
            </a>
            <a href="/admin/stores" className="list-group-item list-group-item-action">
              Stores
            </a>
          </div>
        </div>

        <div className="">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/stores" element={<AdminStores />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}