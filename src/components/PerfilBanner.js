export default function PerfilBanner(dadosProfissional = null, endereco = null, telefone = null, permiteEdicao = false, servicos = []) {
  const containerPerfil = document.createElement("div");
  containerPerfil.className = "perfilContainer-frame";

  const baseUrl = typeof window !== 'undefined' ? (window.location.pathname.split('/').slice(0, 2).join('/') || '') : '';
  const imagensPadrao = [
    'public/assets/images/logo2.png',
  ];
  const fotosServicos = Array.isArray(servicos)
    ? servicos
        .filter(s => s && (s.foto || s.imagem))
        .map(s => {
          const url = s.foto || s.imagem;
          return (url.match(/^https?:\/\//) || url.startsWith('/')) ? url : baseUrl + '/' + url;
        })
    : [];
  const imagensCarrossel = fotosServicos.length > 0 ? fotosServicos : imagensPadrao;
  
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
  
  // determina URL da foto do profissional ou usa placeholder
  let fotoUrl = 'public/assets/images/fotoDePerfil.png';
  if (dadosProfissional && dadosProfissional.foto_perfil) {
    fotoUrl = dadosProfissional.foto_perfil;

    // se for caminho relativo, prefixa com base (/GlowUp)
    if (!fotoUrl.match(/^https?:\/\//) && !fotoUrl.startsWith('/')) {
      const base = window.location.pathname.split('/').slice(0, 2).join('/');
      fotoUrl = base + '/' + fotoUrl;
    }
  }

  // determina URL da imagem de banner (padrão se não houver)
  let bannerUrl = 'public/assets/images/background-primary.avif';
  if (dadosProfissional && dadosProfissional.foto_banner) {
    bannerUrl = dadosProfissional.foto_banner;
    if (!bannerUrl.match(/^https?:\/\//) && !bannerUrl.startsWith('/')) {
      const base = window.location.pathname.split('/').slice(0, 2).join('/');
      bannerUrl = base + '/' + bannerUrl;
    }
  }

  const bannerCardClass = permiteEdicao ? 'perfil-banner-card editable' : 'perfil-banner-card';
  const fotoPerfilClass = permiteEdicao ? 'foto-perfil editable' : 'foto-perfil';

  containerPerfil.innerHTML = `
    <div class="${bannerCardClass}">
      <img src="${bannerUrl}" class="banner-img" alt="Imagem de capa">

      <div class="perfil-overlay">
        <div class="${fotoPerfilClass}">
          <img src="${fotoUrl}" alt="Foto de perfil">
        </div>
      </div>

      <div class="perfil-content">
        <div class="description-profissional">
          <div class="sobre-prof d-flex align-items-center justify-content-between flex-wrap gap-2">
            <h2 class="titulo-principal mb-0">Sobre:</h2>
            ${permiteEdicao ? `
            <button type="button" class="btn btn-sm btn-outline-secondary edit-descricao-btn" title="Editar descrição">
              <i class="bi bi-pencil"></i> Editar
            </button>
            ` : ''}
          </div>

          <div class="titulo-estabelecimento">
            <h1 class="titulo-estab">${nomeEstabelecimento}</h1>
          </div>

          <div class="description" data-descricao-original="${(descricaoProfissional || '').replace(/"/g, '&quot;')}">
            <p class="descricao-texto">${descricaoProfissional || ''}</p>
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
            ${imagensCarrossel.map((_, i) => `
            <button type="button" data-bs-target="#miniCarousel" data-bs-slide-to="${i}" class="${i === 0 ? 'active' : ''}" ${i === 0 ? 'aria-current="true"' : ''} aria-label="Slide ${i + 1}"></button>
            `).join('')}
          </div>

          <div class="carousel-inner">
            ${imagensCarrossel.map((src, i) => `
            <div class="carousel-item ${i === 0 ? 'active' : ''}">
              <img src="${src}" class="d-block w-100" alt="Serviço ${i + 1}" loading="lazy" onerror="this.src='public/assets/images/Cabelo.jpg'">
            </div>
            `).join('')}
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
