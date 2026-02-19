export default function WhatsappFloat() {
    if (document.querySelector('.whatsapp-float')) {
        return null; 
    }
    const whatsappFloat = document.createElement('div');
    whatsappFloat.className = 'whatsapp-float';
    const link = document.createElement('a');
    link.href = 'https://wa.me/5515000000000';  // ← coloque aqui o número real
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', 'Fale conosco pelo WhatsApp');
    const icon = document.createElement('i');
    icon.className = 'fab fa-whatsapp';
    link.appendChild(icon);
    whatsappFloat.appendChild(link);
    return whatsappFloat;
}