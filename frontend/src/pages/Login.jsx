import { useState } from 'react';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Nieprawidłowa nazwa użytkownika lub hasło');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <h2>WMS-lite</h2>
        <p className="login-subtitle">Zaloguj się do panelu magazynu</p>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nazwa użytkownika</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label>Hasło</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="error-box">{error}</div>}
          <button type="submit">Zaloguj się</button>
        </form>
      </div>
    </div>
  );
}

export default Login;