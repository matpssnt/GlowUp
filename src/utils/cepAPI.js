/**
 * API busca de CEP usando Brasil API
 * @see https://brasilapi.com.br/docs
 */

export class CepAPI {
    constructor() {
        this.baseURL = 'https://brasilapi.com.br/api/cep/v1';
    }

    /**
     * Busca informações do CEP
     * @param {string} cep - CEP a ser buscado
     * @returns {Promise<Object>} Dados do endereço
     */
    async buscarCep(cep) {
        try {
            // Remove caracteres não numéricos
            const cepLimpo = cep.replace(/\D/g, '');
            
            // Valida formato do CEP
            if (!/^\d{8}$/.test(cepLimpo)) {
                throw new Error('CEP deve ter 8 dígitos');
            }

            // Faz a requisição para a API
            const response = await fetch(`${this.baseURL}/${cepLimpo}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('CEP não encontrado');
                }
                throw new Error(`Erro na API: ${response.status}`);
            }

            const dados = await response.json();
            return dados;

        } catch (error) {
            // Erro ao buscar CEP
            throw error;
        }
    }

    /**
     * Formata CEP para exibição
     * @param {string} cep - CEP a ser formatado
     * @returns {string} CEP formatado (00000-000)
     */
    formatarCep(cep) {
        const cepLimpo = cep.replace(/\D/g, '');
        if (cepLimpo.length === 8) {
            return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
        }
        return cepLimpo;
    }

    /**
     * Preenche campos de endereço automaticamente
     * @param {Object} dadosCep - Dados retornados pela API
     * @param {Object} campos - Objeto com IDs dos campos do formulário
     */
    preencherEndereco(dadosCep, campos = {}) {
        
        const camposPadrao = {
            city: 'cidade',
            neighborhood: 'bairro',
            street: 'rua',
            state: 'estado'
        };

        const camposFinais = { ...camposPadrao, ...campos };

        // Preenche cada campo se existir
        Object.keys(camposFinais).forEach(campo => {
            const elemento = document.getElementById(camposFinais[campo]);
            
            if (elemento && dadosCep[campo]) {
                elemento.value = dadosCep[campo];
            }
        });
    }

    /**
     * Busca CEP e preenche automaticamente os campos
     * @param {string} cep - CEP a ser buscado
     * @param {Object} campos - Mapeamento de campos
     * @param {Function} callback - Callback para tratamento de erro
     * @returns {Promise<Object>} Dados do endereço
     */
    async buscarEPreencher(cep, campos = {}, callback = null) {
        try {
            const dados = await this.buscarCep(cep);
            this.preencherEndereco(dados, campos);
            
            // Callback de sucesso
            if (callback && typeof callback.success === 'function') {
                callback.success(dados);
                
                document.getElementById('rua').readOnly = true;
                document.getElementById('cidade').readOnly = true;
                document.getElementById('bairro').readOnly = true;
                document.getElementById('estado').readOnly = true;
            }

            return dados;

        } catch (error) {
            // Callback de erro
            if (callback && typeof callback.error === 'function') {
                callback.error(error);
            } else {
                // Tratamento padrão de erro
                this.mostrarErro(error.message);
            }
            throw error;
        }
    }

    /**
     * Mostra mensagem de erro para o usuário
     * @param {string} mensagem - Mensagem de erro
     */
    mostrarErro(mensagem) {
        // Cria ou atualiza elemento de erro
        let elementoErro = document.getElementById('cep-erro');
        
        if (!elementoErro) {
            elementoErro = document.createElement('div');
            elementoErro.id = 'cep-erro';
            elementoErro.className = 'alert alert-danger mt-2';
            elementoErro.style.fontSize = '0.875rem';
            
            // Insere após o campo CEP
            const campoCep = document.getElementById('cep');
            if (campoCep) {
                campoCep.parentNode.insertBefore(elementoErro, campoCep.nextSibling);
            }
        }

        elementoErro.textContent = mensagem;
        elementoErro.style.display = 'block';

        // Remove erro após 5 segundos
        setTimeout(() => {
            if (elementoErro) {
                elementoErro.style.display = 'none';
            }
        }, 5000);
    }

    /**
     * Remove mensagem de erro
     */
    removerErro() {
        const elementoErro = document.getElementById('cep-erro');
        if (elementoErro) {
            elementoErro.style.display = 'none';
        }
    }
}

// Exporta instância padrão
export default new CepAPI();
