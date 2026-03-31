"use strict";

const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const outputRoot = path.join(projectRoot, "obsidian", "relatorio-paginas");
const pagesOutputDir = path.join(outputRoot, "paginas");
const dataOutputDir = path.join(outputRoot, "data");
const skillsOutputDir = path.join(outputRoot, "skills");
const hubsOutputDir = path.join(outputRoot, "hubs");
const mapaOutputDir = path.join(outputRoot, "Mapa");
const decisoesOutputDir = path.join(outputRoot, "Decisoes");
const operacaoOutputDir = path.join(outputRoot, "Operacao");
const dashboardOutputDir = path.join(outputRoot, "Dashboard");

const usedSkills = [
  {
    name: "rosso-project-memory",
    type: "projeto",
    purpose:
      "Memoria operacional da Rosso Labs para preservar conversao, compatibilidade com HTML, CSS e JavaScript existente e prioridades do projeto.",
    source: ".agents/skills/rosso-project-memory/SKILL.md",
  },
  {
    name: "create-plan-lite",
    type: "processo",
    purpose:
      "Planejamento curto antes de mudancas maiores, com foco em risco tecnico, ordem de execucao e validacao final.",
    source: ".agents/skills/create-plan-lite/SKILL.md",
  },
];

const htmlFiles = [
  "index.html",
  "historia.html",
  ...fs
    .readdirSync(path.join(projectRoot, "pages"))
    .filter((file) => file.endsWith(".html"))
    .map((file) => path.join("pages", file)),
];

const entityMap = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

const ensureDir = (dir) => {
  fs.mkdirSync(dir, { recursive: true });
};

const readFile = (relativePath) => {
  const absolutePath = path.join(projectRoot, relativePath);

  return fs.readFileSync(absolutePath, "utf8");
};

const normalizeWhitespace = (value) => value.replace(/\s+/g, " ").trim();

const decodeHtml = (value) =>
  value.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (entity) => entityMap[entity] || entity);

const stripTags = (value) =>
  normalizeWhitespace(
    decodeHtml(
      value
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]+>/g, " ")
    )
  );

const getFirstMatch = (content, regex) => {
  const match = content.match(regex);
  return match?.[1] ? normalizeWhitespace(match[1]) : "";
};

const getAllMatches = (content, regex, mapper) => {
  return Array.from(content.matchAll(regex), mapper).filter(Boolean);
};

const getAttribute = (tagAttributes, attributeName) => {
  const regex = new RegExp(`${attributeName}=["']([^"']+)["']`, "i");
  return tagAttributes.match(regex)?.[1] || "";
};

const slugify = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const hubPath = (group, slug) => `hubs/${group}-${slug}`;
const pageNotePath = (slug) => `paginas/${slug}`;
const mapaPath = (slug) => `Mapa/${slug}`;
const decisoesPath = (slug) => `Decisoes/${slug}`;
const operacaoPath = (slug) => `Operacao/${slug}`;
const dashboardPath = (slug) => `Dashboard/${slug}`;

const classifyPage = (relativePath, title) => {
  if (relativePath === "index.html") return "home";
  if (relativePath === "historia.html") return "institucional";
  if (relativePath.startsWith("pages/sitePara")) return "landing-de-nicho";

  if (relativePath.startsWith("pages/")) {
    if (/rosso labs/i.test(title)) {
      return "pagina-de-apoio";
    }

    return "demo-de-cliente";
  }

  return "pagina";
};

const inferNiche = (relativePath, title) => {
  const source = `${relativePath} ${title}`.toLowerCase();

  if (source.includes("advogado")) return "advogado";
  if (source.includes("dentista") || source.includes("odont")) return "dentista";
  if (source.includes("nutric")) return "nutricionista";
  if (source.includes("academia")) return "academia";
  if (source.includes("personal")) return "personal";
  if (source.includes("empresa")) return "empresa";

  return "";
};

const inferGoal = (pageType, niche) => {
  if (pageType === "home") {
    return "Captar pedidos de orcamento para sites e landing pages da Rosso Labs.";
  }

  if (pageType === "institucional") {
    return "Reforcar credibilidade, trajetoria e confianca da marca.";
  }

  if (pageType === "landing-de-nicho") {
    return `Captar pedidos de orcamento para o nicho ${niche || "especifico"}.`;
  }

  if (pageType === "demo-de-cliente") {
    return `Servir como demonstracao visual/comercial de um site para o nicho ${niche || "especifico"}.`;
  }

  return "Documentar o papel comercial e estrutural da pagina.";
};

