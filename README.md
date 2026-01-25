# ⚽ Clubs Tracker

Aplicação web para visualização de estatísticas de Clubes Pro no **EA Sports FC 26**.

Pesquise clubes, veja estatísticas detalhadas de jogadores, histórico de partidas, compare membros do elenco e acompanhe seus clubes favoritos — tudo com suporte a Português e Inglês.

<!-- TODO: Adicionar screenshot da página inicial -->

## ✨ Funcionalidades

- 🔍 **Busca de Clubes** — Pesquise clubes pelo nome em diferentes plataformas (PS5, PS4, Switch)
- 📊 **Estatísticas Detalhadas** — Visualize stats completas do clube e de cada jogador
- 📜 **Histórico de Partidas** — Acompanhe os últimos jogos com detalhes de cada partida
- 👥 **Comparação de Jogadores** — Compare estatísticas entre membros do elenco
- ⭐ **Favoritos** — Salve seus clubes favoritos para acesso rápido
- 🏆 **Sala de Troféus** — Veja conquistas e títulos do clube
- 🌐 **Internacionalização** — Interface disponível em Português (PT) e Inglês (EN)
- 🌙 **Tema Escuro** — Design moderno com tema dark por padrão

## 🛠️ Tecnologias

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| [Next.js](https://nextjs.org/) | 16 | Framework React com App Router |
| [React](https://react.dev/) | 19 | Biblioteca de UI |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Tipagem estática |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Framework de estilização |
| [ESLint](https://eslint.org/) | 9 | Linting de código |

## 🚀 Começando

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18.17 ou superior
- npm, yarn, pnpm ou bun

### Instalação

```bash
# Clone o repositório
git clone https://github.com/thealfredohenrique/clubs-tracker.git
cd clubs-tracker

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

### Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run start` | Inicia servidor de produção |
| `npm run lint` | Executa o ESLint |

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (páginas e layouts)
│   ├── page.tsx            # Página inicial (busca)
│   ├── layout.tsx          # Layout principal
│   ├── club/[clubId]/      # Página de detalhes do clube
│   ├── compare/            # Página de comparação de jogadores
│   └── debug/              # Página de debug (desenvolvimento)
│
├── components/             # Componentes React reutilizáveis
│   ├── ClubHeader.tsx      # Cabeçalho com stats do clube
│   ├── ClubRoster.tsx      # Lista de jogadores do elenco
│   ├── MatchHistory.tsx    # Histórico de partidas
│   ├── SearchForm.tsx      # Formulário de busca
│   └── ...
│
├── hooks/                  # Custom hooks
│   └── useFavorites.ts     # Hook para gerenciar favoritos
│
├── lib/                    # Utilitários e configurações
│   ├── api-client.ts       # Cliente da API da EA
│   ├── ea-assets.ts        # URLs de assets (escudos, kits)
│   └── i18n.tsx            # Sistema de internacionalização
│
├── types/                  # Definições de tipos TypeScript
│   └── clubs-api.ts        # Tipos da API da EA
│
docs/
└── clubs-api.md            # Documentação da API da EA
```

## 🔌 Arquitetura da API

### ⚠️ Importante: Client-Side Only

**Todas as chamadas à API da EA devem ser feitas no navegador (client-side).**

A EA bloqueia IPs de servidores (Vercel, Cloudflare, etc.), então usamos um proxy CORS para fazer as requisições diretamente do browser do usuário:

```
Navegador → corsproxy.io → proclubs.ea.com/api/fc → JSON
```

### Fluxo de Dados

```typescript
// src/lib/api-client.ts

// Todas as funções usam fetchFromEA<T>() que retorna ApiResult<T>
const result = await searchClub('common-gen5', 'Nome do Clube');

if (result.success) {
  console.log(result.data); // Dados tipados
} else {
  console.error(result.error); // Erro tratado
}
```

### Plataformas Suportadas

| Valor | Plataforma |
|-------|------------|
| `common-gen5` | PlayStation 5 / Xbox Series X\|S / PC |
| `common-gen4` | PlayStation 4 / Xbox One |
| `nx` | Nintendo Switch |

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja como você pode ajudar:

### Adicionando um Novo Componente

1. Crie o arquivo em `src/components/NomeDoComponente.tsx`
2. Exporte via barrel export em `src/components/index.ts`
3. Use a estrutura padrão com seções comentadas:

```typescript
'use client';

import { useState } from 'react';

// ============================================
// TYPES
// ============================================

interface Props {
  // ...
}

// ============================================
// CONSTANTS
// ============================================

const SOME_CONSTANT = 'value';

// ============================================
// HELPER FUNCTIONS
// ============================================

function helperFunction() {
  // ...
}

// ============================================
// COMPONENT
// ============================================

export function NomeDoComponente({ prop }: Props) {
  return <div>...</div>;
}
```

### Adicionando um Novo Endpoint da API

1. Adicione os tipos de resposta em `src/types/clubs-api.ts`
2. Crie a função em `src/lib/api-client.ts` usando `fetchFromEA<T>()`
3. Documente o endpoint em `docs/clubs-api.md`

```typescript
// src/lib/api-client.ts

export async function novoEndpoint(
  platform: Platform,
  clubId: string
): Promise<ApiResult<NovoTipo>> {
  return fetchFromEA<NovoTipo>('/novo/endpoint', {
    platform,
    clubId,
  });
}
```

### Adicionando Traduções

Adicione as novas strings em `src/lib/i18n.tsx` em ambos os objetos `pt` e `en`:

```typescript
const translations = {
  pt: {
    novaSecao: {
      novaChave: 'Texto em português',
    },
  },
  en: {
    novaSecao: {
      novaChave: 'Text in English',
    },
  },
};
```

Use no componente:

```typescript
const { t } = useTranslation();
<span>{t.novaSecao.novaChave}</span>
```

### Padrões de Código

- **Imports**: Use barrel exports `import { X, Y } from '@/components'`
- **Componentes client**: Marque com `'use client'` quando usar hooks/estado
- **Estilização**: Tailwind CSS, tema escuro (gray-950), acentos emerald/cyan
- **Dados da EA**: Sempre parse strings para números: `parseInt(value, 10) || 0`

## 📚 Documentação Adicional

- [Documentação da API da EA](docs/clubs-api.md) — Endpoints, parâmetros e exemplos de resposta

## 📄 Licença

Este projeto é open source e está disponível sob a [MIT License](LICENSE).

---

Feito com ⚽ para a comunidade de Pro Clubs
