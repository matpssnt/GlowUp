import ApiService from "../utils/api.js";
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
    
    // Validação customizada para confirmação de senha
    passwordConfirm.addEventListener('blur', () => {
        if (passwordConfirm.value !== password.value) {
            passwordConfirm.classList.add('is-invalid');
            passwordConfirm.classList.remove('is-valid');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            errorDiv.textContent = friendlyMessages.passwordMatch;
            passwordConfirm.parentElement.appendChild(errorDiv);
        } else if (passwordConfirm.value.length > 0) {
            passwordConfirm.classList.remove('is-invalid');
            passwordConfirm.classList.add('is-valid');
            const existingError = passwordConfirm.parentElement.querySelector('.invalid-feedback');
            if (existingError) existingError.remove();
        }
    });
    
    password.addEventListener('input', () => {
        if (passwordConfirm.value && passwordConfirm.value !== password.value) {
            passwordConfirm.classList.add('is-invalid');
            passwordConfirm.classList.remove('is-valid');
        }
    });

    // Função auxiliar para validar senha
    const validarSenha = (senha) => {
        const resultado = validators.senha(senha);
        return resultado === true; // Retorna true se válido, false se houver erro
    };

    // VALIDAÇÃO FINAL NO SUBMIT
    formulario.addEventListener("submit", async (e) => {
        e.preventDefault();
        let invalido = false;

        // Valida senha curta usando validators
        const resultadoSenha = validators.senha(password.value);
        if (resultadoSenha !== true) {
            invalido = true;
            password.classList.add("is-invalid");
            password.classList.remove("is-valid");
            // Mostra mensagem de erro
            const errorDiv = password.parentElement.querySelector('.invalid-feedback');
            if (!errorDiv) {
                const div = document.createElement('div');
                div.className = 'invalid-feedback';
                div.textContent = resultadoSenha;
                password.parentElement.appendChild(div);
            }
        } else {
            password.classList.remove("is-invalid");
            password.classList.add("is-valid");
        }

        // Valida senhas diferentes
        if (passwordConfirm.value !== password.value) {
            invalido = true;
            passwordConfirm.classList.add("is-invalid");
            passwordConfirm.classList.remove("is-valid");
            const errorDiv = passwordConfirm.parentElement.querySelector('.invalid-feedback');
            if (!errorDiv) {
                const div = document.createElement('div');
                div.className = 'invalid-feedback';
                div.textContent = friendlyMessages.passwordMatch || 'As senhas não coincidem';
                passwordConfirm.parentElement.appendChild(div);
            }
        } else if (passwordConfirm.value.length > 0) {
            passwordConfirm.classList.remove("is-invalid");
            passwordConfirm.classList.add("is-valid");
        }

        if (invalido) return;

        // Desabilita o botão e mostra loading durante a requisição
        btnSubmit.disabled = true;
        const textoOriginal = btnSubmit.textContent;
        btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Cadastrando...';
        
        // Adiciona loading no container do formulário
        const loadingElement = Loading({ 
            size: 'small', 
            variant: 'spinner', 
            context: 'inline',
            message: 'Processando cadastro...'
        });
        formulario.insertAdjacentElement('afterend', loadingElement);

        try {
            // Importa e usa a API
            const api = new ApiService();

            // Faz a requisição de cadastro
            const response = await api.cadastrarCliente(
                nome.value.trim(),
                email.value.trim(),
                password.value
            );

            // Sucesso - mostra notificação e redireciona
            notify.success('Cadastro realizado com sucesso!');
            
            // Limpa o formulário
            formulario.reset();
            
            // Aguarda um pouco para o usuário ver a notificação antes de redirecionar
            setTimeout(() => {
                window.location.href = 'login';
            }, 1500);
        } catch (error) {
            // Erro - mostra notificação de erro
            notify.error('Erro ao cadastrar: ' + error.message);
            console.error('Erro no cadastro:', error);
        } finally {
            // Remove loading e reabilita o botão
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
