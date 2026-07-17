import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApplications } from "../hooks/useApplications";
import { STATUS_OPTIONS } from "../constants";
import ApplicationCard from "../components/ApplicationCard";
import ApplicationForm from "../components/ApplicationForm";
import JobParser from "../components/JobParser";
import StatusSummary from "../components/StatusSummary";
import { formatStatus, isStale } from "../utils";
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
    isFetching
  } = useApplications();

  const [editingApp, setEditingApp] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleParsed = (data) => {
    setParsedData(data);
    setIsAddOpen(true);
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
    <div style={{ minHeight: "100vh", background: "var(--bg-page)" }}>
      <header className="header">
        <span className="header-logo">JobTracker</span>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="page-main">
        {error && (
          <div className="alert alert-error" style={{ marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <StatusSummary applications={rawApplications} />

        <JobParser onParsed={handleParsed} />

        {/* Форма добавления */}
        <div ref={addFormRef} className="card" style={{ marginBottom: "20px", overflow: "hidden" }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setIsAddOpen((prev) => !prev)}
            style={{
              width: "100%",
              textAlign: "left",
              borderRadius: 0,
              display: "flex",
              justifyContent: "space-between",
              padding: "14px 16px",
            }}
          >
            <span style={{ fontWeight: 500, fontSize: "14px" }}>+ Add Application</span>
            <span style={{ fontSize: "12px" }}>{isAddOpen ? "▲" : "▼"}</span>
          </button>

          {isAddOpen && (
            <div style={{ padding: "0 16px 16px" }}>
              <ApplicationForm initialData={parsedData} onSubmit={handleAdd} isEditMode={false} />
            </div>
          )}
        </div>

        {/* Фильтры */}
        <div className="filters-row">
          <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>

          <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="status">Sort: Status</option>
            <option value="date_desc">Sort: Newest first</option>
            <option value="date_asc">Sort: Oldest first</option>
            <option value="company">Sort: Company A–Z</option>
            <option value="salary">Sort: Salary</option>
          </select>

          <div className="search-wrap">
            <input
              type="text"
              placeholder="Search company or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="btn btn-secondary btn-sm" onClick={() => setSearchQuery("")} style={{ flexShrink: 0 }}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Список */}
        <div>
          <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px" }}>
            Applications
            {searchQuery && (
              <span style={{ fontSize: "13px", fontWeight: 400, color: "var(--text-secondary)", marginLeft: "8px" }}>
                {applications.length} result{applications.length !== 1 ? "s" : ""} for "{searchQuery}"
              </span>
            )}
          </h2>

          {isLoading ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Loading...</p>
          ) : applications.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>No applications found.</p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                opacity: isFetching ? 0.6 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {applications.map((app) => (
                <div key={app.id}>
                  {editingApp?.id === app.id ? (
                    <div className="card card-md card-active">
                      <ApplicationForm
                        key={editingApp.id}
                        initialData={editingApp}
                        onSubmit={handleEdit}
                        onCancel={() => setEditingApp(null)}
                        isEditMode={true}
                      />
                    </div>
                  ) : (
                    <ApplicationCard app={app} onEdit={() => setEditingApp(app)} onDelete={handleDelete} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
