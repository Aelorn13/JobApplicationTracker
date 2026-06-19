import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ApplicationsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [formData, setFormData] = useState({
    companyName: "",
    position: "",
    status: "Pending",
  });

  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    companyName: "",
    position: "",
    status: "Pending",
  });

  useEffect(() => {
    fetchApplications();
  }, [filterStatus]);

  const fetchApplications = async () => {
    try {
      const url = filterStatus ? `/JobApplications?status=${filterStatus}` : "/JobApplications";
      const response = await api.get(url);

      // Extract the array from the PaginatedResultDto (usually inside 'items' or 'data')
      const applicationsArray = response.data.items || response.data.data || response.data;

      if (Array.isArray(applicationsArray)) {
        setApplications(applicationsArray);
      } else {
        console.error("Backend did not return an array. Check the response structure:", response.data);
        setApplications([]);
      }
    } catch (err) {
      setError("Failed to fetch applications.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Attach today's date to the payload so backend accepts it properly
      const payload = {
        ...formData,
        appliedDate: new Date().toISOString(),
      };
      const response = await api.post("/JobApplications", payload);
      if (!filterStatus || filterStatus === formData.status) {
        setApplications((prev) => [...prev, response.data]);
      }
      setFormData({ companyName: "", position: "", status: "Pending" });
    } catch (err) {
      setError("Failed to add application.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/JobApplications/${id}`);
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (err) {
      setError("Failed to delete application.");
    }
  };

  const handleEditClick = (app) => {
    setEditingId(app.id);
    setEditFormData({
      companyName: app.companyName,
      position: app.position,
      status: app.status,
      appliedDate: app.appliedDate,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.put(`/JobApplications/${editingId}`, {
        ...editFormData,
        appliedDate: editFormData.appliedDate || new Date().toISOString(),
      });

      if (filterStatus && filterStatus !== editFormData.status) {
        setApplications((prev) => prev.filter((app) => app.id !== editingId));
      } else {
        setApplications((prev) => prev.map((app) => (app.id === editingId ? { ...app, ...editFormData } : app)));
      }
      setEditingId(null);
    } catch (err) {
      setError("Failed to update application.");
    }
  };

  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Job Applications</h2>
        <button onClick={handleLogout}>Logout</button>
      </header>

      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

      <section style={{ marginBottom: "20px" }}>
        <h3>Add New Application</h3>
        <form onSubmit={handleAddSubmit} style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            name="companyName"
            placeholder="Company Name"
            value={formData.companyName}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="position"
            placeholder="Position"
            value={formData.position}
            onChange={handleInputChange}
            required
          />
          <select name="status" value={formData.status} onChange={handleInputChange}>
            <option value="Pending">Pending</option>
            <option value="PhoneScreen">Phone Screen</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button type="submit">Submit</button>
        </form>
      </section>

      <section style={{ marginBottom: "20px" }}>
        <label htmlFor="filterStatus" style={{ marginRight: "10px" }}>
          Filter by Status:
        </label>
        <select id="filterStatus" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="PhoneScreen">Phone Screen</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
      </section>

      <section>
        <h3>Your Applications</h3>
        {!Array.isArray(applications) || applications.length === 0 ? (
          <p>No applications found.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {applications.map((app) => (
              <li key={app.id} style={{ border: "1px solid #ccc", margin: "10px 0", padding: "10px" }}>
                {editingId === app.id ? (
                  <form onSubmit={handleEditSubmit} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                      type="text"
                      name="companyName"
                      value={editFormData.companyName}
                      onChange={handleEditChange}
                      required
                    />
                    <input
                      type="text"
                      name="position"
                      value={editFormData.position}
                      onChange={handleEditChange}
                      required
                    />
                    <select name="status" value={editFormData.status} onChange={handleEditChange}>
                      <option value="Pending">Pending</option>
                      <option value="PhoneScreen">Phone Screen</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong>{app.companyName}</strong> - {app.position}
                      <br />
                      <span>Status: {app.status}</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button onClick={() => handleEditClick(app)}>Edit</button>
                      <button onClick={() => handleDelete(app.id)}>Delete</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
