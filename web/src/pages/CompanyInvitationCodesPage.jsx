import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { companiesAPI } from '../services/api';
import './CompanyInvitationCodesPage.css';

export default function CompanyInvitationCodesPage() {
  const location = useLocation();
  const backTo = location.pathname.startsWith('/gestao') ? '/gestao/dashboard' : '/company/dashboard';

  const [codes, setCodes] = useState([]);
  const [stats, setStats] = useState({ total: 0, available: 0, used: 0, expired: 0 });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newCode, setNewCode] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [filter, setFilter] = useState('');
  const qrRef = useRef(null);

  const companyId = localStorage.getItem('company_id');

  const load = useCallback(() => {
    if (!companyId) return;
    companiesAPI.getInvitationCodes(companyId, filter || undefined)
      .then((res) => {
        setCodes(res.data.codes || []);
        setStats(res.data.stats || {});
      })
      .catch(() => setCodes([]))
      .finally(() => setLoading(false));
  }, [companyId, filter]);

  useEffect(() => { load(); }, [load]);

  const handleGenerate = () => {
    if (!companyId) return;
    setGenerating(true);
    companiesAPI.generateInvitationCode(companyId)
      .then((res) => {
        setNewCode(res.data.invitation);
        load();
      })
      .catch((err) => alert(err.response?.data?.error || 'Erro ao gerar'))
      .finally(() => setGenerating(false));
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    alert('Código copiado!');
  };

  const [company, setCompany] = useState(null);
  useEffect(() => {
    if (companyId) companiesAPI.getById(companyId).then((r) => setCompany(r.data)).catch(() => {});
  }, [companyId]);

  const handleShareWhatsApp = (code) => {
    const msg = encodeURIComponent(`Seu código de acesso ao app: ${code}\nDigite no app para se vincular à nossa pet shop!`);
    let num = (company?.whatsapp || company?.phone || '5581999995555').replace(/\D/g, '');
    if (num && !num.startsWith('55')) num = '55' + num;
    window.open(`https://wa.me/${num || '5581999995555'}?text=${msg}`, '_blank');
  };

  const getCodeUrl = (code) => {
    return `${window.location.origin}/cliente/codigo?code=${encodeURIComponent(code)}`;
  };

  const handleShowQr = (code) => {
    setQrCode(code);
  };

  const handleDownloadQr = () => {
    if (!qrRef.current || !qrCode) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.download = `codigo-${qrCode}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrintQr = () => {
    if (!qrRef.current) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html><head><title>QR Code - ${qrCode}</title></head>
      <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;">
        <h2>Código de acesso: ${qrCode}</h2>
        <div>${qrRef.current.innerHTML}</div>
        <p>Escaneie para abrir o app</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const handleResend = (code) => {
    companiesAPI.resendInvitationCode(companyId, code)
      .then((res) => {
        const url = res.data?.whatsapp_url;
        if (url) window.open(url, '_blank');
        else alert('Código: ' + code);
      })
      .catch((err) => alert(err.response?.data?.error || 'Erro ao reenviar'));
  };

  const handleDelete = (code) => {
    if (!window.confirm('Excluir este código?')) return;
    companiesAPI.deleteInvitationCode(companyId, code)
      .then(() => load())
      .catch((err) => alert(err.response?.data?.error || 'Erro'));
  };

  const statusClass = (s) => s === 'available' ? 'available' : s === 'used' ? 'used' : 'expired';

  return (
    <div className="invitation-codes-page">
      <div className="invitation-codes-container">
        <header>
          <Link to={backTo} className="back-link">← Voltar</Link>
          <h1>Códigos de acesso</h1>
          <p>Gere códigos para seus clientes se vincularem ao app</p>
        </header>

        <div className="stats-row">
          <div className="stat-card"><span className="stat-value">{stats.total}</span> Total</div>
          <div className="stat-card available"><span className="stat-value">{stats.available}</span> Disponíveis</div>
          <div className="stat-card used"><span className="stat-value">{stats.used}</span> Usados</div>
          <div className="stat-card expired"><span className="stat-value">{stats.expired}</span> Expirados</div>
        </div>

        <div className="actions-bar">
          <button type="button" className="btn-generate" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Gerando...' : 'Gerar novo código'}
          </button>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Todos</option>
            <option value="available">Disponíveis</option>
            <option value="used">Usados</option>
            <option value="expired">Expirados</option>
          </select>
        </div>

        {newCode && (
          <div className="new-code-modal">
            <div className="new-code-card">
              <h3>Código gerado!</h3>
              <div className="code-display">{newCode.code}</div>
              <div className="code-actions">
                <button type="button" onClick={() => handleCopy(newCode.code)}>Copiar</button>
                <button type="button" onClick={() => handleShareWhatsApp(newCode.code)}>WhatsApp</button>
                <button type="button" onClick={() => { setNewCode(null); setQrCode(newCode.code); }}>QR Code</button>
                <button type="button" className="btn-close" onClick={() => setNewCode(null)}>Fechar</button>
              </div>
            </div>
          </div>
        )}

        {qrCode && (
          <div className="new-code-modal" onClick={() => setQrCode(null)}>
            <div className="new-code-card qr-card" onClick={(e) => e.stopPropagation()}>
              <h3>QR Code - {qrCode}</h3>
              <div ref={qrRef} className="qr-container">
                <QRCodeSVG value={getCodeUrl(qrCode)} size={200} level="M" />
              </div>
              <p className="qr-hint">Escaneie para abrir o app com o código</p>
              <div className="code-actions">
                <button type="button" onClick={handleDownloadQr}>Baixar</button>
                <button type="button" onClick={handlePrintQr}>Imprimir</button>
                <button type="button" className="btn-close" onClick={() => setQrCode(null)}>Fechar</button>
              </div>
            </div>
          </div>
        )}

        <div className="codes-table-wrapper">
          {loading ? <p>Carregando...</p> : codes.length === 0 ? (
            <p className="empty">Nenhum código gerado. Clique em "Gerar novo código".</p>
          ) : (
            <table className="codes-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Status</th>
                  <th>Data geração</th>
                  <th>Data uso</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.code}</strong></td>
                    <td><span className={`status-badge ${statusClass(c.status)}`}>{c.status === 'available' ? 'Disponível' : c.status === 'used' ? 'Usado' : 'Expirado'}</span></td>
                    <td>{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
                    <td>{c.used_at ? new Date(c.used_at).toLocaleDateString('pt-BR') : '-'}</td>
                    <td>
                      <button type="button" className="btn-icon" onClick={() => handleCopy(c.code)} title="Copiar">📋</button>
                      {c.status === 'available' && (
                        <>
                          <button type="button" className="btn-icon" onClick={() => handleShareWhatsApp(c.code)} title="WhatsApp">📱</button>
                          <button type="button" className="btn-icon" onClick={() => handleResend(c.code)} title="Reenviar">🔄</button>
                          <button type="button" className="btn-icon" onClick={() => handleShowQr(c.code)} title="QR Code">📷</button>
                          <button type="button" className="btn-icon btn-delete" onClick={() => handleDelete(c.code)} title="Excluir">🗑️</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
