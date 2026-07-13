import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

export function useApplications() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("status");

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);
      if (sortBy !== "status") params.append("sortBy", sortBy);

      const response = await api.get(`/JobApplications?${params.toString()}`);
      const items = response.data.items || response.data;
      setApplications(Array.isArray(items) ? items : []);
    } catch {
      setError("Failed to fetch applications.");
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, sortBy]);

  const filteredApplications = searchQuery.trim()
    ? applications.filter(
        (app) =>
          app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.position.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : applications;

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const addApplication = async (payload) => {
    const response = await api.post("/JobApplications", payload);
    await fetchApplications();
  };

  const deleteApplication = async (id) => {
    await api.delete(`/JobApplications/${id}`);
    setApplications((prev) => prev.filter((app) => app.id !== id));
  };

  const updateApplication = async (id, payload, currentFilterStatus) => {
    await api.put(`/JobApplications/${id}`, payload);
    if (currentFilterStatus && currentFilterStatus !== payload.status) {
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } else {
      setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, ...payload } : app)));
    }
  };

  return {
    applications: filteredApplications,
    rawApplications: applications,
    isLoading,
    error,
    setError,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    addApplication,
    deleteApplication,
    updateApplication,
  };
}
