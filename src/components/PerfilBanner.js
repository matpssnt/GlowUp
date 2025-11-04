export default function PerfilBanner() {
    const containerPerfil = document.createElement("div");
    containerPerfil.className = "perfilContainer-frame";
    containerPerfil.innerHTML = `
      <div class="perfil-banner-card">
        <img src="public/assets/images/background-primary.avif" class="banner-img" alt="Imagem de capa">
        <div class="perfil-overlay">
          <div class="foto-perfil">
            <img src="public/assets/images/fotoDePerfil.png" alt="Foto de perfil">
          </div>
          <div class="info-perfil">
            <h5 class="perfil-nome">Daiana Oliveira</h5>
            <p class="perfil-bio">daiana.oli@gmail.com</p>
          </div>
        </div>
      
        <div id="miniCarousel" class="carousel slide mini-carrossel-section" data-bs-ride="carousel" data-bs-interval="3000" data-bs-pause="hover">
      
          <!-- Indicadores -->
          <div class="carousel-indicators">
            <button type="button" data-bs-target="#miniCarousel" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
            <button type="button" data-bs-target="#miniCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
            <button type="button" data-bs-target="#miniCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
          </div>
      
          <!-- Slides -->
          <div class="carousel-inner">
            <div class="carousel-item active">
              <img src="public/assets/images/Cabelo.jpg" class="d-block w-100" alt="Serviço 1" loading="eager">
            </div>
            <div class="carousel-item">
              <img src="public/assets/images/botox.jpg" class="d-block w-100" alt="Serviço 2" loading="lazy">
            </div>
            <div class="carousel-item">
              <img src="public/assets/images/unhas.jpg" class="d-block w-100" alt="Serviço 3" loading="lazy">
            </div>
          </div>
      
          <!-- Controles -->
          <button class="carousel-control-prev" type="button" data-bs-target="#miniCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Slide anterior</span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#miniCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Próximo slide</span>
          </button>
        </div>
      
      </div>
    `;
    return containerPerfil;
}
