import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export function useApplications() {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const fetchApplications = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const url = filterStatus
                ? `/JobApplications?status=${filterStatus}`
                : '/JobApplications';
            const response = await api.get(url);
            const items = response.data.items || response.data;
            setApplications(Array.isArray(items) ? items : []);
        } catch {
            setError('Failed to fetch applications.');
        } finally {
            setIsLoading(false);
        }
    }, [filterStatus]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const addApplication = async (payload) => {
        const response = await api.post('/JobApplications', payload);
        setApplications(prev => [...prev, response.data]);
    };

    const deleteApplication = async (id) => {
        await api.delete(`/JobApplications/${id}`);
        setApplications(prev => prev.filter(app => app.id !== id));
    };

    const updateApplication = async (id, payload, currentFilterStatus) => {
        await api.put(`/JobApplications/${id}`, payload);
        if (currentFilterStatus && currentFilterStatus !== payload.status) {
            setApplications(prev => prev.filter(app => app.id !== id));
        } else {
            setApplications(prev => prev.map(app =>
                app.id === id ? { ...app, ...payload } : app
            ));
        }
    };

    return {
        applications,
        isLoading,
        error,
        setError,
        filterStatus,
        setFilterStatus,
        addApplication,
        deleteApplication,
        updateApplication,
    };
}