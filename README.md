<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.png">
    <img alt="Aerolambda Logo" src="assets/logo.png" width="300">
  </picture>
</p>

# 🚀 Aerolambda - High Performance & Lightweight API Boilerplate

O **Aerolambda** é um boilerplate minimalista e ultraleve para APIs rodando em AWS Lambda, desenvolvido com **TypeScript** e **Serverless Framework**. 

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
src/                      test/unit/
├── core/                 ├── core/
├── routes/               ├── routes/
├── services/             ├── services/
└── repositories/         └── repositories/
```
Os testes espelham exatamente a estrutura do código-fonte, tornando a navegação intuitiva e a manutenção simples.

### 🛡️ Qualidade & Pipeline Pronto
O projeto já vem configurado com:
- **Jest**: Testes unitários com cobertura.
- **ESLint & Prettier**: Padronização de código.
- **GitHub Actions**: Pipeline de qualidade (lint, type-check, tests) e deploy automatizado.

---

## 🚀 Como Começar

### Instalação
```bash
npm install
```

### Desenvolvimento Local
```bash
npm run offline
```

### Testes
```bash
npm test
```

### Deploy
```bash
npm run deploy
```

## 🛠️ Stack Tecnológica
- **Linguagem**: TypeScript
- **Runtime**: Node.js 24.x
- **Infra**: Serverless Framework
- **Testes**: Jest + ts-jest

---
Desenvolvido para ser simples, eficiente e pronto para produção. 🚀