const isInternalLink = (href) => {
  if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return href.includes("roxouw.github.io");
  }

  return true;
};

const classifyCta = (href, className, text) => {
  const source = `${href} ${className} ${text}`.toLowerCase();

  if (source.includes("wa.me") || source.includes("whatsapp")) return "whatsapp";
  if (source.includes("orcamento")) return "orcamento";
  if (source.includes("preco") || source.includes("planos")) return "precos";
  if (source.includes("contato")) return "contato";
  if (source.includes("cta")) return "cta";

  return "acao";
};

const shouldTreatAsCta = (href, className, text) => {
  const source = `${href} ${className} ${text}`.toLowerCase();

  return (
    /btn|cta|whatsapp|nicho-btn|mobile-menu-cta|nav-cta-link/.test(className) ||
    /whatsapp|orcamento|preco|planos|quero|ver modelos|falar|contato|consulta|matricule/i.test(
      source
    )
  );
};

const extractSections = (content) => {
  return getAllMatches(
    content,
    /<section\b([^>]*)>([\s\S]*?)<\/section>/gi,
    ([, attributes, innerHtml]) => {
      const id = getAttribute(attributes, "id");
      const firstHeading =
        getFirstMatch(innerHtml, /<h2\b[^>]*>([\s\S]*?)<\/h2>/i) ||
        getFirstMatch(innerHtml, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i) ||
        getFirstMatch(
          innerHtml,
          /<p\b[^>]*class=["'][^"']*eyebrow[^"']*["'][^>]*>([\s\S]*?)<\/p>/i
        );

      return {
        id: id || "",
        title: stripTags(firstHeading || "Sem titulo explicito"),
      };
    }
  );
};

const extractLinks = (content) => {
  return getAllMatches(content, /<a\b([^>]*)>([\s\S]*?)<\/a>/gi, ([, attributes, innerHtml]) => {
    const href = getAttribute(attributes, "href");
    const className = getAttribute(attributes, "class");
    const text = stripTags(innerHtml);

    if (!href) return null;

    return {
      href,
      text,
      className,
      internal: isInternalLink(href),
    };
  });
};

const extractAssets = (content, tagName, attrName) => {
  const regex = new RegExp(`<${tagName}\\b([^>]*)>`, "gi");

  return getAllMatches(content, regex, ([, attributes]) => getAttribute(attributes, attrName));
};

const toMarkdownList = (items, formatter) => {
  if (!items.length) return "- Nenhum";
  return items.map((item) => `- ${formatter(item)}`).join("\n");
};

const buildFrontmatter = (page) => {
  const frontmatter = {
    titulo: page.title,
    caminho: page.path,
    slug: page.slug,
    tipo: page.pageType,
    nicho: page.niche || null,
    objetivo: page.goal,
    h1: page.h1 || null,
    canonical: page.canonical || null,
    palavras: page.wordCount,
    secoes: page.sections.length,
    ctas: page.ctas.length,
    alertas: page.warnings.length,
    atualizado_em: page.generatedAt,
    tags: ["relatorio-paginas", page.pageType, page.niche || "geral"],
  };

  return [
    "---",
    ...Object.entries(frontmatter)
      .filter(([, value]) => value !== null && value !== "")
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: [${value.map((item) => `"${item}"`).join(", ")}]`;
        }

        if (typeof value === "number") {
          return `${key}: ${value}`;
        }

        return `${key}: "${String(value).replace(/"/g, '\\"')}"`;
      }),
    "---",
  ].join("\n");
};

