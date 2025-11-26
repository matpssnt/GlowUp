import authState from '../utils/AuthState.js';

export default function NavBar({hidelogin = false} = {}) {
    const nav = document.createElement('nav');
    nav.className = 'navbar navbar-expand-lg bg-body-tertiary';
    
    // Função para renderizar o conteúdo da navbar
    const renderNavBar = () => {
        const isAuthenticated = authState.isAuth();
        const user = authState.getUser();
        const userType = authState.getUserType();
        
        let authButtons = '';
        let userMenu = '';
        
        if (isAuthenticated && user) {
            // Menu do usuário logado
            const userDisplayName = user.nome || user.email || 'Usuário';
            authButtons = `
                <div class="dropdown">
                    <button class="btn btn-outline-primary dropdown-toggle mx-2" type="button" id="userMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                        ${userDisplayName}
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenuButton">
                        <li><h6 class="dropdown-header">${userType === 'profissional' ? 'Profissional' : 'Cliente'}</h6></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="perfil">Meu Perfil</a></li>
                        ${userType === 'cliente' ? '<li><a class="dropdown-item" href="minhaAgenda">Minha Agenda</a></li>' : ''}
                        ${userType === 'profissional' ? '<li><a class="dropdown-item" href="dashboard">Dashboard</a></li>' : ''}
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" id="logoutBtn">Sair</a></li>
                    </ul>
                </div>
            `;
        } else {
            // Botões para usuário não logado
            authButtons = `
                <a class="btn btn-outline-primary mx-2 suporte-btn" href="#" role="button" tabindex="0">Suporte</a>
                <a class="btn btn-outline-primary mx-2 login-btn" href="login" role="button" tabindex="0">Entrar</a>
                <a id="comecar" class="btn btn-outline-primary mx-2 register-btn" href="register" role="button" tabindex="0">Começar</a>
            `;
        }
        
        nav.innerHTML = `
        <div class="container-fluid">
            <a class="navbar-brand d-flex align-items-center" href="home">
                <img src="public/assets/images/logo.png" alt="Glow Up" style="width: 70px; height: 70px;" class="logo-img me-2" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                <span class="logo-text" style="display: none;">Glow Up</span>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="home">Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="sobre">Sobre nós</a>
                </li>
                <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Serviços
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#">Estabelecimentos</a></li>
                    <li><a class="dropdown-item" href="#">Profissionais</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#">Em Construção</a></li>
                </ul>
                </li>
            </ul>
            <form class="d-flex">
            ${authButtons}
            </form>
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
    };
    
    // Renderiza inicialmente
    renderNavBar();
    
    // Escuta mudanças no estado de autenticação
    authState.subscribe(() => {
        renderNavBar();
    });
    
    return nav;
}