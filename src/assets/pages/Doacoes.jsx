import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { addDoacao, escutarAuth } from '../../services/firebaseService';

const ROSA = '#A61C5D';
const AMARELO = '#ffd801';
const CINZA = '#f8f9fa';

const VALORES_RAPIDOS = [
  { valor: 20,  label: 'R$ 20',  sub: '1 semana de ração' },
  { valor: 50,  label: 'R$ 50',  sub: '1 consulta vet' },
  { valor: 100, label: 'R$ 100', sub: 'Kit vacinas' },
  { valor: 200, label: 'R$ 200', sub: 'Castração' },
  { valor: 500, label: 'R$ 500', sub: 'Tratamento completo' },
];

const IMPACTO_CARDS = [
  { icon: 'bi-cup-hot',      valor: 'R$ 20',  desc: 'alimenta 1 pet por 1 semana' },
  { icon: 'bi-bandaid',      valor: 'R$ 50',  desc: 'cobre 1 consulta veterinária' },
  { icon: 'bi-shield-check', valor: 'R$ 100', desc: 'paga vacinas de 1 pet' },
];

function calcImpacto(valor) {
  const itens = [];
  if (valor >= 20)  itens.push(`🍖 Alimentar ${Math.floor(valor/20)} pet(s) por 1 semana`);
  if (valor >= 50)  itens.push(`🩺 Pagar ${Math.floor(valor/50)} consulta(s) veterinária(s)`);
  if (valor >= 100) itens.push(`💉 Vacinar ${Math.floor(valor/100)} pet(s)`);
  if (valor >= 200) itens.push(`✂️ Castrar ${Math.floor(valor/200)} pet(s)`);
  if (!itens.length) itens.push('❤️ Contribuir com o cuidado geral dos nossos pets');
  return itens;
}

