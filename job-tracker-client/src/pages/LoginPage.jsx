import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });
            
            const { token } = response.data;
            if (token) {
                login(token);
                navigate('/');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data;
            setError(typeof errorMessage === 'string' ? errorMessage : 'Invalid email or password.');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            
            {error && <div style={{ color: 'red' }}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input 
                        type="email" 
                        id="email"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                
                <div>
                    <label htmlFor="password">Password:</label>
                    <input 
                        type="password" 
                        id="password"
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                
                <button type="submit">Login</button>
            </form>
        </div>
    );
}