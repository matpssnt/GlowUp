export default function RoomCard(indexOuProfissional) {
  const containerCards = document.createElement("div");
  containerCards.className = "heroContainer-frame";
  
  // Se for número (compatibilidade com código antigo), usa valores padrão
  let index, nome, descricao, profissionalId;
  
  if (typeof indexOuProfissional === 'number') {
    index = indexOuProfissional;
    nome = 'Card title';
    descricao = 'Some quick example text to build on the card title and make up the bulk of the card\'s content.';
    profissionalId = null;
  } else {
    // É um objeto com dados do profissional
    const profissional = indexOuProfissional;
    index = profissional.id || 0;
    nome = profissional.nome || profissional.razao_social || 'Profissional';
    descricao = profissional.descricao || profissional.sobre || 'Profissional de estética e beleza';
    profissionalId = profissional.id || profissional.idProfissional || null;
  }
  
  containerCards.innerHTML = `
    <div class="card card-base rounded-card card-partner" style="width: 17rem;">

        <div id="carouselExampleIndicators-${index}" class="carousel slide rounded-card overflow-hidden">

            <div class="carousel-indicators">
                <button type="button" data-bs-target="#carouselExampleIndicators-${index}" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
                <button type="button" data-bs-target="#carouselExampleIndicators-${index}" data-bs-slide-to="1" aria-label="Slide 2"></button>
                <button type="button" data-bs-target="#carouselExampleIndicators-${index}" data-bs-slide-to="2" aria-label="Slide 3"></button>
            </div>

            <div class="carousel-inner shadow">

                <div class="carousel-item active">
                    <img class="d-block w-100" src="public/assets/images/botox.jpg" alt="Procedimento de botox sendo aplicado">
                </div>

                <div class="carousel-item">
                    <img class="d-block w-100" src="public/assets/images/Florence-estetica.jpg" alt="Clínica de estética Florence">
                </div>

                <div class="carousel-item">
                    <img class="d-block w-100" src="public/assets/images/sla.avif" alt="Profissional de estética em atendimento">
                </div>

            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators-${index}" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>

            <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators-${index}" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        </div>

            <div class="card-body">
                <h5 class="card-title">${nome}</h5>
                <p class="card-text">${descricao.substring(0, 100)}${descricao.length > 100 ? '...' : ''}</p>
                <div class="d-flex justify-content-end align-items-center">
                  <a href="${profissionalId ? `agendamento?profissional=${profissionalId}` : '#'}" class="btn-conhecer">Conhecer</a>
                </div>
             </div>
        </div>
  `;
  return containerCards;
}