const buildPageMarkdown = (page, allPages) => {
  const frontmatter = buildFrontmatter(page);
  const relatedByType = allPages.filter(
    (candidate) => candidate.slug !== page.slug && candidate.pageType === page.pageType
  );
  const relatedByNiche = allPages.filter(
    (candidate) => candidate.slug !== page.slug && candidate.niche && candidate.niche === page.niche
  );
  const sectionList = toMarkdownList(
    page.sections,
    (section) => `\`${section.id || "sem-id"}\` ${section.title}`
  );
  const ctaList = toMarkdownList(
    page.ctas,
    (cta) => `**${cta.text || "Sem texto"}** -> \`${cta.href}\` (${cta.kind})`
  );
  const stylesheetList = toMarkdownList(page.stylesheets, (item) => `\`${item}\``);
  const scriptList = toMarkdownList(page.scripts, (item) => `\`${item}\``);
  const htmlLinkList = toMarkdownList(
    page.internalHtmlLinks,
    (item) => `**${item.text || "Sem texto"}** -> \`${item.href}\``
  );
  const anchorLinkList = toMarkdownList(
    page.anchorLinks,
    (item) => `**${item.text || "Sem texto"}** -> \`${item.href}\``
  );
  const warningsList = toMarkdownList(page.warnings, (item) => item);
  const relatedTypeList = toMarkdownList(
    relatedByType,
    (item) => `[[${pageNotePath(item.slug)}|${item.title}]]`
  );
  const relatedNicheList = toMarkdownList(
    relatedByNiche,
    (item) => `[[${pageNotePath(item.slug)}|${item.title}]]`
  );
  const nicheHubLink = page.niche
    ? `[[${hubPath("nicho", page.niche)}|Hub do nicho ${page.niche}]]`
    : "Nenhum";
  const typeHubLink = `[[${hubPath("tipo", page.pageType)}|Hub do tipo ${page.pageType}]]`;

  return `${frontmatter}

# ${page.title}

## Navegacao

- [[00-indice|Indice geral]]
- [[${mapaPath("01-mapa-do-projeto")}|Mapa do Projeto]]
- [[${mapaPath("02-mapa-de-paginas")}|Mapa de Paginas]]
- ${typeHubLink}
- ${nicheHubLink}
- [[${operacaoPath("skills-utilizadas")}|Skills Utilizadas]]
- [[${decisoesPath("01-backlog-cro")}|Backlog CRO]]

## Resumo

- Caminho: \`${page.path}\`
- Tipo: \`${page.pageType}\`
- Nicho: ${page.niche || "geral"}
- Objetivo inferido: ${page.goal}
- H1: ${page.h1 || "Nao encontrado"}
- Meta description: ${page.description || "Nao encontrada"}
- Canonical: ${page.canonical || "Nao encontrada"}
- Body class: \`${page.bodyClass || "sem classe"}\`
- Tem Schema.org: ${page.hasSchema ? "sim" : "nao"}
- Total de palavras: ${page.wordCount}

## Secoes

${sectionList}

## CTAs

${ctaList}

## CSS

${stylesheetList}

## Scripts

${scriptList}

## Links internos para paginas

${htmlLinkList}

## Links de ancora

${anchorLinkList}

## Relacionadas por tipo

${relatedTypeList}

## Relacionadas por nicho

${relatedNicheList}

## Alertas

${warningsList}
`;
};

const buildIndexMarkdown = (pages, summary, generatedAt) => {
  const groupedLines = Object.entries(summary.byType)
    .sort(([a], [b]) => a.localeCompare(b, "pt-BR"))
    .map(([type, count]) => `- \`${type}\`: ${count}`)
    .join("\n");

  const nicheLines = Object.entries(summary.byNiche)
    .sort(([a], [b]) => a.localeCompare(b, "pt-BR"))
    .map(([niche, count]) => `- \`${niche}\`: ${count}`)
    .join("\n");

  const pageLines = pages
    .map(
      (page) =>
        `- [[${pageNotePath(page.slug)}|${page.title}]]\n  caminho: \`${page.path}\` | tipo: \`${page.pageType}\` | secoes: ${page.sections.length} | ctas: ${page.ctas.length}`
    )
    .join("\n");

  return `---
titulo: "Indice do relatorio de paginas"
gerado_em: "${generatedAt}"
tags: ["relatorio-paginas", "indice"]
---

# Relatorio de Paginas

## Visao geral

- Total de paginas analisadas: ${summary.totalPages}
- Total de CTAs identificados: ${summary.totalCtas}
- Total de links internos entre paginas: ${summary.totalInternalHtmlLinks}
- Pasta de dados estruturados: \`data/pages-report.json\`

## Paginas por tipo

${groupedLines || "- Nenhum"}

## Paginas por nicho

${nicheLines || "- Nenhum"}

## Navegacao no Obsidian

- Abra esta pasta \`obsidian/relatorio-paginas\` como vault ou adicione-a ao seu vault atual.
- Use [[${mapaPath("01-mapa-do-projeto")}|Mapa do Projeto]] como ponto de entrada.
- Use [[${mapaPath("02-mapa-de-paginas")}|Mapa de Paginas]] para navegar pela estrutura do site.
- Use [[${operacaoPath("skills-utilizadas")}|Skills Utilizadas]] para ver as skills do projeto separadas.
- Use [[${decisoesPath("01-backlog-cro")}|Backlog CRO]] e [[${decisoesPath("02-hipoteses-de-teste")}|Hipoteses de Teste]] para planejamento.
- Use o arquivo JSON em \`data/pages-report.json\` se quiser automatizar dashboards ou Dataview.

## Notas por pagina

${pageLines}
`;
};

