import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data || 'Invalid email or password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to your JobTracker account"
            bottomText="Don't have an account?"
            bottomLinkText="Register"
            bottomLinkTo="/register"
        >
            {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

            <form onSubmit={handleSubmit} className="form-col">
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={isLoading} style={{ marginTop: '4px' }}>
                    {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>
        </AuthLayout>
    );
}