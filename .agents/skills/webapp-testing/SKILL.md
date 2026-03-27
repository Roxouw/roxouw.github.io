---
name: webapp-testing-lite
description: Use esta skill para validar rapidamente se alterações em landing pages e interfaces web quebraram comportamento, layout ou responsividade.
---

# Quando usar

Use esta skill quando:

- a página sofreu alterações em HTML, CSS ou JS
- a copy foi reorganizada
- novas seções foram inseridas
- houve mudanças em CTA, navbar, hero, cards ou FAQ
- for preciso validar se a landing continua funcional

# Objetivo

Executar uma verificação prática e objetiva da página após mudanças.

# O que verificar

1. carregamento da página
2. hero visível corretamente
3. CTA principal funcionando
4. menu e navegação
5. responsividade básica
6. sobreposição de elementos
7. cortes de texto
8. espaçamento entre seções
9. erros visuais óbvios
10. possíveis erros de JS

# Regras

- Reportar problemas de forma objetiva.
- Separar por severidade:
  - crítico
  - médio
  - leve
- Não inventar problema sem evidência.
- Priorizar problemas que afetam conversão e experiência mobile.

# Formato de saída

## Crítico

- CTA principal não está clicável no mobile

## Médio

- texto da headline quebra mal em telas menores
- card de bônus está desalinhado

## Leve

- espaçamento excessivo no final da seção FAQ

## Resumo

A página funciona, mas precisa de ajustes em responsividade e CTA mobile.
