import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { companiesAPI } from '../services/api';
import axios from 'axios';
import './EmpresaCadastroPage.css';

const SERVICOS = [
  { id: 'banho', label: 'Banho' },
  { id: 'tosa', label: 'Tosa' },
  { id: 'banho_tosa', label: 'Banho + Tosa' },
  { id: 'veterinario', label: 'Consulta' },
  { id: 'vacina', label: 'Vacina' },
];

const DIAS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DIAS_LABEL = { monday: 'Segunda', tuesday: 'Terca', wednesday: 'Quarta', thursday: 'Quinta', friday: 'Sexta', saturday: 'Sabado', sunday: 'Domingo' };

function formatCnpjInput(v) {
  const s = String(v).replace(/\D/g, '').slice(0, 14);
  if (s.length <= 2) return s;
  if (s.length <= 5) return s.slice(0, 2) + '.' + s.slice(2);
  if (s.length <= 8) return s.slice(0, 2) + '.' + s.slice(2, 5) + '.' + s.slice(5);
  if (s.length <= 12) return s.slice(0, 2) + '.' + s.slice(2, 5) + '.' + s.slice(5, 8) + '/' + s.slice(8);
  return s.slice(0, 2) + '.' + s.slice(2, 5) + '.' + s.slice(5, 8) + '/' + s.slice(8, 12) + '-' + s.slice(12);
}

function stripCnpj(v) {
  return String(v).replace(/\D/g, '');
}

