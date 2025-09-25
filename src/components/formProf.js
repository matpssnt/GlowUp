export default function renderFormProf(container) {
    // Cria o formulário
    const formulario = document.createElement('form');
    formulario.className = 'd-flex flex-column';

    // Campo de nome do estabelecimento
    const nome = document.createElement('input');
    nome.type = 'text';
    nome.placeholder = "Nome do Estabelecimento";
    nome.className = 'form-control mb-3';
    nome.required = true;
    formulario.appendChild(nome);

    // Campo de email
    const email = document.createElement('input');
    email.type = 'email';
    email.placeholder = "Seu e-mail";
    email.className = 'form-control mb-3';
    email.required = true;
    formulario.appendChild(email);

    // Campo de senha
    const password = document.createElement('input');
    password.type = 'password';
    password.placeholder = "Sua senha";
    password.className = 'form-control mb-3';
    password.required = true;
    formulario.appendChild(password);

    // Campo de confirmação de senha
    const passwordConfirm = document.createElement('input');
    passwordConfirm.type = 'password';
    passwordConfirm.placeholder = "Confirme sua senha";
    passwordConfirm.className = 'form-control mb-3';
    passwordConfirm.required = true;
    formulario.appendChild(passwordConfirm);

    // Botão de cadastro
    const btnSubmit = document.createElement('button');
    btnSubmit.type = 'submit';
    btnSubmit.textContent = 'Cadastrar';
    btnSubmit.className = 'btn btn-primary';
    formulario.appendChild(btnSubmit);

    // Redirecionamento simples
    formulario.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Salva os dados básicos no localStorage
        const dadosBasicos = {
            nome: nome.value,
            email: email.value,
            senha: password.value,
            tipo: 'profissional'
        };
        localStorage.setItem('dadosBasicos', JSON.stringify(dadosBasicos));
        
        // Redireciona para continuar cadastro
        window.location.href = 'cont-register';
    });

    container.appendChild(formulario);
}
