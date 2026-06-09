import React from 'react';

export default function Header() {
  return (
    <header style={{ backgroundColor: 'white', padding: '15px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <div className="container d-flex justify-content-between align-items-center">
        
        <img src="/assets/images/aaa.png" alt="Logo AdoPet" style={{ height: '60px', objectFit: 'contain' }} />

        <div className="menu-wrapper" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className="hidden-buttons-container" id="botoesOcultos">
            <a href="/" className="btn btn-menu-oculto">Início</a>
            <a href="/pets" className="btn btn-menu-oculto">Encontrar um Pet</a>
            <a href="/sobre" className="btn btn-menu-oculto">Sobre Nós</a>
            <a href="/doacoes" className="btn btn-menu-oculto">Doações</a>
            <a href="/agendamento" className="btn btn-menu-oculto">Agendar Visita</a>
          </div>
          
          <div className="btn-login-header">
            {/* Aqui você pode renderizar o botão de login dinamicamente via React State no futuro */}
          </div>

          <button 
            className="btn" 
            style={{ backgroundColor: '#A61C5D', color: 'white', borderRadius: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
            id="btnMenuToggle"
          >
            <i className="bi bi-list fs-4" id="iconeMenu"></i>
          </button>
        </div>
      </div>
    </header>
  );
}