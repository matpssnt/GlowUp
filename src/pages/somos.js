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
    fundoPrincipal.className = 'fund-principal fade-in';

    fundoPrincipal.innerHTML = `

            <!-- CTA -->
        <section class="sobre-cta">
            <div class="sobre-cta-content">
                <h2>Faça parte da nossa comunidade</h2>
                <p>
                    Cadastre-se agora e comece a aproveitar todos os recursos disponíveis na nossa plataforma.
                </p>
                <a href="/GlowUp/register" class="btn-primary">
                    Criar minha conta
                </a>
            </div>
        </section>
        
        <!-- MISSÃO, VISÃO E VALORES -->
        <section class="sobre-mvv section">
            <div class="content-wrapper">
                <h2>Missão, Visão e Valores</h2>

                <div class="mvv-cards">
                    <div class="mvv-card">
                        <div class="mvv-icon">
                            <i class="fas fa-bullseye"></i>
                        </div>
                        <h3>Missão</h3>
                        <p>
                            Conectar pessoas com profissionais de beleza e bem-estar de forma simples,
                            segura e acessível, promovendo autoestima e confiança.
                        </p>
                    </div>

                    <div class="mvv-card">
                        <div class="mvv-icon">
                            <i class="fas fa-eye"></i>
                        </div>
                        <h3>Visão</h3>
                        <p>
                            Ser a principal plataforma de beleza e bem-estar, reconhecida pela qualidade,
                            confiabilidade e proximidade com nossos usuários.
                        </p>
                    </div>

                    <div class="mvv-card">
                        <div class="mvv-icon">
                            <i class="fas fa-heart"></i>
                        </div>
                        <h3>Valores</h3>
                        <ul>
                            <li>Transparência em todas as relações</li>
                            <li>Foco no usuário e sua experiência</li>
                            <li>Inovação constante em serviços</li>
                            <li>Respeito e inclusão para todos</li>
                            <li>Compromisso com qualidade</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    `;

    Divroot.appendChild(fundoPrincipal);

    // Footer
    const footerContainer = document.getElementById('footer');
    footerContainer.innerHTML = '';
    footerContainer.style.marginTop = '0';
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
}
