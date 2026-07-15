import { formatStatus, isStale } from '../utils';

export default function ApplicationCard({ app, onEdit, onDelete }) {
    return (
        <div className="card card-sm app-card-outer">
            <div className="app-card-body">
                <div className="app-card-title">
                    <span style={{ fontWeight: 600, fontSize: '15px' }}>{app.companyName}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>·</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{app.position}</span>
                </div>

                <div className="app-card-status">
                    <span className={`badge status-${app.status}`}>
                        {formatStatus(app.status)}
                    </span>
                    {isStale(app) && (
                        <span className="badge badge-warning">
                            ⚠️ No response
                        </span>
                    )}
                </div>

                <div className="app-card-meta">
                    <span>Applied: {new Date(app.appliedDate).toLocaleDateString()}</span>
                    {app.location && <span>📍 {app.location}</span>}
                    {app.salaryMin && app.salaryMax && (
                        <span>💰 £{app.salaryMin.toLocaleString()} — £{app.salaryMax.toLocaleString()}</span>
                    )}
                    {app.expirationDate && (
                        <span style={{ color: '#F59E0B' }}>
                            ⏳ {new Date(app.expirationDate).toLocaleDateString()}
                        </span>
                    )}
                </div>

                {app.tags?.length > 0 && (
                    <div className="app-card-tags">
                        {app.tags.map(tag => (
                            <span key={tag} className="badge badge-tag">{tag}</span>
                        ))}
                    </div>
                )}

                {app.notes && (
                    <div className="notes-block">{app.notes}</div>
                )}
            </div>

            <div className="app-card-btns">
                <button className="btn btn-secondary btn-sm" onClick={() => onEdit(app)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(app.id)}>Delete</button>
            </div>
        </div>
    );
}