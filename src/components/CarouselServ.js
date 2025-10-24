export default function CarouselServ(index) {
    const carouselServ = document.createElement('div');
    carouselServ.innerHTML = `
    <div id="carouselExampleCaptions" class="carousel slide">
  <div class="carousel-indicators">
    <button type="button" data-bs-target="#carouselExampleIndicators-${index}" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
    <button type="button" data-bs-target="#carouselExampleIndicators-${index}" data-bs-slide-to="1" aria-label="Slide 2"></button>
    <button type="button" data-bs-target="#carouselExampleIndicators-${index}" data-bs-slide-to="2" aria-label="Slide 3"></button>
  </div>
  <div class="carousel-inner">
    <div class="carousel-item active">
      <img src="public/assets/images/unhas.jpg" class="d-block w-100" alt="...">
      <div class="carousel-caption d-none d-md-block">
        <h5>Cuidado com as Unhas</h5>
        <p>É sobre saúde e bem-estar. No nosso salão, cada cuidado é pensado para deixar suas unhas lindas, fortes e, principalmente, saudáveis..</p>
      </div>
    </div>
    <div class="carousel-item">
      <img src="public/assets/images/Pele.jpg" class="d-block w-100" alt="...">
      <div class="carousel-caption d-none d-md-block">
        <h5>Cuidado com a Pele</h5>
        <p> Acreditamos que cuidar da pele vai muito além da vaidade: é um ato de amor-próprio e saúde..</p>
      </div>
    </div>
    <div class="carousel-item">
      <img src="public/assets/images/Cabelo.jpg" class="d-block w-100" alt="...">
      <div class="carousel-caption d-none d-md-block">
        <h5>Cuidados com o Cabelo</h5>
        <p>Cada fio recebe o cuidado que merece. Porque a verdadeira beleza começa na saúde dos seus cabelos..</p>
      </div>
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






    `;




}
