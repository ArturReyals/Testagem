import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPets, addSolicitacao, escutarAuth, updatePet} from '../../services/firebaseService';

const ROSA   = '#A61C5D';
const AMARELO = '#ffd801';
const CINZA  = '#f8f9fa';
const IMG_FALLBACK = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&q=60';

const statusStyle = {
  disponivel: { bg: '#e6ffee', color: '#008833' },
  reservado:  { bg: '#fff5e6', color: '#cc7700' },
  adotado:    { bg: '#e6f0ff', color: '#004499' },
};
const dotColor = { disponivel: '#22c55e', reservado: '#f59e0b', adotado: '#3b82f6' };

const stepsData = [
  { id: 1, title: '1. Explore',   icon: 'bi-search',             desc: 'Descubra os pets que estão precisando de um lar.' },
  { id: 2, title: '2. Conheça',   icon: 'bi-eye',                desc: 'Agende uma visita para interagir com o seu possível novo amigo.' },
  { id: 3, title: '3. Solicite',  icon: 'bi-clipboard2-check',   desc: 'Preencha o formulário e passe pela nossa entrevista de adoção.' },
  { id: 4, title: '4. Abrace',    icon: 'bi-house-heart',        desc: 'Leve seu novo melhor amigo para casa e dê muito amor!' },
];

// ── Modal do Pet (Copiado da página Pets) ────────────────────────────────────
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
      // 1. Cria a solicitação no banco
      await addSolicitacao({
        petId:       pet.id,
        petNome:     pet.nome,
        usuarioId:   usuario?.uid || '',
        usuarioNome: nome,
        email, tel, cidade, moradia,
        motivo:      form.motivo,
      });

      // 2. Atualiza o status do pet para 'reservado' imediatamente
      await updatePet(pet.id, { status: 'reservado' });

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

