import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
import RoomCard from "../components/Cards.js";
import ApiService from "../utils/api.js";

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

    // Adiciona loading
    const loading = document.createElement('div');
    loading.className = 'text-center my-4';
    loading.innerHTML = '<div class="spinner-border" role="status"><span class="visually-hidden">Carregando...</span></div>';
    divCards.appendChild(loading);

    // Função para carregar profissionais
    async function carregarProfissionais() {
        // Função auxiliar para usar fallback
        const usarFallback = () => {
            loading.remove();
            for (let i = 0; i < 4; i++) {
                divCards.appendChild(RoomCard(i));
            }
        };

        try {
            const api = new ApiService();
            const profissionais = await api.listarProfissionais();
            loading.remove();

            // Se retornou array válido com dados, usa profissionais reais
            if (Array.isArray(profissionais) && profissionais.length > 0) {
                profissionais.slice(0, 4).forEach(prof => {
                    divCards.appendChild(RoomCard(prof));
                });
            } else {
                usarFallback();
            }
        } catch (error) {
            usarFallback();
        }
    }

    const secaoDeInformacao = document.createElement('div');
    secaoDeInformacao.innerHTML =
    `
    <div class="container mt-4">
        <div class="row g-4">
            <div class="col-md-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title fw-bold">Sobre a Plataforma</h5>
                        <p class="card-text">
                            A plataforma conecta clientes e profissionais de forma simples, rápida e segura,
                            oferecendo uma experiência moderna e confiável.
                        </p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title fw-bold">Como Funciona</h5>
                        <p class="card-text">
                        O cliente pesquisa um profissional, visualiza os serviços oferecidos e
                         realiza um agendamento de forma fácil e prática, com apenas alguns cliques.
                        </p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title fw-bold">Benefícios</h5>
                        <p class="card-text">
                            Profissionais de confiança, suporte ágil e praticidade total no uso da plataforma.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    // Carrega profissionais
    carregarProfissionais();


    divRoot.appendChild(fundoPrincipal);
    divRoot.appendChild(informacoes);
    divRoot.appendChild(divCards);
    divRoot.appendChild(secaoDeInformacao);

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
