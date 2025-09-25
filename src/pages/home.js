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
       <h1 style="font-size: 2.8rem; font-weight: 700;">
            Bem-vindo à Glow Up
        </h1>
        <p>Sua plataforma de beleza e bem-estar.</p>
        <div class="d-flex justify-content-center gap-3 mt-3">
            <a href="login" class="btn btn-outline-primary">Começar</a>
            <a href="#" class="btn btn-outline-primary">Veja como funciona</a>
        </div>
    `;
    fundoPrincipal.className = 'text-center fade-in';
    fundoPrincipal.style.padding = '230px 50px';
    fundoPrincipal.style.width = '100%';
    fundoPrincipal.style.backgroundImage = 'url("src/images/back.jpg")';
    fundoPrincipal.style.backgroundSize = 'cover';
    fundoPrincipal.style.backgroundPosition = 'center';
    fundoPrincipal.style.backgroundRepeat = 'no-repeat';
    fundoPrincipal.style.display = 'flex';
    fundoPrincipal.style.flexDirection = 'column';
    fundoPrincipal.style.justifyContent = 'center';
    fundoPrincipal.style.alignItems = 'center';

    const informacoes = document.createElement('div');
    informacoes.style.display = 'flex';
    informacoes.style.justifyContent = 'center';
    informacoes.style.flexDirection = 'column';
    informacoes.style.alignItems = 'center';
    informacoes.style.marginTop = '25px';
    informacoes.innerHTML = `
        <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 15px; color: #000;">
            Alguns dos nossos parceiros 
        </h2>
        <p style="font-size: 1.2rem; margin-bottom: 15px; color: #000;">Os melhores do ramo da estetica</p>
    `;

    const divCards = document.createElement('div');
    divCards.innerHTML = '';
    divCards.className = "cards";

    for (var i = 0; i < 5; i++) {
        const card = RoomCard(i); 
        divCards.appendChild(card);
    }
    

    const footerContainer = document.getElementById('footer');
    footerContainer.innerHTML = '';
    footerContainer.style.marginTop = '150px';
    const footer = Footer();
    footerContainer.appendChild(footer);
    

    // Botão Whatsapp
    const whatsappFloat = document.createElement('div');
    whatsappFloat.className = 'whatsapp-float';

    const whatsappLink = document.createElement('a');
    whatsappLink.href = '#'; 

    const whatsappIcon = document.createElement('i');
    whatsappIcon.className = 'fab fa-whatsapp';

    whatsappLink.appendChild(whatsappIcon);
    whatsappFloat.appendChild(whatsappLink);
    document.body.appendChild(whatsappFloat);

    divRoot.appendChild(fundoPrincipal);
    divRoot.appendChild(informacoes);
    divRoot.appendChild(divCards);
}
