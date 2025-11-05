import renderFormContRegister from "../components/formContRegister.js";

export default function renderContRegisterPage() {
    // Limpa o root e cria a estrutura principal
    const root = document.getElementById('root');
    root.innerHTML = '';

    // Cria o container principal
    const mainContainer = document.createElement('div');
    mainContainer.className = 'card-base card-register registration-card shadow-lg mx-auto rounded-card card-cont-register';
    root.appendChild(mainContainer);

    // Cria o título principal
    const titulo = document.createElement('h1');
    titulo.textContent = 'Complete seu cadastro ';
    titulo.className = 'cont-register-title';
    mainContainer.appendChild(titulo);

    // Cria o container dos formulários
    const formulariosContainer = document.createElement('div');
    formulariosContainer.className = 'mt-4 form-container';
    mainContainer.appendChild(formulariosContainer);

    // Cria o wrapper do formulário de continuação
    const contRegisterWrapper = document.createElement('div');
    contRegisterWrapper.className = 'd-block';
    contRegisterWrapper.id = 'formulario-cont-register';
    formulariosContainer.appendChild(contRegisterWrapper);

    // Renderiza o formulário
    renderFormContRegister(contRegisterWrapper);
}
