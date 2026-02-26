export default function Footer() {
  const footer = document.createElement("div");
  footer.innerHTML = `
    <footer class="text-center text-lg-start bg-dark text-light pt-5">
      <div class="container text-md-start">
        <div class="row mt-3">

          <!-- Sobre -->
          <div class="col-md-3 col-lg-3 col-xl-3 mb-4">
            <h6 class="fw-bold mb-3" style="color: #75b16e;">
              Glow Up
            </h6>
            <p>
              Desde 2025, inspirando <strong>beleza, confiança e bem-estar</strong>.  
              Conectamos você aos melhores parceiros para transformar sua rotina.
            </p>
          </div>

          <!-- Links úteis -->
          <div class="col-md-2 col-lg-2 col-xl-2 mb-4">
            <h6 class="fw-bold mb-3" style="color: #75b16e;">Links Úteis</h6>
            <ul class="list-unstyled">
              <li class="mb-2"><a href="estabelecimentos" class="text-reset footer-link">Estabelecimentos</a></li>
              <li class="mb-2"><a href="profissionais" class="text-reset footer-link">Profissionais</a></li>
              <li class="mb-2"><a href="sobre" class="text-reset footer-link">Sobre Nós</a></li>
              <li class="mb-2"><a href="#" class="text-reset footer-link" data-bs-toggle="modal" data-bs-target="#faqModal">FAQ</a></li>
              <li class="mb-2"><a href="#" class="text-reset footer-link" data-bs-toggle="modal" data-bs-target="#termsModal">Termos de Uso</a></li>
              <li class="mb-2"><a href="#" class="text-reset footer-link" data-bs-toggle="modal" data-bs-target="#privacyModal">Política de Privacidade</a></li>
            </ul>
          </div>

          <!-- Contato e Redes Sociais -->
          <div class="col-md-3 col-lg-3 col-xl-3 mb-4">
            <h6 class="fw-bold mb-3" style="color: #75b16e;">Contato</h6>
            <ul class="list-unstyled">
              <li class="mb-2"><i class="fas fa-envelope me-2"></i> projetointegrador@gmail.com</li>
              <li class="mb-2"><i class="fas fa-phone me-2"></i> (15) 0000-0000</li>
            </ul>
            <h6 class="fw-bold mb-3 mt-4" style="color: #75b16e;">Redes Sociais</h6>
            <div class="social-links">
              <a href="https://www.instagram.com/senacspsorocaba/" target="_blank" class="social-link social-instagram" aria-label="Instagram">
                <i class="fab fa-instagram"></i>
              </a>
              <a href="https://wa.me/5515000000000" target="_blank" class="social-link social-whatsapp" aria-label="WhatsApp">
                <i class="fab fa-whatsapp"></i>
              </a>
              <a href="https://www.facebook.com" target="_blank" class="social-link social-facebook" aria-label="Facebook">
                <i class="fab fa-facebook"></i>
              </a>
              <a href="https://x.com" target="_blank" class="social-link social-twitter" aria-label="Twitter">
                <i class="fab fa-twitter"></i>
              </a>
            </div>
          </div>

          <!-- Depoimentos e Mapa -->
          <div class="col-md-4 col-lg-4 col-xl-4 mb-4">
            <h6 class="fw-bold mb-3" style="color: #75b16e;">Onde estamos</h6>
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
