import renderFormCliente from "../components/formCliente.js";
import renderFormProf from "../components/formProf.js";
import NavBar from "../components/NavBar.js";

export default function renderRegisterPage() {
    
    const root = document.getElementById('root');
    root.innerHTML = '';
    root.style.display = 'flex';
    root.style.justifyContent = 'center';
    root.style.alignItems = 'center';
    root.style.minHeight = '100vh';
    root.style.width = '100%';
    root.style.padding = '20px';
    root.style.boxSizing = 'border-box';


    const nav = document.getElementById('navbar');
    nav.innerHTML = '';

    const navbar = NavBar();
    nav.appendChild(navbar);

    const campo = document.getElementById('comecar');
    if(campo) campo.remove();

    // Cria o container principal
    const mainContainer = document.createElement('div');
    mainContainer.className = 'card-base card-register registration-card shadow-lg mx-auto rounded-card card-register-default';
    root.appendChild(mainContainer);

    // Cria o título principal
    const titulo = document.createElement('h1');
    titulo.textContent = 'Crie sua conta';
    titulo.className = 'base-title page-title-default';
    mainContainer.appendChild(titulo);

    // Cria as abas de navegação
    const navTabs = document.createElement('ul');
    navTabs.className = 'nav nav-tabs';
    navTabs.id = 'nav-tabs';

    // Aba "Sou Usuário"
    const tabCliente = document.createElement('li');
    tabCliente.className = 'nav-item';
    const linkCliente = document.createElement('a');
    linkCliente.className = 'nav-link active';
    linkCliente.id = 'tab-cliente';
    linkCliente.href = '#';
    linkCliente.textContent = 'Sou Usuário';
    tabCliente.appendChild(linkCliente);
    navTabs.appendChild(tabCliente);

    // Aba "Sou Profissional"
    const tabProf = document.createElement('li');
    tabProf.className = 'nav-item';
    const linkProf = document.createElement('a');
    linkProf.className = 'nav-link';
    linkProf.id = 'tab-prof';
    linkProf.href = '#';
    linkProf.textContent = 'Sou Profissional';
    tabProf.appendChild(linkProf);
    navTabs.appendChild(tabProf);

    mainContainer.appendChild(navTabs);

    // Cria o container dos formulários
    const formulariosContainer = document.createElement('div');
    formulariosContainer.className = 'mt-4 form-container';
    mainContainer.appendChild(formulariosContainer);

    // Cria o wrapper do formulário de cliente
    const clienteWrapper = document.createElement('div');
    clienteWrapper.className = 'd-block tab-pane'; // Adiciona 'tab-pane' para a transição
    clienteWrapper.id = 'formulario-cliente';
    formulariosContainer.appendChild(clienteWrapper);

    // Cria o wrapper do formulário de profissional
    const profWrapper = document.createElement('div');
    profWrapper.className = 'd-none tab-pane'; // Adiciona 'tab-pane' para a transição
    profWrapper.id = 'formulario-prof';
    formulariosContainer.appendChild(profWrapper);

    // Renderiza os formulários
    renderFormCliente(clienteWrapper);
    renderFormProf(profWrapper);

    // Função para alternar entre formulários
    function alternarFormulario(tipoAtivo) {
        const tabCliente = document.getElementById('tab-cliente');
        const tabProf = document.getElementById('tab-prof');
        const formCliente = document.getElementById('formulario-cliente');
        const formProf = document.getElementById('formulario-prof');

        if (tipoAtivo === 'cliente') {
            // Ativa aba de cliente
            tabCliente.classList.add('active');
            tabProf.classList.remove('active');
            
            // Mostra formulário de cliente
            formCliente.classList.remove('d-none');
            formCliente.classList.add('d-block');
            
            // Oculta formulário de profissional
            formProf.classList.remove('d-block');
            formProf.classList.add('d-none');
        } else {
            // Ativa aba de profissional
            tabProf.classList.add('active');
            tabCliente.classList.remove('active');
            
            // Mostra formulário de profissional
            formProf.classList.remove('d-none');
            formProf.classList.add('d-block');
            
            // Oculta formulário de cliente
            formCliente.classList.remove('d-block');
            formCliente.classList.add('d-none');
        }
    }

    // Event listeners para as abas
    linkCliente.addEventListener('click', (e) => {
        e.preventDefault();
        alternarFormulario('cliente');
    });

    linkProf.addEventListener('click', (e) => {
        e.preventDefault();
        alternarFormulario('profissional');
    });

    // Adiciona link para voltar ao login
    const btnVoltar = document.createElement('a');
    btnVoltar.innerHTML = "Já tem conta? Faça login aqui";
    btnVoltar.href = "login";
    btnVoltar.className = 'btn btn-link nav-link-default mt-3';
    mainContainer.appendChild(btnVoltar);
}