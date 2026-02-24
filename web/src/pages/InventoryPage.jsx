import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryAPI } from '../services/api';
import { mockProducts } from '../data/mockData';
import './InventoryPage.css';

// Categorias aceitas pela API (backend)
const CATEGORIAS = [
  { value: 'racao', label: 'Ração' },
  { value: 'shampoo', label: 'Shampoo' },
  { value: 'condicionador', label: 'Condicionador' },
  { value: 'perfume', label: 'Perfume' },
  { value: 'antisseptico', label: 'Antisséptico' },
  { value: 'acessorios', label: 'Acessórios' },
  { value: 'medicamentos', label: 'Medicamentos' },
  { value: 'outros', label: 'Outros' },
];

const INITIAL_FORM = {
  name: '',
  category: 'outros',
  brand: '',
  sku: '',
  description: '',
  price: '',
  stock: '',
  minStock: '',
  sellByWeight: false,
  stockWeight: '',
  minStockWeight: '',
  pricePerKg: '',
};

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [entryModal, setEntryModal] = useState(null);
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

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

  const createMutation = useMutation({
    mutationFn: (body) => inventoryAPI.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-alerts'] });
      setForm(INITIAL_FORM);
      setNewProductOpen(false);
    },
    onError: (err) => {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || err.message || 'Erro ao cadastrar produto.';
      alert(msg);
    },
  });

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitNewProduct = (e) => {
    e.preventDefault();
    const name = (form.name || '').trim();
    if (!name) {
      alert('Informe o nome do produto.');
      return;
    }
    const body = {
      name,
      category: form.category,
      brand: form.brand.trim() || undefined,
      sku: form.sku.trim() || undefined,
      description: form.description.trim() || undefined,
      price: form.price !== '' ? parseFloat(form.price) : undefined,
      stock: form.stock !== '' ? parseInt(form.stock, 10) : undefined,
      minStock: form.minStock !== '' ? parseInt(form.minStock, 10) : undefined,
      sellByWeight: !!form.sellByWeight,
    };
    if (form.sellByWeight) {
      body.stockWeight = form.stockWeight !== '' ? parseFloat(form.stockWeight) * 1000 : undefined; // kg -> gramas
      body.minStockWeight = form.minStockWeight !== '' ? parseFloat(form.minStockWeight) * 1000 : undefined;
      body.pricePerKg = form.pricePerKg !== '' ? parseFloat(form.pricePerKg) : undefined;
    }
    createMutation.mutate(body);
  };

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
        <button type="button" className="btn-primary" onClick={() => setNewProductOpen(true)}>+ Novo Produto</button>
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

      {newProductOpen && (
        <div className="modal-overlay" onClick={() => !createMutation.isPending && setNewProductOpen(false)}>
          <div className="modal-content modal-new-product" onClick={(e) => e.stopPropagation()}>
            <h3>Cadastrar novo produto</h3>
            <form onSubmit={handleSubmitNewProduct}>
              <div className="form-group">
                <label>Nome do produto *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="Ex: Ração Premium 15kg"
                  required
                />
              </div>
              <div className="form-group">
                <label>Categoria *</label>
                <select
                  value={form.category}
                  onChange={(e) => handleFormChange('category', e.target.value)}
                  required
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Marca</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => handleFormChange('brand', e.target.value)}
                    placeholder="Opcional"
                  />
                </div>
                <div className="form-group">
                  <label>SKU / Código</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => handleFormChange('sku', e.target.value)}
                    placeholder="Opcional"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Opcional"
                  rows={2}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => handleFormChange('price', e.target.value)}
                    placeholder="0,00"
                  />
                </div>
                {!form.sellByWeight && (
                  <>
                    <div className="form-group">
                      <label>Estoque inicial (un)</label>
                      <input
                        type="number"
                        min="0"
                        value={form.stock}
                        onChange={(e) => handleFormChange('stock', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="form-group">
                      <label>Estoque mínimo (un)</label>
                      <input
                        type="number"
                        min="0"
                        value={form.minStock}
                        onChange={(e) => handleFormChange('minStock', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="form-group form-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={form.sellByWeight}
                    onChange={(e) => handleFormChange('sellByWeight', e.target.checked)}
                  />
                  <span>Venda por peso (ex: ração por quilo)</span>
                </label>
              </div>
              {form.sellByWeight && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Estoque (kg)</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={form.stockWeight}
                      onChange={(e) => handleFormChange('stockWeight', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Estoque mínimo (kg)</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={form.minStockWeight}
                      onChange={(e) => handleFormChange('minStockWeight', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Preço por kg (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.pricePerKg}
                      onChange={(e) => handleFormChange('pricePerKg', e.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setNewProductOpen(false)} disabled={createMutation.isPending}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Salvando...' : 'Cadastrar produto'}
                </button>
              </div>
            </form>
          </div>
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
