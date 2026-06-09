import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
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
  const [carregando, setCarregando] = useState(true);
  const location  = useLocation();
  const navigate  = useNavigate();

  useEffect(() => {
    const unsub = escutarAuth(u => {
      setUsuario(u);
      setCarregando(false);
    });
    return unsub;
  }, []);

  async function handleLogout() {
    await logoutUsuario();
    setUsuario(null);
    navigate('/');
  }

  const esconderLayout = ['/login', '/admin'].includes(location.pathname);
  const ROSA = '#A61C5D';

  if (carregando) return <div className="text-center mt-5">Carregando sistema...</div>;

  return (
    <>
      {!esconderLayout && (
        <header style={{ backgroundColor: 'white', padding: '15px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div className="container d-flex justify-content-between align-items-center">
            <Link to="/" style={{ textDecoration: 'none', color: ROSA, fontSize: '24px', fontWeight: 'bold' }}>AdoPets</Link>
            
            {/* Menu Desktop */}
            <nav className="d-none d-md-flex align-items-center gap-3">
              <Link to="/" style={{ color: location.pathname === '/' ? ROSA : '#333', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}>Início</Link>
              <Link to="/pets" style={{ color: location.pathname === '/pets' ? ROSA : '#333', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}>Encontrar um Pet</Link>
              <Link to="/sobre" style={{ color: location.pathname === '/sobre' ? ROSA : '#333', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}>Sobre Nós</Link>
              <Link to="/doacoes" style={{ color: location.pathname === '/doacoes' ? ROSA : '#333', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}>Doações</Link>
              <Link to="/agendamento" style={{ color: location.pathname === '/agendamento' ? ROSA : '#333', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}>Agendar Visita</Link>
              
              {usuario ? (
                <div className="d-flex align-items-center gap-2">
                  <Link to={usuario.role === 'admin' ? '/admin' : '/minha-conta'} style={{ fontWeight: 700, color: ROSA, background: '#fff0f7', borderRadius: '30px', padding: '6px 14px', fontSize: '14px', textDecoration: 'none' }}>
                    {usuario.role === 'admin' ? 'ADMINISTRADOR' : usuario.nome?.split(' ')[0]?.toUpperCase()}
                  </Link>
                  <button onClick={handleLogout} className="btn btn-sm btn-outline-secondary rounded-pill">Sair</button>
                </div>
              ) : (
                <Link to="/login" className="btn rounded-pill px-4" style={{ background: ROSA, color: 'white', fontSize: '14px' }}>Entrar</Link>
              )}
            </nav>
          </div>
        </header>
      )}

      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/doacoes" element={<Doacoes />} />
          <Route path="/agendamento" element={<Agendamento />} />
          <Route path="/login" element={usuario ? <Navigate to="/" /> : <Login />} />
          
          <Route 
            path="/admin" 
            element={usuario?.role === 'admin' ? <Admin /> : <Navigate to="/" />} 
          />
          <Route 
            path="/minha-conta" 
            element={usuario?.role === 'admin' ? <Navigate to="/admin" /> : (usuario ? <MinhaConta /> : <Navigate to="/login" />)} 
          />
        </Routes>
      </main>
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