const buildSkillsMarkdown = (generatedAt) => {
  const skillsList = usedSkills
    .map(
      (skill) =>
        `- **${skill.name}**\n  tipo: \`${skill.type}\`\n  funcao: ${skill.purpose}\n  origem: \`${skill.source}\``
    )
    .join("\n");

  return `---
titulo: "Skills Utilizadas"
gerado_em: "${generatedAt}"
tags: ["relatorio-paginas", "skills"]
---

# Skills Utilizadas

## Resumo

Estas sao as skills usadas para estruturar e executar este relatorio do projeto.

## Navegacao

- [[00-indice|Indice geral]]
- [[${mapaPath("01-mapa-do-projeto")}|Mapa do Projeto]]
- [[${operacaoPath("01-sistema-operacional")}|Sistema Operacional]]
- [[${decisoesPath("01-backlog-cro")}|Backlog CRO]]

## Lista

${skillsList}

## Hubs relacionados

- [[${hubPath("tipo", "home")}|Hub home]]
- [[${hubPath("tipo", "institucional")}|Hub institucional]]
- [[${hubPath("tipo", "landing-de-nicho")}|Hub landing-de-nicho]]
- [[${hubPath("tipo", "demo-de-cliente")}|Hub demo-de-cliente]]

## Uso no grafo

- Esta nota separa o contexto operacional das notas de paginas.
- Ela ajuda a deixar o grafo mais legivel quando voce quiser conectar processo, estrutura e paginas.
`;
};

const buildTypeHubMarkdown = (type, pages, generatedAt) => {
  const pageList = toMarkdownList(pages, (page) => `[[${pageNotePath(page.slug)}|${page.title}]]`);

  return `---
titulo: "Hub ${type}"
gerado_em: "${generatedAt}"
tags: ["relatorio-paginas", "hub", "tipo", "${type}"]
---

# Hub ${type}

## Navegacao

- [[00-indice|Indice geral]]
- [[${mapaPath("02-mapa-de-paginas")}|Mapa de Paginas]]
- [[${operacaoPath("skills-utilizadas")}|Skills Utilizadas]]

## Paginas deste tipo

${pageList}
`;
};

const buildNicheHubMarkdown = (niche, pages, generatedAt) => {
  const pageList = toMarkdownList(pages, (page) => `[[${pageNotePath(page.slug)}|${page.title}]]`);
  const typeLinks = [...new Set(pages.map((page) => page.pageType).filter(Boolean))].map(
    (type) => `[[${hubPath("tipo", type)}|${type}]]`
  );

  return `---
titulo: "Hub do nicho ${niche}"
gerado_em: "${generatedAt}"
tags: ["relatorio-paginas", "hub", "nicho", "${niche}"]
---

# Hub do nicho ${niche}

## Navegacao

- [[00-indice|Indice geral]]
- [[${mapaPath("02-mapa-de-paginas")}|Mapa de Paginas]]
- [[${operacaoPath("skills-utilizadas")}|Skills Utilizadas]]
- ${typeLinks.join("\n- ")}

## Paginas deste nicho

${pageList}
`;
};

