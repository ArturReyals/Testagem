import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { escutarAuth, logoutUsuario } from '../services/firebaseService';

const ROSA = '#A61C5D';

export default function Header() {
  const [usuario, setUsuario] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const unsub = escutarAuth((u) => setUsuario(u));
    return () => unsub();
  }, []);

  const linkStyle = (path) => ({
    color: location.pathname === path ? ROSA : '#333',
    fontWeight: location.pathname === path ? 'bold' : '600',
    textDecoration: 'none',
    fontSize: '14px',
    marginLeft: '15px' // Espaçamento entre links
  });

  return (
    <header style={{ backgroundColor: 'white', padding: '15px 0', borderBottom: '1px solid #eee' }}>
      <div className="container d-flex justify-content-between align-items-center">
        
        {/* LOGO */}
        <Link to="/" style={{ textDecoration: 'none', color: ROSA, fontSize: '24px', fontWeight: 'bold' }}>
          AdoPets
        </Link>

        {/* MENU COMPLETO */}
        <nav className="d-flex align-items-center">
          <Link to="/" style={linkStyle('/')}>Início</Link>
          <Link to="/pets" style={linkStyle('/pets')}>Encontrar um Pet</Link>
          <Link to="/sobre" style={linkStyle('/sobre')}>Sobre Nós</Link>
          <Link to="/doacoes" style={linkStyle('/doacoes')}>Doações</Link>
          <Link to="/agendamento" style={linkStyle('/agendamento')}>Agendar Visita</Link>

          {/* BOTÃO USUÁRIO */}
          {usuario ? (
            <Link 
              to={usuario.role === 'admin' ? '/admin' : '/minha-conta'} 
              style={{ 
                marginLeft: '20px', 
                padding: '8px 16px', 
                background: '#fff0f7', 
                color: ROSA, 
                borderRadius: '20px', 
                textDecoration: 'none', 
                fontWeight: 'bold', 
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="bi bi-person-circle"></i>
              {usuario.role === 'admin' ? 'ADMINISTRADOR' : usuario.nome?.split(' ')[0]?.toUpperCase()}
            </Link>
          ) : (
            <Link 
              to="/login" 
              style={{ 
                marginLeft: '20px', 
                padding: '8px 16px', 
                background: ROSA, 
                color: 'white', 
                borderRadius: '20px', 
                textDecoration: 'none', 
                fontWeight: 'bold', 
                fontSize: '14px' 
              }}
            >
              Entrar
            </Link>
          )}

          {usuario && (
            <button 
              onClick={logoutUsuario}
              style={{ marginLeft: '10px', background: 'none', border: '1px solid #ddd', borderRadius: '20px', padding: '8px 16px', fontSize: '14px', fontWeight: '600', color: '#555', cursor: 'pointer' }}
            >
              Sair
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}