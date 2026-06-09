// src/assets/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cadastrarUsuario, loginUsuario, escutarAuth } from '../../services/firebaseService';

const ROSA   = '#A61C5D';
const AMARELO = '#ffd801';

function maskTel(v) { return v.replace(/\D/g,'').replace(/^(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d)/,'$1-$2').slice(0,16); }
function maskCpf(v) { return v.replace(/\D/g,'').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2').slice(0,14); }

export default function Login() {
  const navigate = useNavigate();
  const [aba, setAba]           = useState('entrar');
  const [alerta, setAlerta]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [senhaVis, setSenhaVis] = useState(false);
  const [senhaVis2, setSenhaVis2] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', senha: '' });
  const [cadForm, setCadForm]     = useState({ nome: '', email: '', tel: '', cpf: '', senha: '', confSenha: '', termo: false });

  // Redireciona se já tiver sessão ativa
  useEffect(() => {
    const unsub = escutarAuth(usuario => {
      if (usuario) navigate(usuario.role === 'admin' ? '/admin' : '/');
    });
    return unsub;
  }, []);

  function mostrarAlerta(msg, tipo = 'danger') { setAlerta({ msg, tipo }); }

  async function handleLogin() {
    const { email, senha } = loginForm;
    if (!email || !senha) { mostrarAlerta('Preencha e-mail e senha.'); return; }
    setLoading(true);
    try {
      const usuario = await loginUsuario(email, senha);
      mostrarAlerta(`✅ Bem-vindo(a), <strong>${usuario.nome.split(' ')[0]}</strong>! Redirecionando...`, 'success');
      setTimeout(() => navigate(usuario.role === 'admin' ? '/admin' : '/'), 1200);
    } catch (err) {
      const msgs = {
        'auth/user-not-found':  'E-mail não cadastrado.',
        'auth/wrong-password':  'Senha incorreta.',
        'auth/invalid-credential': 'E-mail ou senha incorretos.',
        'auth/too-many-requests': 'Muitas tentativas. Aguarde um momento.',
      };
      mostrarAlerta(msgs[err.code] || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCadastro() {
    const { nome, email, senha, confSenha, termo, tel, cpf } = cadForm;
    if (!nome || !email || !senha || !confSenha) { mostrarAlerta('Preencha todos os campos obrigatórios.'); return; }
    if (senha.length < 6) { mostrarAlerta('A senha deve ter no mínimo 6 caracteres.'); return; }
    if (senha !== confSenha) { mostrarAlerta('As senhas não coincidem.'); return; }
    if (!termo) { mostrarAlerta('Aceite os termos de uso para continuar.'); return; }
    setLoading(true);
    try {
      await cadastrarUsuario({ nome, email, senha, telefone: tel, cpf });
      mostrarAlerta('🎉 Conta criada com sucesso! Redirecionando...', 'success');
      setTimeout(() => navigate('/'), 1400);
    } catch (err) {
      const msgs = {
        'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
        'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres.',
        'auth/invalid-email': 'E-mail inválido.',
      };
      mostrarAlerta(msgs[err.code] || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = { borderRadius: '12px', border: '1.5px solid #e0e0e0', padding: '12px 14px', fontSize: '14px', width: '100%', outline: 'none' };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px 20px' }}>
      <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 12px 40px rgba(0,0,0,0.09)', width: '100%', maxWidth: '440px', overflow: 'hidden' }}>

        {/* Banner */}
        <div style={{ background: AMARELO, padding: '28px 30px 70px', textAlign: 'center', position: 'relative' }}>
          <h2 style={{ color: ROSA, fontWeight: 800, fontSize: '1.6rem', margin: 0 }}>🐾 AdoPet</h2>
          <p style={{ color: ROSA, fontSize: '14px', margin: '6px 0 0', opacity: 0.85 }}>
            Faça login ou crie sua conta para ajudar nossos pets!
          </p>
          <div style={{ width: '76px', height: '76px', background: 'white', borderRadius: '50%', border: `4px solid ${AMARELO}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: ROSA, margin: '0 auto', position: 'absolute', bottom: '-38px', left: '50%', transform: 'translateX(-50%)', boxShadow: '0 4px 16px rgba(166,28,93,0.15)' }}>
            <i className={aba === 'entrar' ? 'bi bi-person' : 'bi bi-person-plus'}></i>
          </div>
        </div>

        <div style={{ padding: '56px 30px 36px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '12px', padding: '4px', marginBottom: '28px' }}>
            {['entrar', 'cadastrar'].map(tab => (
              <div key={tab} onClick={() => { setAba(tab); setAlerta(null); }} style={{ flex: 1, textAlign: 'center', padding: '9px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', background: aba === tab ? ROSA : 'transparent', color: aba === tab ? 'white' : '#888', transition: 'all 0.3s' }}>
                {tab === 'entrar' ? 'Entrar' : 'Criar Conta'}
              </div>
            ))}
          </div>

          {alerta && (
            <div className={`alert alert-${alerta.tipo}`} style={{ fontSize: '13px', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }} dangerouslySetInnerHTML={{ __html: alerta.msg }} />
          )}

          {/* LOGIN */}
          {aba === 'entrar' && (
            <>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: '14px' }}>E-mail</label>
                <div className="input-group">
                  <span className="input-group-text" style={{ borderRadius: '12px 0 0 12px', border: '1.5px solid #e0e0e0', borderRight: 'none', background: 'white' }}>
                    <i className="bi bi-envelope" style={{ color: '#aaa' }}></i>
                  </span>
                  <input type="email" className="form-control" value={loginForm.email}
                    onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    placeholder="seu@email.com"
                    style={{ borderRadius: '0 12px 12px 0', border: '1.5px solid #e0e0e0', borderLeft: 'none', fontSize: '14px' }} />
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ fontSize: '14px' }}>Senha</label>
                <div className="input-group">
                  <span className="input-group-text" style={{ borderRadius: '12px 0 0 12px', border: '1.5px solid #e0e0e0', borderRight: 'none', background: 'white' }}>
                    <i className="bi bi-lock" style={{ color: '#aaa' }}></i>
                  </span>
                  <input type={senhaVis ? 'text' : 'password'} className="form-control" value={loginForm.senha}
                    onChange={e => setLoginForm(f => ({ ...f, senha: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    placeholder="Sua senha"
                    style={{ border: '1.5px solid #e0e0e0', borderLeft: 'none', borderRight: 'none', borderRadius: 0, fontSize: '14px' }} />
                  <button type="button" onClick={() => setSenhaVis(v => !v)}
                    style={{ border: '1.5px solid #e0e0e0', borderLeft: 'none', borderRadius: '0 12px 12px 0', background: 'white', cursor: 'pointer', padding: '0 12px' }}>
                    <i className={`bi ${senhaVis ? 'bi-eye-slash' : 'bi-eye'}`} style={{ color: '#888' }}></i>
                  </button>
                </div>
              </div>

              <button onClick={handleLogin} disabled={loading} style={{ background: ROSA, color: 'white', borderRadius: '12px', border: 'none', fontWeight: 700, padding: '13px', fontSize: '15px', width: '100%', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Entrando...</> : <><i className="bi bi-box-arrow-in-right me-2"></i>Entrar</>}
              </button>
            </>
          )}

          {/* CADASTRO */}
          {aba === 'cadastrar' && (
            <>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Nome Completo *</label>
                  <input type="text" className="form-control" value={cadForm.nome} onChange={e => setCadForm(f => ({ ...f, nome: e.target.value }))} placeholder="Seu nome completo" style={inputStyle} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>E-mail *</label>
                  <input type="email" className="form-control" value={cadForm.email} onChange={e => setCadForm(f => ({ ...f, email: e.target.value }))} placeholder="seu@email.com" style={inputStyle} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Telefone</label>
                  <input type="text" className="form-control" value={cadForm.tel} onChange={e => setCadForm(f => ({ ...f, tel: maskTel(e.target.value) }))} placeholder="(85) 9 9999-9999" style={inputStyle} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>CPF</label>
                  <input type="text" className="form-control" value={cadForm.cpf} onChange={e => setCadForm(f => ({ ...f, cpf: maskCpf(e.target.value) }))} placeholder="000.000.000-00" style={inputStyle} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Senha *</label>
                  <div className="input-group">
                    <input type={senhaVis ? 'text' : 'password'} className="form-control" value={cadForm.senha} onChange={e => setCadForm(f => ({ ...f, senha: e.target.value }))} placeholder="Mínimo 6 caracteres"
                      style={{ borderRadius: '12px 0 0 12px', border: '1.5px solid #e0e0e0', borderRight: 'none', fontSize: '14px' }} />
                    <button type="button" onClick={() => setSenhaVis(v => !v)}
                      style={{ border: '1.5px solid #e0e0e0', borderLeft: 'none', borderRadius: '0 12px 12px 0', background: 'white', cursor: 'pointer', padding: '0 12px' }}>
                      <i className={`bi ${senhaVis ? 'bi-eye-slash' : 'bi-eye'}`} style={{ color: '#888' }}></i>
                    </button>
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Confirmar Senha *</label>
                  <input type={senhaVis2 ? 'text' : 'password'} className="form-control" value={cadForm.confSenha}
                    onChange={e => setCadForm(f => ({ ...f, confSenha: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleCadastro()}
                    placeholder="Repita a senha" style={inputStyle} />
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="cadTermo" checked={cadForm.termo} onChange={e => setCadForm(f => ({ ...f, termo: e.target.checked }))} />
                    <label className="form-check-label" htmlFor="cadTermo" style={{ fontSize: '13px' }}>
                      Li e aceito os <a href="#" style={{ color: ROSA }}>termos de uso</a>.
                    </label>
                  </div>
                </div>
              </div>

              <button onClick={handleCadastro} disabled={loading} style={{ background: ROSA, color: 'white', borderRadius: '12px', border: 'none', fontWeight: 700, padding: '13px', fontSize: '15px', width: '100%', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '16px' }}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Criando conta...</> : <><i className="bi bi-person-plus me-2"></i>Criar Minha Conta</>}
              </button>

              <div className="text-center mt-3" style={{ fontSize: '14px', color: '#888' }}>
                Já tem conta?{' '}
                <span onClick={() => { setAba('entrar'); setAlerta(null); }} style={{ color: ROSA, fontWeight: 600, cursor: 'pointer' }}>Entrar aqui</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}