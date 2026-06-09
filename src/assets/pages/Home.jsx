import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// DADOS DOS PETS em destaque
const petsData = [
  { id: 1, name: 'Bolinha', type: 'Cão',  age: '3 anos',  location: 'Fortaleza', img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop&q=60' },
  { id: 2, name: 'Mia',     type: 'Gato', age: '1 ano',   location: 'Fortaleza', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=60' },
  { id: 3, name: 'Thor',    type: 'Cão',  age: '4 meses', location: 'Caucaia',   img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&auto=format&fit=crop&q=60' },
  { id: 4, name: 'Luna',    type: 'Gato', age: '2 meses', location: 'Eusébio',   img: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500&auto=format&fit=crop&q=60' },
];

const stepsData = [
  { id: 1, title: '1. Explore',   icon: 'bi-search',           desc: 'Descubra os pets que estão precisando de um lar.' },
  { id: 2, title: '2. Conheça',   icon: 'bi-eye',              desc: 'Agende uma visita para interagir com o seu possível novo amigo.' },
  { id: 3, title: '3. Solicite',  icon: 'bi-clipboard2-check', desc: 'Preencha o formulário e passe pela nossa entrevista de adoção.' },
  { id: 4, title: '4. Abrace',    icon: 'bi-house-heart',      desc: 'Leve seu novo melhor amigo para casa e dê muito amor!' },
];

export default function Home() {
  const navigate = useNavigate();

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
          {/* ✅ Link "Ver todos" para /pets */}
          <Link to="/pets" style={{ color: '#A61C5D', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>
            Ver todos →
          </Link>
        </div>

        <div className="row g-4">
          {petsData.map((pet) => (
            <div className="col-md-3" key={pet.id}>
              <div className="card h-100 shadow-sm border-0 overflow-hidden" style={{ borderRadius: '15px' }}>
                <img src={pet.img} className="card-img-top" alt={pet.name} style={{ height: '200px', objectFit: 'cover' }} />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-bold">{pet.name}</h5>
                  <p className="card-text text-muted mb-1"><i className="bi bi-tag"></i> {pet.type} • {pet.age}</p>
                  <p className="card-text text-muted mb-3"><i className="bi bi-geo-alt"></i> {pet.location}</p>
                  <div className="d-flex justify-content-between mt-auto">
                    {/* ✅ CORRIGIDO: "Conhecer" vai para /pets */}
                    <Link
                      to="/pets"
                      className="btn btn-outline-secondary rounded-pill px-3"
                      style={{ fontSize: '14px' }}
                    >
                      Conhecer
                    </Link>
                    {/* ✅ CORRIGIDO: "Adotar" vai para /login (precisa estar logado) */}
                    <Link
                      to="/login"
                      className="btn rounded-pill px-4"
                      style={{ backgroundColor: '#ffd801', color: '#A61C5D', fontWeight: 'bold', fontSize: '14px' }}
                    >
                      Adotar
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
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

        {/* ✅ CTA no final da seção */}
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
    </>
  );
}