export default function Doacoes() {
  const [tela, setTela] = useState(1);
  const [valorSel, setValorSel]     = useState(null);
  const [outroValor, setOutroValor] = useState('');
  const [modoOutro, setModoOutro]   = useState(false);
  const [metodo, setMetodo]         = useState('');
  const [copiado, setCopiado]       = useState(false);
  const [form, setForm]             = useState({ nome: '', email: '', cpf: '', tel: '', anonimo: false });
  const [cardForm, setCardForm]     = useState({ num: '', nome: '', val: '', cvv: '', parcelas: 1 });
  const [resultado, setResultado]   = useState(null);
  const [usuario, setUsuario]       = useState(null);

  useEffect(() => {
    const unsub = escutarAuth(u => {
      setUsuario(u);
      if (u) setForm(f => ({ ...f, nome: u.nome || '', email: u.email || '', cpf: u.cpf || '', tel: u.telefone || '' }));
    });
    return unsub;
  }, []);

  const valorFinal = modoOutro ? parseFloat(outroValor) || 0 : valorSel;

  function handleForm(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  function maskTel(v) { return v.replace(/\D/g,'').replace(/^(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d)/,'$1-$2').slice(0,16); }
  function maskCpf(v) { return v.replace(/\D/g,'').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2').slice(0,14); }

  function copiarPix() {
    navigator.clipboard.writeText('00.000.000/0001-00').catch(() => {});
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  }

  async function processar() {
    if (!valorFinal || valorFinal < 5) { alert('Selecione ou informe um valor mínimo de R$ 5.'); return; }
    if (!metodo) { alert('Selecione a forma de pagamento.'); return; }
    if (!form.anonimo && (!form.nome || !form.email)) { alert('Preencha seu nome e e-mail.'); return; }
    if (metodo !== 'pix' && (!cardForm.num || !cardForm.nome || !cardForm.val || !cardForm.cvv)) {
      alert('Preencha todos os dados do cartão.'); return;
    }
    setTela(2);
    try {
      const impacto = calcImpacto(valorFinal);
      const docRef = await addDoacao({
        usuarioId:  usuario?.uid || '',
        nome:       form.anonimo ? 'Anônimo' : form.nome,
        email:      form.anonimo ? '' : form.email,
        cpf:        form.cpf,
        telefone:   form.tel,
        anonimo:    form.anonimo,
        valor:      valorFinal,
        metodo,
        impacto,
        status:     'confirmada',
      });
      setResultado({
        valor: valorFinal,
        metodo,
        protocolo: 'DOA-' + Date.now().toString().slice(-6),
        email: form.email,
        impacto,
      });
      setTela(3);
    } catch (err) {
      console.error(err);
      alert('Erro ao registrar doação. Tente novamente.');
      setTela(1);
    }
  }

  const inputStyle = { borderRadius: '12px', fontSize: '14px' };
  const btnMetodoStyle = (m) => ({
    border: `2px solid ${metodo === m ? ROSA : '#eee'}`,
    borderRadius: '16px', padding: '16px', cursor: 'pointer',
    background: metodo === m ? '#fff5f9' : 'white', textAlign: 'center', transition: 'all 0.2s',
  });

  return (
    <>
      <section style={{ backgroundColor: AMARELO, padding: '70px 0 90px', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ color: ROSA, fontWeight: 800, fontSize: '2.8rem' }}><i className="bi bi-heart-fill me-2"></i>Faça uma Doação</h1>
          <p style={{ color: ROSA, fontSize: '1.2rem', marginTop: '12px' }}>Cada contribuição ajuda a alimentar, vacinar e cuidar de nossos pets à espera de um lar.</p>
        </div>
      </section>

      <div className="container" style={{ maxWidth: '700px', marginBottom: '80px' }}>
        <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', padding: '40px', marginTop: '-50px', position: 'relative', zIndex: 10 }}>

          {tela === 1 && (
            <>
              <div className="row g-3 mb-4">
                {IMPACTO_CARDS.map((c, i) => (
                  <div key={i} className="col-4">
                    <div style={{ background: CINZA, borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
                      <div style={{ width: '50px', height: '50px', background: '#fff', color: ROSA, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', margin: '0 auto 10px' }}><i className={`bi ${c.icon}`}></i></div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: ROSA }}>{c.valor}</div>
                      <div style={{ fontSize: '11px', color: '#888' }}>{c.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <h5 className="fw-bold mb-1" style={{ color: ROSA }}>Escolha o Valor</h5>
              <p className="text-muted mb-3" style={{ fontSize: '14px' }}>Selecione um valor ou digite outro.</p>
              <div className="row g-3 mb-3">
                {VALORES_RAPIDOS.map(v => (
                  <div key={v.valor} className="col-4">
                    <div onClick={() => { setValorSel(v.valor); setModoOutro(false); }} style={{ border: `2px solid ${!modoOutro && valorSel === v.valor ? ROSA : '#eee'}`, borderRadius: '16px', padding: '14px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '18px', color: !modoOutro && valorSel === v.valor ? 'white' : '#555', background: !modoOutro && valorSel === v.valor ? ROSA : 'white', textAlign: 'center', transition: 'all 0.2s' }}>
                      {v.label}
                      <small style={{ display: 'block', fontSize: '12px', fontWeight: 400, marginTop: '2px' }}>{v.sub}</small>
                    </div>
                  </div>
                ))}
                <div className="col-4">
                  <div onClick={() => { setModoOutro(true); setValorSel(null); }} style={{ border: `2px solid ${modoOutro ? ROSA : '#eee'}`, borderRadius: '16px', padding: '14px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', color: modoOutro ? 'white' : '#555', background: modoOutro ? ROSA : 'white', textAlign: 'center', transition: 'all 0.2s' }}>
                    <i className="bi bi-pencil" style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }}></i>Outro valor
                  </div>
                </div>
              </div>

              {modoOutro && (
                <div className="mb-3">
                  <label className="form-label fw-semibold">Digite o valor (R$) *</label>
                  <input type="number" className="form-control" placeholder="Ex: 75" min="5" style={inputStyle} value={outroValor} onChange={e => setOutroValor(e.target.value)} />
                </div>
              )}

              <hr className="my-4" />
              <h5 className="fw-bold mb-3" style={{ color: ROSA }}>Seus Dados</h5>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Nome *</label>
                  <input type="text" className="form-control" name="nome" value={form.nome} onChange={handleForm} placeholder="Seu nome" style={inputStyle} disabled={form.anonimo} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">E-mail *</label>
                  <input type="email" className="form-control" name="email" value={form.email} onChange={handleForm} placeholder="seu@email.com" style={inputStyle} disabled={form.anonimo} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">CPF (opcional)</label>
                  <input type="text" className="form-control" name="cpf" value={form.cpf} onChange={e => setForm(f => ({ ...f, cpf: maskCpf(e.target.value) }))} placeholder="000.000.000-00" style={inputStyle} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Telefone (opcional)</label>
                  <input type="text" className="form-control" name="tel" value={form.tel} onChange={e => setForm(f => ({ ...f, tel: maskTel(e.target.value) }))} placeholder="(85) 9 0000-0000" style={inputStyle} />
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="anonimo" name="anonimo" checked={form.anonimo} onChange={handleForm} />
                    <label className="form-check-label" htmlFor="anonimo" style={{ fontSize: '14px' }}>Quero fazer minha doação de forma anônima</label>
                  </div>
                </div>
              </div>

              <hr className="my-4" />
              <h5 className="fw-bold mb-3" style={{ color: ROSA }}>Forma de Pagamento</h5>
              <div className="row g-3 mb-4">
                {[
                  { key: 'pix',     icon: 'bi-qr-code',     label: 'PIX' },
                  { key: 'credito', icon: 'bi-credit-card', label: 'Cartão de Crédito' },
                  { key: 'debito',  icon: 'bi-bank',        label: 'Cartão de Débito' },
                ].map(m => (
                  <div key={m.key} className="col-4">
                    <div onClick={() => setMetodo(m.key)} style={btnMetodoStyle(m.key)}>
                      <i className={`bi ${m.icon}`} style={{ fontSize: '28px', color: ROSA, marginBottom: '8px', display: 'block' }}></i>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>{m.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              {metodo === 'pix' && (
                <div style={{ background: CINZA, borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
                  <p className="text-muted mb-3" style={{ fontSize: '14px' }}>Escaneie o QR Code ou copie a chave PIX abaixo.</p>
                  <svg viewBox="0 0 100 100" width="140" height="140" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto', display: 'block', borderRadius: '8px' }}>
                    <rect width="100" height="100" fill="white"/>
                    <rect x="10" y="10" width="30" height="30" fill="none" stroke={ROSA} strokeWidth="3"/>
                    <rect x="15" y="15" width="20" height="20" fill={ROSA}/>
                    <rect x="60" y="10" width="30" height="30" fill="none" stroke={ROSA} strokeWidth="3"/>
                    <rect x="65" y="15" width="20" height="20" fill={ROSA}/>
                    <rect x="10" y="60" width="30" height="30" fill="none" stroke={ROSA} strokeWidth="3"/>
                    <rect x="15" y="65" width="20" height="20" fill={ROSA}/>
                    <rect x="45" y="10" width="5" height="5" fill={ROSA}/><rect x="45" y="20" width="5" height="5" fill={ROSA}/>
                    <rect x="55" y="45" width="5" height="5" fill={ROSA}/><rect x="65" y="45" width="5" height="5" fill={ROSA}/>
                    <rect x="45" y="55" width="5" height="5" fill={ROSA}/><rect x="55" y="65" width="5" height="5" fill={ROSA}/>
                  </svg>
                  <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px', marginTop: '12px' }}>Chave PIX (CNPJ):</p>
                  <div style={{ background: 'white', border: `2px dashed ${ROSA}`, borderRadius: '12px', padding: '10px 16px', fontFamily: 'monospace', fontSize: '14px', color: ROSA, fontWeight: 700, display: 'inline-block' }}>
                    00.000.000/0001-00 – 4PatasFortaleza
                  </div><br />
                  <button onClick={copiarPix} className="btn mt-3" style={{ background: ROSA, color: 'white', borderRadius: '30px', fontWeight: 700, fontSize: '14px' }}>
                    <i className="bi bi-clipboard me-2"></i>Copiar Chave PIX
                  </button>
                  {copiado && <div style={{ color: 'green', fontSize: '13px', marginTop: '8px' }}><i className="bi bi-check-circle me-1"></i>Chave copiada!</div>}
                  <p className="mt-3" style={{ fontSize: '12px', color: '#aaa' }}>Após efetuar o pagamento, clique em "Confirmar Doação".</p>
                </div>
              )}

              {(metodo === 'credito' || metodo === 'debito') && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ background: `linear-gradient(135deg, ${ROSA}, #7b1042)`, borderRadius: '16px', padding: '24px', color: 'white', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', opacity: 0.8 }}>AdoPet</span>
                      <i className="bi bi-credit-card-2-front" style={{ fontSize: '24px', opacity: 0.7 }}></i>
                    </div>
                    <div style={{ fontSize: '20px', fontFamily: 'monospace', letterSpacing: '4px', margin: '16px 0', fontWeight: 700 }}>
                      {cardForm.num ? '•••• •••• •••• ' + cardForm.num.replace(/\D/g,'').slice(-4) : '•••• •••• •••• ••••'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <div style={{ fontSize: '10px', opacity: 0.7, textTransform: 'uppercase' }}>Titular</div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{cardForm.nome.toUpperCase() || 'SEU NOME'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', opacity: 0.7, textTransform: 'uppercase' }}>Validade</div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{cardForm.val || 'MM/AA'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">Número do Cartão *</label>
                      <input type="text" className="form-control" placeholder="0000 0000 0000 0000" maxLength={19} style={inputStyle}
                        value={cardForm.num}
                        onChange={e => { let v = e.target.value.replace(/\D/g,'').substring(0,16); v = v.replace(/(.{4})/g,'$1 ').trim(); setCardForm(f => ({ ...f, num: v })); }} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Nome no Cartão *</label>
                      <input type="text" className="form-control" placeholder="Como no cartão" style={inputStyle} value={cardForm.nome} onChange={e => setCardForm(f => ({ ...f, nome: e.target.value }))} />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold">Validade *</label>
                      <input type="text" className="form-control" placeholder="MM/AA" maxLength={5} style={inputStyle}
                        value={cardForm.val}
                        onChange={e => { let v = e.target.value.replace(/\D/g,''); if (v.length >= 2) v = v.slice(0,2) + '/' + v.slice(2,4); setCardForm(f => ({ ...f, val: v })); }} />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold">CVV *</label>
                      <input type="text" className="form-control" placeholder="•••" maxLength={4} style={inputStyle} value={cardForm.cvv} onChange={e => setCardForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g,'') }))} />
                    </div>
                    {metodo === 'credito' && valorFinal >= 50 && (
                      <div className="col-12">
                        <label className="form-label fw-semibold">Parcelamento</label>
                        <select className="form-select" style={inputStyle} value={cardForm.parcelas} onChange={e => setCardForm(f => ({ ...f, parcelas: e.target.value }))}>
                          {Array.from({ length: valorFinal >= 200 ? 12 : 6 }, (_, i) => i + 1).map(n => (
                            <option key={n} value={n}>{n}x de R$ {n >= 7 ? (valorFinal / n * 1.015).toFixed(2) : (valorFinal / n).toFixed(2)}{n >= 7 ? ' (1,5% a.m.)' : ' (sem juros)'}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-end mt-4">
                <button onClick={processar} className="btn btn-lg" style={{ background: ROSA, color: 'white', borderRadius: '30px', fontWeight: 700, padding: '14px 32px' }}>
                  <i className="bi bi-heart-fill me-2"></i>Confirmar Doação{valorFinal ? ` de R$ ${valorFinal}` : ''}
                </button>
              </div>
            </>
          )}

          {tela === 2 && (
            <div className="text-center py-5">
              <div className="spinner-border mb-4" role="status" style={{ width: '60px', height: '60px', color: ROSA }}></div>
              <h5 className="fw-bold" style={{ color: ROSA }}>Processando sua doação...</h5>
              <p className="text-muted">Registrando no sistema...</p>
            </div>
          )}

          {tela === 3 && resultado && (
            <div className="text-center">
              <div style={{ width: '90px', height: '90px', background: AMARELO, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <i className="bi bi-heart-fill" style={{ fontSize: '46px', color: ROSA }}></i>
              </div>
              <h3 className="fw-bold mb-2" style={{ color: ROSA }}>Muito Obrigado!</h3>
              <p className="text-muted mb-1">Sua doação foi registrada com sucesso. ❤️</p>
              {resultado.email && <p className="text-muted" style={{ fontSize: '14px' }}>Confirmação enviada para <strong>{resultado.email}</strong></p>}
              <div style={{ background: CINZA, borderRadius: '16px', padding: '20px', margin: '24px 0' }}>
                <div style={{ fontSize: '36px', fontWeight: 800, color: ROSA }}>R$ {resultado.valor}</div>
                <div style={{ color: '#888', fontSize: '14px' }}>Valor doado</div>
                <div style={{ marginTop: '12px', fontSize: '13px', color: '#555' }}>via {resultado.metodo === 'pix' ? 'PIX' : resultado.metodo === 'credito' ? 'Cartão de Crédito' : 'Cartão de Débito'}</div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>Protocolo: {resultado.protocolo}</div>
              </div>
              <div style={{ background: '#fff9e6', border: `1.5px solid ${AMARELO}`, borderRadius: '12px', padding: '16px', textAlign: 'left', marginBottom: '24px' }}>
                <strong style={{ color: ROSA }}><i className="bi bi-stars me-2"></i>Com sua doação você vai...</strong>
                <ul style={{ marginTop: '10px', paddingLeft: '20px', fontSize: '14px', color: '#555' }}>
                  {resultado.impacto.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link to="/" className="btn rounded-pill px-4" style={{ background: AMARELO, color: ROSA, fontWeight: 700 }}>Voltar ao Início</Link>
                <Link to="/minha-conta" className="btn rounded-pill px-4" style={{ background: ROSA, color: 'white', fontWeight: 700 }}>Ver Minhas Doações</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}