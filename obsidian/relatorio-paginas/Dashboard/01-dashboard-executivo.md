---
titulo: "Dashboard Executivo"
gerado_em: "2026-03-31T02:30:26.345Z"
tags: ["relatorio-paginas", "dashboard"]
---

# Dashboard Executivo

> Requer o plugin Dataview para renderizar as tabelas e listas abaixo.

## Navegacao

- [[Mapa/01-mapa-do-projeto|Mapa do Projeto]]
- [[Mapa/02-mapa-de-paginas|Mapa de Paginas]]
- [[Decisoes/01-backlog-cro|Backlog CRO]]
- [[Dashboard/02-guia-do-grafo|Guia do Grafo]]

## Paginas por prioridade operacional

```dataview
TABLE tipo as "Tipo", nicho as "Nicho", secoes as "Seções", ctas as "CTAs"
FROM "paginas"
SORT ctas DESC, secoes DESC
```

## Landing pages de nicho

```dataview
TABLE nicho as "Nicho", ctas as "CTAs", palavras as "Palavras"
FROM "paginas"
WHERE tipo = "landing-de-nicho"
SORT nicho ASC
```

## Paginas com alertas

```dataview
TABLE alertas as "Alertas", tipo as "Tipo", nicho as "Nicho"
FROM "paginas"
WHERE alertas > 0
```

## Paginas mais densas

```dataview
TABLE palavras as "Palavras", secoes as "Seções", ctas as "CTAs"
FROM "paginas"
SORT palavras DESC
```

## Notas operacionais

```dataview
LIST
FROM "Decisoes" OR "Operacao"
SORT file.name ASC
```
