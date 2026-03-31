# Relatorio de Paginas para Obsidian

Esta pasta recebe arquivos gerados automaticamente pelo script:

```bash
node scripts/generate-obsidian-pages-report.js
```

Ou, se preferir pelo `npm`:

```bash
npm run report:pages
```

Estrutura:

- `00-indice.md`: visão geral e links internos
- `Mapa/`: hubs principais para navegar o projeto
- `Dashboard/`: visão executiva com Dataview e guia do grafo
- `paginas/*.md`: uma nota por página HTML do projeto
  analytics-tracking- `Decisoes/`: backlog, hipóteses e aprendizados
- `Operacao/`: sistema operacional, skills e checklist
- `hubs/`: agrupamentos por tipo e nicho
- `data/pages-report.json`: base estruturada para automações no Obsidian

Uso no Obsidian:

1. abra `obsidian/relatorio-paginas` como um vault separado; ou
2. copie/sincronize essa pasta para dentro do seu vault atual; ou
3. use `data/pages-report.json` com plugins como DataviewJS ou workflows próprios

Ponto de entrada sugerido:

- `Mapa/01-mapa-do-projeto.md`
- `Dashboard/01-dashboard-executivo.md` se o plugin Dataview estiver instalado
