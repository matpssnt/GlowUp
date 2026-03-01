import authState from '../utils/AuthState.js';

// Função para obter a rota atual
function getCurrentRoute() {
    const pathParts = location.pathname.split('/').filter(Boolean);
    pathParts.shift();
    return '/' + pathParts.join('/') || '/home';
}

// Função para verificar se um link está ativo
function isActiveRoute(href) {
    const currentRoute = getCurrentRoute();
    if (href === 'home' || href === '/home') {
        return currentRoute === '/home' || currentRoute === '/';
    }
    return currentRoute === `/${href}` || currentRoute === href;
}

export default function NavBar({ hidelogin = false } = {}) {
    const nav = document.createElement('nav');
    nav.className = 'navbar navbar-expand-lg bg-body-tertiary';

    // Função para renderizar o conteúdo da navbar
    const renderNavBar = () => {
        const isAuthenticated = authState.isAuth();
        const user = authState.getUser();
        const userType = authState.getUserType();
        const currentRoute = getCurrentRoute();

        let authButtons = '';
        let userMenu = '';
        let notificationsBadge = '';

        if (isAuthenticated && user) {
            // Menu do usuário logado
            const userDisplayName = user.nome || user.email || 'Usuário';
            const shortName = userDisplayName.length > 15 ? userDisplayName.substring(0, 15) + '...' : userDisplayName;

            // Badge de notificações (placeholder - pode ser conectado a um sistema real)
            const notificationCount = 0; // TODO: Conectar com sistema de notificações
            if (notificationCount > 0) {
                notificationsBadge = `<span class="notification-badge">${notificationCount}</span>`;
            }

            authButtons = `
                <div class="navbar-actions d-flex align-items-center gap-2">
                    <div class="dropdown">
                        <button class="btn btn-outline-primary dropdown-toggle mx-2" type="button" id="userMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                            ${shortName}
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenuButton">
                            <li><h6 class="dropdown-header">${userType === 'profissional' ? 'Profissional' : 'Cliente'}</h6></li>
                            <li><hr class="dropdown-divider"></li>
                            ${userType === 'cliente' ? `
                            <li><a class="dropdown-item" href="perfil">Meu Perfil</a></li>
                            <li><a class="dropdown-item" href="minhaAgenda">Minha Agenda</a></li>
                            <li><a class="dropdown-item" href="seguranca">Privacidade e Segurança</a></li>` : ''}
                            ${userType === 'profissional' ?
                    '<li><a class="dropdown-item" href="configuracoes-loja">Configurações da Loja</a></li>' : ''}
                            ${userType === 'profissional' ?
                    '<li><a class="dropdown-item" href="dashboard">Dashboard</a></li>' : ''}
                        <!-- <li><a class="dropdown-item" href="seguranca">Privacidade e Segurança</a></li> criei aqui tambem, mas como ja tem no dashboard, vou deixar comentado. -->
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="#" id="logoutBtn">Sair</a></li>
                        </ul>   
                    </div>
                </div>
            `;
        } else {
            // Botões para usuário não logado
            authButtons = `
                <div class="navbar-actions d-flex align-items-center gap-2">
                    <a class="btn btn-outline-primary mx-2 suporte-btn" href="#" role="button" tabindex="0">Suporte</a>
                    <a class="btn btn-outline-primary mx-2 login-btn" href="login" role="button" tabindex="0">Entrar</a>
                    <a id="cadastre-se" class="btn btn-outline-primary mx-2 register-btn" href="register" role="button" tabindex="0">Cadastre-se</a>
                </div>
            `;
        }

        // Determina qual link está ativo
        const homeActive = isActiveRoute('home') ? 'active' : '';
        const sobreActive = isActiveRoute('sobre') ? 'active' : '';

        nav.innerHTML = `
        <div class="container-fluid">
            <a class="navbar-brand d-flex align-items-center" href="home">
                <img src="public/assets/images/logo2.png" alt="Glow Up" class="logo-img me-2" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                <span class="logo-text" style="display: none;">Glow Up</span>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a class="nav-link ${homeActive}" aria-current="page" href="home">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link ${sobreActive}" href="sobre">Sobre nós</a>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Serviços
                        </a>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="profissionais">Profissionais</a></li>
                            <li><a class="dropdown-item" href="explorar-servicos">Serviços</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="explorar">Explorar Todos</a></li>
                        </ul>
                    </li>
                </ul>
                ${authButtons}
            </div>
        </div>
        `;

        // Adiciona evento de logout
        const logoutBtn = nav.querySelector('#logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                authState.clearUser();
                window.location.href = 'home';
            });
        }

        // Melhora o menu mobile
        const navbarToggler = nav.querySelector('.navbar-toggler');
        if (navbarToggler) {
            navbarToggler.addEventListener('click', () => {
                navbarToggler.classList.toggle('active');
            });
        }
    };
    // Renderiza inicialmente
    renderNavBar();
    // Escuta mudanças no estado de autenticação
    authState.subscribe(() => {
        renderNavBar();
    });
    // Atualiza links ativos quando a rota muda
    window.addEventListener('popstate', () => {
        renderNavBar();
    });
    return nav;
}