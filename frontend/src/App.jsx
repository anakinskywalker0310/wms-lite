import { useState } from 'react';
import Login from './pages/Login';
import Products from './pages/Products';
import Alerts from './pages/Alerts';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState('products');

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="container">
      <h1>WMS-lite</h1>
      <p className="subtitle">Panel zarządzania magazynem</p>
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
      {view === 'products' ? <Products /> : <Alerts />}
    </div>
  );
}

export default App;