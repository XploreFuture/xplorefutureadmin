import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { RegisterRequest, RegisterResponse, ApiErrorResponse } from '../types/api';

const BACKEND_URL = 'http://31.97.205.152:5000';

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        const registerData: RegisterRequest = { username, email, password };

        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerData)
            });

            let data: RegisterResponse | ApiErrorResponse;
            try {
                data = await response.json();
            } catch (jsonError: unknown) {
                data = { msg: `Server error: ${response.statusText}` };
                console.error("JSON parsing error:", jsonError);
            }

            if (response.ok) {
                setMessage({ type: 'success', text: (data as RegisterResponse).msg });
                setUsername('');
                setEmail('');
                setPassword('');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setMessage({ type: 'error', text: (data as ApiErrorResponse).msg || 'Registration failed' });
                if ((data as ApiErrorResponse).errors) {
                    setMessage(prev => ({ ...prev!, text: prev!.text + '\n' + Object.values((data as ApiErrorResponse).errors!).join(', ') }));
                }
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                setMessage({ type: 'error', text: `An error occurred: ${error.message}` });
            } else {
                setMessage({ type: 'error', text: 'An unknown error occurred during registration.' });
            }
            console.error('Registration error:', error);
        }
    };

    return (
        <div style={containerStyle}>
            <h1>Register</h1>
            <form onSubmit={handleSubmit} style={formStyle}>
                <div style={formGroupStyle}>
                    <label htmlFor="username" style={labelStyle}>Username:</label>
                    <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required style={inputStyle} />
                </div>
                <div style={formGroupStyle}>
                    <label htmlFor="email" style={labelStyle}>Email:</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
                </div>
                <div style={formGroupStyle}>
                    <label htmlFor="password" style={labelStyle}>Password:</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
                </div>
                <button type="submit" style={{ ...buttonStyle, backgroundColor: '#28a745' }}>Register</button>
            </form>
            {message && (
                <div style={{ ...messageStyle, ...(message.type === 'success' ? successMessageStyle : errorMessageStyle) }}>
                    {message.text}
                </div>
            )}
            <div style={linksStyle}>
                Already have an account? <Link to="/login" style={linkStyle}>Login here</Link>
                <p><Link to="/" style={linkStyle}>Back to Home</Link></p>
            </div>
        </div>
    );
};

const containerStyle: React.CSSProperties = {
    maxWidth: '400px', margin: '20px auto', backgroundColor: '#fff', padding: '30px',
    borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif'
};
const formStyle: React.CSSProperties = { /* Add form styles if needed */ };
const formGroupStyle: React.CSSProperties = { marginBottom: '15px' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
const inputStyle: React.CSSProperties = {
    width: 'calc(100% - 20px)', padding: '10px', border: '1px solid #ddd',
    borderRadius: '4px', boxSizing: 'border-box'
};
const buttonStyle: React.CSSProperties = {
    width: '100%', padding: '10px', color: 'white', border: 'none',
    borderRadius: '4px', fontSize: '16px', cursor: 'pointer', transition: 'background-color 0.3s ease'
};
const messageStyle: React.CSSProperties = {
    marginTop: '15px', padding: '10px', borderRadius: '4px', textAlign: 'center'
};
const successMessageStyle: React.CSSProperties = { backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' };
const errorMessageStyle: React.CSSProperties = { backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' };
const linksStyle: React.CSSProperties = { textAlign: 'center', marginTop: '20px' };
const linkStyle: React.CSSProperties = { color: '#007bff', textDecoration: 'none' };

export default Register;