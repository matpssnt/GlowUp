import renderFormCliente from "../components/formCliente.js";
import renderFormProf from "../components/formProf.js";
import NavBar from "../components/NavBar.js";

export default function renderRegisterPage() {

    const root = document.getElementById('root');
    root.innerHTML = '';
    root.className = 'register-page-root';


    const nav = document.getElementById('navbar');
    nav.innerHTML = '';

    const navbar = NavBar();
    nav.appendChild(navbar);

    const campo = document.getElementById('cadastre-se');
    if (campo) campo.remove();

    // Container principal - layout horizontal (split)
    const mainContainer = document.createElement('div');
    mainContainer.className = 'register-split-container';
    root.appendChild(mainContainer);

    // Painel esquerdo - branding / visual
    const leftPanel = document.createElement('div');
    leftPanel.className = 'register-left-panel';
    leftPanel.innerHTML = `
        <div class="register-branding">
            <h2 class="register-brand-title">Junte-se ao GlowUp</h2>
            <p class="register-brand-subtitle">Crie sua conta e descubra os melhores profissionais de beleza próximos a você.</p>
            <ul class="register-features">
                <li>✓ Acesso a profissionais qualificados</li>
                <li>✓ Agendamento fácil e rápido</li>
                <li>✓ Ofertas exclusivas</li>
            </ul>
        </div>
    `;
    mainContainer.appendChild(leftPanel);

    // Painel direito - formulário
    const rightPanel = document.createElement('div');
    rightPanel.className = 'register-right-panel';
    mainContainer.appendChild(rightPanel);

    const formCard = document.createElement('div');
    formCard.className = 'register-form-card';
    rightPanel.appendChild(formCard);

    const titulo = document.createElement('h1');
    titulo.textContent = 'Crie sua conta';
    titulo.className = 'register-page-title';
    formCard.appendChild(titulo);

    // Abas horizontais compactas
    const navTabs = document.createElement('ul');
    navTabs.className = 'nav register-nav-tabs';
    navTabs.id = 'nav-tabs';

    const tabCliente = document.createElement('li');
    tabCliente.className = 'nav-item';
    const linkCliente = document.createElement('a');
    linkCliente.className = 'nav-link active';
    linkCliente.id = 'tab-cliente';
    linkCliente.href = '#';
    linkCliente.textContent = 'Sou Usuário';
    tabCliente.appendChild(linkCliente);
    navTabs.appendChild(tabCliente);

    const tabProf = document.createElement('li');
    tabProf.className = 'nav-item';
    const linkProf = document.createElement('a');
    linkProf.className = 'nav-link';
    linkProf.id = 'tab-prof';
    linkProf.href = '#';
    linkProf.textContent = 'Sou Profissional';
    tabProf.appendChild(linkProf);
    navTabs.appendChild(tabProf);

    formCard.appendChild(navTabs);

    const formulariosContainer = document.createElement('div');
    formulariosContainer.className = 'register-form-container';
    formCard.appendChild(formulariosContainer);

    const clienteWrapper = document.createElement('div');
    clienteWrapper.className = 'd-block tab-pane register-tab-pane';
    clienteWrapper.id = 'formulario-cliente';
    formulariosContainer.appendChild(clienteWrapper);

    const profWrapper = document.createElement('div');
    profWrapper.className = 'd-none tab-pane register-tab-pane';
    profWrapper.id = 'formulario-prof';
    formulariosContainer.appendChild(profWrapper);

    renderFormCliente(clienteWrapper);
    renderFormProf(profWrapper);

    function alternarFormulario(tipoAtivo) {
        const tabClienteEl = document.getElementById('tab-cliente');
        const tabProfEl = document.getElementById('tab-prof');
        const formCliente = document.getElementById('formulario-cliente');
        const formProf = document.getElementById('formulario-prof');

        if (tipoAtivo === 'cliente') {
            tabClienteEl.classList.add('active');
            tabProfEl.classList.remove('active');
            formCliente.classList.remove('d-none');
            formCliente.classList.add('d-block');
            formProf.classList.remove('d-block');
            formProf.classList.add('d-none');
        } else {
            tabProfEl.classList.add('active');
            tabClienteEl.classList.remove('active');
            formProf.classList.remove('d-none');
            formProf.classList.add('d-block');
            formCliente.classList.remove('d-block');
            formCliente.classList.add('d-none');
        }
    }

    linkCliente.addEventListener('click', (e) => {
        e.preventDefault();
        alternarFormulario('cliente');
    });

    linkProf.addEventListener('click', (e) => {
        e.preventDefault();
        alternarFormulario('profissional');
    });

    const btnVoltar = document.createElement('a');
    btnVoltar.innerHTML = "Já tem conta? Faça login aqui";
    btnVoltar.href = "login";
    btnVoltar.className = 'register-login-link';
    formCard.appendChild(btnVoltar);
}