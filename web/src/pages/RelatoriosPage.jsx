import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { reportsAPI } from '../services/api';
import './RelatoriosPage.css';

const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#607D8B', '#E91E63'];

function getDateRange(periodo) {
  const end = new Date();
  const start = new Date();
  switch (periodo) {
    case 'hoje':
      start.setDate(start.getDate());
      break;
    case 'semana':
      start.setDate(start.getDate() - 7);
      break;
    case 'mes':
      start.setDate(start.getDate() - 30);
      break;
    case 'ano':
      start.setDate(start.getDate() - 365);
      break;
    default:
      start.setDate(start.getDate() - 30);
  }
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

function exportToCSV(data, filename) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(';'),
    ...data.map((row) =>
      headers
        .map((h) => {
          const v = row[h];
          return typeof v === 'object' && v !== null
            ? JSON.stringify(v)
            : String(v ?? '').replace(/;/g, ',');
        })
        .join(';')
    ),
  ].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}

const TIPOS = [
  { id: 'sales', label: 'Vendas', icon: '💰', key: 'sales' },
  { id: 'services', label: 'Serviços', icon: '✂️', key: 'services' },
  { id: 'clients', label: 'Clientes', icon: '👥', key: 'clients' },
  { id: 'financial', label: 'Financeiro', icon: '📊', key: 'financial' },
  { id: 'products', label: 'Produtos', icon: '📦', key: 'products' },
];

