import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
import ApiService from "../utils/api.js";
import authState from "../utils/AuthState.js";

export default function renderHomePage() {
    const root = document.getElementById('root');
    const navbarContainer = document.getElementById('navbar');
    const footerContainer = document.getElementById('footer');

    // Limpa conteúdos existentes
    root.innerHTML = '';
    navbarContainer.innerHTML = '';
    footerContainer.innerHTML = '';

    root.style.display = 'flex';
    root.style.flexDirection = 'column';

    // Navbar
    navbarContainer.appendChild(NavBar());

    // Hero Section
    const hero = document.createElement('div');
    hero.className = 'text-center fade-in hero';

    const isLoggedIn = authState.isAuth();
    let buttonsHTML = '';

    if (isLoggedIn) {
        const user = authState.getUser(); // Só pega se estiver logado

        // Verifica se é profissional (ajuste conforme o campo real do seu user)
        const isProfessional = user?.isProfissional === true ||
            authState.getUserType() === 'profissional' ||
            user?.tipoUsuario === 'profissional' ||
            user?.role === 'profissional';

        if (isProfessional) {
            // Profissional logado → só "Explorar"
            buttonsHTML = `
                <div class="d-flex justify-content-center gap-3 mt-3">
                    <a href="dashboard" class="btn btn-outline-primary register-btn">Gerenciar Loja</a>
                    <a href="explorar" class="btn btn-outline-primary register-btn">Explorar</a>
                </div>
            `;
        } else {
            // Cliente logado → mostra "Meu Perfil" + "Explorar"
            buttonsHTML = `
                <div class="d-flex justify-content-center gap-3 mt-3">
                    <a href="perfil" class="btn btn-outline-primary register-btn">Meu Perfil</a>
                    <a href="explorar" class="btn btn-outline-primary register-btn">Explorar</a>
                </div>
            `;
        }
    } else {
        // Não logado → Login + Explorar
        buttonsHTML = `
            <div class="d-flex justify-content-center gap-3 mt-3">
                <a href="login" class="btn btn-outline-primary register-btn">Entrar</a>
                <a href="explorar" class="btn btn-outline-primary register-btn">Explorar</a>
            </div>
        `;
    }

    hero.innerHTML = `
        <h1 class="hero-title">Bem-vindo à Glow Up</h1>
        <p class="hero-subtitle">Sua plataforma de beleza e bem-estar.</p>
        ${buttonsHTML}
    `;

    // Seção de Parceiros
    const partnersInfo = document.createElement('div');
    partnersInfo.className = 'partners-info';
    partnersInfo.innerHTML = `
        <h2 class="partners-title">Alguns dos nossos parceiros</h2>
        <p class="partners-subtitle">Os melhores do ramo da estética</p>
    `;

    const partnersGrid = document.createElement('div');
    partnersGrid.className = 'home-parceiros-grid';

    // Loading inicial
    const loading = document.createElement('div');
    loading.className = 'text-center my-4';
    loading.innerHTML = '<div class="spinner-border" role="status"><span class="visually-hidden">Carregando...</span></div>';
    partnersGrid.appendChild(loading);

    // Botão Explorar
    const exploreBtnContainer = document.createElement('div');
    exploreBtnContainer.className = 'explorar-btn-container';
    exploreBtnContainer.innerHTML = `
        <a href="explorar" class="btn-explorar-home">
            <i class="fas fa-compass"></i> Explorar todos
        </a>
    `;

    // Seção de Informações
    const infoSection = document.createElement('div');
    infoSection.className = 'info-section';
    infoSection.innerHTML = `
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
                        <div class="info-card-icon"><i class="fas fa-shield-alt"></i></div>
                        <h5 class="info-card-title">Segurança e Confiança</h5>
                        <p class="info-card-text">
                            Conectamos você apenas com profissionais verificados e estabelecimentos confiáveis,
                            garantindo uma experiência segura e tranquila.
                        </p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="info-card">
                        <div class="info-card-icon"><i class="fas fa-clock"></i></div>
                        <h5 class="info-card-title">Agendamento Fácil</h5>
                        <p class="info-card-text">
                            Encontre o profissional ideal, visualize serviços e horários disponíveis,
                            e agende tudo em poucos cliques, de forma rápida e prática.
                        </p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="info-card">
                        <div class="info-card-icon"><i class="fas fa-heart"></i></div>
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

    // Monta a página
    root.appendChild(hero);
    root.appendChild(partnersInfo);
    root.appendChild(partnersGrid);
    root.appendChild(exploreBtnContainer);
    root.appendChild(infoSection);

    // Footer
    footerContainer.style.marginTop = '150px';
    footerContainer.appendChild(Footer());

    // Botão WhatsApp flutuante (evita duplicação)
    if (!document.querySelector('.whatsapp-float')) {
        const whatsappFloat = document.createElement('div');
        whatsappFloat.className = 'whatsapp-float';

        const link = document.createElement('a');
        link.href = 'https://wa.me/5515000000000';
        link.target = '_blank';

        const icon = document.createElement('i');
        icon.className = 'fab fa-whatsapp';

        link.appendChild(icon);
        whatsappFloat.appendChild(link);
        document.body.appendChild(whatsappFloat);
    }

    // Carrega parceiros (assíncrono)
    loadPartners(partnersGrid, loading);
}

// Função separada para carregar profissionais (melhor organização)
async function loadPartners(gridContainer, loadingElement) {
    try {
        const api = new ApiService();
        const [profsRes, servsRes, addrRes] = await Promise.allSettled([
            api.listarProfissionais(),
            api.listarServicos(),
            api.request('/endereco', 'GET')
        ]);

        loadingElement.remove();

        let professionals = profsRes.status === 'fulfilled' && Array.isArray(profsRes.value) ? profsRes.value : [];
        const services = servsRes.status === 'fulfilled' && Array.isArray(servsRes.value) ? servsRes.value : [];
        const addresses = addrRes.status === 'fulfilled' && Array.isArray(addrRes.value) ? addrRes.value : [];

        // Filtra: Apenas profissionais que possuem serviços cadastrados
        if (services.length > 0) {
            const idsComServico = new Set(services.map(s => String(s.id_profissional_fk)));
            professionals = professionals.filter(p => idsComServico.has(String(p.id)));
        } else {
            professionals = []; // Se não houver serviços no sistema, não mostra nenhum profissional
        }

        if (professionals.length === 0) {
            gridContainer.innerHTML = '<p class="text-center text-muted">Nenhum parceiro encontrado no momento.</p>';
            return;
        }

        // Embaralha e pega até 6
        const selected = shuffleArray(professionals).slice(0, 6);

        selected.forEach((prof, index) => {
            const address = addresses.find(a => a.id_profissional_fk == prof.id);
            const profServices = services.filter(s => s.id_profissional_fk == prof.id);
            const minPrice = profServices.length > 0
                ? Math.min(...profServices.map(s => parseFloat(s.preco || 0)))
                : null;

            const location = address ? `${address.bairro}, ${address.cidade}` : '';
            const description = prof.descricao || 'Profissional de estética e beleza';

            const card = document.createElement('div');
            card.className = 'explorar-card';
            card.style.animationDelay = `${index * 0.05}s`;
            card.innerHTML = `
                <div class="explorar-card-img-wrapper">
                    <img class="explorar-card-img" 
                         src="public/assets/images/botox.jpg" 
                         alt="${prof.nome}"
                         onerror="this.src='public/assets/images/Florence-estetica.jpg'">
                </div>
                <div class="explorar-card-body">
                    <h4 class="explorar-card-name">${prof.nome}</h4>
                    ${location ? `
                        <div class="explorar-card-location">
                            <i class="fas fa-map-marker-alt"></i> ${location}
                        </div>
                    ` : ''}
                    <p class="explorar-card-desc">${description}</p>
                    <div class="explorar-card-footer">
                        ${minPrice !== null ? `
                            <div class="explorar-card-price">
                                <span class="explorar-card-price-label">A partir de</span>
                                <span class="explorar-card-price-value">R$ ${minPrice.toFixed(2).replace('.', ',')}</span>
                            </div>
                        ` : '<div></div>'}
                        <a href="agendamento?profissional=${prof.id}" class="btn-ver-perfil">
                            Conhecer <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            `;

            gridContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Erro ao carregar parceiros:', error);
        loadingElement.remove();
        gridContainer.innerHTML = '<p class="text-center text-muted">Não foi possível carregar os parceiros.</p>';
    }
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}