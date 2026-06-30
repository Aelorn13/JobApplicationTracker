import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApplications } from '../hooks/useApplications';
import { STATUS_OPTIONS } from '../constants';
import ApplicationCard from '../components/ApplicationCard';
import ApplicationForm from '../components/ApplicationForm';
import JobParser from '../components/JobParser';

export default function ApplicationsPage() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const addFormRef = useRef(null);

    const {
        applications,
        isLoading,
        error,
        setError,
        filterStatus,
        setFilterStatus,
        addApplication,
        deleteApplication,
        updateApplication,
    } = useApplications();

    const [editingApp, setEditingApp] = useState(null);
    const [parsedData, setParsedData] = useState(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleParsed = (data) => {
        setParsedData(data);
        addFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleAdd = async (payload) => {
        try {
            await addApplication(payload);
            setParsedData(null);
        } catch {
            setError('Failed to add application.');
            throw new Error('add failed'); // фикс: пробрасываем чтобы форма не сбросилась
        }
    };

    const handleEdit = async (payload) => {
        try {
            await updateApplication(editingApp.id, payload, filterStatus);
            setEditingApp(null);
        } catch {
            setError('Failed to update application.');
            throw new Error('edit failed'); // фикс: пробрасываем чтобы форма не сбросилась
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteApplication(id);
        } catch {
            setError('Failed to delete application.');
        }
    };

    return (
        <div>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Job Applications</h2>
                <button onClick={handleLogout}>Logout</button>
            </header>

            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <JobParser onParsed={handleParsed} />

            <section ref={addFormRef} style={{ marginBottom: '20px' }}>
                <h3>Add New Application</h3>
                <ApplicationForm
                    initialData={parsedData}
                    onSubmit={handleAdd}
                    isEditMode={false}
                />
            </section>

            <section style={{ marginBottom: '20px' }}>
                <label htmlFor="filterStatus" style={{ marginRight: '10px' }}>
                    Filter by Status:
                </label>
                <select
                    id="filterStatus"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="">All</option>
                    {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>
                            {status.replace(/([A-Z])/g, ' $1').trim()}
                        </option>
                    ))}
                </select>
            </section>

            <section>
                <h3>Your Applications</h3>
                {isLoading ? (
                    <p>Loading applications...</p>
                ) : applications.length === 0 ? (
                    <p>No applications found.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {applications.map(app => (
                            <li key={app.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '15px' }}>
                                {editingApp?.id === app.id ? (
                                    <ApplicationForm
                                        key={editingApp.id} // фикс: сбрасывает форму при повторном Edit
                                        initialData={editingApp}
                                        onSubmit={handleEdit}
                                        onCancel={() => setEditingApp(null)}
                                        isEditMode={true}
                                    />
                                ) : (
                                    <ApplicationCard
                                        app={app}
                                        onEdit={() => setEditingApp(app)}
                                        onDelete={handleDelete}
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}