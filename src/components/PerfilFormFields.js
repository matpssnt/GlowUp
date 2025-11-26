// Funções para criar campos do formulário de perfil

// Cria campos pessoais (nome, sobrenome, email, senha)
export function createPersonalFields(nome = '', sobrenome = '', email = '') {
    return `
        <div class="mb-4">
            <h4 class="mb-3">Informações Pessoais</h4>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="nome" class="form-label">Nome *</label>
                    <input 
                        type="text" 
                        class="form-control" 
                        id="nome" 
                        name="nome" 
                        value="${nome}"
                        required
                    >
                </div>
                <div class="col-md-6 mb-3">
                    <label for="sobrenome" class="form-label">Sobrenome *</label>
                    <input 
                        type="text" 
                        class="form-control" 
                        id="sobrenome" 
                        name="sobrenome" 
                        value="${sobrenome}"
                        required
                    >
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="email" class="form-label">Email *</label>
                    <input 
                        type="email" 
                        class="form-control" 
                        id="email" 
                        name="email" 
                        value="${email}"
                        required
                    >
                </div>
                <div class="col-md-6 mb-3">
                    <label for="senha" class="form-label">Nova Senha (opcional)</label>
                    <input 
                        type="password" 
                        class="form-control" 
                        id="senha" 
                        name="senha" 
                        placeholder="Deixe em branco para manter a senha atual"
                    >
                    <small class="form-text text-muted">Mínimo de 6 caracteres</small>
                </div>
            </div>
        </div>
    `;
}

// Cria campos de endereço (estrutura igual ao contRegister)
export function createAddressFields() {
    return `
        <div class="mb-4">
            <h4 class="mb-3">Endereço</h4>
            <div class="row">
                <div class="col-md-4 mb-3">
                    <label for="cep" class="form-label">CEP *</label>
                    <div class="input-group">
                        <input 
                            type="text" 
                            class="form-control" 
                            id="cep" 
                            name="cep" 
                            placeholder="00000-000"
                            maxlength="9"
                            required
                        >
                        <button 
                            type="button" 
                            class="btn btn-outline-secondary" 
                            id="btnBuscarCep"
                        >
                            <i class="bi bi-search"></i> Buscar
                        </button>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <label for="estado" class="form-label">Estado *</label>
                    <select 
                        class="form-select" 
                        id="estado" 
                        name="estado" 
                        required
                    >
                        <option value="">Selecione</option>
                        <option value="AC">Acre</option>
                        <option value="AL">Alagoas</option>
                        <option value="AP">Amapá</option>
                        <option value="AM">Amazonas</option>
                        <option value="BA">Bahia</option>
                        <option value="CE">Ceará</option>
                        <option value="DF">Distrito Federal</option>
                        <option value="ES">Espírito Santo</option>
                        <option value="GO">Goiás</option>
                        <option value="MA">Maranhão</option>
                        <option value="MT">Mato Grosso</option>
                        <option value="MS">Mato Grosso do Sul</option>
                        <option value="MG">Minas Gerais</option>
                        <option value="PA">Pará</option>
                        <option value="PB">Paraíba</option>
                        <option value="PR">Paraná</option>
                        <option value="PE">Pernambuco</option>
                        <option value="PI">Piauí</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="RN">Rio Grande do Norte</option>
                        <option value="RS">Rio Grande do Sul</option>
                        <option value="RO">Rondônia</option>
                        <option value="RR">Roraima</option>
                        <option value="SC">Santa Catarina</option>
                        <option value="SP">São Paulo</option>
                        <option value="SE">Sergipe</option>
                        <option value="TO">Tocantins</option>
                    </select>
                </div>
                <div class="col-md-4 mb-3">
                    <label for="cidade" class="form-label">Cidade *</label>
                    <input 
                        type="text" 
                        class="form-control" 
                        id="cidade" 
                        name="cidade" 
                        required
                    >
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="bairro" class="form-label">Bairro *</label>
                    <input 
                        type="text" 
                        class="form-control" 
                        id="bairro" 
                        name="bairro" 
                        required
                    >
                </div>
                <div class="col-md-4 mb-3">
                    <label for="rua" class="form-label">Rua *</label>
                    <input 
                        type="text" 
                        class="form-control" 
                        id="rua" 
                        name="rua" 
                        required
                    >
                </div>
                <div class="col-md-2 mb-3">
                    <label for="numero" class="form-label">Número *</label>
                    <input 
                        type="text" 
                        class="form-control" 
                        id="numero" 
                        name="numero" 
                        required
                    >
                </div>
            </div>
            <div class="row">
                <div class="col-md-12 mb-3">
                    <label for="complemento" class="form-label">Complemento</label>
                    <input 
                        type="text" 
                        class="form-control" 
                        id="complemento" 
                        name="complemento" 
                        placeholder="Apto, Bloco, etc."
                    >
                </div>
            </div>
        </div>
    `;
}

// Cria campos de contato (telefone)
export function createContactFields() {
    return `
        <div class="mb-4">
            <h4 class="mb-3">Contato</h4>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="telefone" class="form-label">Telefone</label>
                    <input 
                        type="text" 
                        class="form-control" 
                        id="telefone" 
                        name="telefone" 
                        placeholder="(00) 00000-0000"
                    >
                </div>
            </div>
        </div>
    `;
}
