export default function Footer() {
  const footer = document.createElement("div");
  footer.innerHTML = `
    <footer class="text-center text-lg-start bg-dark text-light pt-5">
      <div class="container text-md-start">
        <div class="row mt-3">

          <!-- Sobre -->
          <div class="col-md-3 col-lg-3 col-xl-3 mb-4">
            <h6 class="fw-bold mb-3" style="color: #bd9f78;">
              <i class="fas fa-gem me-2"></i> Glow Up
            </h6>
            <p>
              Desde 2025, inspirando <strong>beleza, confiança e bem-estar</strong>.  
              Conectamos você aos melhores parceiros para transformar sua rotina.
            </p>
          </div>

          <!-- Links úteis -->
          <div class="col-md-2 col-lg-2 col-xl-2 mb-4">
            <h6 class="fw-bold mb-3" style="color: #bd9f78;">Links</h6>
            <ul class="list-unstyled">
              <li class="mb-2"><a href="agendamento" class="text-reset footer-link">Estabelecimentos</a></li>
              <li class="mb-2"><a href="home" class="text-reset footer-link">Profissionais</a></li>
              <!--<li class="mb-2"><a href="#!" class="text-reset footer-link">Ajuda</a></li>--!>
            </ul>
          </div>

          <!-- Contato -->
          <div class="col-md-3 col-lg-3 col-xl-3 mb-4">
            <h6 class="fw-bold mb-3" style="color: #bd9f78;">Contato</h6>
            <ul class="list-unstyled">
              <li class="mb-2"><i class="fas fa-envelope me-2"></i> projetointegrador@gmail.com</li>
              <li class="mb-2"><i class="fas fa-phone me-2"></i> (15) 0000-0000</li>
              <li class="mb-2">
                <a href="https://www.instagram.com/senacspsorocaba/" target="_blank" class="text-reset footer-link">
                  <i class="fab fa-instagram me-2"></i>@glowup
                </a>
              </li>
              <li class="mb-2">
                <a href="https://wa.me/5515000000000" target="_blank" class="text-reset footer-link">
                  <i class="fab fa-whatsapp me-2"></i>WhatsApp
                </a>
              </li>
            </ul>
          </div>

          <!-- Mapa -->
          <div class="col-md-4 col-lg-4 col-xl-4 mb-4">
            <h6 class="fw-bold mb-3" style="color: #bd9f78;">Onde estamos</h6>
            <div class="map-responsive">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.157709162129!2d-46.65657288446812!3d-23.59708946826579!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c5d8f93b7b%3A0x5cf70b1c2db13454!2sPaulista%20Avenue!5e0!3m2!1sen!2sbr!4v1605275971729!5m2!1sen!2sbr"
                width="100%" height="200" style="border:0; border-radius:6px;"
                allowfullscreen="" loading="lazy"
                referrerpolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
          </div>
        </div>
      </div>

      <!-- Frase inspiradora -->
      <section class="text-center mt-4 mb-3">
        <p style="font-style: italic; color: #ddd;">
          "Beleza e bem-estar a um clique de distância ✨"
        </p>
      </section>

      <!-- Copyright -->
      <div class="text-center p-3" style="background-color: rgba(255, 255, 255, 0.05); font-size: 0.9rem;">
        © 2025 Copyright:
        <a class="text-reset fw-bold" href="#">projetoIntegrador.com</a>
      </div>
    </footer>
  `;
  return footer;
}
