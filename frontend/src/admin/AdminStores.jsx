import { useState, useEffect } from "react";
import { apilink } from "../api/ApiLink";

function AdminStores() {
  const [stores, setStores] = useState([]);
  const [storeOwners, setStoreOwners] = useState([]);
  const [availableOwners, setAvailableOwners] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [showModal, setShowModal] = useState(false);




  const [filters, setFilters] = useState({
    name: "",
    email: "",
    address: "",
    rating: ""
  });
  const [storeRatings, setStoreRatings] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    ownerId: ""
  });


  const [assignedOwners, setAssignedOwners] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStores();
    fetchStoreOwners();
  }, []);

  useEffect(() => {
    filterStores();
  }, [filters, stores]);

  useEffect(() => {
    const available = storeOwners.filter(owner => !assignedOwners[owner.id]);
    setAvailableOwners(available);
  }, [storeOwners, assignedOwners]);

  const fetchStoreOwners = async () => {
    try {
      const token = localStorage.getItem("token");
      const query = `
        query GetAllUsers {
          getAllUsers {
            id
            name
            email
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
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }
      const owners = data.data?.getAllUsers?.filter(user => user.role === "storeowner") || [];
      setStoreOwners(owners);
      
    } catch (error) {
      console.error("Error fetching store owners:", error);
    }
  };

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem("token");
      const query = `
        query GetAllStores {
          getAllStores {
            id
            name
            email
            address
            ownerId
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

      const storesData = data.data?.getAllStores || [];
      setStores(storesData);
      const assignedMap = {};
      storesData.forEach(store => {
        if (store.ownerId) {
          assignedMap[store.ownerId] = store.id;
        }
      });
      setAssignedOwners(assignedMap);
      await fetchStoreRatings(storesData);
    } catch (error) {
      alert("Error fetching stores: " + error.message);
    }
  };

  const fetchStoreRatings = async (stores) => {
    try {
      const token = localStorage.getItem("token");
      const ratingsMap = {};

      for (const store of stores) {
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
        const users = usersData.data?.getAllUsers || [];
        let totalRating = 0;
        let ratingCount = 0;

        for (const user of users) {
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

        if (ratingCount > 0) {
          ratingsMap[store.id] = (totalRating / ratingCount).toFixed(1);
        } else {
          ratingsMap[store.id] = "No ratings";
        }
      }
      
      setStoreRatings(ratingsMap);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  const filterStores = () => {
    let filtered = [...stores];
    if (filters.name) {
      filtered = filtered.filter(store => 
        store.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.email) {
      filtered = filtered.filter(store => 
        store.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }
    if (filters.address) {
      filtered = filtered.filter(store => 
        store.address?.toLowerCase().includes(filters.address.toLowerCase())
      );
    }
    if (filters.rating) {
      filtered = filtered.filter(store => {
        const rating = storeRatings[store.id];
        if (rating === "No ratings") return false;
        return rating && rating.includes(filters.rating);
      });
    }
    
    setFilteredStores(filtered);
  };

  const validateForm = () => {
    if (formData.name.length < 20 || formData.name.length > 60) {
      alert("Store name must be between 20 and 60 characters");
      return false;
    }
    if (formData.address && formData.address.length > 400) {
      alert("Address must not exceed 400 characters");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address");
      return false;
    }
    if (!formData.ownerId) {
      alert("Please select a store owner");
      return false;
    }
    return true;
  };

  const handleCreateStore = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const mutation = `
        mutation CreateStore($input: StoreInput!) {
          createStore(input: $input) {
            id
            name
            email
            address
            ownerId
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
          variables: { 
            input: {
              name: formData.name,
              email: formData.email,
              address: formData.address,
              ownerId: parseInt(formData.ownerId)
            }
          }
        })
      });
      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }
      alert("Store created successfully!");
      setShowModal(false);
      resetForm();
      await fetchStores();
      await fetchStoreOwners();
    } catch (error) {
      alert("Error creating store: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      address: "",
      ownerId: ""
    });
  };

  const getOwnerName = (ownerId) => {
    const owner = storeOwners.find(o => o.id === ownerId);
    return owner ? owner.name : 'Unknown';
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Stores</h2>
        <button 
          className="btn "
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
          Add New Store
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
              <input
                type="text"
                className="form-control"
                placeholder="Filter by Rating"
                value={filters.rating}
                onChange={(e) => setFilters({...filters, rating: e.target.value})}
              />
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
              <th>Store Owner</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {filteredStores.map(store => (
              <tr key={store.id}>
                <td>{store.name}</td>
                <td>{store.email}</td>
                <td>{store.address || '-'}</td>
                <td>{getOwnerName(store.ownerId)}</td>
                <td>{storeRatings[store.id] || 'Loading...'}</td>
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
                <h5 className="modal-title">Add New Store</h5>
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
                    <label className="form-label">Store Owner *</label>
                    <select
                      className="form-control"
                      value={formData.ownerId}
                      onChange={(e) => setFormData({...formData, ownerId: e.target.value})}
                      required
                    >
                      <option value="">Select Store Owner</option>
                      {availableOwners.map(owner => (
                        <option key={owner.id} value={owner.id}>
                          {owner.name} ({owner.email})
                        </option>
                      ))}
                    </select>
                    <small className="text-muted">Only owners without any store are shown</small>
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
                  onClick={handleCreateStore}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Store'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStores;