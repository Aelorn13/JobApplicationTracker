export default function ApplicationCard({ app, onEdit, onDelete }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <strong>{app.companyName}</strong> — {app.position}
                <br />
                {app.location && <span>📍 {app.location} &nbsp;</span>}
                {app.salaryMin && app.salaryMax && (
                    <span>
                        💰 £{app.salaryMin.toLocaleString()} — £{app.salaryMax.toLocaleString()}
                    </span>
                )}
                <br />
                <span>Status: {app.status.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span style={{ color: '#888', fontSize: '13px', marginLeft: '10px' }}>
                    Applied: {new Date(app.appliedDate).toLocaleDateString()}
                </span>
                {app.expirationDate && (
                    <span style={{ color: 'orange', marginLeft: '10px' }}>
                        ⏳ Expires: {new Date(app.expirationDate).toLocaleDateString()}
                    </span>
                )}
                {app.tags?.length > 0 && (
                    <div style={{ marginTop: '5px' }}>
                        {app.tags.map(tag => (
                            <span key={tag} style={{
                                background: '#e0e0e0',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                marginRight: '5px',
                                fontSize: '12px',
                                display: 'inline-block',
                                marginBottom: '4px'
                            }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => onEdit(app)}>Edit</button>
                <button onClick={() => onDelete(app.id)}>Delete</button>
            </div>
        </div>
    );
}