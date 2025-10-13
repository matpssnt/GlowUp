import renderLoginPage from './pages/login.js';
import renderRegisterPage from './pages/register.js';
import renderContRegisterPage from './pages/contRegister.js';
import renderHomePage from './pages/home.js';
import renderquemSomos from './pages/somos.js';

const routes = {
    "/home": renderHomePage,
    "/login": renderLoginPage,           // Rota para página de login
    "/register": renderRegisterPage,     // Rota para página de registro
    "/cont-register": renderContRegisterPage,  // Rota para página de continuar cadastro
    "/sobre": renderquemSomos
};

function getPath() {
    // Remove o nome do projeto da URL
    const url = (location.pathname || "").replace("/GlowUp-front/", "/").trim();

    // Se não tiver rota, vai para home
    return url && url.startsWith("/") ? url : "/home";
}

//Decide o que renderizar com base na rota atual
function renderRoutes() {
    const url = getPath(); //Lê a rota atual, ex: "/login"
    const render = routes[url] || routes["/home"]; //Busca esta rota no mapa
    render(); //Executa a funcção de render na pagina atual
}

//Renderizaçõo
document.addEventListener('DOMContentLoaded', renderRoutes);
