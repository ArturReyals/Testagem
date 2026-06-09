// src/assets/pages/Pets.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPets, addSolicitacao, escutarAuth } from '../../services/firebaseService';

const ROSA   = '#A61C5D';
const AMARELO = '#ffd801';
const CINZA  = '#f8f9fa';

// Imagem de fallback (online, sempre disponível)
const IMG_FALLBACK = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&q=60';

function idadeCategoria(idStr) {
  const s = idStr.toLowerCase();
  if (s.includes('mes') || s.includes('mês') || s.includes('semana')) return 'filhote';
  const m = s.match(/(\d+)\s*ano/);
  if (m && parseInt(m[1]) <= 1) return 'filhote';
  return 'adulto';
}

const statusStyle = {
  disponivel: { bg: '#e6ffee', color: '#008833' },
  reservado:  { bg: '#fff5e6', color: '#cc7700' },
  adotado:    { bg: '#e6f0ff', color: '#004499' },
};
const dotColor = { disponivel: '#22c55e', reservado: '#f59e0b', adotado: '#3b82f6' };

// ── Modal do Pet ─────────────────────────────────────────────────────────────
function ModalPet({ pet, onClose, logado, usuario }) {
  const [tela, setTela]         = useState(1);
  const [form, setForm]         = useState({ nome: usuario?.nome || '', email: usuario?.email || '', tel: '', cidade: '', moradia: '', motivo: '', termo: false });
  const [protocolo, setProtocolo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  if (!pet) return null;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function enviarAdocao() {
    const { nome, email, tel, cidade, moradia, termo } = form;
    if (!nome || !email || !tel || !cidade || !moradia) { alert('Preencha todos os campos obrigatórios.'); return; }
    if (!termo) { alert('Aceite os termos de responsabilidade.'); return; }
    setEnviando(true);
    try {
      const ref = await addSolicitacao({
        petId:       pet.id,
        petNome:     pet.nome,
        usuarioId:   usuario?.uid || '',
        usuarioNome: nome,
        email, tel, cidade, moradia,
        motivo:      form.motivo,
      });
      setProtocolo('ADOC-' + Date.now().toString().slice(-6));
      setTela(3);
    } catch (err) {
      alert('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  const st = statusStyle[pet.status] || statusStyle.disponivel;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '760px', maxHeight: '90vh', overflowY: 'auto', animation: 'fadeInUp 0.3s ease' }} onClick={e => e.stopPropagation()}>

        <div style={{ background: AMARELO, padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '20px 20px 0 0' }}>
          <h5 style={{ margin: 0, color: ROSA, fontWeight: 800, fontSize: '1.5rem' }}>{pet.nome}</h5>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: ROSA }}>&times;</button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Tela 1: Informações */}
          {tela === 1 && (
            <div className="row g-4">
              <div className="col-md-5">
                {/* ✅ IMAGEM CORRIGIDA: usa a URL do Firestore/Storage */}
                <img
                  src={pet.foto || IMG_FALLBACK}
                  alt={pet.nome}
                  style={{ width: '100%', height: '270px', objectFit: 'cover', borderRadius: '14px' }}
                  onError={e => { e.target.onerror = null; e.target.src = IMG_FALLBACK; }}
                />
                <div className="text-center mt-3">
                  <span style={{ background: st.bg, color: st.color, borderRadius: '20px', padding: '4px 14px', fontWeight: 700, fontSize: '13px' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: dotColor[pet.status], display: 'inline-block', marginRight: '5px' }}></span>
                    {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="col-md-7">
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {pet.vacinado && <span style={{ background: '#e6ffee', color: '#008833', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', fontWeight: 700 }}>💉 Vacinado</span>}
                  {pet.castrado && <span style={{ background: '#e6f0ff', color: '#004499', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', fontWeight: 700 }}>✂️ Castrado</span>}
                </div>
                <p className="text-muted" style={{ fontSize: '14px', lineHeight: 1.7 }}>{pet.descricao}</p>
                <div className="row g-2 mt-2">
                  {[
                    { icon: 'bi-geo-alt',       val: pet.localizacao },
                    { icon: 'bi-calendar3',     val: pet.idade },
                    { icon: 'bi-rulers',        val: pet.porte ? pet.porte.charAt(0).toUpperCase() + pet.porte.slice(1) : '' },
                    { icon: 'bi-gender-ambiguous', val: pet.sexo },
                  ].map((item, i) => (
                    <div key={i} className="col-6">
                      <div style={{ background: CINZA, borderRadius: '20px', padding: '8px 14px', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#555' }}>
                        <i className={`bi ${item.icon}`} style={{ color: ROSA }}></i> {item.val}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="d-flex gap-3 mt-4 flex-wrap justify-content-end">
                  <button onClick={onClose} className="btn btn-outline-secondary rounded-pill">Fechar</button>
                  <button onClick={() => setTela(2)} className="btn rounded-pill px-4" style={{ background: ROSA, color: 'white', fontWeight: 700 }}
                    disabled={pet.status !== 'disponivel'}>
                    <i className="bi bi-heart me-2"></i>Quero Adotar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tela 2: Formulário */}
          {tela === 2 && (
            <>
              {!logado ? (
                <div style={{ background: 'white', borderRadius: '20px', padding: '32px', textAlign: 'center', border: '2px dashed #ddd' }}>
                  <i className="bi bi-lock" style={{ fontSize: '40px', color: '#ccc' }}></i>
                  <h5 className="mt-3" style={{ color: ROSA }}>Login necessário</h5>
                  <p className="text-muted" style={{ fontSize: '14px' }}>Para solicitar a adoção, você precisa ter uma conta no AdoPet.</p>
                  <div className="d-flex justify-content-center gap-3 mt-3">
                    <Link to="/login" className="btn rounded-pill px-4" style={{ background: ROSA, color: 'white', fontWeight: 700 }}>Entrar</Link>
                    <Link to="/login" className="btn rounded-pill px-4" style={{ background: AMARELO, color: ROSA, fontWeight: 700 }}>Criar Conta</Link>
                  </div>
                </div>
              ) : (
                <>
                  <h6 className="fw-bold mb-1" style={{ color: ROSA }}>Solicitação de Adoção</h6>
                  <p className="text-muted mb-3" style={{ fontSize: '13px' }}>Nossa equipe entrará em contato em até 48h úteis.</p>
                  <div className="row g-3">
                    {[
                      { label: 'Nome Completo *', name: 'nome',   type: 'text',  placeholder: 'Seu nome' },
                      { label: 'E-mail *',        name: 'email',  type: 'email', placeholder: 'seu@email.com' },
                      { label: 'Telefone *',      name: 'tel',    type: 'text',  placeholder: '(85) 9 0000-0000' },
                      { label: 'Cidade *',        name: 'cidade', type: 'text',  placeholder: 'Fortaleza' },
                    ].map(f => (
                      <div key={f.name} className="col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>{f.label}</label>
                        <input type={f.type} className="form-control" name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} style={{ borderRadius: '12px', fontSize: '14px' }} />
                      </div>
                    ))}
                    <div className="col-12">
                      <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Tipo de moradia *</label>
                      <select className="form-select" name="moradia" value={form.moradia} onChange={handleChange} style={{ borderRadius: '12px', fontSize: '14px' }}>
                        <option value="">Selecione...</option>
                        <option>Casa com quintal</option>
                        <option>Casa sem quintal</option>
                        <option>Apartamento</option>
                        <option>Chácara / Sítio</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Por que você quer adotar?</label>
                      <textarea className="form-control" name="motivo" rows="3" value={form.motivo} onChange={handleChange} placeholder="Conte um pouco sobre você..." style={{ borderRadius: '12px', fontSize: '14px' }} />
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" name="termo" checked={form.termo} onChange={handleChange} id="adocTermo" />
                        <label className="form-check-label" htmlFor="adocTermo" style={{ fontSize: '13px' }}>Li e aceito os termos de responsabilidade de adoção.</label>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex gap-3 justify-content-between mt-4 flex-wrap">
                    <button onClick={() => setTela(1)} className="btn btn-outline-secondary rounded-pill">← Voltar</button>
                    <button onClick={enviarAdocao} disabled={enviando} className="btn rounded-pill px-4" style={{ background: ROSA, color: 'white', fontWeight: 700 }}>
                      {enviando ? <><span className="spinner-border spinner-border-sm me-2"></span>Enviando...</> : <><i className="bi bi-send me-2"></i>Enviar Solicitação</>}
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* Tela 3: Sucesso */}
          {tela === 3 && (
            <div className="text-center py-2">
              <div style={{ width: '80px', height: '80px', background: AMARELO, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <i className="bi bi-heart-fill" style={{ fontSize: '38px', color: ROSA }}></i>
              </div>
              <h5 className="fw-bold" style={{ color: ROSA }}>Solicitação Enviada!</h5>
              <p className="text-muted">Sua solicitação para adotar <strong>{pet.nome}</strong> foi recebida com sucesso.</p>
              <div style={{ background: CINZA, borderRadius: '12px', padding: '14px 20px', margin: '16px 0' }}>
                <strong style={{ color: ROSA, fontSize: '18px' }}>{protocolo}</strong>
                <div style={{ color: '#888', fontSize: '12px' }}>Protocolo de Adoção</div>
              </div>
              <p style={{ fontSize: '13px', color: '#888' }}>Nossa equipe analisará sua solicitação e entrará em contato em breve.</p>
              <div className="d-flex gap-3 justify-content-center flex-wrap mt-3">
                <button onClick={onClose} className="btn btn-outline-secondary rounded-pill">Fechar</button>
                <Link to="/agendamento" className="btn rounded-pill px-4" style={{ background: ROSA, color: 'white', fontWeight: 700 }}>Agendar Visita</Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function Pets() {
  const [pets, setPets]                 = useState([]);
  const [carregando, setCarregando]     = useState(true);
  const [filtros, setFiltros]           = useState({ tipo: '', idade: '', porte: '', status: '' });
  const [filtrados, setFiltrados]       = useState([]);
  const [petSelecionado, setPetSelecionado] = useState(null);
  const [logado, setLogado]             = useState(false);
  const [usuario, setUsuario]           = useState(null);

  // Observa sessão do Firebase Auth
  useEffect(() => {
    const unsub = escutarAuth(u => { setLogado(!!u); setUsuario(u); });
    return unsub;
  }, []);

  // Busca pets do Firestore
  useEffect(() => {
    setCarregando(true);
    getPets()
      .then(data => { setPets(data); setFiltrados(data); })
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  // Aplica filtros
  useEffect(() => {
    let res = pets;
    if (filtros.tipo)   res = res.filter(p => p.tipo === filtros.tipo);
    if (filtros.idade)  res = res.filter(p => idadeCategoria(p.idade) === filtros.idade);
    if (filtros.porte)  res = res.filter(p => p.porte === filtros.porte);
    if (filtros.status) res = res.filter(p => p.status === filtros.status);
    setFiltrados(res);
  }, [filtros, pets]);

  function limpar() { setFiltros({ tipo: '', idade: '', porte: '', status: '' }); }

  const selectStyle = { borderRadius: '12px', border: '1.5px solid #ddd', padding: '10px 14px', fontSize: '14px', cursor: 'pointer', background: 'white', flex: 1 };

  return (
    <>
      <section style={{ backgroundColor: AMARELO, padding: '70px 0 90px', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ color: ROSA, fontWeight: 800, fontSize: '2.8rem' }}>
            <i className="bi bi-search-heart me-2"></i>Encontre seu Pet
          </h1>
          <p style={{ color: ROSA, fontSize: '1.2rem', marginTop: '12px' }}>
            Conheça os animais disponíveis para adoção. Cada um espera por um lar cheio de amor.
          </p>
        </div>
      </section>

      {/* FILTROS */}
      <div className="container">
        <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', padding: '20px 24px', marginTop: '-45px', position: 'relative', zIndex: 10, display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <select style={selectStyle} value={filtros.tipo} onChange={e => setFiltros(f => ({ ...f, tipo: e.target.value }))}>
            <option value="">Tipo (Todos)</option>
            <option value="cachorro">Cachorro</option>
            <option value="gato">Gato</option>
          </select>
          <select style={selectStyle} value={filtros.idade} onChange={e => setFiltros(f => ({ ...f, idade: e.target.value }))}>
            <option value="">Idade (Todas)</option>
            <option value="filhote">Filhote</option>
            <option value="adulto">Adulto</option>
          </select>
          <select style={selectStyle} value={filtros.porte} onChange={e => setFiltros(f => ({ ...f, porte: e.target.value }))}>
            <option value="">Porte (Todos)</option>
            <option value="pequeno">Pequeno</option>
            <option value="medio">Médio</option>
            <option value="grande">Grande</option>
          </select>
          <select style={selectStyle} value={filtros.status} onChange={e => setFiltros(f => ({ ...f, status: e.target.value }))}>
            <option value="">Status (Todos)</option>
            <option value="disponivel">Disponível</option>
            <option value="reservado">Reservado</option>
          </select>
          {(filtros.tipo || filtros.idade || filtros.porte || filtros.status) && (
            <button onClick={limpar} style={{ background: '#f0f0f0', border: 'none', borderRadius: '12px', padding: '10px 16px', fontSize: '14px', cursor: 'pointer', color: '#666' }}>✕ Limpar</button>
          )}
        </div>
      </div>

      {/* GRID */}
      <section className="container" style={{ marginTop: '50px', marginBottom: '100px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h4 className="fw-bold mb-0" style={{ color: '#333' }}>Pets Disponíveis</h4>
          <span className="text-muted" style={{ fontSize: '14px' }}>{filtrados.length} pet(s) encontrado(s)</span>
        </div>

        {carregando ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: ROSA, width: '50px', height: '50px' }}></div>
            <p className="mt-3 text-muted">Carregando pets...</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-emoji-frown" style={{ fontSize: '56px', color: '#ddd' }}></i>
            <h5 className="mt-3 text-muted">Nenhum pet encontrado.</h5>
            <button onClick={limpar} className="btn mt-3" style={{ background: AMARELO, color: ROSA, fontWeight: 700, borderRadius: '30px', padding: '10px 28px' }}>Limpar Filtros</button>
          </div>
        ) : (
          <div className="row g-4">
            {filtrados.map(pet => {
              const st = statusStyle[pet.status] || statusStyle.disponivel;
              const isDisp = pet.status === 'disponivel';
              return (
                <div key={pet.id} className="col-md-4 col-sm-6">
                  <div onClick={() => setPetSelecionado(pet)} style={{ border: 'none', borderRadius: '18px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', overflow: 'hidden', cursor: 'pointer', background: 'white', transition: 'transform 0.3s, box-shadow 0.3s', height: '100%' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 35px rgba(166,28,93,0.13)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'; }}>

                    {/* ✅ IMAGEM CORRIGIDA */}
                    <img
                      src={pet.foto || IMG_FALLBACK}
                      alt={pet.nome}
                      style={{ height: '210px', objectFit: 'cover', width: '100%' }}
                      onError={e => { e.target.onerror = null; e.target.src = IMG_FALLBACK; }}
                    />
                    <div style={{ padding: '16px' }}>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 style={{ fontWeight: 700, margin: 0, color: '#333' }}>{pet.nome}</h5>
                        <span style={{ ...st, borderRadius: '20px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: dotColor[pet.status], display: 'inline-block', marginRight: '4px' }}></span>
                          {pet.status}
                        </span>
                      </div>
                      <p className="text-muted mb-1" style={{ fontSize: '13px' }}>
                        {pet.tipo === 'cachorro' ? '' : ''} {pet.tipo?.charAt(0).toUpperCase() + pet.tipo?.slice(1)} · {pet.idade}
                      </p>
                      <p className="text-muted mb-3" style={{ fontSize: '13px' }}>
                        <i className="bi bi-geo-alt"></i> {pet.localizacao}
                      </p>
                      <div className="d-flex gap-2 flex-wrap mb-3">
                        {pet.vacinado && <span style={{ background: '#e6ffee', color: '#008833', borderRadius: '20px', padding: '3px 9px', fontSize: '11px', fontWeight: 700 }}>💉 Vacinado</span>}
                        {pet.castrado && <span style={{ background: '#e6f0ff', color: '#004499', borderRadius: '20px', padding: '3px 9px', fontSize: '11px', fontWeight: 700 }}>✂️ Castrado</span>}
                      </div>
                      <div className="d-flex justify-content-between">
                        <button className="btn btn-outline-secondary rounded-pill px-3" style={{ fontSize: '13px' }} onClick={e => { e.stopPropagation(); setPetSelecionado(pet); }}>
                          Conhecer
                        </button>
                        <button className="btn rounded-pill px-3" style={{ background: AMARELO, color: ROSA, fontWeight: 700, fontSize: '13px', opacity: isDisp ? 1 : 0.6, cursor: isDisp ? 'pointer' : 'not-allowed' }}
                          onClick={e => { e.stopPropagation(); isDisp ? setPetSelecionado(pet) : alert(`Este pet já está ${pet.status}.`); }}>
                          {isDisp ? 'Adotar' : pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {petSelecionado && (
        <ModalPet pet={petSelecionado} onClose={() => setPetSelecionado(null)} logado={logado} usuario={usuario} />
      )}
    </>
  );
}