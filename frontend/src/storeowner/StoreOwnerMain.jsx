import { Routes, Route, useNavigate } from "react-router-dom";
import StoreOwnerDashboard from "./StoreOwnerDashboard";

export default function StoreOwnerMainRoute() {
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
          <span className="navbar-brand">Store Owner Panel</span>
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
        <div className="col">
          <Routes>
            <Route path="/" element={<StoreOwnerDashboard />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}