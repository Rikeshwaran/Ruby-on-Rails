import { useState, useEffect } from "react";
import { apilink } from "../api/ApiLink";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [storeRatings, setStoreRatings] = useState({});
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: ""
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "user"
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [filters, users]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const query = `
        query GetAllUsers {
          getAllUsers {
            id
            name
            email
            address
            role
            status
          }
        }
      `;

      const response = await fetch(apilink, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      const usersData = data.data?.getAllUsers || [];
      setUsers(usersData);
      await fetchStoreOwnersRatings(usersData);
    } catch (error) {
      alert("Error fetching users: " + error.message);
    }
  };

  const fetchStoreOwnersRatings = async (users) => {
    try {
      const token = localStorage.getItem("token");
      const storeOwners = users.filter(user => user.role === "storeowner");
      const ratingsMap = {};
      const storesQuery = `
        query GetAllStores {
          getAllStores {
            id
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
      const allStores = storesData.data?.getAllStores || [];
      for (const owner of storeOwners) {
        const ownerStores = allStores.filter(store => store.ownerId === owner.id);
        let totalRating = 0;
        let ratingCount = 0;
        const usersQuery = `
          query GetAllUsers {
            getAllUsers {
              id
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
        const allUsers = usersData.data?.getAllUsers || [];

        for (const store of ownerStores) {
          for (const user of allUsers) {
            const ratingQuery = `
              query GetUserRatings($userId: Int!) {
                getUserRatings(userId: $userId) {
                  rating
                  storeId
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
                variables: { userId: parseInt(user.id) }
              })
            });
            const ratingData = await ratingResponse.json();
            
            if (!ratingData.errors) {
              const ratings = ratingData.data?.getUserRatings || [];
              ratings.forEach(r => {
                if (r.storeId === store.id) {
                  totalRating += r.rating;
                  ratingCount++;
                }
              });
            }
          }
        }

        if (ratingCount > 0) {
          ratingsMap[owner.id] = (totalRating / ratingCount).toFixed(1);
        } else {
          ratingsMap[owner.id] = "No ratings";
        }
      }
      
      setStoreRatings(ratingsMap);
    } catch (error) {
      console.error("Error fetching store owner ratings:", error);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];
    
    if (filters.name) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.email) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }
    if (filters.address) {
      filtered = filtered.filter(user => 
        user.address?.toLowerCase().includes(filters.address.toLowerCase())
      );
    }
    if (filters.role) {
      filtered = filtered.filter(user => 
        user.role.toLowerCase().includes(filters.role.toLowerCase())
      );
    }
    
    setFilteredUsers(filtered);
  };

  const validateForm = () => {
    if (formData.name.length < 20 || formData.name.length > 60) {
      alert("Name must be between 20 and 60 characters");
      return false;
    }
    if (formData.address && formData.address.length > 400) {
      alert("Address must not exceed 400 characters");
      return false;
    }
    if (!formData.password) {
      alert("Password is required");
      return false;
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,16})/;
    if (!passwordRegex.test(formData.password)) {
      alert("Password must be 8-16 characters with at least 1 uppercase and 1 special character");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const mutation = `
        mutation CreateUser($input: UserInput!) {
          createUser(input: $input) {
            id
            name
            email
            address
            role
            status
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
          variables: { input: formData }
        })
      });
      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      alert("User created successfully!");
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      alert("Error creating user: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      address: "",
      role: "user"
    });
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Users</h2>
        <button 
          className="btn"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          style={{
            border: "1px solid #000000",
            backgroundColor: "#ffffff",
            color: "#000000",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#000000";
            e.target.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#ffffff";
            e.target.style.color = "#000000";
          }}
        >
          Add New User
        </button>
      </div>
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Filters</h5>
          <div className="row">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Filter by Name"
                value={filters.name}
                onChange={(e) => setFilters({...filters, name: e.target.value})}
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Filter by Email"
                value={filters.email}
                onChange={(e) => setFilters({...filters, email: e.target.value})}
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Filter by Address"
                value={filters.address}
                onChange={(e) => setFilters({...filters, address: e.target.value})}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-control"
                value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value})}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="storeowner">Store Owner</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="thead-dark">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Role</th>
              <th>Rating (Store Owners only)</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.address || '-'}</td>
                <td>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</td>  
                <td>
                  {user.role === 'storeowner' ? (
                    <span >
                      {storeRatings[user.id] || 'No ratings'}
                    </span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New User</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                    <small className="text-muted">Min 20, Max 60 characters</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                    <small className="text-muted">8-16 chars, 1 uppercase, 1 special char</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <textarea
                      className="form-control"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      rows="2"
                    />
                    <small className="text-muted">Max 400 characters</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role *</label>
                    <select
                      className="form-control"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      required
                    >
                      <option value="user">User</option>
                      <option value="storeowner">Store Owner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleCreateUser}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;