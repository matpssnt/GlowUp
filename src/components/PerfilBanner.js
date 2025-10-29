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
            <p class="perfil-bio">Meu nome é Daiana Oliveira, tenho 22 anos, sou cabeleleira profissional especializada em cabelos femininos</p>
          </div>
        </div>
      </div>
    `;
    return containerPerfil;
}
