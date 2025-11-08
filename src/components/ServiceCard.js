export default function ServiceCard(servico) {
  const card = document.createElement("div");
  card.className = "card";
  card.style.width = "18rem";

  card.innerHTML = `
    <img src="${servico.imagem}" class="card-img-top" alt="${servico.nome}">
    <div class="card-body">
      <h5 class="card-title">${servico.nome}</h5>
      <p class="card-text">${servico.descricao}</p>
      <a href="#" class="btn btn-primary">Agendar</a>
    </div>
  `;

  return card;
}
