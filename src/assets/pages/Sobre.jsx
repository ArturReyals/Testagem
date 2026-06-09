import React from 'react';
import { Link } from 'react-router-dom';
import * as Imagens from '../../assets/images';

const ROSA = '#A61C5D';
const AMARELO = '#ffd801';

const stats = [
  { valor: '+1.200', label: 'Pets adotados' },
  { valor: '8',      label: 'Anos de história' },
  { valor: '+300',   label: 'Voluntários ativos' },
  { valor: '4',      label: 'Cidades atendidas' },
];

const valores = [
  { icon: 'bi-bullseye', titulo: 'Nossa Missão', texto: 'Resgatar, reabilitar e promover a adoção responsável de cães e gatos em situação de abandono, garantindo a eles uma segunda chance de serem felizes.' },
  { icon: 'bi-eye',      titulo: 'Nossa Visão',  texto: 'Ser referência no bem-estar animal no estado do Ceará, sonhando com um futuro onde nenhum animal precise sofrer nas ruas por falta de amor e cuidado.' },
  { icon: 'bi-heart',    titulo: 'Nossos Valores', texto: 'Amor incondicional à vida, responsabilidade social, transparência em nossas ações e empatia tanto com os animais quanto com as famílias adotantes.' },
];

const equipe = [
  { nome: 'Ana Silva',       cargo: 'Fundadora / Presidência',    bio: 'Idealizadora do projeto, dedica sua vida a dar voz aos animais.',                              img: Imagens.ceo },
  { nome: 'Dr. Rodrigo Silva', cargo: 'Veterinário Chefe',        bio: 'Responsável por cuidar da saúde e reabilitação dos nossos resgatados.',                       img: Imagens.veterinario },
  { nome: 'Beatriz Souza',   cargo: 'Coord. de Voluntários',      bio: 'Organiza nossa rede de amor e treinamentos com voluntários.',                                  img: Imagens.coord_volunt },
  { nome: 'Lucas Andrade',   cargo: 'Gestor de Adoções',          bio: 'Faz a ponte perfeita entre as famílias e os pets que aguardam um lar.',                       img: Imagens.estagiario },
];

export default function Sobre() {
  return (
    <>
      {/* HERO */}
      <section style={{ backgroundColor: AMARELO, padding: '60px 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ color: ROSA, fontWeight: 800, fontSize: '2.5rem' }}>Sobre a AdoPets</h1>
          <p style={{ color: ROSA, fontSize: '1.2rem', marginTop: '10px', fontWeight: 500 }}>
            Conheça nossa história e a missão que nos move todos os dias
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="container" style={{ marginTop: '40px', marginBottom: '60px' }}>
        <div className="row text-center g-4">
          {stats.map((s, i) => (
            <div key={i} className={`col-md-3 col-6 ${i > 0 ? 'border-start' : ''}`} style={{ textAlign: 'center', padding: '20px 0' }}>
              <h2 style={{ color: ROSA, fontWeight: 800, fontSize: '2.5rem', marginBottom: '5px' }}>{s.valor}</h2>
              <p style={{ color: '#666', fontSize: '15px', fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HISTÓRIA */}
      <section className="container" style={{ marginBottom: '80px' }}>
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <span style={{ backgroundColor: AMARELO, color: ROSA, fontWeight: 'bold', padding: '5px 15px', borderRadius: '20px', fontSize: '14px' }}>
              Nossa História
            </span>
            <h3 style={{ color: '#333', fontWeight: 800, marginTop: '15px', marginBottom: '20px' }}>Nascemos do amor pelos animais</h3>
            <p style={{ color: '#666', lineHeight: 1.8 }}>
              A <strong>AdoPets</strong> nasceu em 2017 a partir de um grupo de amigos apaixonados por animais que não podiam mais fechar os olhos para a quantidade de cães e gatos abandonados nas ruas de Fortaleza e região metropolitana.
            </p>
            <p style={{ color: '#666', lineHeight: 1.8 }}>
              O que começou como resgates informais nos finais de semana rapidamente se transformou em uma rede de apoio sólida. Hoje, contamos com abrigos parceiros, clínicas veterinárias aliadas e uma legião de voluntários dedicados a reabilitar e encontrar lares cheios de amor para cada um dos nossos peludos.
            </p>
          </div>
          <div className="col-lg-6">
            <img
              src={Imagens.resgate}
              alt="Equipe resgatando animais"
              style={{ width: '100%', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
            />
          </div>
        </div>
      </section>

      {/* MISSÃO / VISÃO / VALORES */}
      <section style={{ backgroundColor: 'white', padding: '80px 0' }}>
        <div className="container">
          <div className="row g-4">
            {valores.map((v, i) => (
              <div key={i} className="col-md-4">
                <div style={{
                  background: 'white', border: 'none', borderRadius: '15px',
                  padding: '30px 20px', textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)', height: '100%',
                  transition: 'transform 0.3s',
                }}>
                  <div style={{
                    width: '70px', height: '70px', backgroundColor: '#fffafc', color: ROSA,
                    borderRadius: '50%', display: 'flex', justifyContent: 'center',
                    alignItems: 'center', fontSize: '30px', margin: '0 auto 20px',
                  }}>
                    <i className={`bi ${v.icon}`}></i>
                  </div>
                  <h4 style={{ fontWeight: 700, color: '#333' }}>{v.titulo}</h4>
                  <p className="text-muted mt-3" style={{ fontSize: '15px' }}>{v.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EQUIPE */}
      <section className="container" style={{ marginTop: '80px', marginBottom: '80px' }}>
        <div className="text-center mb-5">
          <h3 style={{ color: '#333', fontWeight: 800 }}>Quem faz acontecer</h3>
          <p style={{ color: '#666' }}>Conheça alguns dos rostos por trás da nossa instituição</p>
        </div>
        <div className="row g-4">
          {equipe.map((m, i) => (
            <div key={i} className="col-md-3">
              <div style={{
                background: 'white', borderRadius: '15px', overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center', transition: '0.3s',
              }}>
                <img src={m.img} alt={m.nome} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
                <div style={{ padding: '20px' }}>
                  <div style={{ color: ROSA, fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>
                    {m.cargo}
                  </div>
                  <h5 style={{ fontWeight: 700, color: '#333' }}>{m.nome}</h5>
                  <p className="text-muted" style={{ fontSize: '13px' }}>{m.bio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}