# API de Universidades com NestJS

Esta API consome a [API de domínios universitários](https://github.com/Hipo/university-domains-list-api) e disponibiliza endpoints para buscar informações sobre universidades ao redor do mundo.

## Recursos implementados

- Busca de universidades por nome, país e domínio
- Cache para melhorar performance e reduzir chamadas à API externa
- Documentação Swagger para facilitar o uso da API
- Tratamento de erros para melhorar a experiência do usuário

## Pré-requisitos

- Node.js (v14 ou superior)
- npm ou yarn
- Git (opcional, para clonar o repositório)

## Configuração do ambiente

### 1. Clone o repositório ou crie um novo projeto

```bash
# Opção 1: Clonar o repositório (se você já tem um repositório existente)
git clone <seu-repositorio>
cd university-api

# Opção 2: Criar um novo projeto com NestJS CLI
npm i -g @nestjs/cli
nest new university-api
cd university-api
```

### 2. Instalar dependências necessárias

```bash
npm install axios @nestjs/swagger swagger-ui-express @nestjs/cache-manager cache-manager
```

### 3. Estrutura do projeto

Certifique-se que seu projeto siga esta estrutura de diretórios:

```
university-api/
├── src/
│   ├── university/
│   │   ├── dto/
│   │   │   └── university.dto.ts    # DTOs com decoradores Swagger
│   │   ├── university.controller.ts # Controladores com decoradores Swagger
│   │   ├── university.service.ts    # Serviços com implementação de cache
│   │   └── university.module.ts     # Módulo com configuração de cache
│   ├── app.module.ts                # Módulo principal da aplicação
│   └── main.ts                      # Configuração do Swagger
└── package.json                     # Dependências do projeto
```

Crie os diretórios necessários caso não existam:

```bash
mkdir -p src/university/dto
```

### 4. Configurar os arquivos do projeto

Copie os códigos fornecidos para cada arquivo correspondente na estrutura do projeto. Preste atenção especial às seguintes configurações:

- **main.ts**: Contém a configuração do Swagger
- **university.module.ts**: Contém a configuração do cache
- **university.service.ts**: Implementa a lógica de cache para as requisições
- **university.controller.ts**: Adiciona os decoradores do Swagger

## Executando a aplicação

### Modo de desenvolvimento

```bash
# Iniciar o servidor em modo de desenvolvimento com hot-reload
npm run start:dev
```

### Modo de produção

```bash
# Compilar o projeto
npm run build

# Iniciar em modo de produção
npm run start:prod
```

### Usando Docker (opcional)

Se preferir usar Docker, você pode construir e executar a aplicação em um contêiner:

```bash
# Construir a imagem Docker
docker build -t university-api .

# Executar o contêiner
docker run -p 3000:3000 university-api
```

## Acessando a aplicação

Após iniciar o servidor:

- A API estará disponível em: http://localhost:3000
- A documentação Swagger estará disponível em: http://localhost:3000/api

## Endpoints disponíveis

### 1. Obter todas as universidades
```
GET /universities
```

### 2. Busca flexível (usando qualquer combinação de parâmetros)
```
GET /universities/search?name=&country=&domain=
```

### 3. Buscar universidades por nome
```
GET /universities/search/name?name=Harvard
```

### 4. Buscar universidades por país
```
GET /universities/search/country?country=Brazil
```
**Observação**: Use o nome do país em inglês (Brazil, United States, etc.)

### 5. Buscar universidades por domínio
```
GET /universities/search/domain?domain=harvard.edu
```

## Exemplos de uso

### Buscar universidades com "technology" no nome:
```
GET http://localhost:3000/universities/search/name?name=technology
```

### Buscar universidades do Brasil:
```
GET http://localhost:3000/universities/search/country?country=Brazil
```

### Buscar universidades com domínio específico:
```
GET http://localhost:3000/universities/search/domain?domain=edu.br
```

## Monitoramento do cache

Para verificar se o cache está funcionando corretamente, você pode observar o tempo de resposta das requisições:

1. Faça uma primeira requisição a qualquer endpoint
2. Faça a mesma requisição novamente
3. A segunda requisição deve ser significativamente mais rápida

## Testando a API pelo Swagger

A interface do Swagger permite testar todos os endpoints da API diretamente do navegador:

1. Acesse http://localhost:3000/api
2. Escolha um dos endpoints disponíveis
3. Clique em "Try it out"
4. Preencha os parâmetros necessários
5. Clique em "Execute"
6. Veja a resposta da API

## Tipos de Testes Implementados

### Testes Unitários

Os testes unitários focam em testar componentes individuais (principalmente serviços) isoladamente de suas dependências externas. Usamos mocks para simular dependências como o cache e chamadas HTTP.

Arquivo principal: `src/university/university.service.spec.ts`

Estes testes verificam:
- O correto funcionamento do mecanismo de cache
- As chamadas para a API externa
- O tratamento adequado de erros
- A transformação de dados recebidos

### Testes E2E (End-to-End)

Os testes E2E testam o sistema como um todo, incluindo a integração entre controllers, serviços e a camada HTTP. Eles simulam requisições reais à API.

Arquivo principal: `test/university.e2e-spec.ts`

Estes testes verificam:
- As respostas HTTP corretas (status codes)
- O formato correto dos dados retornados
- A integração entre controllers e serviços
- A validação de parâmetros

## Executando os Testes

### Testes Unitários

```bash
# Executar todos os testes unitários
npm run test

# Executar com watch mode (útil durante o desenvolvimento)
npm run test:watch

# Gerar relatório de cobertura
npm run test:cov
```

### Testes E2E

```bash
# Executar testes E2E
npm run test:e2e
```

## Relatório de Cobertura

Ao executar `npm run test:cov`, um relatório de cobertura será gerado na pasta `coverage/`. Você pode abrir o arquivo `coverage/lcov-report/index.html` em um navegador para visualizar detalhes.

O relatório mostra:
- Porcentagem de linhas cobertas
- Porcentagem de branches cobertas
- Porcentagem de funções cobertas
- Visualização de quais linhas específicas não estão cobertas
