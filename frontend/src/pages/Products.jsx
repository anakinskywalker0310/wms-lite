import { useState, useEffect } from 'react';

function Products() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    quantity: '',
    min_threshold: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/products');
      if (!response.ok) {
        throw new Error('Nie udało się pobrać produktów');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const resetForm = () => {
    setFormData({ sku: '', name: '', category: '', quantity: '', min_threshold: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const token = localStorage.getItem('token');
    const payload = {
      ...formData,
      quantity: Number(formData.quantity) || 0,
      min_threshold: Number(formData.min_threshold) || 0,
    };

    const url = editingId
      ? `http://127.0.0.1:8000/products/${editingId}`
      : 'http://127.0.0.1:8000/products';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Operacja nie powiodła się');
      }

      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      sku: product.sku,
      name: product.name,
      category: product.category || '',
      quantity: String(product.quantity),
      min_threshold: String(product.min_threshold),
    });
    setEditingId(product.id);
  };

  const handleDelete = async (id) => {
    setError('');
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://127.0.0.1:8000/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Nie udało się usunąć produktu');
      }

      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Produkty</h2>
     {error && <div className="error-box">{error}</div>}

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>SKU</th>
            <th>Nazwa</th>
            <th>Kategoria</th>
            <th>Ilość</th>
            <th>Próg minimalny</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.sku}</td>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>{product.quantity}</td>
              <td>{product.min_threshold}</td>
              <td>
                <button onClick={() => handleEdit(product)}>Edytuj</button>
                <button onClick={() => handleDelete(product.id)}>Usuń</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>{editingId ? 'Edytuj produkt' : 'Dodaj nowy produkt'}</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>SKU:</label>
          <input type="text" name="sku" value={formData.sku} onChange={handleChange} required />
        </div>
        <div>
          <label>Nazwa:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Kategoria:</label>
          <input type="text" name="category" value={formData.category} onChange={handleChange} />
        </div>
        <div>
          <label>Ilość:</label>
          <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} />
        </div>
        <div>
          <label>Próg minimalny:</label>
          <input type="number" name="min_threshold" value={formData.min_threshold} onChange={handleChange} />
        </div>
        <button type="submit">{editingId ? 'Zapisz zmiany' : 'Dodaj produkt'}</button>
        {editingId && <button type="button" onClick={resetForm}>Anuluj</button>}
      </form>
    </div>
  );
}

export default Products;