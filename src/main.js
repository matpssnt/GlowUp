import renderLoginPage from './pages/login.js';
import renderRegisterPage from './pages/register.js';
import renderContRegisterPage from './pages/contRegister.js';
import renderHomePage from './pages/home.js';
import renderquemSomos from './pages/somos.js';
import renderAgendamentoPage from './pages/agendamento.js';

const routes = {
    "/home": renderHomePage,
    "/login": renderLoginPage,           // Rota para página de login
    "/register": renderRegisterPage,     // Rota para página de registro
    "/cont-register": renderContRegisterPage,  // Rota para página de continuar cadastro
    "/sobre": renderquemSomos,
    "/agendamento": renderAgendamentoPage
};

function getPath() {
    // Divide o caminho atual em partes
    const pathParts = location.pathname.split('/').filter(Boolean); // Remove vazios
    // Remove o primeiro item (que é o nome da pasta do projeto)
    pathParts.shift();
    // Junta de novo as partes restantes
    const path = '/' + pathParts.join('/');
    return path;
}

//Decide o que renderizar com base na rota atual
function renderRoutes() {
    const url = getPath(); //Lê a rota atual, ex: "/login"
    const render = routes[url] || routes["/home"]; //Busca esta rota no mapa
    render(); //Executa a funcção de render na pagina atual
}

//Renderizaçõo
document.addEventListener('DOMContentLoaded', renderRoutes);
