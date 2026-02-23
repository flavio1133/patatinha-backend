import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryAPI } from '../services/api';
import { mockProducts } from '../data/mockData';
import './InventoryPage.css';

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [entryModal, setEntryModal] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', search],
    queryFn: () => inventoryAPI.getAll({ search }).then((res) => res.data),
    retry: false,
  });

  const { data: lowStock } = useQuery({
    queryKey: ['low-stock-alerts'],
    queryFn: () => inventoryAPI.getLowStockAlerts().then((res) => res.data),
    retry: false,
  });

  const allProducts = data?.products?.length ? data.products : mockProducts;
  const products = allProducts.filter((p) => !filterCat || p.category === filterCat);
  const lowCount = lowStock?.count ?? allProducts.filter((p) => p.stockStatus === 'low').length;
  const categories = [...new Set(allProducts.map((p) => p.category).filter(Boolean))];
  const valorEstoque = allProducts.reduce((acc, p) => acc + (p.stock || 0) * (p.price || 0), 0);

  const statusDot = (s) => (s === 'low' ? '🔴' : s === 'critical' ? '🔴' : '🟢');

  return (
    <div className="inventory-page">
      <div className="inventory-stats">
        <div className="stat-mini"><span>{allProducts.length}</span> Total produtos</div>
        <div className="stat-mini warning"><span>{lowCount}</span> Estoque baixo</div>
        <div className="stat-mini"><span>0</span> Vencimentos</div>
        <div className="stat-mini"><span>R$ {valorEstoque.toFixed(0)}</span> Valor em estoque</div>
      </div>
      <div className="page-header">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">Todas categorias</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="btn-primary">+ Novo Produto</button>
      </div>

      {lowCount > 0 && (
        <div className="alert-banner">⚠️ {lowCount} produto(s) com estoque baixo</div>
      )}

      {isLoading && !data ? (
        <div className="loading">Carregando...</div>
      ) : (
        <div className="inventory-table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Estoque</th>
                <th>Mín</th>
                <th>Preço</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.stock ?? 0}</td>
                  <td>{product.minStock ?? '-'}</td>
                  <td>R$ {Number(product.price || 0).toFixed(2)}</td>
                  <td>
                    <span className={'stock-status status-' + (product.stockStatus || 'normal')}>
                      {statusDot(product.stockStatus)} {product.stockStatus === 'low' ? 'Baixo' : 'Normal'}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="btn-sm" onClick={() => setEntryModal(product.id)}>Entrada</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {entryModal && (
        <div className="modal-overlay" onClick={() => setEntryModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Entrada de estoque</h3>
            <p>Quantidade, valor da compra, nota fiscal.</p>
            <button type="button" className="btn-primary" onClick={() => setEntryModal(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
