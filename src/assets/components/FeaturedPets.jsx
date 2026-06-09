import React from 'react';

const petsData = [
  { id: 1, name: 'Bolinha', type: 'Cão', age: '3 anos', location: 'Fortaleza', img: '/assets/images/cachorro1.jpg' },
  { id: 2, name: 'Mia', type: 'Gato', age: '1 ano', location: 'Fortaleza', img: '/assets/images/gato1.jpeg' },
  { id: 3, name: 'Thor', type: 'Cão', age: '4 meses', location: 'Caucaia', img: '/assets/images/cachorro2.jpg' },
  { id: 4, name: 'Luna', type: 'Gato', age: '2 meses', location: 'Eusébio', img: '/assets/images/gato2.jpg' },
];

export default function FeaturedPets() {
  return (
    <section className="container" style={{ marginTop: '60px', marginBottom: '80px' }}>
      <h3 style={{ color: '#333', fontWeight: 'bold', marginBottom: '30px' }}>Pets em Destaque</h3>
      
      <div className="row g-4">
        {petsData.map((pet) => (
          <div className="col-md-3" key={pet.id}>
            <div className="card pet-card h-100 shadow-sm border-0">
              <img src={pet.img} className="card-img-top" alt={`Foto de ${pet.name}`} style={{ height: '200px', objectFit: 'cover' }} />
              <div className="card-body">
                <h5 className="card-title fw-bold">{pet.name}</h5>
                <p className="card-text text-muted mb-1"><i className="bi bi-tag"></i> {pet.type} • {pet.age}</p>
                <p className="card-text text-muted mb-3"><i className="bi bi-geo-alt"></i> {pet.location}</p>
                <div className="d-flex justify-content-between mt-auto">
                  <button className="btn btn-outline-secondary rounded-pill px-3" style={{ fontSize: '14px' }}>Conhecer</button>
                  <button className="btn rounded-pill px-4" style={{ backgroundColor: '#ffd801', color: '#A61C5D', fontWeight: 'bold', fontSize: '14px' }}>Adotar</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}