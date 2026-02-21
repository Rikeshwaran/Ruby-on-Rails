import { useState, useEffect } from "react";
import { apilink } from "../api/ApiLink";
import { jwtDecode } from "jwt-decode";

function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userRatings, setUserRatings] = useState({});
  const [storeRatings, setStoreRatings] = useState({});
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [showPasswordModal, setShowPasswordModal] = useState(false);


  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);


  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const userId = decoded.user_id;
  useEffect(() => {
    fetchUserDetails();
    fetchData();
  }, []);

  useEffect(() => {
    filterStores();
  }, [searchTerm, stores]);

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

  const fetchData = async () => {
    try {
      const storesQuery = `
        query GetAllStores {
          getAllStores {
            id
            name
            address
            email
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
      setStores(allStores);

      const ratingsQuery = `
        query GetUserRatings($userId: Int!) {
          getUserRatings(userId: $userId) {
            id
            storeId
            rating
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
          variables: { userId: userId }
        })
      });
      const ratingsData = await ratingsResponse.json();
      
      const userRatingMap = {};
      ratingsData.data?.getUserRatings?.forEach(r => {
        userRatingMap[r.storeId] = {
          id: r.id,
          rating: r.rating
        };
      });
      setUserRatings(userRatingMap);
      await fetchOverallRatings(allStores);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const fetchOverallRatings = async (stores) => {
    try {
      const ratingsMap = {};
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

      for (const store of stores) {
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
              variables: { userId: user.id }
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
    if (!searchTerm.trim()) {
      setFilteredStores(stores);
      return;
    }

    const filtered = stores.filter(store => 
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStores(filtered);
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

  const handleSubmitRating = async () => {
    if (ratingValue < 1 || ratingValue > 5) {
      alert("Rating must be between 1 and 5");
      return;
    }

    try {
      const existingRating = userRatings[selectedStore.id];

      let mutation;
      let variables;

      if (existingRating) {
        mutation = `
          mutation UpdateRating($ratingId: Int!, $input: RatingsInput!) {
            updateRating(ratingId: $ratingId, input: $input) {
              id
              rating
              storeId
            }
          }
        `;
        variables = {
          ratingId: existingRating.id,
          input: { rating: ratingValue }
        };
      } else {
        mutation = `
          mutation CreateRating($input: RatingsInput!) {
            createRating(input: $input) {
              id
              rating
              storeId
            }
          }
        `;
        variables = {
          input: {
            storeId: selectedStore.id,
            rating: ratingValue
          }
        };
      }

      const response = await fetch(apilink, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          query: mutation,
          variables: variables
        })
      });
      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      alert(`Rating ${existingRating ? 'updated' : 'submitted'} successfully!`);
      setShowRatingModal(false);
      fetchData();
    } catch (error) {
      alert("Error submitting rating: " + error.message);
    }
  };

  const openRatingModal = (store) => {
    setSelectedStore(store);
    const existingRating = userRatings[store.id];
    setRatingValue(existingRating?.rating || 5);
    setShowRatingModal(true);
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  const StarRating = ({ ratingValue, setRatingValue }) => {
    const [hover, setHover] = useState(null);

    return (
      <div style={{ fontSize: "30px", cursor: "pointer" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => setRatingValue(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
            style={{
              color:
                star <= (hover || ratingValue)
                  ? "#ffc107"
                  : "#e4e5e9",
              transition: "color 0.2s",
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="container-fluid">
      <div className="alert  d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">
            Welcome back, <strong>{currentUser?.name || 'User'}</strong>!
          </h4>
          {currentUser && (
            <small className="text-muted">
              {currentUser.email} - {currentUser.address || 'No address provided'}
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

      <h2>Available Stores</h2>
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search by store name or address"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
              <th>Address</th>
              <th>Overall Rating</th>
              <th>My Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStores.map(store => (
              <tr key={store.id}>
                <td>{store.name}</td>
                <td>{store.address || '-'}</td>
                <td>
                  <span className="">
                    {storeRatings[store.id] || 'No ratings'}
                  </span>
                </td>
                <td>
                  {userRatings[store.id] ? (
                    <span className="">
                      {userRatings[store.id].rating} / 5
                    </span>
                  ) : (
                    <span className="text-muted">Not rated</span>
                  )}
                </td>
                <td>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => openRatingModal(store)}
                  >
                    {userRatings[store.id] ? 'Modify Rating' : 'Submit Rating'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showRatingModal && selectedStore && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {userRatings[selectedStore.id] ? 'Modify' : 'Submit'} Rating for {selectedStore.name}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowRatingModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Rating (1-5) *</label>
                    <StarRating 
                      ratingValue={ratingValue}
                      setRatingValue={setRatingValue}
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary" 
                  onClick={() => setShowRatingModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-primary"
                  onClick={handleSubmitRating}
                >
                  {userRatings[selectedStore.id] ? 'Update' : 'Submit'} Rating
                </button>
              </div>
            </div>
          </div>
        </div>
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

export default UserDashboard;