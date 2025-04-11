import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [activeTab, setActiveTab] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLogin = async (role) => {
    setError(''); // Clear any previous error

    try {
      const response = await fetch(`http://localhost:5000/api/auth/login/${role}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token); // Store the JWT token
        localStorage.setItem('role', data.role);   // Store the user's role
        navigate(`/${role}/home`); // Redirect to the appropriate homepage
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to connect to the server');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <div>
        <button onClick={() => setActiveTab('user')} className={activeTab === 'user' ? 'active' : ''}>User Login</button>
        <button onClick={() => setActiveTab('admin')} className={activeTab === 'admin' ? 'active' : ''}>Admin Login</button>
      </div>

      {activeTab === 'user' && (
        <div>
          <h3>User Login</h3>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={() => handleLogin('user')}>Login as User</button>
          <p>Don't have an account? <a href="/signup">Sign up</a></p>
        </div>
      )}

      {activeTab === 'admin' && (
        <div>
          <h3>Admin Login</h3>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={() => handleLogin('admin')}>Login as Admin</button>
        </div>
      )}
    </div>
  );
}

export default LoginPage;