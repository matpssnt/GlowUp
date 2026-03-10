import renderFormContRegister from "../components/formContRegister.js";

export default function renderContRegisterPage() {
    const root = document.getElementById('root');
    root.innerHTML = '';
    root.className = 'cont-register-page-root';

    const mainContainer = document.createElement('div');
    mainContainer.className = 'cont-register-split-container';
    root.appendChild(mainContainer);

    const titulo = document.createElement('h1');
    titulo.textContent = 'Complete seu cadastro';
    titulo.className = 'cont-register-page-title';
    mainContainer.appendChild(titulo);

    const formulariosContainer = document.createElement('div');
    formulariosContainer.className = 'cont-register-form-wrapper';
    mainContainer.appendChild(formulariosContainer);

    const contRegisterWrapper = document.createElement('div');
    contRegisterWrapper.className = 'cont-register-form-inner';
    contRegisterWrapper.id = 'formulario-cont-register';
    formulariosContainer.appendChild(contRegisterWrapper);

    renderFormContRegister(contRegisterWrapper);
}