const buildProjectMapMarkdown = (summary, generatedAt) => {
  return `---
titulo: "Mapa do Projeto"
gerado_em: "${generatedAt}"
tags: ["relatorio-paginas", "mapa", "projeto"]
---

# Mapa do Projeto

## Camadas

- [[00-indice|Indice geral]]
- [[${mapaPath("02-mapa-de-paginas")}|Mapa de Paginas]]
- [[${decisoesPath("01-backlog-cro")}|Backlog CRO]]
- [[${decisoesPath("02-hipoteses-de-teste")}|Hipoteses de Teste]]
- [[${decisoesPath("03-aprendizados")}|Aprendizados]]
- [[${operacaoPath("01-sistema-operacional")}|Sistema Operacional]]
- [[${operacaoPath("skills-utilizadas")}|Skills Utilizadas]]
- [[${dashboardPath("01-dashboard-executivo")}|Dashboard Executivo]]
- [[${dashboardPath("02-guia-do-grafo")}|Guia do Grafo]]

## Visao rapida

- Total de paginas: ${summary.totalPages}
- Total de CTAs mapeados: ${summary.totalCtas}
- Total de links internos entre paginas: ${summary.totalInternalHtmlLinks}

## Como usar

- Use este mapa como tela inicial do projeto no Obsidian.
- Entre em Paginas para auditoria estrutural.
- Entre em Decisoes para priorizacao e testes.
- Entre em Operacao para processo, skills e checklists.
`;
};

const buildPagesMapMarkdown = (pages, summary, generatedAt) => {
  const typeLinks = Object.keys(summary.byType)
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .map((type) => `- [[${hubPath("tipo", type)}|${type}]]`)
    .join("\n");

  const nicheLinks = Object.keys(summary.byNiche)
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .map((niche) => `- [[${hubPath("nicho", niche)}|${niche}]]`)
    .join("\n");

  const importantPages = pages
    .filter((page) => page.pageType === "home" || page.pageType === "landing-de-nicho")
    .map((page) => `- [[${pageNotePath(page.slug)}|${page.title}]]`)
    .join("\n");

  return `---
titulo: "Mapa de Paginas"
gerado_em: "${generatedAt}"
tags: ["relatorio-paginas", "mapa", "paginas"]
---

# Mapa de Paginas

## Navegacao

- [[${mapaPath("01-mapa-do-projeto")}|Mapa do Projeto]]
- [[00-indice|Indice geral]]
- [[${decisoesPath("01-backlog-cro")}|Backlog CRO]]
- [[${dashboardPath("01-dashboard-executivo")}|Dashboard Executivo]]

## Por tipo

${typeLinks || "- Nenhum"}

## Por nicho

${nicheLinks || "- Nenhum"}

## Paginas prioritarias

${importantPages || "- Nenhum"}
`;
};

const buildBacklogMarkdown = (pages, generatedAt) => {
  const landingPages = pages
    .filter((page) => page.pageType === "landing-de-nicho")
    .map(
      (page) =>
        `- [ ] Revisar promessa, prova e CTA em [[${pageNotePath(page.slug)}|${page.title}]]`
    )
    .join("\n");

  return `---
titulo: "Backlog CRO"
gerado_em: "${generatedAt}"
tags: ["relatorio-paginas", "decisoes", "backlog"]
---

# Backlog CRO

## Prioridades

- [ ] Revisar o hero e o CTA da [[${pageNotePath("index")}|home]]
- [ ] Auditar as paginas com mais risco de gargalo comercial em mobile
- [ ] Padronizar aprendizados entre nichos fortes e fracos

## Landing pages de nicho

${landingPages || "- [ ] Sem paginas de nicho mapeadas"}

## Navegacao

- [[${mapaPath("01-mapa-do-projeto")}|Mapa do Projeto]]
- [[${mapaPath("02-mapa-de-paginas")}|Mapa de Paginas]]
- [[${decisoesPath("02-hipoteses-de-teste")}|Hipoteses de Teste]]
`;
};

const buildHypothesesMarkdown = (generatedAt) => {
  return `---
titulo: "Hipoteses de Teste"
gerado_em: "${generatedAt}"
tags: ["relatorio-paginas", "decisoes", "teste"]
---

# Hipoteses de Teste

## Estrutura sugerida

- Hipotese:
- Pagina:
- Mudanca:
- Motivo:
- Metrica:
- Resultado:

## Hipoteses iniciais

- [ ] Se a home reforcar mais rapidamente oferta + prova + CTA, deve aumentar pedidos de orcamento.
- [ ] Se as landing pages de nicho encurtarem o caminho ate WhatsApp e planos, devem aumentar contato.
- [ ] Se os melhores elementos de prova forem replicados entre nichos, a percepcao de confianca deve subir.

## Navegacao

- [[${mapaPath("01-mapa-do-projeto")}|Mapa do Projeto]]
- [[${decisoesPath("01-backlog-cro")}|Backlog CRO]]
- [[${decisoesPath("03-aprendizados")}|Aprendizados]]
`;
};

