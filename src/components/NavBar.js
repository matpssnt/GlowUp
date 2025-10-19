export default function NavBar({hidelogin = false} = {}) {
    const nav = document.createElement('nav');
    nav.className = 'navbar navbar-expand-lg bg-body-tertiary';
    nav.innerHTML = `
    <div class="container-fluid">
        <a class="navbar-brand d-flex align-items-center" href="home">
            <img src="public/assets/images/logo.png" alt="Glow Up" style = "width: 70px; height: 70px; class="logo-img me-2" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
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
        <a class="btn btn-outline-primary mx-2 suporte-btn" href="#" role="button" tabindex="0">Suporte</a>
        <a class="btn btn-outline-primary mx-2 login-btn" href="login" role="button" tabindex="0">Entrar</a>
        <a  id="comecar" class="btn btn-outline-primary mx-2 register-btn" href="register" role="button" tabindex="0">Começar</a>
        </form>
        </div>
    </div>
    `;
    return nav;
}