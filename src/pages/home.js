import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
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


    const fundoPrincipal = document.createElement('div');
    fundoPrincipal.className = 'text-center fade-in hero';

    const estaLogado = authState.isAuth();  

    let botoesHTML = `
    <div class="d-flex justify-content-center gap-3 mt-3">
        <a href="perfil" class="btn btn-outline-primary register-btn">Meu Perfil</a>
        <a href="explorar" class="btn btn-outline-primary register-btn">Explorar</a>
    </div>
`;

    if (!estaLogado) {
        botoesHTML = `
        <div class="d-flex justify-content-center gap-3 mt-3">
            <a href="login" class="btn btn-outline-primary register-btn">Login</a>
            <a href="explorar" class="btn btn-outline-primary register-btn">Explorar</a>
        </div>
    `;
    }

    fundoPrincipal.innerHTML = `
    <h1 class="hero-title">Bem-vindo à Glow Up</h1>
    <p class="hero-subtitle">Sua plataforma de beleza e bem-estar.</p>
    ${botoesHTML}
`;
    fundoPrincipal.className = 'text-center fade-in hero';

    const informacoes = document.createElement('div');
    informacoes.className = 'partners-info';
    informacoes.innerHTML = `
        <h2 class="partners-title">
            Alguns dos nossos parceiros 
        </h2>
        <p class="partners-subtitle">Os melhores do ramo da estética</p>
    `;

    const divCards = document.createElement('div');
    divCards.innerHTML = '';
    divCards.className = "home-parceiros-grid";

    // Adiciona loading
    const loading = document.createElement('div');
    loading.className = 'text-center my-4';
    loading.innerHTML = '<div class="spinner-border" role="status"><span class="visually-hidden">Carregando...</span></div>';
    divCards.appendChild(loading);

    // Função para embaralhar array (Fisher-Yates)
    function shuffleArray(arr) {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Função para carregar profissionais
    async function carregarProfissionais() {
        try {
            const api = new ApiService();
            const [profissionais, servicos, enderecos] = await Promise.allSettled([
                api.listarProfissionais(),
                api.listarServicos(),
                api.request('/endereco', 'GET')
            ]);

            loading.remove();

            const profs = (profissionais.status === 'fulfilled' && Array.isArray(profissionais.value)) ? profissionais.value : [];
            const servs = (servicos.status === 'fulfilled' && Array.isArray(servicos.value)) ? servicos.value : [];
            const endrs = (enderecos.status === 'fulfilled' && Array.isArray(enderecos.value)) ? enderecos.value : [];

            if (profs.length > 0) {
                // Seleciona até 8 profissionais aleatórios
                const selecionados = shuffleArray(profs).slice(0, 8);

                selecionados.forEach((prof, index) => {
                    const endereco = endrs.find(e => e.id_profissional_fk == prof.id);
                    const servicosDoProf = servs.filter(s => s.id_profissional_fk == prof.id);
                    const menorPreco = servicosDoProf.length > 0
                        ? Math.min(...servicosDoProf.map(s => parseFloat(s.preco)))
                        : null;
                    const bairro = endereco ? `${endereco.bairro}, ${endereco.cidade}` : '';
                    const descricao = prof.descricao || 'Profissional de estética e beleza';

                    const cardEl = document.createElement('div');
                    cardEl.className = 'explorar-card';
                    cardEl.style.animationDelay = `${index * 0.05}s`;
                    cardEl.innerHTML = `
                        <div class="explorar-card-img-wrapper">
                            <img class="explorar-card-img" 
                                 src="public/assets/images/botox.jpg" 
                                 alt="${prof.nome}"
                                 onerror="this.src='public/assets/images/Florence-estetica.jpg'">
                        </div>
                        <div class="explorar-card-body">
                            <h4 class="explorar-card-name">${prof.nome}</h4>
                            ${bairro ? `
                                <div class="explorar-card-location">
                                    <i class="fas fa-map-marker-alt"></i> ${bairro}
                                </div>
                            ` : ''}
                            <p class="explorar-card-desc">${descricao}</p>
                            <div class="explorar-card-footer">
                                ${menorPreco !== null ? `
                                    <div class="explorar-card-price">
                                        <span class="explorar-card-price-label">A partir de</span>
                                        <span class="explorar-card-price-value">R$ ${menorPreco.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                ` : '<div></div>'}
                                <a href="agendamento?profissional=${prof.id}" class="btn-ver-perfil">
                                    Conhecer <i class="fas fa-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                    `;
                    divCards.appendChild(cardEl);
                });
            } else {
                divCards.innerHTML = '<p class="text-center text-muted">Nenhum parceiro encontrado no momento.</p>';
            }
        } catch (error) {
            loading.remove();
            divCards.innerHTML = '<p class="text-center text-muted">Não foi possível carregar os parceiros.</p>';
        }
    }

    // Botão Explorar
    const explorarBtnContainer = document.createElement('div');
    explorarBtnContainer.className = 'explorar-btn-container';
    explorarBtnContainer.innerHTML = `
        <a href="profissionais" class="btn-explorar-home">
            <i class="fas fa-compass"></i> Explorar
        </a>
    `;

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
    divRoot.appendChild(explorarBtnContainer);
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
