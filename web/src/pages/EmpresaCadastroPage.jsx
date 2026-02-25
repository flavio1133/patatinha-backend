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

function formatCpfInput(v) {
  const s = String(v).replace(/\D/g, '').slice(0, 11);
  if (s.length <= 3) return s;
  if (s.length <= 6) return s.slice(0, 3) + '.' + s.slice(3);
  if (s.length <= 9) return s.slice(0, 3) + '.' + s.slice(3, 6) + '.' + s.slice(6);
  return s.slice(0, 3) + '.' + s.slice(3, 6) + '.' + s.slice(6, 9) + '-' + s.slice(9);
}

function stripCpf(v) {
  return String(v).replace(/\D/g, '');
}

function validateCpfDigits(v) {
  const s = stripCpf(v);
  if (s.length !== 11) return false;
  if (/^(\d)\1+$/.test(s)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(s.charAt(i), 10) * (10 - i);
  let d1 = 11 - (sum % 11);
  if (d1 >= 10) d1 = 0;
  if (parseInt(s.charAt(9), 10) !== d1) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(s.charAt(i), 10) * (11 - i);
  let d2 = 11 - (sum % 11);
  if (d2 >= 10) d2 = 0;
  if (parseInt(s.charAt(10), 10) !== d2) return false;
  return true;
}

export default function EmpresaCadastroPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [cnpjStatus, setCnpjStatus] = useState({ valid: null, message: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step2Error, setStep2Error] = useState('');
  const [form, setForm] = useState({
    person_type: 'pj',
    name: '',
    legal_name: '',
    cpf: '',
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
    enabled: form.person_type === 'pj' && stripCnpj(form.cnpj).length === 14,
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
    if (form.person_type === 'pj' && stripCnpj(form.cnpj).length === 14) validateCnpj();
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

  const cnpjDigits = stripCnpj(form.cnpj).length;
  const cpfDigits = stripCpf(form.cpf).length;
  const isPj = form.person_type === 'pj';
  const isPf = form.person_type === 'pf';
  const cpfOk = isPf ? (cpfDigits === 11 && validateCpfDigits(form.cpf)) : true;
  const canStep1 =
    form.name &&
    form.legal_name &&
    ((isPj && cnpjDigits === 14 && cnpjStatus.valid) || (isPf && cpfOk));
  const passwordsMatch = form.password === form.confirmPassword && form.password.length >= 6;
  const canStep2 = form.email && form.phone && form.address && form.address_number && form.neighborhood && form.city && form.state && form.zip_code && passwordsMatch;
  const canStep4 = form.terms;

  const handleStep2Next = () => {
    if (!form.email || !form.phone || !form.address || !form.address_number || !form.neighborhood || !form.city || !form.state || !form.zip_code) {
      setStep2Error('Preencha todos os campos obrigatórios de contato e endereço.');
      return;
    }
    if (!passwordsMatch) {
      setStep2Error('As senhas devem coincidir e ter pelo menos 6 caracteres.');
      return;
    }
    setStep2Error('');
    setStep(3);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canStep4) return;
    const opening = { ...form.opening_hours };
    form.closed_days.forEach((d) => { opening[d] = 'Fechado'; });
    const payload = {
      ...form,
      person_type: form.person_type,
      cpf: form.person_type === 'pf' ? stripCpf(form.cpf) : '',
      cnpj: form.person_type === 'pj' ? stripCnpj(form.cnpj) : '',
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
                <label>Tipo de cadastro *</label>
                <div className="radio-row">
                  <label>
                    <input
                      type="radio"
                      name="person_type"
                      value="pj"
                      checked={form.person_type === 'pj'}
                      onChange={() => {
                        updateForm('person_type', 'pj');
                        setCnpjStatus({ valid: null, message: '' });
                      }}
                    />
                    Pessoa Jurídica (CNPJ)
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="person_type"
                      value="pf"
                      checked={form.person_type === 'pf'}
                      onChange={() => {
                        updateForm('person_type', 'pf');
                        setCnpjStatus({ valid: null, message: '' });
                      }}
                    />
                    Pessoa Física (CPF)
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Nome fantasia *</label>
                <input value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="Ex.: Pet Shop Patatinha" required />
              </div>
              <div className="form-group">
                <label>{form.person_type === 'pf' ? 'Nome completo *' : 'Razao social *'}</label>
                <input
                  value={form.legal_name}
                  onChange={(e) => updateForm('legal_name', e.target.value)}
                  placeholder={form.person_type === 'pf' ? 'Nome completo do responsável' : 'Razao social'}
                  required
                />
              </div>
              {form.person_type === 'pf' && (
                <div className="form-group">
                  <label>CPF *</label>
                  <input
                    value={form.cpf}
                    onChange={(e) => updateForm('cpf', formatCpfInput(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                  {form.cpf && !cpfOk && (
                    <span className="cnpj-feedback invalid">CPF inválido</span>
                  )}
                </div>
              )}
              {form.person_type === 'pj' && (
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
              )}
              <button type="button" className="btn-next" onClick={() => setStep(2)} disabled={!canStep1}>Continuar</button>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h2>Etapa 2: Contato e endereco</h2>
              <div className="form-group">
                <label>E-mail *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  placeholder="contato@petshop.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Senha *</label>
                  <div className="password-field">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => updateForm('password', e.target.value)}
                      placeholder="Min. 6 caracteres"
                      minLength={6}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirmar senha *</label>
                  <div className="password-field">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(e) => updateForm('confirmPassword', e.target.value)}
                      placeholder="Repita a senha"
                      minLength={6}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={showConfirmPassword ? 'Ocultar senha de confirmação' : 'Mostrar senha de confirmação'}
                    >
                      {showConfirmPassword ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>
              </div>
              {form.password && form.confirmPassword && !passwordsMatch && (
                <p className="form-error">As senhas devem coincidir e ter pelo menos 6 caracteres.</p>
              )}
              {step2Error && (
                <p className="form-error">{step2Error}</p>
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
                <button type="button" className="btn-next" onClick={handleStep2Next}>Continuar</button>
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
