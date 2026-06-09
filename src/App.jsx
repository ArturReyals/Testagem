import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { escutarAuth, logoutUsuario } from './services/firebaseService';

import Home        from './assets/pages/Home';
import Sobre       from './assets/pages/Sobre';
import Pets        from './assets/pages/Pets';
import Doacoes     from './assets/pages/Doacoes';
import Agendamento from './assets/pages/Agendamento';
import Login       from './assets/pages/Login';
import Admin       from './assets/pages/Admin';
import MinhaConta  from './assets/pages/MinhaConta';

function AppContent() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [usuario, setUsuario]       = useState(null);
  const location  = useLocation();
  const navigate  = useNavigate();

  useEffect(() => {
    const unsub = escutarAuth(u => setUsuario(u));
    return unsub;
  }, []);

  async function handleLogout() {
    await logoutUsuario();
    setUsuario(null);
    navigate('/');
  }

  const esconderLayout = ['/login', '/admin'].includes(location.pathname);
  const primeiroNome   = usuario?.nome?.split(' ')[0] || '';

  const linkAtivo = (path) => ({ color: location.pathname === path ? ROSA : '#333' });
  const ROSA = '#A61C5D';

  return (
    <>
      {!esconderLayout && (
        <>
          <div style={{ width: '100%', height: '7px', background: '#A61C5D' }}></div>

          <header style={{ backgroundColor: 'white', padding: '15px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'relative' }}>
            <div className="container d-flex justify-content-between align-items-center">

              <Link to="/" style={{ textDecoration: 'none' }}>
                <h2 style={{ color: '#A61C5D', fontWeight: 'bold', margin: 0 }}>AdoPet</h2>
              </Link>

              <div className="d-flex align-items-center gap-3">
                <div
                  className={`${menuAberto ? 'd-flex flex-column position-absolute end-0 bg-white p-4 shadow rounded' : 'd-none d-md-flex'} gap-3 align-items-center`}
                  style={{ top: '100%', zIndex: 1000 }}
                >
                  <Link to="/"            className="text-decoration-none fw-bold"    style={linkAtivo('/')}            onClick={() => setMenuAberto(false)}>Início</Link>
                  <Link to="/pets"        className="text-decoration-none fw-semibold" style={linkAtivo('/pets')}        onClick={() => setMenuAberto(false)}>Encontrar um Pet</Link>
                  <Link to="/sobre"       className="text-decoration-none fw-semibold" style={linkAtivo('/sobre')}       onClick={() => setMenuAberto(false)}>Sobre Nós</Link>
                  <Link to="/doacoes"     className="text-decoration-none fw-semibold" style={linkAtivo('/doacoes')}     onClick={() => setMenuAberto(false)}>Doações</Link>
                  <Link to="/agendamento" className="text-decoration-none fw-semibold" style={linkAtivo('/agendamento')} onClick={() => setMenuAberto(false)}>Agendar Visita</Link>

                  {usuario ? (
                    <div className="d-flex align-items-center gap-2">
                      <Link to="/minha-conta" onClick={() => setMenuAberto(false)} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#A61C5D', fontSize: '14px', background: '#fff0f7', borderRadius: '30px', padding: '6px 14px' }}>
                        <i className="bi bi-person-circle fs-5"></i>
                        {primeiroNome}
                      </Link>
                      <button
                        onClick={() => { handleLogout(); setMenuAberto(false); }}
                        className="btn rounded-pill px-3"
                        style={{ border: '1.5px solid #A61C5D', color: '#A61C5D', fontSize: '14px', background: 'transparent' }}
                      >
                        <i className="bi bi-box-arrow-right me-1"></i>Sair
                      </button>
                    </div>
                  ) : (
                    <Link to="/login" className="btn rounded-pill px-3" style={{ background: '#A61C5D', color: 'white', fontSize: '14px' }} onClick={() => setMenuAberto(false)}>
                      <i className="bi bi-box-arrow-in-right me-1"></i>Entrar
                    </Link>
                  )}
                </div>

                <button
                  className="btn d-md-none"
                  style={{ backgroundColor: '#A61C5D', color: 'white', borderRadius: '36px' }}
                  onClick={() => setMenuAberto(!menuAberto)}
                >
                  <i className={`bi ${menuAberto ? 'bi-x-lg' : 'bi-list'} fs-4`}></i>
                </button>
              </div>
            </div>
          </header>
        </>
      )}

      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/"             element={<Home />} />
          <Route path="/sobre"        element={<Sobre />} />
          <Route path="/pets"         element={<Pets />} />
          <Route path="/doacoes"      element={<Doacoes />} />
          <Route path="/agendamento"  element={<Agendamento />} />
          <Route path="/login"        element={<Login />} />
          <Route path="/admin"        element={<Admin />} />
          <Route path="/minha-conta"  element={<MinhaConta />} />
          <Route path="*" element={
            <div className="container text-center py-5">
              <h2 style={{ color: '#A61C5D' }}>Página não encontrada 😢</h2>
              <Link to="/" className="btn mt-3" style={{ background: '#A61C5D', color: 'white', borderRadius: '30px' }}>Voltar ao início</Link>
            </div>
          } />
        </Routes>
      </main>

      {!esconderLayout && (
        <footer style={{ backgroundColor: '#212529', color: 'white', padding: '60px 0 20px 0' }}>
          <div className="container">
            <div className="row g-4">
              <div className="col-md-4">
                <h4 className="fw-bold" style={{ color: '#ffd801' }}>4PatasFortaleza</h4>
                <p style={{ fontSize: '14px', color: '#bbb', marginTop: '15px' }}>
                  Fundação dedicada a garantir que cães e gatos encontrem um lar seguro, carinhoso e cheio de amor. Adote e transforme uma vida!
                </p>
              </div>
              <div className="col-md-4">
                <h5 className="fw-bold mb-3">Acesso Rápido</h5>
                <ul className="list-unstyled" style={{ lineHeight: 2 }}>
                  <li><Link to="/pets"        className="text-decoration-none text-light">Encontrar um Pet</Link></li>
                  <li><Link to="/sobre"       className="text-decoration-none text-light">Sobre Nós</Link></li>
                  <li><Link to="/doacoes"     className="text-decoration-none text-light">Doações</Link></li>
                  <li><Link to="/agendamento" className="text-decoration-none text-light">Agendar Visita</Link></li>
                  <li><Link to="/minha-conta" className="text-decoration-none text-light">Minha Conta</Link></li>
                </ul>
              </div>
              <div className="col-md-4">
                <h5 className="fw-bold mb-3">Redes Sociais</h5>
                <div className="d-flex gap-3">
                  <a href="https://www.facebook.com/"  target="_blank" rel="noreferrer" className="text-light fs-4"><i className="bi bi-facebook"></i></a>
                  <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="text-light fs-4"><i className="bi bi-instagram"></i></a>
                  <a href="https://web.whatsapp.com/"  target="_blank" rel="noreferrer" className="text-light fs-4"><i className="bi bi-whatsapp"></i></a>
                </div>
              </div>
            </div>
            <hr style={{ borderColor: '#444', marginTop: '40px', marginBottom: '20px' }} />
            <div className="text-center" style={{ color: '#777', fontSize: '13px' }}>
              &copy; {new Date().getFullYear()} 4PatasFortaleza. Todos os direitos reservados.
            </div>
          </div>
        </footer>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}