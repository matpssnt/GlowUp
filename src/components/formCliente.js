import ApiService from "../utils/api.js";
import authState from "../utils/AuthState.js";
import { applyVisualValidation, friendlyMessages } from "../utils/formValidation.js";
import { validators } from "../utils/validation.js";
import { notify } from "./Notification.js";
import Loading from "./Loading.js";

export default function renderFormCliente(container) {

    const formulario = document.createElement('form');
    formulario.className = 'register-form register-form-grid';
    formulario.id = 'formCliente';

    // ===============================
    // LINHA 1 - NOME | EMAIL
    // ===============================
    const row1 = document.createElement('div');
    row1.className = 'register-form-row';

    const nomeContainer = document.createElement('div');
    nomeContainer.className = 'register-field';
    nomeContainer.innerHTML = `
        <label for="nomeCliente" class="form-label">Nome completo *</label>
        <input type="text" id="nomeCliente" name="nome" placeholder="Seu nome completo" class="form-control" required>
    `;

    const nome = nomeContainer.querySelector('#nomeCliente');

    const emailContainer = document.createElement('div');
    emailContainer.className = 'register-field';
    emailContainer.innerHTML = `
        <label for="emailCliente" class="form-label">E-mail *</label>
        <input type="email" id="emailCliente" name="email" placeholder="Seu e-mail" class="form-control" required>
    `;

    const email = emailContainer.querySelector('#emailCliente');

    row1.appendChild(nomeContainer);
    row1.appendChild(emailContainer);
    formulario.appendChild(row1);

    // ===============================
    // LINHA 2 - SENHA | CONFIRMAR
    // ===============================
    const row2 = document.createElement('div');
    row2.className = 'register-form-row';

    // Container senha
    const passwordContainer = document.createElement('div');
    passwordContainer.className = 'register-field';
    passwordContainer.style.position = "relative";

    passwordContainer.innerHTML = `
        <label for="senhaCliente" class="form-label">Senha *</label>
        <input type="password" id="senhaCliente" name="senha" placeholder="Mínimo 6 caracteres" class="form-control" required>
    `;

    const password = passwordContainer.querySelector('#senhaCliente');

    // Ícone olho senha
    const togglePassword = document.createElement('img');
    togglePassword.src = '/GlowUp/public/assets/images/olho-aberto.png';
    togglePassword.style.position = 'absolute';
    togglePassword.style.right = '10px';
    togglePassword.style.top = '49px';
    togglePassword.style.cursor = 'pointer';
    togglePassword.style.width = '20px';

    passwordContainer.appendChild(togglePassword);

    // Container confirmar senha
    const passwordConfirmContainer = document.createElement('div');
    passwordConfirmContainer.className = 'register-field';
    passwordConfirmContainer.style.position = "relative";

    passwordConfirmContainer.innerHTML = `
        <label for="senhaConfirmCliente" class="form-label">Confirmar senha *</label>
        <input type="password" id="senhaConfirmCliente" name="senhaConfirm" placeholder="Confirme sua senha" class="form-control" required>
    `;

    const passwordConfirm = passwordConfirmContainer.querySelector('#senhaConfirmCliente');

    // Ícone confirmar senha
    const togglePasswordConfirm = document.createElement('img');
    togglePasswordConfirm.src = '/GlowUp/public/assets/images/olho-aberto.png';
    togglePasswordConfirm.style.position = 'absolute';
    togglePasswordConfirm.style.right = '10px';
    togglePasswordConfirm.style.top = '49px';
    togglePasswordConfirm.style.cursor = 'pointer';
    togglePasswordConfirm.style.width = '20px';

    passwordConfirmContainer.appendChild(togglePasswordConfirm);

    // EVENTOS DO OLHO
    togglePassword.addEventListener('click', () => {

        const isPassword = password.type === 'password';

        password.type = isPassword ? 'text' : 'password';

        togglePassword.src = isPassword
            ? '/GlowUp/public/assets/images/esconder.png'
            : '/GlowUp/public/assets/images/olho-aberto.png';

    });

    togglePasswordConfirm.addEventListener('click', () => {

        const isPassword = passwordConfirm.type === 'password';

        passwordConfirm.type = isPassword ? 'text' : 'password';

        togglePasswordConfirm.src = isPassword
            ? '/GlowUp/public/assets/images/esconder.png'
            : '/GlowUp/public/assets/images/olho-aberto.png';

    });

    row2.appendChild(passwordContainer);
    row2.appendChild(passwordConfirmContainer);
    formulario.appendChild(row2);

    // ===============================
    // BOTÃO
    // ===============================
    const btnSubmit = document.createElement('button');
    btnSubmit.type = 'submit';
    btnSubmit.textContent = 'Cadastrar';
    btnSubmit.className = 'btn btn-primary register-submit-btn';

    formulario.appendChild(btnSubmit);

    // ===============================
    // VALIDAÇÕES VISUAIS
    // ===============================
    applyVisualValidation(nome, ['required'], {
        helpText: 'Digite seu nome completo',
        customMessage: friendlyMessages.required
    });

    applyVisualValidation(email, ['required', 'email'], {
        helpText: 'Digite um e-mail válido',
        customMessage: friendlyMessages.email
    });

    applyVisualValidation(password, ['required', ['minLength', 6]], {
        helpText: 'A senha deve ter no mínimo 6 caracteres',
        customMessage: friendlyMessages.password
    });

    // ===============================
    // FUNÇÕES AUXILIARES
    // ===============================
    function setFieldError(input, message) {

        let errorDiv = input.parentElement.querySelector('.invalid-feedback');

        input.classList.add('is-invalid');
        input.classList.remove('is-valid');

        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            input.parentElement.appendChild(errorDiv);
        }

        errorDiv.textContent = message;
    }

    function clearFieldError(input) {

        input.classList.remove('is-invalid');
        input.classList.add('is-valid');

        const errorDiv = input.parentElement.querySelector('.invalid-feedback');
        if (errorDiv) errorDiv.remove();
    }

    // ===============================
    // VALIDAÇÃO CONFIRMAR SENHA
    // ===============================
    passwordConfirm.addEventListener('blur', () => {

        if (passwordConfirm.value && passwordConfirm.value !== password.value) {

            setFieldError(passwordConfirm, friendlyMessages.passwordMatch || 'As senhas não coincidem');

        } else if (passwordConfirm.value) {

            clearFieldError(passwordConfirm);

        }

    });

    password.addEventListener('input', () => {

        if (passwordConfirm.value) {

            if (passwordConfirm.value !== password.value) {

                setFieldError(passwordConfirm, friendlyMessages.passwordMatch || 'As senhas não coincidem');

            } else {

                clearFieldError(passwordConfirm);

            }

        }

    });

    // ===============================
    // SUBMIT
    // ===============================
    formulario.addEventListener('submit', async (e) => {

        e.preventDefault();

        let invalido = false;

        const resultadoSenha = validators.senha(password.value);

        if (resultadoSenha !== true) {

            invalido = true;
            setFieldError(password, resultadoSenha);

        } else {

            clearFieldError(password);

        }

        if (passwordConfirm.value !== password.value) {

            invalido = true;
            setFieldError(passwordConfirm, friendlyMessages.passwordMatch || 'As senhas não coincidem');

        }

        if (invalido) return;

        btnSubmit.disabled = true;

        const textoOriginal = btnSubmit.textContent;

        btnSubmit.innerHTML =
            '<span class="spinner-border spinner-border-sm me-2"></span>Cadastrando...';

        const loadingElement = Loading({
            size: 'small',
            variant: 'spinner',
            context: 'inline',
            message: 'Processando cadastro...'
        });

        formulario.insertAdjacentElement('afterend', loadingElement);

        try {

            const api = new ApiService();

            await api.cadastrarCliente(
                nome.value.trim(),
                email.value.trim(),
                password.value
            );

            notify.success('Cadastro realizado com sucesso!');

            const response = await api.login(email.value.trim(), password.value);

            if (response && response.token) {

                let jwtPayload = {};

                try {

                    const base64Url = response.token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    jwtPayload = JSON.parse(window.atob(base64));

                } catch (e) {}

                const sub = jwtPayload.sub || {};

                const userData = {
                    tipoUsuario: 'cliente',
                    nome: sub.nome || nome.value.trim(),
                    email: sub.email || email.value.trim(),
                    id: sub.id || null,
                    cliente_id: sub.cliente_id || null
                };

                authState.setUser(userData, response.token);

                const currentPath = window.location.pathname;
                const basePath = currentPath.split('/').slice(0, 2).join('/');

                setTimeout(() => {

                    window.location.href = basePath + '/home';

                }, 1000);

            }

        } catch (error) {

            notify.error('Erro ao cadastrar: ' + error.message);

        } finally {

            if (loadingElement?.parentElement) loadingElement.remove();

            btnSubmit.disabled = false;
            btnSubmit.textContent = textoOriginal;

        }

    });

    container.appendChild(formulario);

}