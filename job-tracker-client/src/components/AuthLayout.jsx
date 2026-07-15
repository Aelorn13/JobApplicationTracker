import { Link } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, bottomText, bottomLinkText, bottomLinkTo, children }) {
    return (
        <div className="page-center">
            <div className="auth-card">
                <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
                    {title}
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '14px' }}>
                    {subtitle}
                </p>

                {children}

                <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {bottomText}{' '}
                    <Link
                        to={bottomLinkTo}
                        style={{ color: 'var(--blue-primary)', textDecoration: 'none', fontWeight: 500 }}
                    >
                        {bottomLinkText}
                    </Link>
                </p>
            </div>
        </div>
    );
}