const buildLearningsMarkdown = (generatedAt) => {
  return `---
titulo: "Aprendizados"
gerado_em: "${generatedAt}"
tags: ["relatorio-paginas", "decisoes", "aprendizados"]
---

# Aprendizados

## Como registrar

- Contexto:
- O que mudou:
- Impacto percebido:
- O que manter:
- O que evitar:

## Pontos iniciais

- A estrutura por nicho ajuda a comparar oferta, prova e CTA sem depender de memoria.
- O grafo fica mais util quando as notas conectam paginas, hubs, skills e decisoes.

## Navegacao

- [[${mapaPath("01-mapa-do-projeto")}|Mapa do Projeto]]
- [[${decisoesPath("01-backlog-cro")}|Backlog CRO]]
- [[${operacaoPath("01-sistema-operacional")}|Sistema Operacional]]
`;
};

const buildOperationsMarkdown = (generatedAt) => {
  return `---
titulo: "Sistema Operacional"
gerado_em: "${generatedAt}"
tags: ["relatorio-paginas", "operacao"]
---

# Sistema Operacional

## Fluxo sugerido

1. Entrar em [[${mapaPath("01-mapa-do-projeto")}|Mapa do Projeto]]
2. Escolher uma pagina em [[${mapaPath("02-mapa-de-paginas")}|Mapa de Paginas]]
3. Registrar prioridade em [[${decisoesPath("01-backlog-cro")}|Backlog CRO]]
4. Criar teste em [[${decisoesPath("02-hipoteses-de-teste")}|Hipoteses de Teste]]
5. Consolidar resultado em [[${decisoesPath("03-aprendizados")}|Aprendizados]]

## Apoio operacional

- [[${operacaoPath("skills-utilizadas")}|Skills Utilizadas]]
- [[${operacaoPath("02-checklist-de-revisao")}|Checklist de Revisao]]

## Objetivo

Usar o Obsidian como memoria operacional do projeto para melhorar clareza, priorizacao e execucao.
`;
};

const buildReviewChecklistMarkdown = (generatedAt) => {
  return `---
titulo: "Checklist de Revisao"
gerado_em: "${generatedAt}"
tags: ["relatorio-paginas", "operacao", "checklist"]
---

# Checklist de Revisao

## Conversao

- [ ] O hero deixa a oferta clara em poucos segundos
- [ ] O CTA principal aparece cedo
- [ ] A pagina parece comercial, nao institucional demais

## Credibilidade

- [ ] Existe prova visual ou contexto de projeto
- [ ] A oferta parece confiavel
- [ ] O contato esta facil

## Mobile

- [ ] Headline quebra bem
- [ ] CTA fica clicavel
- [ ] Nao ha overflow nem blocos longos demais

## Tecnico

- [ ] Nenhum ID ou classe essencial foi quebrado
- [ ] Scripts e ancoras continuam funcionando
- [ ] SEO basico continua preservado

## Navegacao

- [[${operacaoPath("01-sistema-operacional")}|Sistema Operacional]]
- [[${decisoesPath("01-backlog-cro")}|Backlog CRO]]
`;
};

const buildDashboardMarkdown = (generatedAt) => {
  return `---
titulo: "Dashboard Executivo"
gerado_em: "${generatedAt}"
tags: ["relatorio-paginas", "dashboard"]
---

# Dashboard Executivo

> Requer o plugin Dataview para renderizar as tabelas e listas abaixo.

## Navegacao

- [[${mapaPath("01-mapa-do-projeto")}|Mapa do Projeto]]
- [[${mapaPath("02-mapa-de-paginas")}|Mapa de Paginas]]
- [[${decisoesPath("01-backlog-cro")}|Backlog CRO]]
- [[${dashboardPath("02-guia-do-grafo")}|Guia do Grafo]]

## Paginas por prioridade operacional

\`\`\`dataview
TABLE tipo as "Tipo", nicho as "Nicho", secoes as "Seções", ctas as "CTAs"
FROM "paginas"
SORT ctas DESC, secoes DESC
\`\`\`

## Landing pages de nicho

\`\`\`dataview
TABLE nicho as "Nicho", ctas as "CTAs", palavras as "Palavras"
FROM "paginas"
WHERE tipo = "landing-de-nicho"
SORT nicho ASC
\`\`\`

## Paginas com alertas

\`\`\`dataview
TABLE alertas as "Alertas", tipo as "Tipo", nicho as "Nicho"
FROM "paginas"
WHERE alertas > 0
\`\`\`

## Paginas mais densas

\`\`\`dataview
TABLE palavras as "Palavras", secoes as "Seções", ctas as "CTAs"
FROM "paginas"
SORT palavras DESC
\`\`\`

## Notas operacionais

\`\`\`dataview
LIST
FROM "Decisoes" OR "Operacao"
SORT file.name ASC
\`\`\`
`;
};

