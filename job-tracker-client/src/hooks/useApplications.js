import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

export function useApplications() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const url = filterStatus ? `/JobApplications?status=${filterStatus}` : "/JobApplications";
      const response = await api.get(url);
      const items = response.data.items || response.data;
      setApplications(Array.isArray(items) ? items : []);
    } catch {
      setError("Failed to fetch applications.");
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus]);

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
    setApplications((prev) => {
      const updated = [...prev, response.data];
      return updated.sort((a, b) => {
        const priority = { Offer: 0, Interview: 1, PhoneScreen: 2, Pending: 3, Rejected: 4 };
        const diff = (priority[a.status] ?? 4) - (priority[b.status] ?? 4);
        if (diff !== 0) return diff;
        return new Date(b.appliedDate) - new Date(a.appliedDate);
      });
    });
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
    addApplication,
    deleteApplication,
    updateApplication,
  };
}
