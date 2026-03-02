import loginForm from "../components/loginForm.js";
import NavBar from "../components/NavBar.js";

export default function renderLoginPage() {
    const root = document.getElementById('root');
    const navbarContainer = document.getElementById('navbar');
    root.innerHTML = '';  // limpa


    // Estilo base no root (centraliza e full height)
    root.style.display = 'flex';
    root.style.minHeight = '100vh';
    root.style.margin = '0';
    root.style.padding = '0';
    root.style.background = 'linear-gradient(135deg, #2e5e4e, #75b16e96, #2e5e4ec2)'; 
    root.style.backgroundSize = 'cover';

    // Remove navbar se não quiser na tela de login (ou deixa se preferir)
    const nav = document.getElementById('navbar');
    navbarContainer.appendChild(NavBar());

    // Container principal split
    const container = document.createElement('div');
    container.className = 'login-split-container';
    container.style.display = 'flex';
    container.style.width = '100%';
    container.style.maxWidth = '1200px';
    container.style.margin = 'auto';
    container.style.overflow = 'hidden';
    container.style.boxShadow = '0 0 40px rgba(0,0,0,0.2)';
    container.style.borderRadius = '16px';
    container.style.background = 'white'; // fallback caso queira borda branca

    // Lado esquerdo - Welcome / Hero
    const leftSide = document.createElement('div');
    leftSide.className = 'login-left';
    leftSide.innerHTML = `
        <div class="welcome-content">
            <h1>Bem-vindo de volta ao GlowUp</h1>
            <p>Você voltou mais forte. Hora de elevar o nível da sua melhor versão!</p>
            <p class="extra-text">Acesse sua conta e comece agora!</p>
        </div>
    `;

    // Lado direito - Formulário (reutiliza o que já existe)
    const rightSide = document.createElement('div');
    rightSide.className = 'login-right';
    const form = loginForm();  // seu componente atual

    // Ajustes leves no form (adiciona classes se precisar)
    form.classList.add('card-login');

    // Link de cadastro
    const btnVoltar = document.createElement('a');
    btnVoltar.textContent = "Não tem conta? Cadastre-se aqui";
    btnVoltar.href = "register";
    btnVoltar.className = 'btn-link mt-3 d-block text-center';

    form.appendChild(btnVoltar);
    rightSide.appendChild(form);

    container.appendChild(leftSide);
    container.appendChild(rightSide);
    root.appendChild(container);
}
