import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AuthLayout from '../components/AuthLayout';

export default function RegisterPage() {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await api.post('/auth/register', formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data || 'Registration failed. Please check your details.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create account"
            subtitle="Start tracking your job applications"
            bottomText="Already have an account?"
            bottomLinkText="Sign in"
            bottomLinkTo="/login"
        >
            {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

            <form onSubmit={handleSubmit} className="form-col">
                <div className="form-grid-2">
                    <div className="form-group">
                        <label>First Name</label>
                        <input type="text" name="firstName" autoComplete="given-name"
                            value={formData.firstName} onChange={handleChange} placeholder="John" required />
                    </div>
                    <div className="form-group">
                        <label>Last Name</label>
                        <input type="text" name="lastName" autoComplete="family-name"
                            value={formData.lastName} onChange={handleChange} placeholder="Doe" required />
                    </div>
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" autoComplete="email"
                        value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" name="password" autoComplete="new-password"
                        value={formData.password} onChange={handleChange} placeholder="Min. 6 characters" required />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={isLoading} style={{ marginTop: '4px' }}>
                    {isLoading ? 'Creating account...' : 'Create account'}
                </button>
            </form>
        </AuthLayout>
    );
}