<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.png">
    <img alt="Aerolambda Logo" src="assets/logo.png" width="300">
  </picture>
</p>

# 🚀 Aerolambda - High Performance & Lightweight API Boilerplate

O **Aerolambda** é um boilerplate minimalista e ultraleve para APIs e consumidores SQS rodando em AWS Lambda, desenvolvido com **TypeScript** e **Serverless Framework**.

Diferente de frameworks tradicionais como o Express, o **Aerolambda** foi desenhado para ser **nativo para Lambda**, garantindo pacotes extremamente pequenos, custos reduzidos e os menores tempos de *Cold Start*.

## 💡 Por que usar o Aerolambda?

### 📦 Ultraleve (Tiny Bundle Size)
O pacote de deploy gerado (`dist`) tem **menos de 200KB**.
- **Limite AWS Lambda**: 50MB (upload direto) / 250MB (descompactado).
- **Vantagem**: Enquanto frameworks pesados e `node_modules` gigantes podem facilmente estourar esses limites ou degradar a performance, o **Aerolambda** mantém seu projeto enxuto e escalável.

### 📊 Comparativo: Aerolambda vs Express
| Característica | Aerolambda | Express + serverless-http |
| :--- | :--- | :--- |
| **Tamanho do Bundle (aprox.)** | **~120 KB** | **~2 MB - 5 MB** |
| **Dependências de Core** | 0 (Nativo) | 30+ (Express ecosystem) |
| **Cold Start** | Ultrarápido (< 100ms) | Lento (Inércia de dependências) |
| **Complexidade** | Simples e Direta | Alta (Overhead de middleware) |

> [!NOTE]  
> Em Lambdas, **tamanho é performance**. Pacotes menores carregam mais rápido e custam menos.

### ⚡ Performance Superior & Cold Starts Mínimos
Ao evitar o overhead de roteadores pesados e middleware desnecessário, o **Aerolambda** sobe e responde muito mais rápido. É ideal para APIs que precisam de baixa latência.

### 🏗️ Arquitetura Limpa e Espelhada
Seguimos uma estrutura organizada que separa responsabilidades de forma clara:
```text
src/                        test/unit/
├── aws/                    ├── core/
├── core/                   ├── messages/
├── messages/               ├── routes/
├── routes/                 ├── services/
├── services/               └── repositories/
└── repositories/
```
Os testes espelham exatamente a estrutura do código-fonte, tornando a navegação intuitiva e a manutenção simples.

### 🛡️ Qualidade & Pipeline Pronto
O projeto já vem configurado com:
- **Jest**: Testes unitários com cobertura.
- **ESLint & Prettier**: Padronização de código.
- **GitHub Actions**: Pipeline de qualidade (lint, type-check, tests) e deploy automatizado via `serverless deploy`.

---

## 🚀 Como Começar

### Instalação
```bash
npm install
```

### Desenvolvimento Local (apenas HTTP)
```bash
npm run offline
```

### Desenvolvimento Local (HTTP + SQS)

Requer Docker para subir o ElasticMQ (SQS local):
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

---

## ⚡ Gerador de Código

O Aerolambda vem com um gerador que cria toda a estrutura necessária com um único comando.

### Nova rota CRUD

```bash
npm run generate route Product
```

Gera e registra automaticamente:
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

Gera e registra automaticamente:
```
src/messages/handlers/order-placed.handler.ts
test/unit/messages/order-placed.handler.test.ts
```

> O `MessageProcessor` roteia a mensagem pelo campo `"type"` do body. Adicionar um novo tipo de mensagem não exige nenhuma mudança de infraestrutura — apenas gere o handler e implemente a lógica.

---

## 🏛️ Arquitetura de Lambdas

O projeto provisiona **duas Lambdas independentes** via CloudFormation no deploy:

| Lambda | Trigger | Handler |
| :--- | :--- | :--- |
| `api` | HTTP API Gateway | `src/index.handler` |
| `sqsConsumer` | SQS (`MainQueue`) | `src/sqsHandler.handler` |

Cada Lambda escala de forma independente. A fila SQS (`MainQueue`) e sua DLQ são criadas automaticamente no deploy.

### Fluxo SQS

```
Mensagem SQS → { "type": "ORDER_PLACED", ... }
                          ↓
               sqsHandler → MessageProcessor
                          ↓
               orderPlacedHandler()
```

### Clientes AWS pré-configurados

```typescript
import { dynamodb, s3, sqs, ssm } from "./aws";
```

Todos os clientes suportam endpoints locais via variáveis de ambiente (`DYNAMODB_ENDPOINT`, `S3_ENDPOINT`, `SQS_ENDPOINT`) para uso com LocalStack e ElasticMQ.

---

## 🛠️ Stack Tecnológica
- **Linguagem**: TypeScript
- **Runtime**: Node.js 24.x
- **Infra**: Serverless Framework v3 + CloudFormation
- **AWS SDK**: v3 (DynamoDB, S3, SQS, SSM)
- **Testes**: Jest + ts-jest
- **Local**: serverless-offline + ElasticMQ + LocalStack

---
Desenvolvido para ser simples, eficiente e pronto para produção. 🚀
