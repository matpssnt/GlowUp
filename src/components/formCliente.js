import ApiService from "../utils/api.js";
import authState from "../utils/AuthState.js";
import { applyVisualValidation, friendlyMessages } from "../utils/formValidation.js";
import { validators } from "../utils/validation.js";
import { notify } from "./Notification.js";
import Loading from "./Loading.js";

export default function renderFormCliente(container) {

    // Formulário
    const formulario = document.createElement('form');
    formulario.className = 'd-flex flex-column';
    formulario.id = 'formCliente';

    // Container para nome
    const nomeContainer = document.createElement('div');
    nomeContainer.className = 'mb-3';
    const nomeLabel = document.createElement('label');
    nomeLabel.textContent = 'Nome completo *';
    nomeLabel.className = 'form-label';
    nomeLabel.setAttribute('for', 'nomeCliente');
    const nome = document.createElement('input');
    nome.type = 'text';
    nome.id = 'nomeCliente';
    nome.name = 'nome';
    nome.placeholder = "Seu nome completo";
    nome.className = 'form-control';
    nome.required = true;
    nomeContainer.appendChild(nomeLabel);
    nomeContainer.appendChild(nome);
    formulario.appendChild(nomeContainer);

    // Container para email
    const emailContainer = document.createElement('div');
    emailContainer.className = 'mb-3';
    const emailLabel = document.createElement('label');
    emailLabel.textContent = 'E-mail *';
    emailLabel.className = 'form-label';
    emailLabel.setAttribute('for', 'emailCliente');
    const email = document.createElement('input');
    email.type = 'email';
    email.id = 'emailCliente';
    email.name = 'email';
    email.placeholder = "Seu e-mail";
    email.className = 'form-control';
    email.required = true;
    emailContainer.appendChild(emailLabel);
    emailContainer.appendChild(email);
    formulario.appendChild(emailContainer);

    // Container para senha
    const passwordContainer = document.createElement('div');
    passwordContainer.className = 'mb-3';
    const passwordLabel = document.createElement('label');
    passwordLabel.textContent = 'Senha *';
    passwordLabel.className = 'form-label';
    passwordLabel.setAttribute('for', 'senhaCliente');
    const password = document.createElement('input');
    password.type = 'password';
    password.id = 'senhaCliente';
    password.name = 'senha';
    password.placeholder = "Sua senha (mínimo 6 caracteres)";
    password.className = 'form-control';
    password.required = true;
    passwordContainer.appendChild(passwordLabel);
    passwordContainer.appendChild(password);
    formulario.appendChild(passwordContainer);

    // Container para confirmação de senha
    const passwordConfirmContainer = document.createElement('div');
    passwordConfirmContainer.className = 'mb-3';
    const passwordConfirmLabel = document.createElement('label');
    passwordConfirmLabel.textContent = 'Confirmar senha *';
    passwordConfirmLabel.className = 'form-label';
    passwordConfirmLabel.setAttribute('for', 'senhaConfirmCliente');
    const passwordConfirm = document.createElement('input');
    passwordConfirm.type = 'password';
    passwordConfirm.id = 'senhaConfirmCliente';
    passwordConfirm.name = 'senhaConfirm';
    passwordConfirm.placeholder = "Confirme sua senha";
    passwordConfirm.className = 'form-control';
    passwordConfirm.required = true;
    passwordConfirmContainer.appendChild(passwordConfirmLabel);
    passwordConfirmContainer.appendChild(passwordConfirm);
    formulario.appendChild(passwordConfirmContainer);

    // BOTÃO
    const btnSubmit = document.createElement('button');
    btnSubmit.type = 'submit';
    btnSubmit.textContent = 'Cadastrar';
    btnSubmit.className = 'btn btn-primary mt-2';
    formulario.appendChild(btnSubmit);

    // Aplica validação visual aos campos
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
    // VALIDAÇÃO AO SAIR DO CAMPO DE CONFIRMAÇÃO DE SENHA
    // ===============================
    passwordConfirm.addEventListener('blur', () => {
        if (
            passwordConfirm.value.length > 0 &&
            passwordConfirm.value !== password.value
        ) {
            setFieldError(
                passwordConfirm,
                friendlyMessages.passwordMatch || 'As senhas não coincidem'
            );
        } else if (passwordConfirm.value.length > 0) {
            clearFieldError(passwordConfirm);
        }
    });

    // ===============================
    // REVALIDA CONFIRMAÇÃO AO DIGITAR A SENHA
    // ===============================
    password.addEventListener('input', () => {
        if (
            passwordConfirm.value.length > 0 &&
            passwordConfirm.value !== password.value
        ) {
            setFieldError(
                passwordConfirm,
                friendlyMessages.passwordMatch || 'As senhas não coincidem'
            );
        } else if (passwordConfirm.value.length > 0) {
            clearFieldError(passwordConfirm);
        }
    });

    // ===============================
    // FUNÇÃO AUXILIAR DE SENHA
    // ===============================
    const validarSenha = (senha) => {
        const resultado = validators.senha(senha);
        return resultado === true;
    };

    // ===============================
    // VALIDAÇÃO FINAL NO SUBMIT
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

        if (
            passwordConfirm.value.length > 0 &&
            passwordConfirm.value !== password.value
        ) {
            invalido = true;
            setFieldError(
                passwordConfirm,
                friendlyMessages.passwordMatch || 'As senhas não coincidem'
            );
        } else if (passwordConfirm.value.length > 0) {
            clearFieldError(passwordConfirm);
        }

        if (invalido) return;

        btnSubmit.disabled = true;
        const textoOriginal = btnSubmit.textContent;
        btnSubmit.innerHTML =
            '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Cadastrando...';

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

            const emailValue = email.value.trim();
            const passwordValue = password.value;

            const response = await api.login(emailValue, passwordValue);

            if (response && response.token) {
                let jwtPayload = null;
                
                try {
                    const token = response.token.split('.');
                    
                    if (token.length === 3) {
                        const base64 = token[1].replace(/-/g, '+').replace(/_/g, '/');
                        const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
                        jwtPayload = JSON.parse(atob(padded));
                    }

                } catch (e) {
                    // Ignora erro de decodificação
                }

                const sub = jwtPayload?.sub || {};

                const userData = {
                    tipoUsuario: response.tipoUsuario || 'cliente',
                    nome: sub.nome || '',
                    email: sub.email || emailValue,
                    id: sub.id || null,
                    cliente_id: sub.cliente_id || null
                };

                authState.setUser(userData, response.token);

                const currentPath = window.location.pathname;
                const basePath = currentPath.split('/').slice(0, 2).join('/');

                window.location.href = basePath + '/home';

            } else {
                notify.error('Cadastro realizado, mas não foi possível logar automáticamente. Tente logar manualmente.');
                window.location.href = 'login';
            }

        } catch (error) {
            notify.error('Erro ao cadastrar: ' + error.message);
        } finally {
            if (loadingElement && loadingElement.parentElement) {
                loadingElement.remove();
            }
            btnSubmit.disabled = false;
            btnSubmit.textContent = textoOriginal;
        }
    });

    // Coloca o form no container
    container.appendChild(formulario);
}
