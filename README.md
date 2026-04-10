<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.png">
    <img alt="Aerolambda Logo" src="assets/logo.png" width="300">
  </picture>
</p>

# Aerolambda - AWS Lambda Boilerplate

Boilerplate para construir APIs HTTP e consumidores SQS em AWS Lambda com **TypeScript** e **Serverless Framework**.

Sem frameworks web tradicionais — o roteamento HTTP e o dispatcher de mensagens são implementados nativamente, mantendo o projeto enxuto e direto ao ponto.

---

## Por que usar o Aerolambda?

### Sem overhead de framework web

Frameworks como Express foram projetados para servidores de longa duração. Em Lambda, cada invocação é isolada — carregar o ecossistema do Express (middleware, roteador, `serverless-http`) é custo sem benefício.

O Aerolambda implementa roteamento HTTP e dispatcher SQS nativamente, trazendo apenas o que a aplicação realmente precisa.

### Comparativo: Aerolambda vs Express

| | Aerolambda | Express + serverless-http |
| :--- | :--- | :--- |
| **Código da aplicação (`dist/`)** | ~220 KB | ~220 KB |
| **Dependências de framework** | Nenhuma | Express ecosystem (~2–5 MB) |
| **AWS SDK v3** | Incluído quando usado | Incluído quando usado |
| **Cold Start** | Menor (menos módulos para carregar) | Maior |
| **Flexibilidade** | Total | Limitada pelo Express |

> O tamanho final do pacote deployado depende de quais clientes AWS SDK você importar. Cada cliente (`@aws-sdk/client-s3`, `@aws-sdk/client-dynamodb` etc.) adiciona entre 1–5 MB ao bundle. Use apenas os que seu projeto precisar.

### Arquitetura de duas Lambdas independentes

O projeto provisiona duas Lambdas via CloudFormation:

| Lambda | Trigger | Handler |
| :--- | :--- | :--- |
| `api` | HTTP API Gateway | `src/index.handler` |
| `sqsConsumer` | SQS (`MainQueue`) | `src/sqsHandler.handler` |

Cada uma escala de forma independente, com timeout e memória configuráveis separadamente.

### Estrutura espelhada entre `src/` e `test/`

```text
src/                        test/unit/
├── aws/                    ├── core/
├── core/                   ├── messages/
├── messages/               ├── routes/
├── routes/                 ├── services/
├── services/               └── repositories/
└── repositories/
```

---

## Como Começar

### Instalação
```bash
npm install
```

### Desenvolvimento local (apenas HTTP)
```bash
npm run offline
```

### Desenvolvimento local (HTTP + SQS)

Requer Docker. Sobe ElasticMQ (SQS local) e LocalStack (DynamoDB, S3, SSM):
```bash
npm run offline:sqs
```

### Testes
```bash
npm test
```

### Deploy
```bash
npm run deploy
```

O deploy executa `serverless deploy`, que provisiona via CloudFormation toda a infraestrutura declarada no `serverless.yml`: Lambdas, filas SQS, DLQ, permissões IAM e variáveis de ambiente.

---

## Gerador de Código

Cria toda a estrutura necessária com um único comando — arquivos e registro automático no index.

### Nova rota CRUD

```bash
npm run generate route Product
```

Gera e registra:
```
src/core/models/Product.ts
src/repositories/ProductRepository.ts
src/services/ProductService.ts
src/routes/productRoutes.ts
test/unit/services/ProductService.test.ts
test/unit/repositories/ProductRepository.test.ts
```

### Novo handler SQS

```bash
npm run generate handler ORDER_PLACED
```

Gera e registra:
```
src/messages/handlers/order-placed.handler.ts
test/unit/messages/order-placed.handler.test.ts
```

O `MessageProcessor` roteia a mensagem pelo campo `"type"` do body. Adicionar um novo tipo de mensagem não exige nenhuma mudança de infraestrutura.

```
Mensagem SQS → { "type": "ORDER_PLACED", "orderId": "123" }
                          ↓
               sqsHandler → MessageProcessor
                          ↓
               orderPlacedHandler()
```

---

## Clientes AWS pré-configurados

```typescript
import { dynamodb, s3, sqs, ssm } from "./aws";
```

Todos os clientes suportam endpoints locais via variáveis de ambiente para uso com LocalStack e ElasticMQ:

| Variável | Cliente |
| :--- | :--- |
| `DYNAMODB_ENDPOINT` | DynamoDB Document Client |
| `S3_ENDPOINT` | S3 Client (path-style habilitado) |
| `SQS_ENDPOINT` | SQS Client |

Importe apenas os clientes que seu projeto usar para manter o bundle enxuto.

---

## Stack
- **Linguagem**: TypeScript
- **Runtime**: Node.js 24.x
- **Infra**: Serverless Framework v3 + CloudFormation
- **AWS SDK**: v3 (DynamoDB, S3, SQS, SSM)
- **Testes**: Jest + ts-jest
- **Qualidade**: ESLint + Prettier + GitHub Actions
- **Local**: serverless-offline + ElasticMQ + LocalStack
