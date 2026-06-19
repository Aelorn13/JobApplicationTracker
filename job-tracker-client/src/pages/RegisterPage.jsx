import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await api.post('/auth/register', formData);
            navigate('/login'); 
        } catch (err) {
            const errorMessage = err.response?.data;
            setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
        }
    };

    return (
        <div>
            <h2>Register</h2>
            
            {error && <div style={{ color: 'red' }}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="firstName">First Name:</label>
                    <input 
                        type="text" 
                        id="firstName"
                        name="firstName"
                        value={formData.firstName} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <div>
                    <label htmlFor="lastName">Last Name:</label>
                    <input 
                        type="text" 
                        id="lastName"
                        name="lastName"
                        value={formData.lastName} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <div>
                    <label htmlFor="email">Email:</label>
                    <input 
                        type="email" 
                        id="email"
                        name="email"
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                
                <div>
                    <label htmlFor="password">Password:</label>
                    <input 
                        type="password" 
                        id="password"
                        name="password"
                        value={formData.password} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                
                <button type="submit">Register</button>
            </form>
        </div>
    );
}