export default function RelatoriosPage() {
  const [tipo, setTipo] = useState('sales');
  const [periodo, setPeriodo] = useState('mes');
  const [paymentMethods, setPaymentMethods] = useState([]);

  const { startDate, endDate } = getDateRange(periodo);

  const endpoints = {
    sales: () => reportsAPI.getSales({ startDate, endDate, groupBy: 'day' }),
    services: () => reportsAPI.getServices({ startDate, endDate }),
    clients: () => reportsAPI.getClients({ startDate, endDate }),
    financial: () => reportsAPI.getFinancial({ startDate, endDate }),
    products: () => reportsAPI.getProducts({ startDate, endDate }),
  };

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['reports', tipo, startDate, endDate],
    queryFn: () => endpoints[tipo]().then((r) => r.data),
  });

  useEffect(() => {
    if (tipo === 'sales') {
      reportsAPI.getSalesByPayment({ startDate, endDate }).then((r) => setPaymentMethods(r.data || []));
    }
  }, [tipo, startDate, endDate]);

  const data = Array.isArray(reportData) ? reportData : [];
  const handleExport = () => {
    const name = `relatorio_${tipo}_${startDate}_${endDate}`;
    exportToCSV(data, name);
  };

  const formatMoney = (v) => (v != null ? 'R$ ' + Number(v).toFixed(2) : '-');
  const formatDate = (d) =>
    d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

  const renderSales = () => (
    <>
      <div className="rel-chart-grid">
        <div className="rel-chart-card">
          <h3>Vendas por Dia</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(v) => (typeof v === 'number' && v > 100 ? formatMoney(v) : v)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#4CAF50" name="Faturamento" />
              <Line type="monotone" dataKey="total_sales" stroke="#2196F3" name="Qtd Vendas" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rel-chart-card">
          <h3>Métodos de Pagamento</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={paymentMethods}
                dataKey="revenue"
                nameKey="payment_method"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(e) => `${e.payment_method}: ${formatMoney(e.revenue)}`}
              >
                {paymentMethods.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatMoney(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rel-table-wrap">
        <h3>Detalhamento</h3>
        <table className="rel-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Vendas</th>
              <th>Faturamento</th>
              <th>Ticket Médio</th>
              <th>Clientes Únicos</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td>{formatDate(row.date)}</td>
                <td>{row.total_sales}</td>
                <td>{formatMoney(row.revenue)}</td>
                <td>{formatMoney(row.average_ticket)}</td>
                <td>{row.unique_clients ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderServices = () => (
    <>
      <div className="rel-chart-grid">
        <div className="rel-chart-card">
          <h3>Serviços Mais Realizados</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="service_name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total_appointments" fill="#4CAF50" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rel-chart-card">
          <h3>Receita por Serviço</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                dataKey="revenue"
                nameKey="service_name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(e) => `${e.service_name}: ${formatMoney(e.revenue)}`}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatMoney(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rel-table-wrap">
        <h3>Detalhamento por Serviço</h3>
        <table className="rel-table">
          <thead>
            <tr>
              <th>Serviço</th>
              <th>Qtd</th>
              <th>Receita</th>
              <th>Preço Médio</th>
              <th>Pets Atendidos</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td>{row.service_name}</td>
                <td>{row.total_appointments}</td>
                <td>{formatMoney(row.revenue)}</td>
                <td>{formatMoney(row.average_price)}</td>
                <td>{row.unique_pets ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderClients = () => {
    const active = data.filter((c) => c.status === 'active').length;
    const atRisk = data.filter((c) => c.status === 'at_risk').length;
    const inactive = data.filter((c) => c.status === 'inactive').length;
    const pieData = [
      { name: 'Ativos', value: active },
      { name: 'Em Risco', value: atRisk },
      { name: 'Inativos', value: inactive },
    ];
    return (
      <>
        <div className="rel-chart-grid">
          <div className="rel-chart-card">
            <h3>Status dos Clientes</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  <Cell fill="#4CAF50" />
                  <Cell fill="#FF9800" />
                  <Cell fill="#F44336" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="rel-chart-card">
            <h3>Top 10 Clientes</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.slice(0, 10)} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip formatter={(v) => formatMoney(v)} />
                <Bar dataKey="total_spent" fill="#4CAF50" name="Total Gasto" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rel-table-wrap">
          <h3>Lista de Clientes</h3>
          <table className="rel-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Pets</th>
                <th>Atendimentos</th>
                <th>Total Gasto</th>
                <th>Última Visita</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <td>{row.name}</td>
                  <td>{row.total_pets}</td>
                  <td>{row.total_appointments}</td>
                  <td>{formatMoney(row.total_spent)}</td>
                  <td>{formatDate(row.last_visit)}</td>
                  <td>
                    <span
                      className={
                        'rel-badge ' +
                        (row.status === 'active' ? 'active' : row.status === 'at_risk' ? 'at-risk' : 'inactive')
                      }
                    >
                      {row.status === 'active' ? 'Ativo' : row.status === 'at_risk' ? 'Em Risco' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const renderFinancial = () => {
    const totals = data.reduce(
      (acc, r) => ({
        revenue: acc.revenue + (r.revenue || 0),
        expenses: acc.expenses + (r.expenses || 0),
        commissions: acc.commissions + (r.commissions || 0),
        profit: acc.profit + (r.profit || 0),
      }),
      { revenue: 0, expenses: 0, commissions: 0, profit: 0 }
    );
    return (
      <>
        <div className="rel-chart-grid">
          <div className="rel-chart-card">
            <h3>Fluxo de Caixa</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(v) => formatMoney(v)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#4CAF50" name="Receitas" />
                <Line type="monotone" dataKey="expenses" stroke="#F44336" name="Despesas" />
                <Line type="monotone" dataKey="profit" stroke="#2196F3" name="Lucro" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="rel-chart-card">
            <h3>Resumo do Período</h3>
            <div className="rel-summary">
              <div className="rel-summary-item">
                <span>Receita Total</span>
                <strong>{formatMoney(totals.revenue)}</strong>
              </div>
              <div className="rel-summary-item">
                <span>Despesas Totais</span>
                <strong className="neg">{formatMoney(totals.expenses)}</strong>
              </div>
              <div className="rel-summary-item">
                <span>Comissões</span>
                <strong className="neg">{formatMoney(totals.commissions)}</strong>
              </div>
              <div className="rel-summary-item total">
                <span>Lucro Líquido</span>
                <strong className={totals.profit >= 0 ? 'pos' : 'neg'}>{formatMoney(totals.profit)}</strong>
              </div>
            </div>
          </div>
        </div>
        <div className="rel-table-wrap">
          <h3>Detalhamento Diário</h3>
          <table className="rel-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Receitas</th>
                <th>Despesas</th>
                <th>Comissões</th>
                <th>Lucro</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <td>{formatDate(row.date)}</td>
                  <td>{formatMoney(row.revenue)}</td>
                  <td>{formatMoney(row.expenses)}</td>
                  <td>{formatMoney(row.commissions)}</td>
                  <td className={row.profit >= 0 ? 'pos' : 'neg'}>{formatMoney(row.profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const renderProducts = () => (
    <>
      <div className="rel-chart-grid">
        <div className="rel-chart-card">
          <h3>Produtos Mais Vendidos</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(v) => (typeof v === 'number' && v > 10 ? formatMoney(v) : v)} />
              <Bar dataKey="total_revenue" fill="#4CAF50" name="Receita" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rel-table-wrap">
        <h3>Detalhamento de Produtos</h3>
        <table className="rel-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Vezes Vendido</th>
              <th>Qtd Vendida</th>
              <th>Receita</th>
              <th>Estoque</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td>{row.name}</td>
                <td>{row.category}</td>
                <td>{row.times_sold}</td>
                <td>{row.total_quantity_sold}</td>
                <td>{formatMoney(row.total_revenue)}</td>
                <td>{row.current_stock}</td>
                <td>
                  <span className={'rel-badge stock-' + (row.stock_status || 'high')}>
                    {row.stock_status === 'low' ? 'Baixo' : row.stock_status === 'medium' ? 'Médio' : 'Ok'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderContent = () => {
    if (isLoading) return <div className="rel-placeholder">Carregando...</div>;
    if (!data.length) return <div className="rel-placeholder">Nenhum dado no período selecionado.</div>;
    switch (tipo) {
      case 'sales':
        return renderSales();
      case 'services':
        return renderServices();
      case 'clients':
        return renderClients();
      case 'financial':
        return renderFinancial();
      case 'products':
        return renderProducts();
      default:
        return null;
    }
  };

  return (
    <div className="relatorios-page">
      <div className="rel-header">
        <h1>Relatórios</h1>
        <div className="rel-export-row">
          <select
            className="rel-periodo"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            title="Período"
          >
            <option value="hoje">Hoje</option>
            <option value="semana">Semana</option>
            <option value="mes">Mês</option>
            <option value="ano">Ano</option>
          </select>
          <button type="button" className="rel-export-btn" onClick={handleExport} disabled={!data?.length}>
            Exportar CSV
          </button>
        </div>
      </div>
      <div className="relatorios-filters">
        <div className="rel-tipo">
          {TIPOS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={tipo === t.id ? 'active' : ''}
              onClick={() => setTipo(t.id)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="relatorios-content">{renderContent()}</div>
    </div>
  );
}
