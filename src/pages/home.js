import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
import RoomCard from "../components/Cards.js";

export default function renderHomePage() {
    const divRoot = document.getElementById('root');
    divRoot.innerHTML = '';

    divRoot.style.display = 'flex';
    divRoot.style.flexDirection = 'column';
    //NavBar
    const nav = document.getElementById('navbar');
    nav.innerHTML = '';
    const navbar = NavBar();
    nav.appendChild(navbar);

    //Conteudo Principal
    const fundoPrincipal = document.createElement('div');
    fundoPrincipal.innerHTML = `
       <h1 class="hero-title">Bem-vindo à Glow Up</h1>
        <p class="hero-subtitle">Sua plataforma de beleza e bem-estar.</p>
        <div class="d-flex justify-content-center gap-3 mt-3">
            <a href="login" class="btn btn-outline-primary register-btn">Começar</a>
            <a href="#" class="btn btn-outline-primary register-btn">Veja como funciona</a>
        </div>
    `;
    fundoPrincipal.className = 'text-center fade-in hero';

    const informacoes = document.createElement('div');
    informacoes.className = 'partners-info';
    informacoes.innerHTML = `
        <h2 class="partners-title">
            Alguns dos nossos parceiros 
        </h2>
        <p class="partners-subtitle">Os melhores do ramo da estetica</p>
    `;

    const divCards = document.createElement('div');
    divCards.innerHTML = '';
    divCards.className = "cards";

    for (var i = 0; i < 4; i++) {
        const card = RoomCard(i);
        divCards.appendChild(card);
    }

    divRoot.appendChild(fundoPrincipal);
    divRoot.appendChild(informacoes);
    divRoot.appendChild(divCards);

    const footerContainer = document.getElementById('footer');
    footerContainer.innerHTML = '';
    footerContainer.style.marginTop = '150px';
    const footer = Footer();
    footerContainer.appendChild(footer);


    // Botão Whatsapp (evita duplicação)
    if (!document.querySelector('.whatsapp-float')) {
        const whatsappFloat = document.createElement('div');
        whatsappFloat.className = 'whatsapp-float';
    
        const whatsappLink = document.createElement('a');
        whatsappLink.href = 'https://wa.me/5515000000000';
        whatsappLink.target = '_blank';
    
        const whatsappIcon = document.createElement('i');
        whatsappIcon.className = 'fab fa-whatsapp';
    
        whatsappLink.appendChild(whatsappIcon);
        whatsappFloat.appendChild(whatsappLink);
        document.body.appendChild(whatsappFloat);
    }
}
