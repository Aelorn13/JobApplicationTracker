import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApplications } from "../hooks/useApplications";
import { STATUS_OPTIONS } from "../constants";
import ApplicationCard from "../components/ApplicationCard";
import ApplicationForm from "../components/ApplicationForm";
import JobParser from "../components/JobParser";
import StatusSummary from "../components/StatusSummary";

export default function ApplicationsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const addFormRef = useRef(null);

  const {
    applications,
    rawApplications,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    setError,
    filterStatus,
    setFilterStatus,
    addApplication,
    deleteApplication,
    updateApplication,
    sortBy,
    setSortBy,
  } = useApplications();

  const [editingApp, setEditingApp] = useState(null);
  const [parsedData, setParsedData] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleParsed = (data) => {
    setParsedData(data);
    addFormRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAdd = async (payload) => {
    try {
      await addApplication(payload);
      setParsedData(null);
    } catch {
      setError("Failed to add application.");
      throw new Error("add failed");
    }
  };

  const handleEdit = async (payload) => {
    try {
      await updateApplication(editingApp.id, payload, filterStatus);
      setEditingApp(null);
    } catch {
      setError("Failed to update application.");
      throw new Error("edit failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteApplication(id);
    } catch {
      setError("Failed to delete application.");
    }
  };

  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Job Applications</h2>
        <button onClick={handleLogout}>Logout</button>
      </header>

      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
      <StatusSummary applications={rawApplications} />

      <JobParser onParsed={handleParsed} />

      <section ref={addFormRef} style={{ marginBottom: "20px" }}>
        <h3>Add New Application</h3>
        <ApplicationForm initialData={parsedData} onSubmit={handleAdd} isEditMode={false} />
      </section>

      <section style={{ marginBottom: "20px", display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <label htmlFor="filterStatus" style={{ marginRight: "10px" }}>
            Filter by Status:
          </label>
          <select id="filterStatus" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.replace(/([A-Z])/g, " $1").trim()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sortBy" style={{ marginRight: "10px" }}>
            Sort by:
          </label>
          <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="status">Status (default)</option>
            <option value="date_desc">Date (newest first)</option>
            <option value="date_asc">Date (oldest first)</option>
            <option value="company">Company (A-Z)</option>
            <option value="salary">Salary (highest first)</option>
          </select>
        </div>
        <div>
          <input
            type="text"
            placeholder="Search by company or position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: "4px 8px", minWidth: "250px" }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} style={{ marginLeft: "6px" }}>
              ✕
            </button>
          )}
        </div>
      </section>

      <section>
        <h3>
          Your Applications
          {searchQuery && (
            <span style={{ fontSize: "14px", fontWeight: "normal", color: "#666", marginLeft: "10px" }}>
              {applications.length} result{applications.length !== 1 ? "s" : ""} for "{searchQuery}"
            </span>
          )}
        </h3>
        {isLoading ? (
          <p>Loading applications...</p>
        ) : applications.length === 0 ? (
          <p>No applications found.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {applications.map((app) => (
              <li key={app.id} style={{ border: "1px solid #ccc", margin: "10px 0", padding: "15px" }}>
                {editingApp?.id === app.id ? (
                  <ApplicationForm
                    key={editingApp.id}
                    initialData={editingApp}
                    onSubmit={handleEdit}
                    onCancel={() => setEditingApp(null)}
                    isEditMode={true}
                  />
                ) : (
                  <ApplicationCard app={app} onEdit={() => setEditingApp(app)} onDelete={handleDelete} />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
