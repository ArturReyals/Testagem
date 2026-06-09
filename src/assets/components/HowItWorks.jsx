import React from 'react';

const steps = [
  { id: 1, title: '1. Explore', icon: 'bi-search', desc: 'Descubra os pets que estão precisando de um lar.' },
  { id: 2, title: '2. Conheça', icon: 'bi-eye', desc: 'Agende uma visita para interagir com o seu possível novo amigo.' },
  { id: 3, title: '3. Solicite', icon: 'bi-clipboard2-check', desc: 'Preencha o formulário e passe pela nossa entrevista de adoção.' },
  { id: 4, title: '4. Abrace', icon: 'bi-house-heart', desc: 'Leve seu novo melhor amigo para casa e dê muito amor!' },
];

export default function HowItWorks() {
  return (
    <section className="container" style={{ marginTop: '80px', marginBottom: '80px', textAlign: 'center' }}>
      <h3 style={{ color: '#333', fontWeight: 'bold', marginBottom: '50px' }}>Como Funciona a Adoção</h3>
      <div className="row g-4">
        {steps.map((step) => (
          <div className="col-md-3" key={step.id}>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#ffd801', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px auto', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
              <i className={`bi ${step.icon}`} style={{ fontSize: '35px', color: '#A61C5D' }}></i>
            </div>
            <h5 className="fw-bold" style={{ color: '#A61C5D' }}>{step.title}</h5>
            <p className="text-muted" style={{ fontSize: '14px' }}>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}