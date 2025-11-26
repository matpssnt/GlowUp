export default function PerfilBanner(dadosProfissional = null, endereco = null, telefone = null) {
  const containerPerfil = document.createElement("div");
  containerPerfil.className = "perfilContainer-frame";
  
  // Dados padrão ou do profissional
  const nomeProfissional = dadosProfissional?.nome || dadosProfissional?.razao_social || 'Profissional';
  const descricaoProfissional = dadosProfissional?.descricao || 'Especialista em estética e beleza';
  const nomeEstabelecimento = dadosProfissional?.nome || dadosProfissional?.razao_social || 'Estabelecimento';
  const bioProfissional = dadosProfissional?.descricao ? dadosProfissional.descricao.substring(0, 50) + '...' : 'Especialista em estética e beleza';
  
  // Formata endereço
  let enderecoFormatado = 'Endereço não informado';
  if (endereco) {
    const partes = [];
    if (endereco.rua) partes.push(endereco.rua);
    if (endereco.numero) partes.push(endereco.numero);
    if (endereco.bairro) partes.push(endereco.bairro);
    if (partes.length > 0) {
      enderecoFormatado = partes.join(', ');
      if (endereco.cidade) enderecoFormatado += ` - ${endereco.cidade}`;
    }
  }
  
  // Formata telefone
  let telefoneFormatado = 'Telefone não informado';
  let whatsappLink = '#';
  if (telefone) {
    const ddd = telefone.ddd || '';
    const numero = telefone.digitos || telefone.numero || '';
    if (ddd && numero) {
      telefoneFormatado = `(${ddd}) ${numero}`;
      whatsappLink = `https://wa.me/55${ddd}${numero.replace(/\D/g, '')}`;
    }
  }
  
  containerPerfil.innerHTML = `
    <div class="perfil-banner-card">
      <img src="public/assets/images/background-primary.avif" class="banner-img" alt="Imagem de capa">

      <div class="perfil-overlay">
        <div class="foto-perfil">
          <img src="public/assets/images/fotoDePerfil.png" alt="Foto de perfil">
        </div>
      </div>

      <div class="perfil-content">
        <div class="description-profissional">
          <div class="sobre-prof">
            <h2 class="titulo-principal">Sobre:</h2>
          </div>

          <div class="titulo-estabelecimento">
            <h1 class="titulo-estab">${nomeEstabelecimento}</h1>
          </div>

          <div class="description">
            <p>
              ${descricaoProfissional}
            </p>
          </div>

          <div class="info-extra">
            <div class="location">
              <i class="bi bi-geo-alt-fill icon"></i>
              <div>
                <h3>Localização</h3>
                <p>${enderecoFormatado}</p>
              </div>
            </div>

            <div class="telefone">
              <i class="bi bi-whatsapp icon"></i>
              <div>
                <h3>WhatsApp</h3>
                <p>
                  <a href="${whatsappLink}" class="whatsapp-link" target="_blank">
                    ${telefoneFormatado}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Carrossel -->
        <div id="miniCarousel" class="carousel slide mini-carrossel-section" data-bs-ride="carousel" data-bs-interval="3000" data-bs-pause="hover">
          <div class="carousel-indicators">
            <button type="button" data-bs-target="#miniCarousel" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
            <button type="button" data-bs-target="#miniCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
            <button type="button" data-bs-target="#miniCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
          </div>

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

          <button class="carousel-control-prev" type="button" data-bs-target="#miniCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Anterior</span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#miniCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Próximo</span>
          </button>
        </div>
      </div>
    </div>
  `;
  return containerPerfil;
}
