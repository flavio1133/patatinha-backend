import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryAPI } from '../services/api';
import { mockProducts } from '../data/mockData';
import './PDVPage.css';

export default function PDVPage() {
  const [cart, setCart] = useState([]);
  const [clientSearch, setClientSearch] = useState('');

  const { data: productsData } = useQuery({
    queryKey: ['pdv-products'],
    queryFn: () => inventoryAPI.getAll().then((r) => r.data),
    retry: false,
  });

  const products = productsData?.products?.length ? productsData.products : mockProducts;

  const addToCart = (product) => {
    const existing = cart.find((c) => c.id === product.id);
    if (existing) {
      setCart(cart.map((c) => (c.id === product.id ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (id) => setCart(cart.filter((c) => c.id !== id));
  const updateQty = (id, qty) => {
    if (qty <= 0) removeFromCart(id);
    else setCart(cart.map((c) => (c.id === id ? { ...c, qty } : c)));
  };

  const subtotal = cart.reduce((acc, c) => acc + (c.price || 0) * c.qty, 0);

  return (
    <div className="pdv-page">
      <h1>PDV - Ponto de Venda</h1>
      <div className="pdv-layout">
        <div className="pdv-products">
          <input
            type="text"
            placeholder="Buscar produto (código, nome)..."
            className="pdv-search"
          />
          <div className="pdv-grid">
            {products.map((p) => (
              <button
                key={p.id}
                type="button"
                className="pdv-product-card"
                onClick={() => addToCart(p)}
              >
                <div className="pdv-product-img">📦</div>
                <div className="pdv-product-name">{p.name}</div>
                <div className="pdv-product-price">R$ {Number(p.price || 0).toFixed(2)}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="pdv-cart">
          <div className="pdv-cart-header">
            <h3>Carrinho</h3>
            <input
              type="text"
              placeholder="Cliente (buscar ou avulso)"
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
            />
          </div>
          <div className="pdv-cart-items">
            {cart.length === 0 ? (
              <p>Carrinho vazio</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="pdv-cart-row">
                  <span>{item.name}</span>
                  <div className="pdv-cart-qty">
                    <button type="button" onClick={() => updateQty(item.id, item.qty - 1)}>-</button>
                    <span>{item.qty}</span>
                    <button type="button" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                  </div>
                  <span>R$ {(item.price * item.qty).toFixed(2)}</span>
                  <button type="button" className="pdv-remove" onClick={() => removeFromCart(item.id)}>×</button>
                </div>
              ))
            )}
          </div>
          <div className="pdv-cart-footer">
            <div className="pdv-subtotal">
              Subtotal: <strong>R$ {subtotal.toFixed(2)}</strong>
            </div>
            <button type="button" className="btn-finalize" disabled={cart.length === 0}>
              Finalizar venda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
