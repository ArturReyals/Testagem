// src/assets/pages/Agendamento.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { addAgendamento, escutarAuth, getAgendamentos } from '../../services/firebaseService';

const ROSA = '#A61C5D';
const AMARELO = '#ffd801';
const CINZA = '#f8f9fa';

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const HORARIOS = ['09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00'];
const MOTIVO_MAP = { '':'—', adocao:'Interesse em adoção', conhecer:'Conhecer os pets', voluntario:'Ser voluntário', doacao:'Entregar doação', outro:'Outro' };

function maskCpf(v) { return v.replace(/\D/g,'').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2').slice(0,14); }
function maskTel(v) { return v.replace(/\D/g,'').replace(/^(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d)/,'$1-$2').slice(0,16); }

function Calendario({ diaSel, onSelect }) {
  const [viewDate, setViewDate] = useState(new Date());
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const mudarMes = (delta) => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  const primeiroDia = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const ultimoDia   = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
  const diasVazios = Array.from({ length: primeiroDia.getDay() });
  const dias       = Array.from({ length: ultimoDia.getDate() }, (_, i) => i + 1);
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <button onClick={() => mudarMes(-1)} style={{ borderRadius: '50%', width: '36px', height: '36px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}><i className="bi bi-chevron-left"></i></button>
        <span style={{ fontWeight: 700, color: ROSA, fontSize: '18px' }}>{MESES[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
        <button onClick={() => mudarMes(1)} style={{ borderRadius: '50%', width: '36px', height: '36px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}><i className="bi bi-chevron-right"></i></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
        {DIAS_SEMANA.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#aaa', padding: '6px 0' }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {diasVazios.map((_, i) => <div key={'v'+i} />)}
        {dias.map(d => {
          const data = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
          const dow = data.getDay();
          const passado = data < hoje;
          const domingo = dow === 0;
          const desativado = passado || domingo;
          const isHoje = data.getTime() === hoje.getTime();
          const isSel = diaSel && data.toDateString() === diaSel.toDateString();
          return (
            <div key={d} onClick={() => !desativado && onSelect(data)} style={{ textAlign: 'center', borderRadius: '10px', padding: '10px 4px', fontSize: '14px', cursor: desativado ? 'default' : 'pointer', fontWeight: isSel ? 700 : 500, background: isSel ? ROSA : isHoje ? AMARELO : 'transparent', color: isSel ? 'white' : isHoje ? ROSA : desativado ? '#ccc' : '#333', border: isSel ? `2px solid ${ROSA}` : '2px solid transparent', transition: 'all 0.2s' }}>{d}</div>
          );
        })}
      </div>
    </>
  );
}

function Stepper({ tela }) {
  const steps = ['Seus Dados','Data & Hora','Confirmação','Concluído'];
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '40px' }}>
      {steps.map((s, i) => {
        const n = i + 1;
        const done = n < tela;
        const active = n === tela;
        return (
          <React.Fragment key={n}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '130px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: `2px solid ${done || active ? ROSA : '#ddd'}`, background: done || active ? ROSA : 'white', color: done || active ? 'white' : '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', transition: 'all 0.4s' }}>
                {done ? <i className="bi bi-check-lg" style={{ fontSize: '14px' }}></i> : n}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: done || active ? ROSA : '#aaa', marginTop: '8px', textAlign: 'center' }}>{s}</div>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: '2px', background: done ? ROSA : '#ddd', marginBottom: '20px', transition: 'background 0.4s' }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function Agendamento() {
  const [tela, setTela] = useState(1);
  const [form, setForm] = useState({ nome: '', cpf: '', email: '', telefone: '', motivo: '', pet: '' });
  const [diaSel, setDiaSel] = useState(null);
  const [horarioSel, setHorarioSel] = useState(null);
  const [protocolo, setProtocolo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [stages, setStages] = useState({ enviado: true, analise: false, confirmado: false, lembrete: false, visita: false });
  
  // ✅ Estado novo para armazenar a lista de agendamentos reais vindos do banco
  const [agendamentosDoBanco, setAgendamentosDoBanco] = useState([]);

  useEffect(() => {
    const unsub = escutarAuth(u => {
      setUsuario(u);
      if (u) setForm(f => ({ ...f, nome: u.nome || '', email: u.email || '', telefone: u.telefone || '' }));
    });
    return unsub;
  }, []);

  // ✅ Busca os agendamentos salvos no banco para saber o que bloquear
  useEffect(() => {
    getAgendamentos()
      .then(setAgendamentosDoBanco)
      .catch(console.error);
  }, [tela]); // Recarrega se o fluxo mudar para atualizar horários novos

  function handleForm(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function irPara(n) {
    if (n === 2) {
      if (!form.nome || !form.email || !form.telefone) { alert('Preencha: Nome, E-mail e Telefone.'); return; }
    }
    if (n === 3) {
      if (!diaSel || !horarioSel) { alert('Selecione uma data e um horário.'); return; }
    }
    if (n === 4) {
      setEnviando(true);
      try {
        const dataStr = diaSel.toLocaleDateString('pt-BR');
        await addAgendamento({
          usuarioId:   usuario?.uid || '',
          usuarioNome: form.nome,
          email:      form.email,
          telefone:   form.telefone,
          cpf:        form.cpf,
          motivo:     form.motivo,
          petInteresse: form.pet,
          data:       dataStr,
          horario:    horarioSel,
          dataISO:    diaSel.toISOString(),
          status:     'pendente', // Garante o status correto inicial
        });
        const prot = '#AGD-' + Math.floor(1000 + Math.random() * 9000);
        setProtocolo(prot);
        setTela(4);
        setTimeout(() => setStages(s => ({ ...s, analise: true })), 800);
        setTimeout(() => setStages(s => ({ ...s, confirmado: true })), 2800);
        setTimeout(() => setStages(s => ({ ...s, lembrete: true })), 4800);
        setTimeout(() => setStages(s => ({ ...s, visita: true })), 6800);
      } catch (err) {
        console.error(err);
        alert('Erro ao salvar agendamento. Tente novamente.');
      } finally {
        setEnviando(false);
      }
      return;
    }
    setTela(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ✅ LÓGICA DE BLOQUEIO DINÂMICO: Descobre quais horários estão ocupados na data escolhida
  const obterHorariosOcupados = () => {
    if (!diaSel) return [];
    const dataAlvoStr = diaSel.toLocaleDateString('pt-BR');
    
    return agendamentosDoBanco
      .filter(a => a.data === dataAlvoStr && (a.status === 'pendente' || a.status === 'confirmado' || a.status === 'bloqueado'))
      .map(a => a.horario);
  };

  const horariosOcupados = obterHorariosOcupados();
  const inputStyle = { borderRadius: '12px', fontSize: '14px' };
  const btnRosa = { background: ROSA, color: 'white', borderRadius: '30px', fontWeight: 700, border: 'none', padding: '10px 24px', cursor: 'pointer' };

  return (
    <>
      <section style={{ backgroundColor: AMARELO, padding: '70px 0 90px', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ color: ROSA, fontWeight: 800, fontSize: '2.8rem' }}><i className="bi bi-calendar-heart me-2"></i>Agendar Visitação</h1>
          <p style={{ color: ROSA, fontSize: '1.2rem', marginTop: '12px' }}>Venha conhecer nossos pets pessoalmente! Escolha o melhor dia e horário para sua visita.</p>
        </div>
      </section>

      <div className="container" style={{ maxWidth: '760px', marginBottom: '80px' }}>
        <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', padding: '40px', marginTop: '-50px', position: 'relative', zIndex: 10 }}>
          <Stepper tela={tela} />

          {tela === 1 && (
            <>
              <h5 className="fw-bold mb-1" style={{ color: ROSA }}>Seus Dados</h5>
              <p className="text-muted mb-4" style={{ fontSize: '14px' }}>Preencha suas informações para o agendamento.</p>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Nome Completo *</label>
                  <input type="text" className="form-control" name="nome" value={form.nome} onChange={handleForm} placeholder="Ex: Maria Silva" style={inputStyle} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">CPF</label>
                  <input type="text" className="form-control" name="cpf" value={form.cpf} onChange={e => setForm(f => ({ ...f, cpf: maskCpf(e.target.value) }))} placeholder="000.000.000-00" style={inputStyle} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">E-mail *</label>
                  <input type="email" className="form-control" name="email" value={form.email} onChange={handleForm} placeholder="seu@email.com" style={inputStyle} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Telefone / WhatsApp *</label>
                  <input type="text" className="form-control" name="telefone" value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: maskTel(e.target.value) }))} placeholder="(85) 9 9999-9999" style={inputStyle} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Motivo da Visita</label>
                  <select className="form-select" name="motivo" value={form.motivo} onChange={handleForm} style={inputStyle}>
                    <option value="">Selecione...</option>
                    <option value="adocao">Interesse em adoção</option>
                    <option value="conhecer">Conhecer os pets</option>
                    <option value="voluntario">Ser voluntário</option>
                    <option value="doacao">Entregar doação</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Pet de interesse (opcional)</label>
                  <input type="text" className="form-control" name="pet" value={form.pet} onChange={handleForm} placeholder="Ex: Bolinha, Thor, Luna..." style={inputStyle} />
                </div>
              </div>
              <div className="text-end mt-4">
                <button onClick={() => irPara(2)} style={btnRosa}>Próximo <i className="bi bi-arrow-right ms-1"></i></button>
              </div>
            </>
          )}

          {tela === 2 && (
            <>
              <h5 className="fw-bold mb-1" style={{ color: ROSA }}>Escolha a Data</h5>
              <p className="text-muted mb-4" style={{ fontSize: '14px' }}>Disponível de segunda a sábado, exceto feriados.</p>
              <Calendario diaSel={diaSel} onSelect={d => { setDiaSel(d); setHorarioSel(null); }} />
              {diaSel && (
                <div style={{ marginTop: '24px' }}>
                  <h5 className="fw-bold mb-1" style={{ color: ROSA }}>Escolha o Horário</h5>
                  <p className="text-muted mb-3" style={{ fontSize: '14px' }}>Horários <span style={{ textDecoration: 'line-through', color: '#aaa' }}>riscados</span> já estão reservados ou em análise.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    {HORARIOS.map(h => {
                      const ocupado = horariosOcupados.includes(h);
                      const selecionado = horarioSel === h;
                      return (
                        <div key={h} onClick={() => !ocupado && setHorarioSel(h)} style={{ border: `2px solid ${selecionado ? ROSA : ocupado ? '#f0f0f0' : '#ddd'}`, borderRadius: '12px', padding: '12px 8px', textAlign: 'center', background: selecionado ? ROSA : ocupado ? '#fafafa' : 'white', color: selecionado ? 'white' : ocupado ? '#ccc' : '#333', cursor: ocupado ? 'default' : 'pointer', textDecoration: ocupado ? 'line-through' : 'none', fontSize: '14px', fontWeight: 600 }}>
                          {!ocupado && <i className="bi bi-clock me-1" style={{ color: selecionado ? 'white' : ROSA }}></i>}
                          {ocupado && <i className="bi bi-x-circle text-danger me-1"></i>}
                          {h}
                          {ocupado && <div style={{ fontSize: '11px', marginTop: '2px', textDecoration: 'none', display: 'block' }}>Ocupado</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="d-flex justify-content-between mt-4">
                <button onClick={() => !enviando && irPara(1)} className="btn btn-outline-secondary rounded-pill"><i className="bi bi-arrow-left me-1"></i> Voltar</button>
                <button onClick={() => irPara(3)} style={{ ...btnRosa, opacity: !diaSel || !horarioSel ? 0.5 : 1 }} disabled={!diaSel || !horarioSel}>Próximo <i className="bi bi-arrow-right ms-1"></i></button>
              </div>
            </>
          )}

          {tela === 3 && (
            <>
              <div className="text-center mb-4">
                <h5 className="fw-bold" style={{ color: ROSA }}>Confirme seu Agendamento</h5>
                <p className="text-muted" style={{ fontSize: '14px' }}>Revise as informações antes de confirmar.</p>
              </div>
              <div style={{ background: CINZA, borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
                {[
                  { icon: 'bi-person',    label: 'Nome',     value: form.nome },
                  { icon: 'bi-envelope',  label: 'E-mail',   value: form.email },
                  { icon: 'bi-phone',     label: 'Telefone', value: form.telefone },
                  { icon: 'bi-calendar3', label: 'Data',     value: diaSel?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                  { icon: 'bi-clock',     label: 'Horário',  value: horarioSel },
                  { icon: 'bi-heart',     label: 'Motivo',   value: MOTIVO_MAP[form.motivo] || '—' },
                  ...(form.pet ? [{ icon: 'bi-star', label: 'Pet de interesse', value: form.pet }] : []),
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e8e8e8' }}>
                    <span style={{ color: '#888', fontSize: '14px' }}><i className={`bi ${row.icon} me-2`}></i>{row.label}</span>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#333' }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: '#fff9e6', border: `1.5px solid ${AMARELO}`, borderRadius: '12px', padding: '14px 16px', fontSize: '13px', color: '#7a5f00', marginBottom: '20px' }}>
                <i className="bi bi-info-circle me-2"></i>Você receberá a confirmação no e-mail informado. Nossa equipe analisará o agendamento em até 24h.
              </div>
              <div className="d-flex justify-content-between">
                <button onClick={() => irPara(2)} className="btn btn-outline-secondary rounded-pill"><i className="bi bi-arrow-left me-1"></i> Voltar</button>
                <button onClick={() => irPara(4)} disabled={enviando} style={btnRosa}>
                  {enviando ? <><span className="spinner-border spinner-border-sm me-2"></span>Salvando...</> : <><i className="bi bi-check-circle me-1"></i> Confirmar Visita</>}
                </button>
              </div>
            </>
          )}

          {tela === 4 && (
            <>
              <div className="text-center">
                <div style={{ width: '90px', height: '90px', background: AMARELO, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <i className="bi bi-calendar-check" style={{ fontSize: '42px', color: ROSA }}></i>
                </div>
                <h4 className="fw-bold" style={{ color: ROSA }}>Solicitação Enviada!</h4>
                <p className="text-muted">Acompanhe abaixo o status do seu agendamento.</p>
                <div style={{ background: CINZA, borderRadius: '14px', padding: '16px 20px', display: 'inline-block', margin: '10px auto' }}>
                  <strong style={{ fontSize: '22px', color: ROSA }}>{protocolo}</strong>
                  <div style={{ fontSize: '13px', color: '#888' }}>Número de Protocolo</div>
                </div>
              </div>
              <div style={{ marginTop: '24px' }}>
                {[
                  { key: 'enviado',     icon: 'bi-send-check',    label: 'Solicitação Enviada',    desc: 'Recebemos sua solicitação com sucesso.' },
                  { key: 'analise',     icon: 'bi-search',         label: 'Em Análise',             desc: 'Nossa equipe está verificando disponibilidade...' },
                  { key: 'confirmado', icon: 'bi-calendar-check', label: 'Agendamento Confirmado', desc: 'Você receberá a confirmação por e-mail.' },
                  { key: 'lembrete',    icon: 'bi-bell',           label: 'Lembrete Enviado',       desc: 'Enviaremos um lembrete 24h antes da visita.' },
                  { key: 'visita',      icon: 'bi-house-heart',    label: 'Dia da Visita',          desc: 'Bem-vindo à ONG AdoPet! Nos vemos em breve. 🐾' },
                ].map((stage, i) => {
                  const done = stages[stage.key];
                  return (
                    <div key={stage.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '14px 0', borderBottom: i < 4 ? '1px solid #f0f0f0' : 'none' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0, background: done ? ROSA : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: done ? 'white' : '#ccc', fontSize: '18px', transition: 'all 0.5s' }}>
                        <i className={`bi ${stage.icon}`}></i>
                      </div>
                      <div>
                        <strong style={{ color: done ? ROSA : '#555', display: 'block' }}>{stage.label}</strong>
                        <small style={{ color: '#888' }}>{stage.desc}</small>
                      </div>
                      {done && <i className="bi bi-check-circle-fill ms-auto" style={{ color: ROSA, fontSize: '20px', flexShrink: 0 }}></i>}
                    </div>
                  );
                })}
              </div>
              <div className="text-center mt-4 d-flex justify-content-center gap-3 flex-wrap">
                <Link to="/" className="btn rounded-pill px-4" style={{ background: AMARELO, color: ROSA, fontWeight: 700 }}>Voltar ao Início</Link>
                <Link to="/minha-conta" className="btn rounded-pill px-4" style={{ background: ROSA, color: 'white', fontWeight: 700 }}>Ver Meus Agendamentos</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}