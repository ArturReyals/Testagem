import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  escutarAuth, logoutUsuario,
  getSolicitacoesByUsuario,
  getAgendamentosByUsuario,
  getDoacoesByUsuario,
  // IMPORTANTE: Adicione estas duas funções no seu firebaseService
  buscarDadosUsuario, 
  atualizarDadosUsuario 
} from '../../services/firebaseService';

const ROSA    = '#A61C5D';
const AMARELO = '#ffd801';
const CINZA   = '#f8f9fa';

// --- Funções de Apoio permanecem iguais ---
function formatData(ts) {
  if (!ts) return '—';
  if (ts.toDate) return ts.toDate().toLocaleDateString('pt-BR');
  if (typeof ts === 'string') return ts;
  return '—';
}

const statusColorMap = {
  pendente:   { bg: '#fff8e6', color: '#cc7700' },
  aprovado:   { bg: '#e6ffee', color: '#008833' },
  rejeitado:  { bg: '#ffe6e6', color: '#cc0000' },
  confirmada: { bg: '#e6ffee', color: '#008833' },
  cancelado:  { bg: '#ffe6e6', color: '#cc0000' },
};

function Badge({ status }) {
  const s = statusColorMap[status] || { bg: '#f0f0f0', color: '#555' };
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: '20px', padding: '3px 12px', fontSize: '12px', fontWeight: 700, textTransform: 'capitalize' }}>
      {status}
    </span>
  );
}

function CardVazio({ icone, texto, link, linkText }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px', color: '#aaa' }}>
      <i className={`bi ${icone}`} style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}></i>
      <p style={{ marginBottom: '16px' }}>{texto}</p>
      {link && <Link to={link} className="btn rounded-pill px-4" style={{ background: ROSA, color: 'white', fontWeight: 700 }}>{linkText}</Link>}
    </div>
  );
}

// --- Componentes das Abas ---
function AbaAdocoes({ uid }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getSolicitacoesByUsuario(uid).then(setItems).catch(console.error).finally(() => setLoading(false)); }, [uid]);
  if (loading) return <div className="text-center py-5"><div className="spinner-border" style={{ color: ROSA }}></div></div>;
  if (!items.length) return <CardVazio icone="bi-heart" texto="Você ainda não fez nenhuma solicitação de adoção." link="/pets" linkText="Ver Pets para Adoção" />;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr style={{ background: CINZA }}>{['Protocolo','Pet','Status','Data'].map(h => <th key={h} style={{ padding: '12px 16px', fontWeight: 700, fontSize: '13px', color: '#888', textAlign: 'left', borderBottom: '1px solid #eee' }}>{h}</th>)}</tr></thead>
        <tbody>{items.map(s => (<tr key={s.id} style={{ borderBottom: '1px solid #f5f5f5' }}><td style={{ padding: '14px 16px' }}><span style={{ fontFamily: 'monospace', color: ROSA, fontWeight: 700 }}>{s.protocolo}</span></td><td style={{ padding: '14px 16px', fontWeight: 600 }}>{s.petNome}</td><td style={{ padding: '14px 16px' }}><Badge status={s.status} /></td><td style={{ padding: '14px 16px', color: '#888', fontSize: '13px' }}>{formatData(s.criadoEm)}</td></tr>))}</tbody>
      </table>
    </div>
  );
}

function AbaAgendamentos({ uid }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getAgendamentosByUsuario(uid).then(setItems).catch(console.error).finally(() => setLoading(false)); }, [uid]);
  if (loading) return <div className="text-center py-5"><div className="spinner-border" style={{ color: ROSA }}></div></div>;
  if (!items.length) return <CardVazio icone="bi-calendar" texto="Você não tem agendamentos de visita." link="/agendamento" linkText="Agendar uma Visita" />;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr style={{ background: CINZA }}>{['Protocolo','Data','Horário','Motivo','Status'].map(h => <th key={h} style={{ padding: '12px 16px', fontWeight: 700, fontSize: '13px', color: '#888', textAlign: 'left', borderBottom: '1px solid #eee' }}>{h}</th>)}</tr></thead>
        <tbody>{items.map(a => (<tr key={a.id} style={{ borderBottom: '1px solid #f5f5f5' }}><td style={{ padding: '14px 16px' }}><span style={{ fontFamily: 'monospace', color: ROSA, fontWeight: 700 }}>{a.protocolo}</span></td><td style={{ padding: '14px 16px', fontWeight: 600 }}>{a.data}</td><td style={{ padding: '14px 16px' }}>{a.horario}</td><td style={{ padding: '14px 16px', color: '#666', fontSize: '13px' }}>{a.motivo || '—'}</td><td style={{ padding: '14px 16px' }}><Badge status={a.status} /></td></tr>))}</tbody>
      </table>
    </div>
  );
}