export default function EmpresaCadastroPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [cnpjStatus, setCnpjStatus] = useState({ valid: null, message: '' });
  const [form, setForm] = useState({
    name: '',
    legal_name: '',
    cnpj: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    whatsapp: '',
    zip_code: '',
    address: '',
    address_number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    opening_hours: Object.fromEntries(DIAS.map((d) => [d, '09:00-18:00'])),
    closed_days: [],
    services_offered: ['banho', 'tosa', 'banho_tosa', 'veterinario'],
    logo_url: '',
    terms: false,
  });

  const updateForm = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const { refetch: validateCnpj } = useQuery({
    queryKey: ['cnpj', stripCnpj(form.cnpj)],
    queryFn: () => axios.get('/api/companies/validate-cnpj/' + stripCnpj(form.cnpj)).then((r) => r.data),
    enabled: stripCnpj(form.cnpj).length === 14,
    retry: false,
    onSuccess: (data) => setCnpjStatus({ valid: data.valid, message: data.message }),
    onError: () => setCnpjStatus({ valid: false, message: 'Erro ao validar' }),
  });

  const registerMutation = useMutation({
    mutationFn: (data) => companiesAPI.register(data),
    onSuccess: (res) => {
      if (res.data?.token) localStorage.setItem('company_token', res.data.token);
      if (res.data?.company?.id) localStorage.setItem('company_id', res.data.company.id);
      navigate('/company/dashboard', { state: { message: 'Empresa cadastrada! Você tem 15 dias de teste grátis.' } });
    },
  });

  const handleCnpjBlur = () => {
    if (stripCnpj(form.cnpj).length === 14) validateCnpj();
  };

  const fetchCep = useCallback(() => {
    const cep = form.zip_code.replace(/\D/g, '');
    if (cep.length !== 8) return;
    fetch('https://viacep.com.br/ws/' + cep + '/json/')
      .then((r) => r.json())
      .then((data) => {
        if (!data.erro) {
          updateForm('address', data.logradouro || '');
          updateForm('neighborhood', data.bairro || '');
          updateForm('city', data.localidade || '');
          updateForm('state', data.uf || '');
        }
      })
      .catch(() => {});
  }, [form.zip_code]);

  const canStep1 = form.name && form.legal_name && stripCnpj(form.cnpj).length === 14 && cnpjStatus.valid;
  const passwordsMatch = form.password === form.confirmPassword && form.password.length >= 6;
  const canStep2 = form.email && form.phone && form.address && form.address_number && form.neighborhood && form.city && form.state && form.zip_code && passwordsMatch;
  const canStep4 = form.terms;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canStep4) return;
    const opening = { ...form.opening_hours };
    form.closed_days.forEach((d) => { opening[d] = 'Fechado'; });
    const payload = {
      ...form,
      cnpj: stripCnpj(form.cnpj),
      zip_code: form.zip_code.replace(/\D/g, ''),
      opening_hours: opening,
      services_offered: form.services_offered,
    };
    delete payload.terms;
    delete payload.closed_days;
    delete payload.confirmPassword;
    registerMutation.mutate(payload);
  };

  return (
    <div className="empresa-cadastro-page">
      <div className="empresa-cadastro-container">
        <header className="empresa-cadastro-header">
          <Link to="/" className="back-link">Voltar</Link>
          <p className="empresa-cadastro-login-hint">
            Já tem conta? <Link to="/company/login">Fazer login</Link>
          </p>
          <h1>Cadastrar minha pet shop</h1>
          <div className="steps">
            {[1, 2, 3, 4].map((s) => (
              <span key={s} className={'step-dot ' + (step >= s ? 'active' : '')}>{s}</span>
            ))}
          </div>
        </header>

        <form onSubmit={handleSubmit} className="empresa-form">
          {step === 1 && (
            <div className="form-step">
              <h2>Etapa 1: Dados da empresa</h2>
              <div className="form-group">
                <label>Nome fantasia *</label>
                <input value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="Ex.: Pet Shop Patatinha" required />
              </div>
              <div className="form-group">
                <label>Razao social *</label>
                <input value={form.legal_name} onChange={(e) => updateForm('legal_name', e.target.value)} placeholder="Razao social" required />
              </div>
              <div className="form-group">
                <label>CNPJ *</label>
                <input
                  value={form.cnpj}
                  onChange={(e) => {
                    updateForm('cnpj', formatCnpjInput(e.target.value));
                    setCnpjStatus({ valid: null, message: '' });
                  }}
                  onBlur={handleCnpjBlur}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
                {cnpjStatus.valid !== null && (
                  <span className={'cnpj-feedback ' + (cnpjStatus.valid ? 'valid' : 'invalid')}>{cnpjStatus.message}</span>
                )}
              </div>
              <button type="button" className="btn-next" onClick={() => setStep(2)} disabled={!canStep1}>Continuar</button>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h2>Etapa 2: Contato e endereco</h2>
              <div className="form-group">
                <label>E-mail *</label>
                <input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="contato@petshop.com" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Senha *</label>
                  <input type="password" value={form.password} onChange={(e) => updateForm('password', e.target.value)} placeholder="Min. 6 caracteres" minLength={6} required />
                </div>
                <div className="form-group">
                  <label>Confirmar senha *</label>
                  <input type="password" value={form.confirmPassword} onChange={(e) => updateForm('confirmPassword', e.target.value)} placeholder="Repita a senha" minLength={6} required />
                </div>
              </div>
              {form.password && form.confirmPassword && !passwordsMatch && (
                <p className="form-error">As senhas devem coincidir e ter pelo menos 6 caracteres.</p>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label>Telefone *</label>
                  <input value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="(81) 99999-9999" required />
                </div>
                <div className="form-group">
                  <label>WhatsApp (opcional)</label>
                  <input value={form.whatsapp} onChange={(e) => updateForm('whatsapp', e.target.value)} placeholder="(81) 99999-9999" />
                </div>
              </div>
              <div className="form-group">
                <label>CEP *</label>
                <input value={form.zip_code} onChange={(e) => updateForm('zip_code', e.target.value.replace(/\D/g, '').slice(0, 8))} onBlur={fetchCep} placeholder="00000000" maxLength={8} />
              </div>
              <div className="form-group">
                <label>Logradouro *</label>
                <input value={form.address} onChange={(e) => updateForm('address', e.target.value)} placeholder="Rua, Av." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Numero *</label>
                  <input value={form.address_number} onChange={(e) => updateForm('address_number', e.target.value)} placeholder="123" required />
                </div>
                <div className="form-group">
                  <label>Complemento</label>
                  <input value={form.complement} onChange={(e) => updateForm('complement', e.target.value)} placeholder="Sala 1" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Bairro *</label>
                  <input value={form.neighborhood} onChange={(e) => updateForm('neighborhood', e.target.value)} placeholder="Bairro" required />
                </div>
                <div className="form-group">
                  <label>Cidade *</label>
                  <input value={form.city} onChange={(e) => updateForm('city', e.target.value)} placeholder="Recife" required />
                </div>
                <div className="form-group form-group-small">
                  <label>UF *</label>
                  <input value={form.state} onChange={(e) => updateForm('state', e.target.value.toUpperCase().slice(0, 2))} placeholder="PE" maxLength={2} required />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-prev" onClick={() => setStep(1)}>Voltar</button>
                <button type="button" className="btn-next" onClick={() => setStep(3)} disabled={!canStep2}>Continuar</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <h2>Etapa 3: Configuracoes iniciais</h2>
              <div className="form-group">
                <label>Horario de funcionamento</label>
                {DIAS.map((d) => (
                  <div key={d} className="horario-row">
                    <label className="check-label">
                      <input type="checkbox" checked={form.closed_days.includes(d)} onChange={(e) => updateForm('closed_days', e.target.checked ? [...form.closed_days, d] : form.closed_days.filter((x) => x !== d))} />
                      Fechado
                    </label>
                    <span className="dia-label">{DIAS_LABEL[d]}</span>
                    <input type="text" value={form.closed_days.includes(d) ? '' : (form.opening_hours[d] || '09:00-18:00')} onChange={(e) => updateForm('opening_hours', { ...form.opening_hours, [d]: e.target.value })} placeholder="09:00-18:00" disabled={form.closed_days.includes(d)} />
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label>Servicos oferecidos</label>
                <div className="services-check">
                  {SERVICOS.map((s) => (
                    <label key={s.id} className="check-label">
                      <input type="checkbox" checked={form.services_offered.includes(s.id)} onChange={(e) => updateForm('services_offered', e.target.checked ? [...form.services_offered, s.id] : form.services_offered.filter((x) => x !== s.id))} />
                      {s.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-prev" onClick={() => setStep(2)}>Voltar</button>
                <button type="button" className="btn-next" onClick={() => setStep(4)}>Continuar</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="form-step">
              <h2>Etapa 4: Finalizacao</h2>
              <div className="resumo">
                <p><strong>{form.name}</strong></p>
                <p>CNPJ: {form.cnpj}</p>
                <p>E-mail: {form.email}</p>
                <p>Telefone: {form.phone}</p>
                <p>Endereco: {form.address}, {form.address_number} - {form.neighborhood}, {form.city}/{form.state}</p>
              </div>
              <div className="form-group">
                <label>URL da logo (opcional)</label>
                <input type="url" value={form.logo_url} onChange={(e) => updateForm('logo_url', e.target.value)} placeholder="https://exemplo.com/logo.png" />
              </div>
              <div className="form-group">
                <label className="check-label">
                  <input type="checkbox" checked={form.terms} onChange={(e) => updateForm('terms', e.target.checked)} required />
                  Li e aceito os termos de uso
                </label>
              </div>
              {registerMutation.error && <p className="form-error">{registerMutation.error.response?.data?.error || 'Erro ao cadastrar.'}</p>}
              <div className="form-actions">
                <button type="button" className="btn-prev" onClick={() => setStep(3)}>Voltar</button>
                <button type="submit" className="btn-submit" disabled={!canStep4 || registerMutation.isPending}>
                  {registerMutation.isPending ? 'Cadastrando...' : 'Finalizar cadastro'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
