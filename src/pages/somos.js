import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";

export default function renderquemSomos() {
    const Divroot = document.getElementById('root');
    Divroot.innerHTML = '';

    const nav = document.getElementById('navbar');
    nav.innerHTML = '';
    const navbar = NavBar();
    nav.appendChild(navbar);
    
    // Hero section
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


    // Footer
    const footerContainer = document.getElementById('footer');
    footerContainer.innerHTML = '';
    footerContainer.style.marginTop = '150px';
    const footer = Footer();
    footerContainer.appendChild(footer);


    // Botão WhatsApp flutuante
    if (!document.querySelector('.whatsapp-float')) {
        const whatsappFloat = document.createElement('div');
        whatsappFloat.className = 'whatsapp-float';

        const whatsappLink = document.createElement('a');
        whatsappLink.href = 'https://wa.me/5515000000000';
        whatsappLink.target = '_blank';
        whatsappLink.setAttribute('aria-label', 'Contato via WhatsApp');

        const whatsappIcon = document.createElement('i');
        whatsappIcon.className = 'fab fa-whatsapp';

        whatsappLink.appendChild(whatsappIcon);
        whatsappFloat.appendChild(whatsappLink);
        document.body.appendChild(whatsappFloat);
    }

    Divroot.appendChild(fundoPrincipal);
}
