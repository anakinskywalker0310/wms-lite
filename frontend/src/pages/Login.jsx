import { useState } from 'react';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e) => {
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch('http://127.0.0.1:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Nie udało się zarejestrować');
      }

      setSuccessMsg('Konto utworzone! Możesz się teraz zalogować.');
      setIsRegisterMode(false);
      setPassword('');
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <h2>WMS-lite</h2>
        <p className="login-subtitle">
          {isRegisterMode ? 'Stwórz nowe konto' : 'Zaloguj się do panelu magazynu'}
        </p>
        <form onSubmit={isRegisterMode ? handleRegister : handleLogin}>
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
          {successMsg && <div className="success-box">{successMsg}</div>}
          <button type="submit">
            {isRegisterMode ? 'Zarejestruj się' : 'Zaloguj się'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem' }}>
          {isRegisterMode ? 'Masz już konto?' : 'Nie masz konta?'}{' '}
          <button
            type="button"
            onClick={toggleMode}
            style={{ background: 'none', color: '#6366f1', padding: 0, textDecoration: 'underline' }}
          >
            {isRegisterMode ? 'Zaloguj się' : 'Zarejestruj się'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;