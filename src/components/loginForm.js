import ApiService from '../utils/api.js';
import authState from '../utils/AuthState.js';

export default function loginForm() {

    const divRoot = document.getElementById('root');
    divRoot.innerHTML = '';

    // Container principal
    const container = document.createElement('div');
    container.className = 'card-base card-login shadow-lg card-login-default';
    divRoot.appendChild(container);

    // Título
    const titulo = document.createElement('h1');
    titulo.textContent = 'Entrar';
    titulo.className = 'login-title page-title-default';
    container.appendChild(titulo);

    // Formulário
    const formulario = document.createElement('form');
    formulario.className = 'd-flex flex-column';
    container.appendChild(formulario);

    // Alert de erro
    const errorAlert = document.createElement('div');
    errorAlert.className = 'alert alert-danger d-none mb-3';
    errorAlert.setAttribute('role', 'alert');
    formulario.appendChild(errorAlert);

    // Campo email
    const email = document.createElement('input');
    email.type = 'email';
    email.placeholder = "Seu login";
    email.className = 'form-control mb-3';
    email.required = true;
    formulario.appendChild(email);

    // Container da senha
    const passwordContainer = document.createElement('div');
    passwordContainer.className = 'position-relative mb-3';

    // Campo senha
    const password = document.createElement('input');
    password.type = 'password';
    password.placeholder = "Sua senha";
    password.className = 'form-control';
    password.required = true;
    password.style.paddingRight = "45px";

    // Ícone mostrar/ocultar senha
    const togglePassword = document.createElement('img');
    togglePassword.src = '/GlowUp/public/assets/images/olho-aberto.png';
    togglePassword.style.position = 'absolute';
    togglePassword.style.right = '12px';
    togglePassword.style.top = '50%';
    togglePassword.style.transform = 'translateY(-50%)';
    togglePassword.style.cursor = 'pointer';
    togglePassword.style.width = '22px';
    togglePassword.style.height = '22px';

        // Evento toggle senha
    togglePassword.addEventListener('click', () => {

        const isPassword = password.type === 'password';

        password.type = isPassword ? 'text' : 'password';

        togglePassword.src = isPassword
            ? '/GlowUp/public/assets/images/esconder.png'
            : '/GlowUp/public/assets/images/olho-aberto.png';

    });

    passwordContainer.appendChild(password);
    passwordContainer.appendChild(togglePassword);
    formulario.appendChild(passwordContainer);

    // Botão login
    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.textContent = "Entrar";
    btn.className = 'btn btn-primary';
    formulario.appendChild(btn);

    // Api service
    const apiService = new ApiService();

    // Mostrar erro
    const showError = (message) => {
        errorAlert.textContent = message;
        errorAlert.classList.remove('d-none');
    };

    // Esconder erro
    const hideError = () => {
        errorAlert.classList.add('d-none');
    };

    // Submit login
    formulario.addEventListener('submit', async (e) => {

        e.preventDefault();
        hideError();

        const emailValue = email.value.trim();
        const senhaValue = password.value.trim();

        if (!emailValue || !senhaValue) {
            showError('Por favor, preencha todos os campos.');
            return;
        }

        btn.disabled = true;
        const originalText = btn.textContent;
        btn.textContent = 'Entrando...';

        try {

            const response = await apiService.login(emailValue, senhaValue);

            if (response && response.token) {

                let jwtPayload = null;

                try {

                    const tokenParts = response.token.split('.');

                    if (tokenParts.length === 3) {

                        const base64 = tokenParts[1]
                            .replace(/-/g, '+')
                            .replace(/_/g, '/');

                        const padded = base64.padEnd(
                            base64.length + (4 - base64.length % 4) % 4,
                            '='
                        );

                        jwtPayload = JSON.parse(atob(padded));

                    }

                } catch (e) {}

                const sub = jwtPayload?.sub || {};

                const userData = {
                    tipoUsuario: response.tipoUsuario || 'cliente',
                    nome: sub.nome || emailValue,
                    email: sub.email || emailValue,
                    id: sub.id || sub.idCadastro || null,
                    cliente_id: sub.cliente_id || sub.clienteId || null,
                    profissional_id: sub.profissional_id || sub.profissionalId || null,
                    foto_perfil: sub.foto_perfil || '',
                    foto_banner: sub.foto_banner || ''
                };

                authState.setUser(userData, response.token);

                const currentPath = window.location.pathname;
                const basePath = currentPath.split('/').slice(0, 2).join('/');

                if (userData.tipoUsuario === 'profissional') {
                    window.location.href = basePath + '/dashboard';
                } else {
                    window.location.href = basePath + '/home';
                }

            } else {

                showError('Erro ao fazer login. Tente novamente.');

            }

        } catch (error) {

            let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';

            if (error.message) {
                errorMessage = error.message;
            }

            showError(errorMessage);

        } finally {

            btn.disabled = false;
            btn.textContent = originalText;

        }

    });

    return container;

}