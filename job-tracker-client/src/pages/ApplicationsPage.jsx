import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const STATUS_OPTIONS = ["Pending", "PhoneScreen", "Interview", "Offer", "Rejected"];

export default function ApplicationsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [formData, setFormData] = useState({
    companyName: "",
    position: "",
    status: STATUS_OPTIONS[0],
    location: "",
    salaryMin: "",
    salaryMax: "",
    expirationDate: "",
    rawDescription: "",
    tagsString: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    companyName: "",
    position: "",
    status: STATUS_OPTIONS[0],
    appliedDate: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    expirationDate: "",
    rawDescription: "",
    tagsString: "",
  });

  const [jobText, setJobText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const addFormRef = useRef(null);

  useEffect(() => {
    fetchApplications();
  }, [filterStatus]);

  const fetchApplications = async () => {
    setIsLoading(true);
    setError("");
    try {
      const url = filterStatus ? `/JobApplications?status=${filterStatus}` : "/JobApplications";
      const response = await api.get(url);

      const applicationsArray = response.data.items || response.data.data || response.data;

      if (Array.isArray(applicationsArray)) {
        setApplications(applicationsArray);
      } else {
        console.error("Backend did not return an array. Check the response structure:", response.data);
        setApplications([]);
      }
    } catch (err) {
      setError("Failed to fetch applications.");
    } finally {
      setIsLoading(false);
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

  const parseTags = (tagsString) => {
    if (!tagsString) return [];
    return tagsString
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        companyName: formData.companyName,
        position: formData.position,
        status: formData.status,
        appliedDate: new Date().toISOString(),
        location: formData.location || null,
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : null,
        expirationDate: formData.expirationDate ? new Date(formData.expirationDate).toISOString() : null,
        rawDescription: formData.rawDescription || null,
        tags: parseTags(formData.tagsString),
      };

      const response = await api.post("/JobApplications", payload);
      setApplications((prev) => [...prev, response.data]);

      setFormData({
        companyName: "",
        position: "",
        status: STATUS_OPTIONS[0],
        location: "",
        salaryMin: "",
        salaryMax: "",
        expirationDate: "",
        rawDescription: "",
        tagsString: "",
      });
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
      location: app.location || "",
      salaryMin: app.salaryMin ?? "",
      salaryMax: app.salaryMax ?? "",
      expirationDate: app.expirationDate ? new Date(app.expirationDate).toISOString().split("T")[0] : "",
      rawDescription: app.rawDescription || "",
      tagsString: app.tags?.join(", ") || "",
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
      const payload = {
        companyName: editFormData.companyName,
        position: editFormData.position,
        status: editFormData.status,
        appliedDate: editFormData.appliedDate,
        location: editFormData.location || null,
        salaryMin: editFormData.salaryMin ? Number(editFormData.salaryMin) : null,
        salaryMax: editFormData.salaryMax ? Number(editFormData.salaryMax) : null,
        expirationDate: editFormData.expirationDate ? new Date(editFormData.expirationDate).toISOString() : null,
        rawDescription: editFormData.rawDescription || null,
        tags: parseTags(editFormData.tagsString),
      };

      await api.put(`/JobApplications/${editingId}`, payload);

      if (filterStatus && filterStatus !== editFormData.status) {
        setApplications((prev) => prev.filter((app) => app.id !== editingId));
      } else {
        setApplications((prev) => prev.map((app) => (app.id === editingId ? { ...app, ...payload } : app)));
      }
      setEditingId(null);
    } catch (err) {
      setError("Failed to update application.");
    }
  };

  const handleParse = async () => {
    if (!jobText.trim()) return;

    setIsParsing(true);
    setParseError("");

    try {
      const response = await api.post("/JobApplications/parse", { jobText });
      const parsed = response.data;

      setFormData((prev) => ({
        ...prev,
        companyName: parsed.companyName || prev.companyName,
        position: parsed.position || prev.position,
        location: parsed.location || prev.location,
        salaryMin: parsed.salaryMin ?? prev.salaryMin,
        salaryMax: parsed.salaryMax ?? prev.salaryMax,
        rawDescription: jobText,
        tagsString: parsed.tags?.length > 0 ? parsed.tags.join(", ") : prev.tagsString,
      }));

      setJobText("");
      addFormRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      setParseError("Failed to parse job description. Try again.");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Job Applications</h2>
        <button onClick={handleLogout}>Logout</button>
      </header>

      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

      <section style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ccc" }}>
        <h3>Parse from Job Description</h3>
        <p style={{ color: "#666", fontSize: "14px" }}>
          Paste the job posting text below and click Parse. Fields will be auto-filled.
        </p>
        <textarea
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
          placeholder="Paste job description here..."
          rows={8}
          style={{ width: "100%", marginBottom: "10px", boxSizing: "border-box" }}
        />
        {parseError && <div style={{ color: "red", marginBottom: "8px" }}>{parseError}</div>}
        <button onClick={handleParse} disabled={isParsing || !jobText.trim()}>
          {isParsing ? "Parsing..." : "Parse"}
        </button>
      </section>

      <section ref={addFormRef} style={{ marginBottom: "20px" }}>
        <h3>Add New Application</h3>
        <form
          onSubmit={handleAddSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "500px" }}
        >
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
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.replace(/([A-Z])/g, " $1").trim()}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="location"
            placeholder="Location (e.g. London, Remote)"
            value={formData.location}
            onChange={handleInputChange}
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              style={{ flex: 1 }}
              type="number"
              name="salaryMin"
              placeholder="Salary Min (£)"
              value={formData.salaryMin}
              onChange={handleInputChange}
            />
            <input
              style={{ flex: 1 }}
              type="number"
              name="salaryMax"
              placeholder="Salary Max (£)"
              value={formData.salaryMax}
              onChange={handleInputChange}
            />
          </div>

          <input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleInputChange} />

          <input
            type="text"
            name="tagsString"
            placeholder="Tags (comma separated)"
            value={formData.tagsString}
            onChange={handleInputChange}
          />

          <button type="submit" style={{ alignSelf: "flex-start" }}>
            Submit
          </button>
        </form>
      </section>

      <section style={{ marginBottom: "20px" }}>
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
      </section>

      <section>
        <h3>Your Applications</h3>

        {isLoading ? (
          <p>Loading applications...</p>
        ) : !Array.isArray(applications) || applications.length === 0 ? (
          <p>No applications found.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {applications.map((app) => (
              <li key={app.id} style={{ border: "1px solid #ccc", margin: "10px 0", padding: "15px" }}>
                {editingId === app.id ? (
                  <form
                    onSubmit={handleEditSubmit}
                    style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "500px" }}
                  >
                    <input
                      type="text"
                      name="companyName"
                      placeholder="Company Name"
                      value={editFormData.companyName}
                      onChange={handleEditChange}
                      required
                    />
                    <input
                      type="text"
                      name="position"
                      placeholder="Position"
                      value={editFormData.position}
                      onChange={handleEditChange}
                      required
                    />

                    <select name="status" value={editFormData.status} onChange={handleEditChange}>
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status.replace(/([A-Z])/g, " $1").trim()}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      name="location"
                      placeholder="Location"
                      value={editFormData.location}
                      onChange={handleEditChange}
                    />

                    <div style={{ display: "flex", gap: "10px" }}>
                      <input
                        style={{ flex: 1 }}
                        type="number"
                        name="salaryMin"
                        placeholder="Salary Min (£)"
                        value={editFormData.salaryMin}
                        onChange={handleEditChange}
                      />
                      <input
                        style={{ flex: 1 }}
                        type="number"
                        name="salaryMax"
                        placeholder="Salary Max (£)"
                        value={editFormData.salaryMax}
                        onChange={handleEditChange}
                      />
                    </div>

                    <input
                      type="date"
                      name="expirationDate"
                      value={editFormData.expirationDate}
                      onChange={handleEditChange}
                    />

                    <input
                      type="text"
                      name="tagsString"
                      placeholder="Tags (comma separated)"
                      value={editFormData.tagsString}
                      onChange={handleEditChange}
                    />

                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                      <button type="submit">Save</button>
                      <button type="button" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <strong>{app.companyName}</strong> — {app.position}
                      <br />
                      <span style={{ color: "#888", fontSize: "13px", display: "block", marginBottom: "4px" }}>
                        📅 Applied: {new Date(app.appliedDate).toLocaleDateString()}
                      </span>
                      {app.location && <span>📍 {app.location} &nbsp;</span>}
                      {app.salaryMin && app.salaryMax && (
                        <span>
                          💰 £{app.salaryMin.toLocaleString()} — £{app.salaryMax.toLocaleString()}
                        </span>
                      )}
                      <br />
                      <span>Status: {app.status.replace(/([A-Z])/g, " $1").trim()}</span>
                      {app.expirationDate && (
                        <span style={{ color: "orange", marginLeft: "10px" }}>
                          ⏳ Expires: {new Date(app.expirationDate).toLocaleDateString()}
                        </span>
                      )}
                      {app.tags?.length > 0 && (
                        <div style={{ marginTop: "5px" }}>
                          {app.tags.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                background: "#e0e0e0",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                marginRight: "5px",
                                fontSize: "12px",
                                display: "inline-block",
                                marginBottom: "4px",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
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
