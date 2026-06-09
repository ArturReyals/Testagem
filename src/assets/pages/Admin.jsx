// src/assets/pages/Admin.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getPets, addPet, updatePet, deletePet, uploadImagem,
  getUsuarios, getSolicitacoes, updateSolicitacao,
  getAgendamentos,
  logoutUsuario, escutarAuth, seedPets,
} from '../../services/firebaseService';

const ROSA   = '#A61C5D';
const AMARELO = '#ffd801';
const CINZA  = '#f0f2f5';

const cardStyle = { background: 'white', borderRadius: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '24px' };
const thStyle   = { padding: '12px 16px', fontWeight: 700, fontSize: '13px', color: '#888', background: '#fafafa', borderBottom: '1px solid #f0f0f0', textAlign: 'left' };
const tdStyle   = { padding: '12px 16px', fontSize: '13px', color: '#444', borderBottom: '1px solid #f8f8f8' };
const inputStyle = { borderRadius: '10px', border: '1.5px solid #e0e0e0', padding: '9px 13px', fontSize: '14px', width: '100%', outline: 'none' };
const btnRosa   = { background: ROSA, color: 'white', border: 'none', borderRadius: '10px', padding: '9px 18px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' };

const statusColor = { disponivel: { bg: '#e6ffee', color: '#008833' }, reservado: { bg: '#fff5e6', color: '#cc7700' }, adotado: { bg: '#e6f0ff', color: '#004499' } };
const solColor    = { pendente: { bg: '#fff5e6', color: '#cc7700' }, aprovado: { bg: '#e6ffee', color: '#008833' }, rejeitado: { bg: '#ffe6e6', color: '#cc0000' } };

const IMG_FALLBACK = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&q=60';

function Badge({ status, map }) {
  const s = (map || statusColor)[status] || { bg: '#eee', color: '#555' };
  return <span style={{ background: s.bg, color: s.color, borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 700, textTransform: 'capitalize' }}>{status}</span>;
}

// ── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ aba, setAba, sessao, onSair }) {
  const navs = [
    { key: 'dashboard',    icon: 'bi-speedometer2',     label: 'Dashboard' },
    { key: 'pets',         icon: 'bi-heart',            label: 'Gerenciar Pets' },
    { key: 'cadastrar',    icon: 'bi-plus-circle',      label: 'Cadastrar Pet' },
    { key: 'solicitacoes', icon: 'bi-clipboard2-check', label: 'Solicitações' },
    { key: 'usuarios',     icon: 'bi-people',           label: 'Usuários' },
    { key: 'agendamentos', icon: 'bi-calendar-check',   label: 'Agendamentos' },
  ];
  return (
    <div style={{ width: '240px', background: `linear-gradient(160deg,#7b1042,${ROSA})`, minHeight: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 100, display: 'flex', flexDirection: 'column', boxShadow: '4px 0 20px rgba(166,28,93,0.18)' }}>
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <div style={{ color: 'white', fontWeight: 800, fontSize: '20px' }}>🐾 AdoPet</div>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', display: 'block', marginTop: '4px' }}>Painel Administrativo</span>
      </div>
      <nav style={{ padding: '16px 0', flex: 1 }}>
        {navs.map(n => (
          <div key={n.key} onClick={() => setAba(n.key)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 20px', color: aba === n.key ? 'white' : 'rgba(255,255,255,0.75)', fontSize: '14px', fontWeight: aba === n.key ? 700 : 500, cursor: 'pointer', borderLeft: `3px solid ${aba === n.key ? AMARELO : 'transparent'}`, background: aba === n.key ? 'rgba(255,255,255,0.15)' : 'transparent', transition: 'all 0.2s' }}>
            <i className={`bi ${n.icon}`} style={{ fontSize: '18px', width: '22px' }}></i>
            {n.label}
          </div>
        ))}
      </nav>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <div style={{ color: 'white', fontSize: '13px' }}>
          <span style={{ fontWeight: 600 }}>{sessao?.nome}</span>
          <small style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', display: 'block' }}>{sessao?.email}</small>
        </div>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '10px', textDecoration: 'none' }}>
          <i className="bi bi-house"></i> Ver Site
        </Link>
        <div onClick={onSair} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '6px', cursor: 'pointer' }}>
          <i className="bi bi-box-arrow-right"></i> Sair
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ pets, users, sols, setAba }) {
  const stats = [
    { val: pets.length,                                      label: 'Total de Pets',  icon: 'bi-heart-fill',       bg: '#fff0f5', color: ROSA },
    { val: pets.filter(p => p.status === 'disponivel').length, label: 'Disponíveis', icon: 'bi-check-circle-fill', bg: '#e6ffee', color: '#22c55e' },
    { val: pets.filter(p => p.status === 'reservado').length,  label: 'Reservados',  icon: 'bi-clock-fill',        bg: '#fff8e6', color: '#f59e0b' },
    { val: users.length,                                     label: 'Usuários',      icon: 'bi-people-fill',       bg: '#e6f0ff', color: '#3b82f6' },
  ];
  return (
    <>
      <div className="row g-3 mb-4">
        {stats.map((s, i) => (
          <div key={i} className="col-md-3 col-6">
            <div style={{ background: 'white', borderRadius: '18px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: s.color, flexShrink: 0 }}>
                <i className={`bi ${s.icon}`}></i>
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#222', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ ...cardStyle, padding: '20px 24px' }}>
        <h6 style={{ fontWeight: 700, color: '#333', marginBottom: '16px' }}>Ações Rápidas</h6>
        <div className="d-flex gap-3 flex-wrap">
          <button onClick={() => setAba('cadastrar')} style={btnRosa}><i className="bi bi-plus-circle me-2"></i>Cadastrar Pet</button>
          <button onClick={() => setAba('solicitacoes')} style={{ ...btnRosa, background: '#3b82f6' }}><i className="bi bi-clipboard2-check me-2"></i>Ver Solicitações</button>
        </div>
      </div>
    </>
  );
}

// ── GERENCIAR PETS ───────────────────────────────────────────────────────────
function GerenciarPets({ pets, onRefresh, setAba }) {
  const [busca, setBusca]       = useState('');
  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const filtrados = pets.filter(p => p.nome?.toLowerCase().includes(busca.toLowerCase()));

  async function excluir(id, nome) {
    if (!window.confirm(`Excluir ${nome}?`)) return;
    try { await deletePet(id); onRefresh(); }
    catch { alert('Erro ao excluir.'); }
  }

  async function salvarEdicao() {
    if (!editando.nome || !editando.idade) { alert('Preencha nome e idade.'); return; }
    setSalvando(true);
    try {
      await updatePet(editando.id, editando);
      setEditando(null);
      onRefresh();
    } catch { alert('Erro ao salvar.'); }
    finally { setSalvando(false); }
  }

  return (
    <div style={cardStyle}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h5 style={{ margin: 0, fontWeight: 700, color: '#333' }}><i className="bi bi-heart me-2" style={{ color: ROSA }}></i>Pets Cadastrados</h5>
        <input placeholder="Buscar pet..." value={busca} onChange={e => setBusca(e.target.value)}
          style={{ ...inputStyle, width: '220px' }} />
      </div>
      <div style={{ overflowX: 'auto' }}>
        {!filtrados.length ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
            <i className="bi bi-inbox" style={{ fontSize: '40px' }}></i>
            <p className="mt-2">Nenhum pet encontrado.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Foto','Nome','Tipo','Status','Localização','Ações'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                editando?.id === p.id ? (
                  <tr key={p.id} style={{ background: '#fffbf5' }}>
                    <td style={tdStyle} colSpan={6}>
                      <div className="row g-2 align-items-end">
                        {[
                          { label: 'Nome', name: 'nome', type: 'text' },
                          { label: 'Idade', name: 'idade', type: 'text' },
                          { label: 'Localização', name: 'localizacao', type: 'text' },
                        ].map(f => (
                          <div key={f.name} className="col-md-3">
                            <label style={{ fontSize: '12px', color: '#888', display: 'block' }}>{f.label}</label>
                            <input type={f.type} value={editando[f.name] || ''} onChange={e => setEditando(ed => ({ ...ed, [f.name]: e.target.value }))} style={{ ...inputStyle, padding: '7px 10px' }} />
                          </div>
                        ))}
                        <div className="col-md-2">
                          <label style={{ fontSize: '12px', color: '#888', display: 'block' }}>Status</label>
                          <select value={editando.status} onChange={e => setEditando(ed => ({ ...ed, status: e.target.value }))} style={{ ...inputStyle, padding: '7px 10px' }}>
                            <option value="disponivel">Disponível</option>
                            <option value="reservado">Reservado</option>
                            <option value="adotado">Adotado</option>
                          </select>
                        </div>
                        <div className="col-auto d-flex gap-2">
                          <button onClick={salvarEdicao} disabled={salvando} style={btnRosa}>
                            {salvando ? '...' : '✓ Salvar'}
                          </button>
                          <button onClick={() => setEditando(null)} className="btn btn-outline-secondary" style={{ borderRadius: '10px', fontSize: '13px' }}>Cancelar</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={p.id}>
                    <td style={tdStyle}>
                      <img src={p.foto || IMG_FALLBACK} alt={p.nome} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '10px' }}
                        onError={e => { e.target.onerror = null; e.target.src = IMG_FALLBACK; }} />
                    </td>
                    <td style={tdStyle}><strong>{p.nome}</strong></td>
                    <td style={tdStyle}>{p.tipo === 'cachorro' ? '🐶' : '🐱'} {p.tipo}</td>
                    <td style={tdStyle}><Badge status={p.status} /></td>
                    <td style={tdStyle}>{p.localizacao}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => setEditando({ ...p })} style={{ background: '#f0f8ff', color: '#3b82f6', border: 'none', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>✏️ Editar</button>
                        <button onClick={() => excluir(p.id, p.nome)} style={{ background: '#ffe6e6', color: '#cc0000', border: 'none', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>🗑 Excluir</button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── CADASTRAR PET ─────────────────────────────────────────────────────────────
function CadastrarPet({ onRefresh, setAba }) {
  const [form, setForm]     = useState({ nome: '', tipo: 'cachorro', sexo: 'Macho', idade: '', porte: 'medio', localizacao: 'Fortaleza', descricao: '', foto: '', status: 'disponivel', vacinado: false, castrado: false });
  const [alerta, setAlerta] = useState(null);
  const [arquivo, setArquivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [salvando, setSalvando] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleArquivo(e) {
    const file = e.target.files[0];
    if (!file) return;
    setArquivo(file);
    setPreview(URL.createObjectURL(file));
  }

  async function salvar() {
    if (!form.nome || !form.idade) { setAlerta({ msg: 'Preencha o nome e a idade do pet.', tipo: 'danger' }); return; }
    setSalvando(true);
    try {
      let fotoUrl = form.foto;

      // ✅ Se selecionou um arquivo, faz upload para o Firebase Storage
      if (arquivo) {
        fotoUrl = await uploadImagem(arquivo, 'pets');
      }

      await addPet({ ...form, foto: fotoUrl });
      setAlerta({ msg: `✅ Pet <strong>${form.nome}</strong> cadastrado com sucesso!`, tipo: 'success' });
      setForm({ nome: '', tipo: 'cachorro', sexo: 'Macho', idade: '', porte: 'medio', localizacao: 'Fortaleza', descricao: '', foto: '', status: 'disponivel', vacinado: false, castrado: false });
      setArquivo(null);
      setPreview(null);
      onRefresh();
      setTimeout(() => setAba('pets'), 1500);
    } catch (err) {
      console.error('Erro ao cadastrar pet:', err);
      let msg = 'Erro ao cadastrar pet. Tente novamente.';
      if (err?.code === 'storage/unauthorized') msg = '⚠️ Sem permissão no Storage. Use uma URL de imagem.';
      else if (err?.code === 'permission-denied') msg = '⚠️ Sem permissão no Firestore. Verifique as regras.';
      else if (err?.message) msg = 'Erro: ' + err.message;
      setAlerta({ msg, tipo: 'danger' });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div style={cardStyle}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0' }}>
        <h5 style={{ margin: 0, fontWeight: 700, color: '#333' }}><i className="bi bi-plus-circle me-2" style={{ color: ROSA }}></i>Cadastrar Novo Pet</h5>
      </div>
      <div style={{ padding: '24px' }}>
        {alerta && <div className={`alert alert-${alerta.tipo}`} style={{ borderRadius: '10px', fontSize: '14px', marginBottom: '16px' }} dangerouslySetInnerHTML={{ __html: alerta.msg }} />}
        <div className="row g-3">
          {[
            { label: 'Nome do Pet *', name: 'nome', type: 'text', placeholder: 'Ex: Bolinha', col: 6 },
            { label: 'Idade *', name: 'idade', type: 'text', placeholder: 'Ex: 2 anos / 4 meses', col: 4 },
          ].map(f => (
            <div key={f.name} className={`col-md-${f.col}`}>
              <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>{f.label}</label>
              <input type={f.type} name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} style={inputStyle} />
            </div>
          ))}

          {/* ✅ UPLOAD DE IMAGEM — substitui o campo de URL */}
          <div className="col-12">
            <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Foto do Pet</label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div>
                <input type="file" accept="image/*" onChange={handleArquivo} className="form-control" style={{ ...inputStyle, width: 'auto' }} />
                <p style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>Ou cole uma URL abaixo</p>
                <input type="text" name="foto" value={form.foto} onChange={handleChange} placeholder="https://..." style={{ ...inputStyle, marginTop: '4px' }} />
              </div>
              {(preview || form.foto) && (
                <img src={preview || form.foto} alt="preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #eee' }}
                  onError={e => { e.target.style.display = 'none'; }} />
              )}
            </div>
          </div>

          {[
            { label: 'Espécie *',     name: 'tipo',        options: [['cachorro','Cachorro'],['gato','Gato']], col: 3 },
            { label: 'Sexo *',        name: 'sexo',        options: [['Macho','Macho'],['Fêmea','Fêmea']], col: 3 },
            { label: 'Porte *',       name: 'porte',       options: [['pequeno','Pequeno'],['medio','Médio'],['grande','Grande']], col: 4 },
            { label: 'Localização *', name: 'localizacao', options: [['Fortaleza','Fortaleza'],['Caucaia','Caucaia'],['Eusébio','Eusébio'],['Maracanaú','Maracanaú']], col: 4 },
            { label: 'Status',        name: 'status',      options: [['disponivel','Disponível'],['reservado','Reservado'],['adotado','Adotado']], col: 4 },
          ].map(f => (
            <div key={f.name} className={`col-md-${f.col}`}>
              <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>{f.label}</label>
              <select name={f.name} value={form[f.name]} onChange={handleChange} style={inputStyle}>
                {f.options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
              </select>
            </div>
          ))}
          <div className="col-12">
            <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Descrição</label>
            <textarea name="descricao" rows={3} value={form.descricao} onChange={handleChange} placeholder="Personalidade, história, comportamento..." style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div className="col-12 d-flex gap-4">
            {[['vacinado','Vacinado'],['castrado','Castrado']].map(([name, label]) => (
              <div key={name} className="form-check">
                <input type="checkbox" className="form-check-input" name={name} checked={form[name]} onChange={handleChange} id={name} />
                <label className="form-check-label" htmlFor={name} style={{ fontSize: '14px' }}>{label}</label>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button onClick={salvar} disabled={salvando} style={{ ...btnRosa, opacity: salvando ? 0.7 : 1 }}>
            {salvando ? <><span className="spinner-border spinner-border-sm me-2"></span>Salvando...</> : <><i className="bi bi-floppy me-2"></i>Salvar Pet</>}
          </button>
          <button onClick={() => { setForm({ nome: '', tipo: 'cachorro', sexo: 'Macho', idade: '', porte: 'medio', localizacao: 'Fortaleza', descricao: '', foto: '', status: 'disponivel', vacinado: false, castrado: false }); setArquivo(null); setPreview(null); }}
            className="btn btn-outline-secondary" style={{ borderRadius: '10px' }}>Limpar</button>
        </div>
      </div>
    </div>
  );
}

// ── SOLICITAÇÕES ─────────────────────────────────────────────────────────────
function Solicitacoes({ sols, onRefresh }) {
  const [filtro, setFiltro]     = useState('todas');
  const [atualizando, setAtualizando] = useState(null);
  const filtrados = filtro === 'todas' ? sols : sols.filter(s => s.status === filtro);

  async function mudarStatus(id, status) {
    setAtualizando(id);
    try { await updateSolicitacao(id, status); onRefresh(); }
    catch { alert('Erro ao atualizar.'); }
    finally { setAtualizando(null); }
  }

  const tabs = [['todas','Todas'],['pendente','Pendentes'],['aprovado','Aprovadas'],['rejeitado','Rejeitadas']];
  return (
    <div style={cardStyle}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h5 style={{ margin: 0, fontWeight: 700, color: '#333' }}><i className="bi bi-clipboard2-check me-2" style={{ color: ROSA }}></i>Solicitações de Adoção</h5>
        <div style={{ display: 'flex', background: '#f0f0f0', borderRadius: '10px', padding: '4px', gap: '2px' }}>
          {tabs.map(([key, label]) => (
            <div key={key} onClick={() => setFiltro(key)} style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', background: filtro === key ? ROSA : 'transparent', color: filtro === key ? 'white' : '#888' }}>{label}</div>
          ))}
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        {!filtrados.length ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
            <i className="bi bi-inbox" style={{ fontSize: '40px' }}></i>
            <p className="mt-2">Nenhuma solicitação encontrada.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Protocolo','Solicitante','Pet','Status','Ações'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {filtrados.map(s => (
                <tr key={s.id}>
                  <td style={tdStyle}><span style={{ fontFamily: 'monospace', color: ROSA }}>{s.protocolo}</span></td>
                  <td style={tdStyle}>{s.usuarioNome}<div style={{ fontSize: '11px', color: '#aaa' }}>{s.email}</div></td>
                  <td style={tdStyle}>{s.petNome}</td>
                  <td style={tdStyle}><Badge status={s.status} map={solColor} /></td>
                  <td style={tdStyle}>
                    {s.status === 'pendente' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => mudarStatus(s.id, 'aprovado')} disabled={atualizando === s.id}
                          style={{ background: '#e6ffee', color: '#008833', border: 'none', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>✓ Aprovar</button>
                        <button onClick={() => mudarStatus(s.id, 'rejeitado')} disabled={atualizando === s.id}
                          style={{ background: '#ffe6e6', color: '#cc0000', border: 'none', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>✕ Rejeitar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── USUÁRIOS ─────────────────────────────────────────────────────────────────
function Usuarios({ users }) {
  return (
    <div style={cardStyle}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0' }}>
        <h5 style={{ margin: 0, fontWeight: 700, color: '#333' }}><i className="bi bi-people me-2" style={{ color: ROSA }}></i>Usuários Cadastrados</h5>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Nome','E-mail','Papel','Cadastro'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={tdStyle}><strong>{u.nome}</strong></td>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}><Badge status={u.role} map={{ admin: { bg: '#fff0f5', color: ROSA }, visitante: { bg: '#f0f0f0', color: '#555' } }} /></td>
                <td style={tdStyle}>{u.criadoEm?.toDate ? u.criadoEm.toDate().toLocaleDateString('pt-BR') : u.criadoEm}</td>
              </tr>
            ))}
            {!users.length && <tr><td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: '#ccc', padding: '32px' }}>Nenhum usuário.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ── AGENDAMENTOS (admin) ──────────────────────────────────────────────────────
function AgendamentosAdmin({ agends }) {
  const solColor = { pendente: { bg: '#fff5e6', color: '#cc7700' }, confirmado: { bg: '#e6ffee', color: '#008833' }, cancelado: { bg: '#ffe6e6', color: '#cc0000' } };
  return (
    <div style={cardStyle}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0' }}>
        <h5 style={{ margin: 0, fontWeight: 700, color: '#333' }}><i className="bi bi-calendar-check me-2" style={{ color: ROSA }}></i>Agendamentos de Visita</h5>
      </div>
      <div style={{ overflowX: 'auto' }}>
        {!agends.length ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
            <i className="bi bi-calendar" style={{ fontSize: '40px' }}></i>
            <p className="mt-2">Nenhum agendamento ainda.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Protocolo','Nome','Data','Horário','Motivo','Status'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {agends.map(a => (
                <tr key={a.id}>
                  <td style={tdStyle}><span style={{ fontFamily: 'monospace', color: ROSA }}>{a.protocolo}</span></td>
                  <td style={tdStyle}>{a.usuarioNome}<div style={{ fontSize: '11px', color: '#aaa' }}>{a.email}</div></td>
                  <td style={tdStyle}>{a.data}</td>
                  <td style={tdStyle}>{a.horario}</td>
                  <td style={tdStyle}>{a.motivo || '—'}</td>
                  <td style={tdStyle}><Badge status={a.status} map={solColor} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function Admin() {
  const navigate  = useNavigate();
  const [aba, setAba]       = useState('dashboard');
  const [sessao, setSessao] = useState(null);
  const [pets, setPets]     = useState([]);
  const [users, setUsers]   = useState([]);
  const [sols, setSols]     = useState([]);
  const [agends, setAgends] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [p, u, s, a] = await Promise.all([getPets(), getUsuarios(), getSolicitacoes(), getAgendamentos()]);
      setPets(p); setUsers(u); setSols(s); setAgends(a);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  }, []);

  useEffect(() => {
    const unsub = escutarAuth(async usuario => {
      if (!usuario || usuario.role !== 'admin') { navigate('/login'); return; }
      setSessao(usuario);
      await refresh();
      setCarregando(false);
    });
    return unsub;
  }, []);

  async function sair() {
    await logoutUsuario();
    navigate('/login');
  }

  const abaTitle = { dashboard: 'Dashboard', pets: 'Gerenciar Pets', cadastrar: 'Cadastrar Pet', solicitacoes: 'Solicitações', usuarios: 'Usuários', agendamentos: 'Agendamentos' };

  if (carregando) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: CINZA }}>
        <div className="spinner-border" style={{ color: ROSA, width: '50px', height: '50px' }}></div>
      </div>
    );
  }

  return (
    <div style={{ background: CINZA, minHeight: '100vh', display: 'flex' }}>
      <Sidebar aba={aba} setAba={setAba} sessao={sessao} onSair={sair} />
      <div style={{ marginLeft: '240px', flex: 1, minHeight: '100vh' }}>
        <div style={{ background: 'white', padding: '14px 28px', borderBottom: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 90, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h4 style={{ margin: 0, color: '#333', fontWeight: 700, fontSize: '18px' }}>{abaTitle[aba]}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ background: 'rgba(166,28,93,0.1)', color: ROSA, borderRadius: '20px', padding: '8px 14px', fontSize: '13px' }}>
              <i className="bi bi-shield-check me-1"></i>Admin
            </span>
            <button onClick={sair} className="btn btn-sm" style={{ borderRadius: '10px', border: '1.5px solid #e0e0e0', fontSize: '13px' }}>
              <i className="bi bi-box-arrow-right me-1"></i>Sair
            </button>
          </div>
        </div>
        <div style={{ padding: '28px' }}>
          {aba === 'dashboard'    && <Dashboard pets={pets} users={users} sols={sols} setAba={setAba} />}
          {aba === 'pets'         && <GerenciarPets pets={pets} onRefresh={refresh} setAba={setAba} />}
          {aba === 'cadastrar'    && <CadastrarPet onRefresh={refresh} setAba={setAba} />}
          {aba === 'solicitacoes' && <Solicitacoes sols={sols} onRefresh={refresh} />}
          {aba === 'usuarios'     && <Usuarios users={users} />}
          {aba === 'agendamentos' && <AgendamentosAdmin agends={agends} />}
        </div>
      </div>
    </div>
  );
}