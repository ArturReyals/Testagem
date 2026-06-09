import React from 'react';

export default function FilterBar() {
  // Funções mockadas para evitar erros na renderização inicial
  const toggleDropdown = (tipo) => console.log(`Abrir dropdown: ${tipo}`);
  const selecionarOpcao = (tipo, valor) => console.log(`Selecionou ${valor} no filtro ${tipo}`);
  const buscarPets = () => console.log('Buscando pets...');

  return (
    <div className="container mt-n5"> {/* Ajuste de margem se necessário */}
      <div className="search-bar-floating d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 bg-white shadow-sm rounded-4">
        
        <div className="filter-block flex-grow-1" onClick={() => toggleDropdown('tipo')} style={{ cursor: 'pointer' }}>
          <strong className="d-block">Tipo de Pet</strong>
          <span className="filter-value text-muted">Cachorro/Gato</span>
        </div>

        <div className="filter-block flex-grow-1 border-start ps-3" onClick={() => toggleDropdown('idade')} style={{ cursor: 'pointer' }}>
          <strong className="d-block">Idade</strong>
          <span className="filter-value text-muted">Filhote/Adulto</span>
        </div>

        <div className="filter-block flex-grow-1 border-start ps-3" onClick={() => toggleDropdown('porte')} style={{ cursor: 'pointer' }}>
          <strong className="d-block">Porte</strong>
          <span className="filter-value text-muted">Pequeno/Médio/Grande</span>
        </div>

        <div className="filter-block flex-grow-1 border-start ps-3" onClick={() => toggleDropdown('localizacao')} style={{ cursor: 'pointer' }}>
          <strong className="d-block">Localização</strong>
          <span className="filter-value text-muted">Cidade/Estado</span>
        </div>

        <div>
          <button 
            className="btn px-4 py-2" 
            onClick={buscarPets}
            style={{ backgroundColor: '#A61C5D', color: 'white', borderRadius: '30px', fontWeight: 'bold' }}
          >
            Buscar Pets
          </button>
        </div>

      </div>
    </div>
  );
}