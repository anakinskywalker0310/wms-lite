import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Products from './pages/Products';
import Alerts from './pages/Alerts';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [view, setView] = useState('products');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchCurrentUser();
    }
  }, [isLoggedIn]);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://127.0.0.1:8000/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setCurrentUser(data);
    } catch {
      handleLogout();
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>WMS-lite</h1>
          <p className="subtitle">
            {currentUser ? `Zalogowano jako: ${currentUser.username} (${currentUser.role})` : 'Panel zarządzania magazynem'}
          </p>
        </div>
        <button onClick={handleLogout}>Wyloguj się</button>
      </div>
      <nav>
        <button
          className={view === 'products' ? 'active' : ''}
          onClick={() => setView('products')}
        >
          Produkty
        </button>
        <button
          className={view === 'alerts' ? 'active' : ''}
          onClick={() => setView('alerts')}
        >
          Alerty
        </button>
      </nav>
      {view === 'products' ? <Products currentUser={currentUser} /> : <Alerts />}
    </div>
  );
}

export default App;