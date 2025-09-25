
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
        <p style="font-size 1rem; font-weight: 500;">
            Conheça nossa empresa
        </p>
        <div class="line">
        </div> 
        <style>
            .line{
                border-bottom: 1px solid #0c0b0b85;
                display: inline-block;
                width: 50%;
                padding-top: 2rem;
            }
        </style>
    `;
    fundoPrincipal.className = 'fund-principal fade-in';
    fundoPrincipal.style.padding = '20px';
    fundoPrincipal.style.width = '100%';
    fundoPrincipal.style.height = '50vh'; // ou 50vh
    fundoPrincipal.style.display = 'flex';
    fundoPrincipal.style.flexDirection = 'column';
    fundoPrincipal.style.alignItems = 'center'; // centraliza o texto verticalmente
    fundoPrincipal.style.justifyContent = 'center'; 
    // fundoPrincipal.style.backgroundImage = 'url("src/images/fundoPrincipal.jfif")';
    fundoPrincipal.style.background = `radial-gradient(circle, #fac37c, #c7824dff)`;
    fundoPrincipal.style.backgroundSize = 'cover';
    fundoPrincipal.style.backgroundPosition = 'center';
    fundoPrincipal.style.backgroundRepeat = 'no-repeat';
    

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