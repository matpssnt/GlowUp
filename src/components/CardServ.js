export default function CardServ(index) {
  const containerCardServ = document.createElement("div");
  containerCardServ.className = "heroContainer-frame";
  containerCardServ.innerHTML = `
    <div class="card text-bg-dark">
  <img src="public/assets/images/unhas.jpg" class="card-img" alt="...">
  <div class="card-img-overlay">
    <h5 class="card-title">Unhas</h5>
    <p class="card-text">Muito mais que beleza! Fazemos manicure e pedicure com higiene, produtos de qualidade e técnicas que protegem e fortalecem suas unhas..</p>
    <p class="card-text"><small></small></p>
  </div>
</div>

    <div class="card text-bg-dark">
  <img src="public/assets/images/Pele.jpg" class="card-img" alt="...">
  <div class="card-img-overlay">
    <h5 class="card-title">Pele</h5>
    <p class="card-text">Momento de relaxar e renovar! Oferecemos limpeza de pele, hidratação e tratamentos faciais que deixam sua pele radiante e saudável..</p>
    <p class="card-text"><small></small></p>
  </div>
</div>

    <div class="card text-bg-dark">
  <img src="public/assets/images/Cabelo.jpg" class="card-img" alt="...">
  <div class="card-img-overlay">
    <h5 class="card-title">Cabelo</h5>
    <p class="card-text">Seus fios merecem o melhor! Realizamos hidratação profunda, cortes modernos, coloração e tratamentos que recuperam o brilho e a vitalidade dos seus cabelos..</p>
    <p class="card-text"><small></small></p>
  </div>
</div>

    <p class="card-text">Agende seu horário e venha viver uma experiência completa de beleza e bem-estar.</p>
  `;
  return containerCardServ;
}