const buildGraphGuideMarkdown = (generatedAt) => {
  return `---
titulo: "Guia do Grafo"
gerado_em: "${generatedAt}"
tags: ["relatorio-paginas", "dashboard", "grafo"]
---

# Guia do Grafo

## Melhor ponto de partida

- Abra [[${mapaPath("01-mapa-do-projeto")}|Mapa do Projeto]]
- Depois use o grafo global

## Grupos sugeridos

- Mapa/
- paginas/
- Decisoes/
- Operacao/
- hubs/

## Cores sugeridas

- Mapa/: azul
- paginas/: verde
- Decisoes/: laranja
- Operacao/: amarelo
- hubs/: roxo ou cinza

## Ajustes visuais

- Tamanho do nó: pequeno ou médio
- Distância do link: média
- Força de repulsão: média ou alta
- Mostrar texto: só quando precisar
- Profundidade no gráfico local: 2 ou 3

## Dica prática

- Se o grafo parecer vazio, reabra o vault e abra primeiro [[${mapaPath("01-mapa-do-projeto")}|Mapa do Projeto]].
- Se parecer bagunçado, filtre por pasta e inspecione uma camada por vez.
`;
};

const buildSummary = (pages) => {
  return pages.reduce(
    (summary, page) => {
      summary.totalPages += 1;
      summary.totalCtas += page.ctas.length;
      summary.totalInternalHtmlLinks += page.internalHtmlLinks.length;
      summary.byType[page.pageType] = (summary.byType[page.pageType] || 0) + 1;

      if (page.niche) {
        summary.byNiche[page.niche] = (summary.byNiche[page.niche] || 0) + 1;
      }

      return summary;
    },
    {
      totalPages: 0,
      totalCtas: 0,
      totalInternalHtmlLinks: 0,
      byType: {},
      byNiche: {},
    }
  );
};

