import { useState, useEffect } from "react";
import { apilink } from "../api/ApiLink";
import { jwtDecode } from "jwt-decode";

function StoreOwnerDashboard() {
  const [stats, setStats] = useState({
    averageRating: 0,
    totalRatings: 0
  });
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [userStore, setUserStore] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const userId = decoded.user_id;

  useEffect(() => {
    fetchUserDetails();
    fetchStoreData();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const query = `
        query GetUser($userId: Int!) {
          getUser(userId: $userId) {
            id
            name
            email
            address
            role
          }
        }
      `;

      const response = await fetch(apilink, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          query,
          variables: { userId: userId }
        })
      });
      const data = await response.json();
      
      if (!data.errors) {
        setCurrentUser(data.data?.getUser);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const fetchStoreData = async () => {
    try {
      const storesQuery = `
        query GetAllStores {
          getAllStores {
            id
            name
            ownerId
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
      
      const store = storesData.data?.getAllStores?.find(s => s.ownerId === userId);
      setUserStore(store);
      
      if (!store) {
        setLoading(false);
        return;
      }
      const usersQuery = `
        query GetAllUsers {
          getAllUsers {
            id
            name
            email
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
      
      const users = usersData.data?.getAllUsers || [];
      const storeRatings = [];
      let totalRating = 0;

      for (const user of users) {
        const ratingQuery = `
          query GetUserRatings($userId: Int!) {
            getUserRatings(userId: $userId) {
              id
              rating
              storeId
              status
            }
          }
        `;

        const ratingResponse = await fetch(apilink, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            query: ratingQuery,
            variables: { userId: user.id }
          })
        });
        const ratingData = await ratingResponse.json();
        
        if (!ratingData.errors) {
          const userRatings = ratingData.data?.getUserRatings || [];
          userRatings.forEach(r => {
            if (r.storeId === store.id) {
              storeRatings.push({
                id: r.id,
                rating: r.rating,
                userName: user.name,
                userEmail: user.email
              });
              totalRating += r.rating;
            }
          });
        }
      }

      setRatings(storeRatings);
      setStats({
        averageRating: storeRatings.length > 0 ? (totalRating / storeRatings.length).toFixed(1) : 0,
        totalRatings: storeRatings.length
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching store data:", error);
      setLoading(false);
    }
  };

  const validatePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match");
      return false;
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,16})/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      alert("Password must be 8-16 characters with at least 1 uppercase and 1 special character");
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    try {
      const mutation = `
        mutation UpdateUser($userId: Int!, $input: UserInput!) {
          updateUser(userId: $userId, input: $input) {
            id
          }
        }
      `;

      const response = await fetch(apilink, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            userId: userId,
            input: { password: passwordData.newPassword }
          }
        })
      });
      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      alert("Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      alert("Error changing password: " + error.message);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="container-fluid">
      <div className="alert alert-info d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">
            Welcome back, <strong>{currentUser?.name || 'Store Owner'}</strong>!
          </h4>
          {currentUser && (
            <small className="text-muted">
              {currentUser.email} • {currentUser.address || 'No address provided'}
            </small>
          )}
        </div>
        <button 
          className="btn btn-outline-secondary"
          onClick={() => setShowPasswordModal(true)}
        >
          Change Password
        </button>
      </div>

      {!userStore ? (
        <div className="text-center mt-5">
          <h3>You don't have a store assigned yet.</h3>
          <p>Please contact the admin to assign a store to you.</p>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>My Store: {userStore.name}</h2>
          </div>

          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card text-dark bg-info">
                <div className="card-body">
                  <h5 className="card-title">Average Rating</h5>
                  <h2>{stats.averageRating} / 5</h2>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card text-dark bg-info">
                <div className="card-body">
                  <h5 className="card-title">Total Ratings Received</h5>
                  <h2>{stats.totalRatings}</h2>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h4>Users Ratings</h4>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>User Name</th>
                      <th>Email</th>
                      <th>Rating Given</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratings.length > 0 ? (
                      ratings.map((rating, index) => (
                        <tr key={index}>
                          <td>{rating.userName}</td>
                          <td>{rating.userEmail}</td>
                          <td>
                            <span>{rating.rating} / 5</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center">
                          No ratings yet for your store
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
      {showPasswordModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Change Password</h5>
                <button type="button" className="btn-close" onClick={() => setShowPasswordModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">New Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      required
                    />
                    <small className="text-muted">8-16 chars, 1 uppercase, 1 special char</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirm Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary" 
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-primary"
                  onClick={handleChangePassword}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoreOwnerDashboard;