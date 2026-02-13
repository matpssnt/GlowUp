import renderExplorarPage from './explorar.js';

export default function renderEstabelecimentosPage() {
    renderExplorarPage({
        tipoFiltro: 'pj',
        titulo: 'Estabelecimentos',
        subtitulo: 'Conheça os melhores salões e clínicas de beleza da região',
        icone: 'fas fa-store',
        labelEntidade: 'estabelecimento'
    });
}
