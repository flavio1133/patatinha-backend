import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesAPI } from '../services/api';
import './ConfiguracoesPage.css';

const DIAS = [
  { key: 'monday', label: 'Segunda' },
  { key: 'tuesday', label: 'Terça' },
  { key: 'wednesday', label: 'Quarta' },
  { key: 'thursday', label: 'Quinta' },
  { key: 'friday', label: 'Sexta' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

const SERVICOS_OPCOES = [
  { value: 'banho', label: 'Banho' },
  { value: 'tosa', label: 'Tosa' },
  { value: 'banho_tosa', label: 'Banho e Tosa' },
  { value: 'veterinario', label: 'Consulta / Veterinário' },
  { value: 'vacina', label: 'Vacina' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'outros', label: 'Outros' },
];

export default function ConfiguracoesPage() {
  const location = useLocation();
  const hashTab = location.hash?.replace('#', '') || '';
  const [aba, setAba] = useState(hashTab || 'disponibilidade');
  const queryClient = useQueryClient();
  const companyId = localStorage.getItem('company_id');

  useEffect(() => {
    if (hashTab && ['disponibilidade', 'empresa', 'servicos', 'profissionais', 'usuarios', 'integracao', 'assinatura', 'backup', 'perfil'].includes(hashTab)) {
      setAba(hashTab);
    }
  }, [hashTab]);

  const { data: companyData } = useQuery({
    queryKey: ['company-settings', companyId],
    queryFn: () => companiesAPI.getById(companyId).then((r) => r.data),
    enabled: !!companyId,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (body) => companiesAPI.updateSettings(companyId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings', companyId] });
    },
  });

  const settings = companyData?.settings || {};
  const [openingHours, setOpeningHours] = useState(settings.opening_hours || {});
  const [servicesOffered, setServicesOffered] = useState(settings.services_offered || []);

  useEffect(() => {
    const oh = settings.opening_hours || {};
    const so = settings.services_offered || [];
    setOpeningHours(oh);
    setServicesOffered(Array.isArray(so) ? so : []);
  }, [settings.opening_hours, settings.services_offered]);

  const handleHorarioChange = (dayKey, value) => {
    setOpeningHours((prev) => ({ ...prev, [dayKey]: value }));
  };

  const handleSaveHorarios = () => {
    updateSettingsMutation.mutate({ opening_hours: openingHours });
  };

  const handleServicoToggle = (value) => {
    setServicesOffered((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const handleSaveServicos = () => {
    updateSettingsMutation.mutate({ services_offered: servicesOffered });
  };

  const abas = [
    { id: 'disponibilidade', label: 'Datas e horários', icon: '📅' },
    { id: 'empresa', label: 'Empresa', icon: '🏢' },
    { id: 'servicos', label: 'Serviços', icon: '✂️' },
    { id: 'profissionais', label: 'Profissionais', icon: '👤' },
    { id: 'usuarios', label: 'Usuários', icon: '👥' },
    { id: 'integracao', label: 'Integrações', icon: '🔗' },
    { id: 'assinatura', label: 'Assinatura', icon: '💳' },
    { id: 'backup', label: 'Backup', icon: '💾' },
  ];

  return (
    <div className="configuracoes-page">
      <h1>Configurações</h1>
      <div className="config-tabs">
        {abas.map((a) => (
          <button
            key={a.id}
            type="button"
            className={aba === a.id ? 'active' : ''}
            onClick={() => setAba(a.id)}
          >
            {a.icon} {a.label}
          </button>
        ))}
      </div>
      <div className="config-content">
        {aba === 'disponibilidade' && (
          <section className="config-section">
            <h2>Datas e horários disponíveis para clientes</h2>
            <p className="config-desc">
              Defina os dias e horários em que sua pet shop atende. Os clientes vinculados verão apenas esses horários ao agendar.
            </p>
            {companyId ? (
              <>
                <div className="config-opening-hours">
                  <h3>Horário de funcionamento por dia</h3>
                  <p className="config-hint">Use o formato 08:00-18:00 ou "Fechado" para dias sem atendimento.</p>
                  {DIAS.map((d) => (
                    <div key={d.key} className="config-row">
                      <label>{d.label}</label>
                      <input
                        type="text"
                        value={openingHours[d.key] ?? ''}
                        onChange={(e) => handleHorarioChange(d.key, e.target.value)}
                        placeholder="08:00-18:00"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn-save-config"
                    onClick={handleSaveHorarios}
                    disabled={updateSettingsMutation.isPending}
                  >
                    {updateSettingsMutation.isPending ? 'Salvando...' : 'Salvar horários'}
                  </button>
                </div>
                <div className="config-services-offered">
                  <h3>Serviços que o cliente pode agendar</h3>
                  <p className="config-hint">Marque os serviços que aparecem para o cliente na hora de agendar.</p>
                  <div className="config-checkbox-group">
                    {SERVICOS_OPCOES.map((s) => (
                      <label key={s.value} className="config-checkbox">
                        <input
                          type="checkbox"
                          checked={servicesOffered.includes(s.value)}
                          onChange={() => handleServicoToggle(s.value)}
                        />
                        <span>{s.label}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn-save-config"
                    onClick={handleSaveServicos}
                    disabled={updateSettingsMutation.isPending}
                  >
                    {updateSettingsMutation.isPending ? 'Salvando...' : 'Salvar serviços'}
                  </button>
                </div>
                {updateSettingsMutation.isSuccess && (
                  <p className="config-success">Configurações salvas. Os clientes verão essas opções ao agendar.</p>
                )}
              </>
            ) : (
              <p className="config-info">Entre como dono da empresa (Login da empresa) para configurar datas e horários.</p>
            )}
          </section>
        )}
        {aba === 'empresa' && (
          <section>
            <h2>Dados da Empresa</h2>
            <p>Edição de dados cadastrais, logo e horário de funcionamento.</p>
          </section>
        )}
        {aba === 'servicos' && (
          <section>
            <h2>Serviços</h2>
            <p>Lista de serviços oferecidos (banho, tosa, consulta, etc.).</p>
          </section>
        )}
        {aba === 'profissionais' && (
          <section>
            <h2>Profissionais</h2>
            <p>Funcionários, especialidades, dias de trabalho e comissões.</p>
          </section>
        )}
        {aba === 'usuarios' && (
          <section>
            <h2>Usuários</h2>
            <p>Quem tem acesso ao sistema (admin, gerente, funcionário).</p>
          </section>
        )}
        {aba === 'integracao' && (
          <section>
            <h2>Integrações</h2>
            <p>WhatsApp, pagamentos, notificações.</p>
          </section>
        )}
        {aba === 'assinatura' && (
          <section>
            <h2>Assinatura</h2>
            <p>Status, histórico e alteração de plano.</p>
          </section>
        )}
        {aba === 'backup' && (
          <section>
            <h2>Backup</h2>
            <p>Gerar backup, restaurar.</p>
          </section>
        )}
      </div>
    </div>
  );
}
