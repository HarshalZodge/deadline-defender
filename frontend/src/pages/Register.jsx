import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        }
    };

    return (
        <div className="onboarding-screen">
            <div className="onboarding-bg"></div>
            <div className="onboarding-content" style={{paddingTop: '100px'}}>
                <div className="app-logo">🛡️</div>
                <h1 className="app-name" style={{marginBottom: '20px'}}>Register</h1>
                {error && <div className="error-msg">{error}</div>}
                
                <form onSubmit={submitHandler} style={{width: '100%', maxWidth: '300px'}}>
                    <div className="form-group">
                        <input className="form-input" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <input className="form-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <input className="form-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-primary">Create Account</button>
                </form>
                
                <button className="btn-ghost" onClick={() => navigate('/login')}>Already have an account? Sign In</button>
            </div>
        </div>
    );
};

export default Register;
