# AGENTS.md

## Objetivo do projeto
Este projeto é a landing principal da Rosso Labs.
O objetivo é gerar mais pedidos de orçamento para criação de sites e landing pages para empresas e autônomos.

## Prioridade máxima
Toda alteração deve priorizar:
1. conversão
2. clareza da oferta
3. prova/credibilidade
4. experiência mobile
5. estabilidade técnica

Estética vem depois. Mudança bonita que piora clareza, CTA ou desempenho não é melhoria.

## Resultado esperado da página
A página deve fazer o visitante:
- entender em poucos segundos o que a Rosso Labs oferece
- perceber valor e profissionalismo
- confiar nos projetos e na execução
- clicar em CTA de orçamento, WhatsApp ou modelos/preços

## O que preservar sempre
- Estrutura principal de navegação, hero, vitrine visual, serviços, projetos, banner comercial, contato e modal de nicho
- Classes, IDs e ganchos usados por CSS e JavaScript
- Responsividade
- Fluxo do menu mobile
- Modal de nicho
- Toggle de tema
- Intro/animações só se não prejudicarem conversão e performance
- Scripts existentes em `/assets/js/`

## O que evitar
- Não transformar a página em portfólio frio
- Não encher a landing de texto institucional
- Não esconder CTA principal
- Não adicionar bibliotecas sem necessidade forte
- Não refatorar HTML inteiro sem motivo claro
- Não trocar nomes de classes ou IDs sem verificar impacto
- Não quebrar âncoras existentes
- Não criar copy genérica tipo “soluções inovadoras” ou “presença digital de excelência”

## Direção de copy
A copy deve ser:
- direta
- profissional
- comercial
- clara
- escaneável
- orientada a benefício

A copy deve enfatizar:
- geração de contato
- clareza da mensagem
- confiança
- rapidez de entrega
- atendimento direto
- estrutura pensada para conversão

## CTAs
Priorizar CTAs objetivos, como:
- Ver modelos e preços
- Pedir orçamento
- Falar no WhatsApp
- Quero meu site agora

Evitar CTAs fracos, vagos ou institucionais.

## Hierarquia da página
Ao revisar a página, preservar ou melhorar esta lógica:
1. promessa comercial no hero
2. CTA visível acima da dobra
3. prova rápida de valor
4. vitrine visual / projetos
5. explicação da abordagem
6. serviços
7. cases com contexto comercial
8. reforço de urgência e perda
9. fechamento com CTA forte

## Regras para mudanças
Antes de mudanças grandes:
- resumir o problema atual
- explicar o que será alterado
- apontar risco técnico
- executar em etapas pequenas

Em mudanças de copy:
- melhorar sem aumentar texto desnecessariamente
- manter boa leitura no mobile
- evitar repetição excessiva
- reforçar promessa, prova e ação

Em mudanças de layout:
- preservar semântica
- preservar acessibilidade básica
- preservar performance
- não piorar CLS, carregamento ou leitura

## Prova e credibilidade
Sempre que possível, reforçar:
- projetos publicados
- foco comercial dos cases
- atendimento direto
- prazo de entrega
- diferenciais práticos
- CTA para contato imediato

Nunca reduzir prova social/visual sem colocar algo melhor no lugar.

## Mobile first
Toda alteração deve ser pensada primeiro para mobile.
Verificar sempre:
- headline quebrando bem
- CTA visível cedo
- botões clicáveis
- cards sem overflow
- textos sem blocos longos demais
- espaçamento consistente
- menu mobile funcionando

## SEO e descoberta
Preservar e melhorar quando fizer sentido:
- title
- meta description
- headings
- Open Graph
- schema
- links internos
- texto com intenção comercial real

Não mudar SEO técnico sem necessidade.

## JavaScript e comportamento
Antes de alterar HTML, verificar impacto em:
- `analytics.js`
- `index.js`
- `transitions.js`
- `mobile-fix.js`

Se houver risco de quebrar comportamento, preferir mudanças menores e compatíveis.

## Como decidir se algo é melhoria
Uma mudança só é considerada melhoria se fizer pelo menos um destes:
- deixar a oferta mais clara
- aumentar confiança
- facilitar contato
- melhorar leitura
- melhorar experiência mobile
- reduzir distração
- reforçar conversão

## Checklist antes de concluir
- Hero continua forte?
- CTA principal continua visível acima da dobra?
- A oferta está clara?
- A página parece mais venda do que portfólio?
- Os cases continuam ajudando a vender?
- O WhatsApp continua fácil de acessar?
- O modal de nicho continua funcionando?
- O mobile continua bom?
- Algum ID, classe ou script foi afetado?
- O resultado final está mais comercial do que antes?

## Formato de entrega esperado
Ao final de cada tarefa, informar:
1. o que foi alterado
2. por que isso melhora a conversão
3. qualquer risco técnico
4. o que ainda pode ser otimizado depois