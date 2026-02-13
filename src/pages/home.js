import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
import RoomCard from "../components/Cards.js";
import ApiService from "../utils/api.js";
import authState from "../utils/AuthState.js";

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
    const mostrarBotoesHero = !authState.isAuth();
    fundoPrincipal.innerHTML = `
    <h1 class="hero-title">Bem-vindo à Glow Up</h1>
        <p class="hero-subtitle">Sua plataforma de beleza e bem-estar.</p>
        <div class="d-flex justify-content-center gap-3 mt-3">
            <a href="login" class="btn btn-outline-primary register-btn">Login</a>
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
    secaoDeInformacao.className = 'info-section';
    secaoDeInformacao.innerHTML =
    `
    <div class="container py-5">
        <div class="row text-center mb-5">
            <div class="col-12">
                <h2 class="info-section-title">Por que escolher a Glow Up?</h2>
                <p class="info-section-subtitle">Descubra como facilitamos sua jornada de beleza e bem-estar</p>
            </div>
        </div>
        <div class="row g-4">
            <div class="col-md-4">
                <div class="info-card">
                    <div class="info-card-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h5 class="info-card-title">Segurança e Confiança</h5>
                    <p class="info-card-text">
                        Conectamos você apenas com profissionais verificados e estabelecimentos confiáveis,
                        garantindo uma experiência segura e tranquila.
                    </p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="info-card">
                    <div class="info-card-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <h5 class="info-card-title">Agendamento Fácil</h5>
                    <p class="info-card-text">
                        Encontre o profissional ideal, visualize serviços e horários disponíveis,
                        e agende tudo em poucos cliques, de forma rápida e prática.
                    </p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="info-card">
                    <div class="info-card-icon">
                        <i class="fas fa-heart"></i>
                    </div>
                    <h5 class="info-card-title">Cuidado Personalizado</h5>
                    <p class="info-card-text">
                        Oferecemos uma experiência única e personalizada, conectando você
                        aos melhores profissionais do mercado para cuidar de você.
                    </p>
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