const generatePageReport = (relativePath, generatedAt) => {
  const content = readFile(relativePath);
  const absolutePath = path.join(projectRoot, relativePath);
  const stat = fs.statSync(absolutePath);

  const title = stripTags(getFirstMatch(content, /<title>([\s\S]*?)<\/title>/i));
  const description = decodeHtml(
    getFirstMatch(
      content,
      /<meta\b[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i
    )
  );
  const canonical = getFirstMatch(
    content,
    /<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i
  );
  const h1 = stripTags(getFirstMatch(content, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i));
  const bodyClass = getFirstMatch(content, /<body\b[^>]*class=["']([^"']+)["'][^>]*>/i);
  const sections = extractSections(content);
  const links = extractLinks(content);
  const stylesheets = extractAssets(content, "link", "href").filter((href) =>
    href.endsWith(".css")
  );
  const scripts = extractAssets(content, "script", "src").filter(Boolean);
  const pageType = classifyPage(relativePath, title);
  const niche = inferNiche(relativePath, title);
  const wordCount = stripTags(content).split(/\s+/).filter(Boolean).length;
  const internalHtmlLinks = links.filter(
    (link) =>
      link.internal &&
      link.href !== "#" &&
      !link.href.startsWith("#") &&
      (link.href.endsWith(".html") || /^\/$/.test(link.href))
  );
  const anchorLinks = links.filter((link) => link.href.startsWith("#"));
  const ctas = links
    .filter((link) => shouldTreatAsCta(link.href, link.className, link.text))
    .map((link) => ({
      text: link.text,
      href: link.href,
      kind: classifyCta(link.href, link.className, link.text),
    }));
  const warnings = [];

  if (!title) warnings.push("Pagina sem <title>.");
  if (!description) warnings.push("Pagina sem meta description.");
  if (!h1) warnings.push("Pagina sem H1.");
  if (!canonical) warnings.push("Pagina sem canonical.");
  if (!ctas.length) warnings.push("Nenhum CTA identificado pelas heuristicas do relatorio.");

  return {
    path: relativePath,
    fileName: path.basename(relativePath),
    slug: slugify(relativePath.replace(/\.html$/i, "").replace(/[\\/]/g, "-")),
    title,
    description,
    canonical,
    h1,
    bodyClass,
    pageType,
    niche,
    goal: inferGoal(pageType, niche),
    hasSchema: /application\/ld\+json/i.test(content),
    sections,
    stylesheets,
    scripts,
    ctas,
    internalHtmlLinks,
    anchorLinks,
    warnings,
    wordCount,
    modifiedAt: stat.mtime.toISOString(),
    generatedAt,
  };
};

const run = () => {
  const generatedAt = new Date().toISOString();

  ensureDir(outputRoot);
  ensureDir(pagesOutputDir);
  ensureDir(dataOutputDir);
  ensureDir(skillsOutputDir);
  ensureDir(hubsOutputDir);
  ensureDir(mapaOutputDir);
  ensureDir(decisoesOutputDir);
  ensureDir(operacaoOutputDir);
  ensureDir(dashboardOutputDir);

  const pages = htmlFiles
    .map((relativePath) => generatePageReport(relativePath, generatedAt))
    .sort((a, b) => a.path.localeCompare(b.path, "pt-BR"));

  const summary = buildSummary(pages);

  fs.writeFileSync(
    path.join(dataOutputDir, "pages-report.json"),
    JSON.stringify({ generatedAt, summary, usedSkills, pages }, null, 2)
  );

  for (const page of pages) {
    fs.writeFileSync(path.join(pagesOutputDir, `${page.slug}.md`), buildPageMarkdown(page, pages));
  }

  fs.writeFileSync(
    path.join(outputRoot, "00-indice.md"),
    buildIndexMarkdown(pages, summary, generatedAt)
  );
  fs.writeFileSync(
    path.join(mapaOutputDir, "01-mapa-do-projeto.md"),
    buildProjectMapMarkdown(summary, generatedAt)
  );
  fs.writeFileSync(
    path.join(mapaOutputDir, "02-mapa-de-paginas.md"),
    buildPagesMapMarkdown(pages, summary, generatedAt)
  );
  fs.writeFileSync(
    path.join(decisoesOutputDir, "01-backlog-cro.md"),
    buildBacklogMarkdown(pages, generatedAt)
  );
  fs.writeFileSync(
    path.join(decisoesOutputDir, "02-hipoteses-de-teste.md"),
    buildHypothesesMarkdown(generatedAt)
  );
  fs.writeFileSync(
    path.join(decisoesOutputDir, "03-aprendizados.md"),
    buildLearningsMarkdown(generatedAt)
  );
  fs.writeFileSync(
    path.join(operacaoOutputDir, "01-sistema-operacional.md"),
    buildOperationsMarkdown(generatedAt)
  );
  fs.writeFileSync(
    path.join(operacaoOutputDir, "02-checklist-de-revisao.md"),
    buildReviewChecklistMarkdown(generatedAt)
  );
  fs.writeFileSync(
    path.join(operacaoOutputDir, "skills-utilizadas.md"),
    buildSkillsMarkdown(generatedAt)
  );
  fs.writeFileSync(
    path.join(dashboardOutputDir, "01-dashboard-executivo.md"),
    buildDashboardMarkdown(generatedAt)
  );
  fs.writeFileSync(
    path.join(dashboardOutputDir, "02-guia-do-grafo.md"),
    buildGraphGuideMarkdown(generatedAt)
  );
  fs.writeFileSync(
    path.join(skillsOutputDir, "skills-utilizadas.md"),
    buildSkillsMarkdown(generatedAt)
  );

  for (const type of Object.keys(summary.byType)) {
    const pagesOfType = pages.filter((page) => page.pageType === type);
    fs.writeFileSync(
      path.join(hubsOutputDir, `tipo-${type}.md`),
      buildTypeHubMarkdown(type, pagesOfType, generatedAt)
    );
  }

  for (const niche of Object.keys(summary.byNiche)) {
    const pagesOfNiche = pages.filter((page) => page.niche === niche);
    fs.writeFileSync(
      path.join(hubsOutputDir, `nicho-${niche}.md`),
      buildNicheHubMarkdown(niche, pagesOfNiche, generatedAt)
    );
  }

  console.log(
    `Relatorio gerado em ${path.relative(projectRoot, outputRoot)} com ${pages.length} paginas analisadas.`
  );
};

run();
