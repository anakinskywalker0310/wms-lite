import { useState, useEffect } from 'react';

function Alerts() {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/products/alerts/low-stock');
      if (!response.ok) {
        throw new Error('Nie udało się pobrać alertów');
      }
      const data = await response.json();
      setLowStockProducts(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Alerty niskiego stanu magazynowego</h2>
     {error && <div className="error-box">{error}</div>}
      {lowStockProducts.length === 0 ? (
        <p>Brak produktów poniżej progu minimalnego.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Nazwa</th>
              <th>Ilość</th>
              <th>Próg minimalny</th>
            </tr>
          </thead>
          <tbody>
            {lowStockProducts.map((product) => (
              <tr key={product.id} style={{ backgroundColor: '#ffe0e0' }}>
                <td>{product.sku}</td>
                <td>{product.name}</td>
                <td>{product.quantity}</td>
                <td>{product.min_threshold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Alerts;