import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Tooltip as PieTooltip } from 'recharts';
import { BarChart, Bar, XAxis as BarX, YAxis as BarY, CartesianGrid as BarGrid, Tooltip as BarTooltip } from 'recharts';
import { adminAPI } from '../services/api';
import { mockDashboard } from '../data/mockData';
import './DashboardPage.css';

const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#607D8B'];

export default function DashboardPage() {
  const { data: apiData, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.getDashboard().then((res) => res.data),
    retry: 1,
  });

  const d = apiData || mockDashboard;
  const dashboard = { ...mockDashboard, ...d };

  if (isLoading && !apiData) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="dashboard">
      {isError && (
        <div className="dashboard-api-error">
          <p>Não foi possível conectar ao servidor. Verifique a conexão e se está logado como empresa (ou se a API está online).</p>
          <button type="button" className="btn-retry" onClick={() => refetch()}>Tentar novamente</button>
        </div>
      )}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{dashboard?.appointments?.total ?? 0}</div>
            <div className="stat-label">Agendamentos Hoje</div>
            {dashboard?.appointments?.attended != null && (
              <div className="stat-extra">Comparecimento: {dashboard.appointments.attended}</div>
            )}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">R$ {Number(dashboard?.sales?.revenue ?? 0).toFixed(2)}</div>
            <div className="stat-label">Faturamento Hoje</div>
            {dashboard?.sales?.meta != null && (
              <div className="stat-extra">Meta: R$ {dashboard.sales.meta?.toFixed(0)}</div>
            )}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{dashboard?.customers?.total ?? dashboard?.subscriptions?.active ?? 0}</div>
            <div className="stat-label">Clientes Ativos</div>
            {dashboard?.customers?.new != null && (
              <div className="stat-extra">Novos: {dashboard.customers.new}</div>
            )}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{dashboard?.stock?.critical ?? dashboard?.alerts?.lowStock ?? 0}</div>
            <div className="stat-label">Estoque Crítico</div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="dashboard-charts">
        <div className="chart-card">
          <h3>Faturamento (últimos 7 dias)</h3>
          <div className="chart-inner">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dashboard?.revenueChart || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip formatter={(v) => ['R$ ' + v, 'Faturamento']} />
                <Line type="monotone" dataKey="valor" stroke="#4CAF50" strokeWidth={2} dot={{ fill: '#4CAF50' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="chart-card">
          <h3>Serviços mais realizados</h3>
          <div className="chart-inner">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={dashboard?.servicesChart || []} dataKey="quantidade" nameKey="nome" cx="50%" cy="50%" outerRadius={70} label>
                  {(dashboard?.servicesChart || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <PieTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="chart-card chart-wide">
          <h3>Horários de pico</h3>
          <div className="chart-inner">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dashboard?.peakHours || []}>
                <BarGrid strokeDasharray="3 3" />
                <BarX dataKey="hora" />
                <BarY />
                <BarTooltip />
                <Bar dataKey="qtd" fill="#2196F3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        {/* Próximos agendamentos */}
        <div className="dashboard-card">
          <h3>Próximos agendamentos</h3>
          <div className="upcoming-list">
            {(dashboard?.upcomingAppointments || []).slice(0, 5).map((apt) => (
              <div key={apt.id} className="upcoming-item">
                <span className="upcoming-time">{apt.time}</span>
                <div>
                  <strong>{apt.petName}</strong> - {apt.service}
                  <span className="upcoming-customer">{apt.customerName}</span>
                </div>
                <button type="button" className="btn-checkin" title="Check-in">✓</button>
              </div>
            ))}
            {(!dashboard?.upcomingAppointments || dashboard.upcomingAppointments.length === 0) && (
              <p className="empty-msg">Nenhum agendamento nas próximas horas.</p>
            )}
          </div>
        </div>

        {/* Alertas */}
        <div className="dashboard-card">
          <h3>Alertas importantes</h3>
          <div className="alerts-list">
            {(dashboard?.alerts?.lowStock ?? 0) > 0 && (
              <div className="alert-item warning">⚠️ {dashboard.alerts.lowStock} produto(s) com estoque baixo</div>
            )}
            {(dashboard?.alerts?.vaccines ?? 0) > 0 && (
              <div className="alert-item warning">💉 {dashboard.alerts.vaccines} vacina(s) vencendo</div>
            )}
            {(dashboard?.alerts?.billsToday ?? 0) > 0 && (
              <div className="alert-item error">📄 {dashboard.alerts.billsToday} conta(s) a pagar hoje</div>
            )}
            {(dashboard?.alerts?.inactive30 ?? 0) > 0 && (
              <div className="alert-item info">👥 {dashboard.alerts.inactive30} cliente(s) inativo(s) há 30+ dias</div>
            )}
            {(dashboard?.alerts?.paymentFailed ?? 0) > 0 && (
              <div className="alert-item error">💳 {dashboard.alerts.paymentFailed} pagamento(s) falhado(s)</div>
            )}
            {!dashboard?.alerts?.lowStock && !dashboard?.alerts?.vaccines && !dashboard?.alerts?.billsToday && !dashboard?.alerts?.inactive30 && !dashboard?.alerts?.paymentFailed && (
              <p className="empty-msg">Nenhum alerta no momento.</p>
            )}
          </div>
        </div>

        {/* Atividade recente */}
        <div className="dashboard-card">
          <h3>Atividade recente</h3>
          <div className="activity-list">
            {(dashboard?.recentActivity || []).map((a, i) => (
              <div key={i} className="activity-item">
                <span className="activity-type">{a.type === 'checkin' ? '✓' : a.type === 'sale' ? '💰' : '👤'}</span>
                <span>{a.msg}</span>
                <span className="activity-time">{a.time}</span>
              </div>
            ))}
            {(!dashboard?.recentActivity || dashboard.recentActivity.length === 0) && (
              <p className="empty-msg">Nenhuma atividade recente.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
