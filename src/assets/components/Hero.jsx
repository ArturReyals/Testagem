import React from 'react';

export default function Hero() {
  return (
    <section style={{ backgroundColor: '#ffd801', padding: '80px 0 100px 0', textAlign: 'center' }}>
      <div className="container">
        <h1 style={{ color: '#A61C5D', fontWeight: 800, fontSize: '3rem' }}>
          Encontre o Seu Melhor Amigo Hoje!
        </h1>
        <p style={{ color: '#A61C5D', fontSize: '1.5rem', marginTop: '15px' }}>
          Adoção de cães e gatos em toda Fortaleza e cidades metropolitanas. Dê um lar a quem precisa de amor.
        </p>
      </div>
    </section>
  );
}