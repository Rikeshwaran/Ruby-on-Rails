import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apilink } from "../api/ApiLink";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalUsersSubmittedRating: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const usersQuery = `
        query GetAllUsers {
          getAllUsers {
            id
            role
          }
        }
      `;
      const usersResponse = await fetch(apilink, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ query: usersQuery })
      });
      const usersData = await usersResponse.json();
      const storesQuery = `
        query GetAllStores {
          getAllStores {
            id
          }
        }
      `;
      const storesResponse = await fetch(apilink, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ query: storesQuery })
      });
      const storesData = await storesResponse.json();

      const users = usersData.data?.getAllUsers || [];
      let uniqueUsersWithRatings = new Set();
      for (const user of users) {
        const ratingsQuery = `
          query GetUserRatings($userId: Int!) {
            getUserRatings(userId: $userId) {
              id
            }
          }
        `;

        const ratingsResponse = await fetch(apilink, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ 
            query: ratingsQuery,
            variables: { userId: parseInt(user.id) }
          })
        });
        const ratingsData = await ratingsResponse.json();
        
        if (ratingsData.data?.getUserRatings?.length > 0) {
          uniqueUsersWithRatings.add(user.id);
        }
      }
      setStats({
        totalUsers: users.length,
        totalStores: storesData.data?.getAllStores?.length || 0,
        totalUsersSubmittedRating: uniqueUsersWithRatings.size
      });

    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Admin Dashboard</h2>
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Total Users</h5>
              <h2>{stats.totalUsers}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Total Stores</h5>
              <h2>{stats.totalStores}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Users Submitted Rating</h5>
              <h2>{stats.totalUsersSubmittedRating}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;