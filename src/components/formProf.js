export default function renderFormProf(container) {

    const formulario = document.createElement('form');
    formulario.className = 'd-flex flex-column';

    // NOME
    const nome = document.createElement('input');
    nome.type = 'text';
    nome.placeholder = "Nome do Estabelecimento";
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

    // MENSAGEM ERRO SENHA
    const passwordError = document.createElement('div');
    passwordError.className = 'invalid-feedback';
    passwordError.textContent = 'A senha deve ter no mínimo 6 caracteres.';
    formulario.appendChild(passwordError);

    // CONFIRMAR SENHA
    const passwordConfirm = document.createElement('input');
    passwordConfirm.type = 'password';
    passwordConfirm.placeholder = "Confirme sua senha";
    passwordConfirm.className = 'form-control mb-1';
    passwordConfirm.required = true;
    formulario.appendChild(passwordConfirm);

    // MENSAGEM ERRO CONFIRMAÇÃO
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

    // VALIDAÇÃO SENHA
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
        if (passwordConfirm.value !== password.value || !validarSenha(password.value)) {
            passwordConfirm.classList.add("is-invalid");
            passwordConfirm.classList.remove("is-valid");
        } else {
            passwordConfirm.classList.remove("is-invalid");
            passwordConfirm.classList.add("is-valid");
        }
    });

    // SUBMIT
    formulario.addEventListener('submit', (e) => {
        let invalido = false;

        // senha curta
        if (!validarSenha(password.value)) {
            invalido = true;
            password.classList.add("is-invalid");
        }

        // senhas diferentes
        if (passwordConfirm.value !== password.value) {
            invalido = true;
            passwordConfirm.classList.add("is-invalid");
        }

        if (invalido) {
            e.preventDefault();
            return; // não continua
        }

        // Salva no localStorage
        const dadosBasicos = {
            nome: nome.value,
            email: email.value,
            senha: password.value,
            tipo: 'profissional'
        };
        localStorage.setItem('dadosBasicos', JSON.stringify(dadosBasicos));

        // Redireciona
        window.location.href = 'cont-register';
    });

    container.appendChild(formulario);
}
