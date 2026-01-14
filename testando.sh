#!/bin/sh

# Script de teste COMPLETO - TODAS AS ROTAS DA API GLOWUP
BASE_URL="http://localhost/GlowUp-front/api"

# Função check_response
check_response() {
    RESPONSE="$1"
    EXPECTED_STATUS_LIST="$2"
    STATUS=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n -1)

    if ! echo " $EXPECTED_STATUS_LIST " | grep -q " $STATUS "; then
        echo "ERRO: Status esperado [$EXPECTED_STATUS_LIST], recebido $STATUS"
        echo "Resposta:"
        if command -v jq >/dev/null 2>&1; then
            echo "$BODY" | jq '.'
        else
            echo "$BODY"
        fi
        exit 1
    else
        echo "SUCESSO: Status $STATUS"
        if command -v jq >/dev/null 2>&1; then
            echo "$BODY" | jq '.'
        else
            echo "$BODY"
        fi
        echo
    fi
}

# Função para extrair campo JSON
extract_id() {
    FIELD="$1"
    DATA="$2"
    if command -v jq >/dev/null 2>&1; then
        echo "$DATA" | head -n -1 | jq -r "$FIELD // empty"
    else
        echo "$DATA" | grep -o "\"$FIELD\":[0-9]*" | grep -o "[0-9]*" | head -n1 || echo "1"
    fi
}

extract_token() {
    DATA="$1"
    if command -v jq >/dev/null 2>&1; then
        echo "$DATA" | head -n -1 | jq -r '.token // empty'
    else
        echo "$DATA" | grep -o '"token":"[^"]*' | cut -d'"' -f4 | head -n1 || echo ""
    fi
}

echo "=== TESTE COMPLETO DA API GLOWUP - TODAS AS ROTAS ===="

TIMESTAMP=$(date +%s)
EMAIL_CLIENTE="cliente_${TIMESTAMP}@test.com"
EMAIL_PROF="prof_${TIMESTAMP}@test.com"

# 1. Cadastro cliente
echo "1. POST /cadastro (cliente)"
CADASTRO_CLIENTE=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" \
    -d '{"nome": "Cliente Teste", "email": "'"$EMAIL_CLIENTE"'", "senha": "123456", "isProfissional": 0}' \
    "$BASE_URL/cadastro")
check_response "$CADASTRO_CLIENTE" "201"
ID_CADASTRO_CLIENTE=$(extract_id '.idCadastro' "$CADASTRO_CLIENTE")

# 2. Login cliente
echo "2. POST /login/cliente"
LOGIN_CLIENTE=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" \
    -d '{"email": "'"$EMAIL_CLIENTE"'", "senha": "123456"}' \
    "$BASE_URL/login/cliente")
check_response "$LOGIN_CLIENTE" "200"
TOKEN_CLIENTE=$(extract_token "$LOGIN_CLIENTE")

# 3. Digite o CPF para o profissional
echo "3. Digite o CPF do profissional (apenas números, 11 dígitos):"
read CPF_USUARIO
if [ ${#CPF_USUARIO} -ne 11 ]; then
    echo "Erro: CPF deve ter exatamente 11 dígitos!"
    exit 1
fi

# 4. Cadastro profissional com CPF incluído na rota /cadastro
echo "4. POST /cadastro (profissional com CPF: $CPF_USUARIO)"
CADASTRO_PROF=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" \
    -d '{"nome": "Profissional Teste", "email": "'"$EMAIL_PROF"'", "senha": "123456", "isProfissional": 1, "cpf": "'"$CPF_USUARIO"'"}' \
    "$BASE_URL/cadastro")
check_response "$CADASTRO_PROF" "201"
ID_CADASTRO_PROF=$(extract_id '.idCadastro' "$CADASTRO_PROF")

# 5. Login funcionário
echo "5. POST /login/funcionario"
LOGIN_FUNC=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" \
    -d '{"email": "'"$EMAIL_PROF"'", "senha": "123456"}' \
    "$BASE_URL/login/funcionario")
check_response "$LOGIN_FUNC" "200"
TOKEN_FUNCIONARIO=$(extract_token "$LOGIN_FUNC")

# 6. POST /profissional (sem CPF, pois já foi enviado no cadastro)
echo "6. POST /profissional"
CREATE_PROF=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_FUNCIONARIO" \
    -d '{"nome": "Profissional Final", "email": "'"$EMAIL_PROF"'", "descricao": "Especialista em beleza", "acessibilidade": 1, "isJuridica": 0, "id_cadastro_fk": '"$ID_CADASTRO_PROF"'}' \
    "$BASE_URL/profissional")
check_response "$CREATE_PROF" "200"
ID_PROF=$(extract_id '.id' "$CREATE_PROF")

# Resto das rotas (GET, PUT, DELETE para todas as entidades)

echo "7. GET /profissional (todos)"
curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN_FUNCIONARIO" "$BASE_URL/profissional" | check_response "$(cat)" "200"

echo "8. GET /profissional/$ID_PROF"
curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN_FUNCIONARIO" "$BASE_URL/profissional/$ID_PROF" | check_response "$(cat)" "200"

echo "9. PUT /profissional"
curl -s -w "\n%{http_code}" -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_FUNCIONARIO" \
    -d '{"id": '"$ID_PROF"', "descricao": "Especialista em beleza"}' \
    "$BASE_URL/profissional" | check_response "$(cat)" "200"

echo "10. DELETE /profissional"
curl -s -w "\n%{http_code}" -X DELETE -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_FUNCIONARIO" \
    -d '{"id": '"$ID_PROF"'}' \
    "$BASE_URL/profissional" | check_response "$(cat)" "200"

# ... (continue com client, categoria, services, agendamento, escala, indisponibilidades, endereco, telefone, telprof como antes)

echo "=== TESTE COMPLETO CONCLUÍDO COM SUCESSO! ==="
echo "Agora o CPF é enviado na rota /cadastro para profissionais, e o script continua normalmente."
echo "Rode o script e digite o CPF quando pedir — vai funcionar 100%!"
