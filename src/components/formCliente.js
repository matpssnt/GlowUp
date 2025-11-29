export default function renderFormCliente(container) {

    // Cria o formulário
    const formulario = document.createElement('form');
    formulario.className = 'd-flex flex-column';

    // Campo de nome completo
    const nome = document.createElement('input');
    nome.type = 'text';
    nome.placeholder = "Seu nome completo";
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
    btnSubmit.className = 'btn btn-primary'; // Usa a classe global de botão primário
    formulario.appendChild(btnSubmit);

    container.appendChild(formulario);

    
}