import { STATUS_OPTIONS } from '../constants';
import { formatStatus } from '../utils';

export default function StatusSummary({ applications }) {
    const counts = STATUS_OPTIONS.reduce((acc, status) => {
        acc[status] = applications.filter(app => app.status === status).length;
        return acc;
    }, {});

    const total = applications.length;
    if (total === 0) return null;

    return (
        <div className="summary-bar">
            {STATUS_OPTIONS.map(status => (
                counts[status] > 0 && (
                    <div key={status} className="summary-item">
                        <span className={`summary-dot dot-${status}`} />
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            {formatStatus(status)}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>
                            {counts[status]}
                        </span>
                    </div>
                )
            ))}
            <div className="summary-total">
                <span style={{ fontSize: '13px', color: 'var(--blue-primary)', fontWeight: 600 }}>
                    Total: {total}
                </span>
            </div>
        </div>
    );
}