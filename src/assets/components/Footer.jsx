import React from 'react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#212529', color: 'white', padding: '60px 0 20px 0' }}>
      <div className="container">
        <div className="row g-4">
          <div className="col-md-4">
            <h4 className="fw-bold" style={{ color: '#ffd801' }}>AdoPets</h4>
            <p style={{ fontSize: '14px', color: '#bbb', marginTop: '15px' }}>
              Fundação dedicada a garantir que cães e gatos encontrem um lar seguro, carinhoso e cheio de amor. Adote e transforme uma vida!
            </p>
          </div>

          <div className="col-md-4">
            <h5 className="fw-bold mb-3">Acesso Rápido</h5>
            <ul className="list-unstyled" style={{ lineHeight: 2 }}>
              <li><a href="/pets" className="footer-link text-decoration-none text-light">Encontrar um Pet</a></li>
              <li><a href="#como-funciona" className="footer-link text-decoration-none text-light">Como Funciona</a></li>
              <li><a href="/sobre" className="footer-link text-decoration-none text-light">Sobre Nós</a></li>
              <li><a href="/doacoes" className="footer-link text-decoration-none text-light">Doações</a></li>
            </ul>
          </div>

          <div className="col-md-4">
            <h5 className="fw-bold mb-3">Redes Sociais</h5>
            <div className="d-flex gap-3">
              <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" className="footer-social text-light fs-4"><i className="bi bi-facebook"></i></a>
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="footer-social text-light fs-4"><i className="bi bi-instagram"></i></a>
              <a href="https://web.whatsapp.com/" target="_blank" rel="noreferrer" className="footer-social text-light fs-4"><i className="bi bi-whatsapp"></i></a>
            </div>
          </div>
        </div>

        <hr style={{ borderColor: '#444', marginTop: '40px', marginBottom: '20px' }} />

        <div className="text-center" style={{ color: '#777', fontSize: '13px' }}>
          &copy; {new Date().getFullYear()} AdoPets. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}