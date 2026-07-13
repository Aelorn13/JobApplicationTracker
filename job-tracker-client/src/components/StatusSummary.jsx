import { STATUS_OPTIONS } from '../constants';

export default function StatusSummary({ applications }) {
    const counts = STATUS_OPTIONS.reduce((acc, status) => {
        acc[status] = applications.filter(app => app.status === status).length;
        return acc;
    }, {});

    const total = applications.length;

    if (total === 0) return null;

    return (
        <div style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            padding: '12px 16px',
            background: '#f9f9f9',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '13px'
        }}>
            <span style={{ color: '#666' }}>
                Total: <strong>{total}</strong>
            </span>
            {STATUS_OPTIONS.map(status => (
                counts[status] > 0 && (
                    <span key={status} style={{ color: getStatusColor(status) }}>
                        {status.replace(/([A-Z])/g, ' $1').trim()}: <strong>{counts[status]}</strong>
                    </span>
                )
            ))}
        </div>
    );
}

function getStatusColor(status) {
    switch (status) {
        case 'Offer': return '#2e7d32';
        case 'Interview': return '#1565c0';
        case 'PhoneScreen': return '#6a1b9a';
        case 'Pending': return '#e65100';
        case 'Rejected': return '#b71c1c';
        default: return '#333';
    }
}