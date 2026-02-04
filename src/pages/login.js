import loginForm from "../components/loginForm.js";
import NavBar from "../components/NavBar.js";

export default function renderLoginPage() {
    // Limpa o root e adiciona o formulário completo
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

    const campo = document.getElementById('castra-se');
    if (campo) campo.remove();



    const formulario = loginForm();
    // Cria link para página de cadastro
    const btnVoltar = document.createElement('a');
    btnVoltar.textContent = "Não tem conta? Cadastre-se aqui";
    btnVoltar.href = "register";
    btnVoltar.className = 'btn-link nav-link-default mt-2';

    formulario.appendChild(btnVoltar);
    root.appendChild(formulario);

}