// ── Componente Principal (Home) ──────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  
  const [ultimosPets, setUltimosPets] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  // Estados para o Modal
  const [petSelecionado, setPetSelecionado] = useState(null);
  const [logado, setLogado] = useState(false);
  const [usuario, setUsuario] = useState(null);

  // Verifica o status de autenticação
  useEffect(() => {
    const unsub = escutarAuth(u => {
      setLogado(!!u);
      setUsuario(u);
    });
    return unsub;
  }, []);

  // Busca os últimos 4 pets
  useEffect(() => {
    async function carregarPetsDestaque() {
      try {
        const todosPets = await getPets();
        const petsDestaque = todosPets
          .filter(pet => pet.status === 'disponivel')
          .sort((a, b) => {
             const dataA = a.criadoEm?.toMillis ? a.criadoEm.toMillis() : Date.now();
             const dataB = b.criadoEm?.toMillis ? b.criadoEm.toMillis() : Date.now();
             return dataB - dataA;
          })
          .slice(0, 4);

        setUltimosPets(petsDestaque);
      } catch (error) {
        console.error("Erro ao carregar pets em destaque:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregarPetsDestaque();
  }, []);

  return (
    <>
      {/* HERO SECTION */}
      <section style={{ backgroundColor: '#ffd801', padding: '80px 0 100px 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ color: '#A61C5D', fontWeight: 800, fontSize: '3rem' }}>Encontre o Seu Melhor Amigo Hoje!</h1>
          <p style={{ color: '#A61C5D', fontSize: '1.5rem', marginTop: '15px' }}>
            Adoção de cães e gatos em toda Fortaleza e cidades metropolitanas. Dê um lar a quem precisa de amor.
          </p>
        </div>
      </section>

      {/* PETS EM DESTAQUE */}
      <section className="container" style={{ marginTop: '60px', marginBottom: '80px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 style={{ color: '#333', fontWeight: 'bold', margin: 0 }}>Pets em Destaque</h3>
          <Link to="/pets" style={{ color: '#A61C5D', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>
            Ver todos →
          </Link>
        </div>

        {carregando ? (
           <div className="text-center py-5">
             <div className="spinner-border" style={{ color: '#A61C5D' }}></div>
           </div>
        ) : ultimosPets.length === 0 ? (
           <div className="text-center py-5 text-muted">
             Nenhum pet disponível no momento.
           </div>
        ) : (
          <div className="row g-4">
            {ultimosPets.map((pet) => (
              <div className="col-md-3" key={pet.id}>
                <div className="card h-100 shadow-sm border-0 overflow-hidden" style={{ borderRadius: '15px' }}>
                  <img 
                    src={pet.foto || IMG_FALLBACK} 
                    className="card-img-top" 
                    alt={pet.nome} 
                    style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }} 
                    onError={(e) => { e.target.onerror = null; e.target.src = IMG_FALLBACK; }}
                    onClick={() => setPetSelecionado(pet)}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title fw-bold">{pet.nome}</h5>
                    <p className="card-text text-muted mb-1" style={{ textTransform: 'capitalize' }}>
                      <i className="bi bi-tag"></i> {pet.tipo} • {pet.idade}
                    </p>
                    <p className="card-text text-muted mb-3">
                      <i className="bi bi-geo-alt"></i> {pet.localizacao}
                    </p>
                    <div className="d-flex justify-content-between mt-auto">
                      <button
                        onClick={() => setPetSelecionado(pet)}
                        className="btn btn-outline-secondary rounded-pill px-3"
                        style={{ fontSize: '14px' }}
                      >
                        Conhecer
                      </button>
                      <button
                        onClick={() => setPetSelecionado(pet)}
                        className="btn rounded-pill px-4"
                        style={{ backgroundColor: '#ffd801', color: '#A61C5D', fontWeight: 'bold', fontSize: '14px', border: 'none' }}
                      >
                        Adotar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* COMO FUNCIONA */}
      <section className="container" style={{ marginTop: '80px', marginBottom: '80px', textAlign: 'center' }}>
        <h3 style={{ color: '#333', fontWeight: 'bold', marginBottom: '50px' }}>Como Funciona a Adoção</h3>
        <div className="row g-4">
          {stepsData.map((step) => (
            <div className="col-md-3" key={step.id}>
              <div style={{
                width: '80px', height: '80px',
                backgroundColor: '#ffd801', borderRadius: '50%',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                margin: '0 auto 20px auto', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}>
                <i className={`bi ${step.icon}`} style={{ fontSize: '35px', color: '#A61C5D' }}></i>
              </div>
              <h5 className="fw-bold" style={{ color: '#A61C5D' }}>{step.title}</h5>
              <p className="text-muted" style={{ fontSize: '14px' }}>{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <Link
            to="/pets"
            className="btn px-5 py-3"
            style={{ backgroundColor: '#A61C5D', color: 'white', borderRadius: '30px', fontWeight: 'bold', fontSize: '1rem' }}
          >
            Quero Adotar um Pet
          </Link>
        </div>
      </section>

      {/* SEÇÃO DE CHAMADA PARA DOAÇÕES */}
      <section style={{ backgroundColor: '#ffd801', padding: '60px 0', textAlign: 'center' }}>
        <div className="container">
          <h3 style={{ color: '#A61C5D', fontWeight: 800, fontSize: '2rem' }}>Ajude com uma Doação</h3>
          <p style={{ color: '#A61C5D', fontSize: '1.1rem', marginTop: '10px', marginBottom: '30px' }}>
            Seu apoio garante ração, vacinas e cuidados veterinários para os nossos pets.
          </p>
          <Link
            to="/doacoes"
            className="btn px-5 py-3"
            style={{ backgroundColor: '#A61C5D', color: 'white', borderRadius: '30px', fontWeight: 'bold', fontSize: '1rem' }}
          >
            Fazer uma Doação
          </Link>
        </div>
      </section>

      {/* RENDEREIZAÇÃO DO MODAL QUANDO UM PET FOR SELECIONADO */}
      {petSelecionado && (
        <ModalPet 
          pet={petSelecionado} 
          onClose={() => setPetSelecionado(null)} 
          logado={logado} 
          usuario={usuario} 
        />
      )}
    </>
  );
}