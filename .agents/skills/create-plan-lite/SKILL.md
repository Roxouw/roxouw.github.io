---
name: create-plan-lite
description: Use esta skill para criar um plano curto, claro e executável antes de mudanças grandes no projeto.
---

# Quando usar

Use esta skill quando:

- a tarefa envolver várias etapas
- houver risco de quebrar layout, JS ou estrutura
- a solicitação estiver vaga
- a mudança afetar copy, layout e comportamento ao mesmo tempo
- a página precisar ser refatorada com segurança

# Objetivo

Criar um plano enxuto antes de executar mudanças, reduzindo retrabalho e evitando alterações desorganizadas.

# Formato do plano

O plano deve ser sempre curto e objetivo, contendo:

1. objetivo final
2. problemas encontrados
3. ordem das alterações
4. riscos técnicos
5. validação final

# Regras

- Não escrever plano longo demais.
- Não repetir a solicitação do usuário.
- Não listar tarefas irrelevantes.
- Priorizar ordem lógica de execução.
- Destacar se existe risco em CSS, JS, responsividade ou SEO.

# Exemplo de saída esperada

## Objetivo

Transformar a landing em funil de venda para curso de edição de vídeos.

## Problemas atuais

- promessa fraca no hero
- CTA pouco visível
- ausência de prova
- oferta pouco clara

## Ordem de execução

1. ajustar hero
2. criar seção de dores
3. estruturar oferta
4. inserir FAQ
5. revisar CTAs
6. validar mobile

## Riscos

- quebra de espaçamento
- conflito com classes existentes
- excesso de texto em telas pequenas

## Validação

- CTA acima da dobra
- copy mais escaneável
- sem regressão visual
