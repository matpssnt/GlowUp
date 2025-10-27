export default function descriptionProf() {

    // Container principal
    const container = document.createElement('div');
    container.className = 'card p-4 shadow-lg d-flex flex-row';
    container.style.width = '100%';
    container.style.maxWidth = '950px';
    container.style.height = '600px';
    container.style.border = 'none';
    container.style.backgroundColor = '#ffffff';
    container.style.borderRadius = '10px';
    container.style.overflow = 'hidden';

    // Lado esquerdo com imagem de fundo
    const leftSide = document.createElement('div');
    leftSide.className = 'left-side d-flex align-items-center justify-content-center';
    leftSide.style.width = '57%';
    leftSide.style.backgroundImage = 'url("")';
    leftSide.style.backgroundSize = 'cover';
    leftSide.style.backgroundPosition = 'center';
    leftSide.style.borderRadius = '10px 0 0 10px';

    // Lado direito (conteúdo)
    const rightSide = document.createElement('div');
    rightSide.className = 'right-side d-flex flex-column justify-content-center p-5';
    rightSide.style.width = '43%';
    rightSide.style.backgroundColor = '#fff';

    const formulario = document.createElement('form');
    formulario.className = 'd-flex flex-column gap-3';

    //  Bloco do perfil (foto + nome)
    const perfilContainer = document.createElement('div');
    perfilContainer.className = 'd-flex align-items-center mb-4';
    perfilContainer.style.gap = '15px';

    const imgProf = document.createElement('img');
    imgProf.src = ''; //add
    imgProf.alt = 'Foto do profissional';
    imgProf.style.width = '80px';
    imgProf.style.height = '80px';
    imgProf.style.borderRadius = '50%';
    imgProf.style.objectFit = 'cover';
    imgProf.style.border = '2px solid #007bff';

    const nomeProf = document.createElement('h4');
    nomeProf.textContent = ''; //add
    nomeProf.style.margin = '0';
    nomeProf.style.fontWeight = 'bold';
    nomeProf.style.color = '#333';

    perfilContainer.appendChild(imgProf);
    perfilContainer.appendChild(nomeProf);
    formulario.appendChild(perfilContainer);


    const email = document.createElement('input');
    email.type = 'email';
    email.maxLength = '50';
    email.placeholder = "E-mail do profissional";
    email.className = 'inputs form-control';
    formulario.appendChild(email);


    const descricaoProf = document.createElement('input');
    descricaoProf.type = 'text';
    descricaoProf.maxLength = '50';
    descricaoProf.placeholder = "Descrição do profissional";
    descricaoProf.className = 'inputs form-control';
    formulario.appendChild(descricaoProf);


    const localizacao = document.createElement('input');
    localizacao.type = 'text';
    localizacao.maxLength = '50';
    localizacao.placeholder = "Localização do salão";
    localizacao.className = 'inputs form-control';
    formulario.appendChild(localizacao);


    const telefone = document.createElement('input');
    telefone.type = 'text';
    telefone.maxLength = '50';
    telefone.placeholder = "Telefone do profissional";
    telefone.className = 'inputs form-control';
    formulario.appendChild(telefone);


    rightSide.appendChild(formulario);
    container.appendChild(leftSide);
    container.appendChild(rightSide);

    return container;
}