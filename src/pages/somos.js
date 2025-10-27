
import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
export default function renderquemSomos(){
    const Divroot = document.getElementById('root');
    Divroot.innerHTML = '';

    
    const nav = document.getElementById('navbar');
    nav.innerHTML = '';
    const navbar = NavBar();
    nav.appendChild(navbar);
    
    const fundoPrincipal = document.createElement('div');
    fundoPrincipal.innerHTML = `
       <h1 style="font-size: 2.8rem; font-weight: 700;">
            Quem somos nós?
        </h1>
        <p style="font-size: 1rem; font-weight: 500;">
            Conheça nossa empresa
        </p>
        <div class="line">
        </div> 
    `;
    fundoPrincipal.className = 'fund-principal fade-in';
    

    const footerContainer = document.getElementById('footer');
    footerContainer.innerHTML = '';
    footerContainer.style.marginTop = '150px';

    const footer = Footer();
    footerContainer.appendChild(footer);

    // Cria o botão
    const setCima = document.createElement('div');
    setCima.className = 'seta-float';
    setCima.style.cursor = 'pointer'; // Indica que é clicável

    // Cria o ícone
    const setaIcon = document.createElement('i');
    setaIcon.className = 'fa fa-arrow-up';

    // Adiciona o ícone ao botão
    setCima.appendChild(setaIcon);

    // Adiciona o botão ao corpo da página
    document.body.appendChild(setCima);

    // Adiciona o evento de clique para rolar ao topo
    
    setCima.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Rolagem suave
        });
    });

    // Botão Whatsapp
    const whatsappFloat = document.createElement('div');
    whatsappFloat.className = 'whatsapp-float';

    const whatsappLink = document.createElement('a');
    whatsappLink.href = '#'; 

    const whatsappIcon = document.createElement('i');
    whatsappIcon.className = 'fab fa-whatsapp';

    whatsappLink.appendChild(whatsappIcon);
    whatsappFloat.appendChild(whatsappLink);
    document.body.appendChild(whatsappFloat);

    Divroot.appendChild(fundoPrincipal);

}