function AbaDoacoes({ uid }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getDoacoesByUsuario(uid).then(setItems).catch(console.error).finally(() => setLoading(false)); }, [uid]);
  if (loading) return <div className="text-center py-5"><div className="spinner-border" style={{ color: ROSA }}></div></div>;
  if (!items.length) return <CardVazio icone="bi-heart-fill" texto="Você ainda não fez nenhuma doação." link="/doacoes" linkText="Fazer uma Doação" />;
  const total = items.reduce((acc, d) => acc + (d.valor || 0), 0);
  return (
    <><div style={{ background: `linear-gradient(135deg, ${ROSA}, #7b1042)`, borderRadius: '14px', padding: '20px 24px', color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}><i className="bi bi-heart-fill" style={{ fontSize: '32px', opacity: 0.8 }}></i><div><div style={{ fontSize: '13px', opacity: 0.8 }}>Total doado</div><div style={{ fontSize: '28px', fontWeight: 800 }}>R$ {total.toFixed(2)}</div></div></div>
    <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: CINZA }}>{['Protocolo','Valor','Método','Status','Data'].map(h => <th key={h} style={{ padding: '12px 16px', fontWeight: 700, fontSize: '13px', color: '#888', textAlign: 'left', borderBottom: '1px solid #eee' }}>{h}</th>)}</tr></thead><tbody>{items.map(d => (<tr key={d.id} style={{ borderBottom: '1px solid #f5f5f5' }}><td style={{ padding: '14px 16px' }}><span style={{ fontFamily: 'monospace', color: ROSA, fontWeight: 700 }}>{d.protocolo}</span></td><td style={{ padding: '14px 16px', fontWeight: 700, color: ROSA }}>R$ {d.valor?.toFixed(2)}</td><td style={{ padding: '14px 16px', color: '#666', fontSize: '13px', textTransform: 'capitalize' }}>{d.metodo === 'pix' ? 'PIX' : d.metodo === 'credito' ? 'Crédito' : 'Débito'}</td><td style={{ padding: '14px 16px' }}><Badge status={d.status} /></td><td style={{ padding: '14px 16px', color: '#888', fontSize: '13px' }}>{formatData(d.criadoEm)}</td></tr>))}</tbody></table></div></>
  );
}

// --- Nova Aba de Perfil ---
function AbaPerfil({ uid }) {
  const [formData, setFormData] = useState({ nome: '', telefone: '', endereco: '' });
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    buscarDadosUsuario(uid).then(setFormData);
  }, [uid]);

  const handleSalvar = async () => {
    setSalvando(true);
    await atualizarDadosUsuario(uid, formData);
    setEditando(false);
    setSalvando(false);
    alert('Dados atualizados!');
  };

  return (
    <div style={{ padding: '10px' }}>
      <h5 className="mb-4">Meus Dados Cadastrais</h5>
      <div className="mb-3">
        <label className="form-label text-muted">Nome Completo</label>
        <input className="form-control" disabled={!editando} value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
      </div>
      <div className="mb-3">
        <label className="form-label text-muted">Telefone</label>
        <input className="form-control" disabled={!editando} value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} />
      </div>
      <div className="mb-4">
        <label className="form-label text-muted">Endereço</label>
        <textarea className="form-control" disabled={!editando} value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})} />
      </div>
      {editando ? (
        <button className="btn text-white rounded-pill px-4" style={{ background: ROSA }} onClick={handleSalvar} disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      ) : (
        <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setEditando(true)}>Editar Perfil</button>
      )}
    </div>
  );
}

// ── Componente Principal ────────────────────────────────
export default function MinhaConta() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [aba, setAba] = useState('adocoes');

  useEffect(() => {
    const unsub = escutarAuth(u => {
      if (!u) { navigate('/login'); return; }
      setUsuario(u);
      setCarregando(false);
    });
    return unsub;
  }, [navigate]);

  async function sair() {
    await logoutUsuario();
    navigate('/');
  }

  if (carregando) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner-border" style={{ color: ROSA }}></div></div>;

  const abas = [
    { key: 'adocoes', icon: 'bi-heart', label: 'Adocoes' },
    { key: 'agendamentos', icon: 'bi-calendar-check', label: 'Visitas' },
    { key: 'doacoes', icon: 'bi-cash-coin', label: 'Doacoes' },
    { key: 'perfil', icon: 'bi-person-gear', label: 'Perfil' },
  ];

  return (
    <>
      <section style={{ backgroundColor: AMARELO, padding: '60px 0 80px', textAlign: 'center' }}>
        <div className="container">
          <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 20px rgba(166,28,93,0.2)' }}>
            <i className="bi bi-person-circle" style={{ fontSize: '40px', color: ROSA }}></i>
          </div>
          <h2 style={{ color: ROSA, fontWeight: 800, margin: 0 }}>Olá, {usuario?.nome?.split(' ')[0]}! 🐾</h2>
        </div>
      </section>

      <div className="container" style={{ maxWidth: '860px', marginBottom: '80px' }}>
        <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', marginTop: '-40px', position: 'relative', zIndex: 10, overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', overflowX: 'auto' }}>
            {abas.map(a => (
              <button key={a.key} onClick={() => setAba(a.key)} style={{ flex: 1, minWidth: '120px', padding: '18px 16px', border: 'none', background: 'none', fontWeight: aba === a.key ? 700 : 500, fontSize: '14px', color: aba === a.key ? ROSA : '#888', borderBottom: `3px solid ${aba === a.key ? ROSA : 'transparent'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <i className={`bi ${a.icon}`}></i>{a.label}
              </button>
            ))}
          </div>
          <div style={{ padding: '24px' }}>
            {aba === 'adocoes' && <AbaAdocoes uid={usuario.uid} />}
            {aba === 'agendamentos' && <AbaAgendamentos uid={usuario.uid} />}
            {aba === 'doacoes' && <AbaDoacoes uid={usuario.uid} />}
            {aba === 'perfil' && <AbaPerfil uid={usuario.uid} />}
          </div>
          <div style={{ borderTop: '1px solid #f0f0f0', padding: '16px 24px', display: 'flex', justifyContent: 'space-between' }}>
            <Link to="/" className="btn btn-outline-secondary rounded-pill px-4">Voltar ao Início</Link>
            <button onClick={sair} className="btn rounded-pill px-4" style={{ background: ROSA, color: 'white' }}>Sair</button>
          </div>
        </div>
      </div>
    </>
  );
}