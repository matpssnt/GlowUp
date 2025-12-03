import ApiService from "../utils/api.js";
export default function renderFormCliente(container) {

    // Formulário
    const formulario = document.createElement('form');
    formulario.className = 'd-flex flex-column';

    // NOME
    const nome = document.createElement('input');
    nome.type = 'text';
    nome.placeholder = "Seu nome completo";
    nome.className = 'form-control mb-3';
    nome.required = true;
    formulario.appendChild(nome);

    // EMAIL
    const email = document.createElement('input');
    email.type = 'email';
    email.placeholder = "Seu e-mail";
    email.className = 'form-control mb-3';
    email.required = true;
    formulario.appendChild(email);

    // SENHA
    const password = document.createElement('input');
    password.type = 'password';
    password.placeholder = "Sua senha (mínimo 6 caracteres)";
    password.className = 'form-control mb-1';
    password.required = true;
    formulario.appendChild(password);

    // Mensagem de erro da senha
    const passwordError = document.createElement('div');
    passwordError.className = 'invalid-feedback';
    passwordError.textContent = 'A senha deve ter no mínimo 6 caracteres.';
    formulario.appendChild(passwordError);

    // CONFIRMAÇÃO DE SENHA
    const passwordConfirm = document.createElement('input');
    passwordConfirm.type = 'password';
    passwordConfirm.placeholder = "Confirme sua senha";
    passwordConfirm.className = 'form-control mb-1';
    passwordConfirm.required = true;
    formulario.appendChild(passwordConfirm);

    // Mensagem senha diferente
    const errorMsg = document.createElement("div");
    errorMsg.className = "invalid-feedback";
    errorMsg.textContent = "As senhas são diferentes.";
    formulario.appendChild(errorMsg);

    // BOTÃO
    const btnSubmit = document.createElement('button');
    btnSubmit.type = 'submit';
    btnSubmit.textContent = 'Cadastrar';
    btnSubmit.className = 'btn btn-primary mt-2';
    formulario.appendChild(btnSubmit);

    // Função validar senha
    function validarSenha(s) {
        return s.length >= 6;
    }

    // VALIDAÇÃO DA SENHA
    password.addEventListener("input", () => {
        if (!validarSenha(password.value)) {
            password.classList.add("is-invalid");
            password.classList.remove("is-valid");
        } else {
            password.classList.remove("is-invalid");
            password.classList.add("is-valid");
        }
    });

    // VALIDAÇÃO CONFIRMAR SENHA
    passwordConfirm.addEventListener("input", () => {
        if (passwordConfirm.value !== password.value) {
            passwordConfirm.classList.add("is-invalid");
            passwordConfirm.classList.remove("is-valid");
        } else {
            passwordConfirm.classList.remove("is-invalid");
            passwordConfirm.classList.add("is-valid");
        }
    });

    // VALIDAÇÃO FINAL NO SUBMIT
    formulario.addEventListener("submit", async (e) => {
        e.preventDefault();
        let invalido = false;

        // senha curta
        if (!validarSenha(password.value)) {
            invalido = true;
            password.classList.add("is-invalid");
            password.classList.remove("is-valid");
        }

        // senhas diferentes
        if (passwordConfirm.value !== password.value) {
            invalido = true;
            passwordConfirm.classList.add("is-invalid");
            passwordConfirm.classList.remove("is-valid");
        }

        if (invalido) return;

        // Desabilita o botão durante a requisição
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Cadastrando...';

        try {
            // Importa e usa a API
            const api = new ApiService();

            // Faz a requisição de cadastro
            const response = await api.cadastrarCliente(
                nome.value.trim(),
                email.value.trim(),
                password.value
            );

            // Sucesso
            alert('Cadastro realizado com sucesso!');
            
            // Limpa o formulário
            formulario.reset();
            
            // Redireciona para login
            window.location.href = 'login';
        } catch (error) {
            // Erro
            alert('Erro ao cadastrar: ' + error.message);
            console.error('Erro no cadastro:', error);
        } finally {
            // Reabilita o botão
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Cadastrar';
        }
    });

    // Coloca o form no container
    container.appendChild(formulario);
<<<<<<< HEAD

    
}
=======
}
>>>>>>> upstream/main
