# transitions.js — Guia de Instalação

## O que faz

Sistema de transição entre páginas drop-in. Adiciona:

- **Fade-out/in** suave ao navegar entre páginas (320ms)
- **Barra de progresso** no topo (estilo GitHub, usa a cor `--teal` do tema)
- **Preload antecipado** das páginas ao passar o mouse em links (prefetch no hover)
- **Touch prefetch** em mobile (ao tocar em links)
- **Bfcache** — funciona corretamente com o botão voltar/avançar do browser
- **Tema** — lê o `localStorage` para aplicar claro/escuro antes do fade in

---

## Instalação em cada página

Adicione **uma única linha** antes do `</body>` em cada arquivo HTML:

```html
    <script src="/transitions.js"></script>
  </body>
</html>
```

**Ordem correta no `index.html`:**
```html
    <!-- ... conteúdo ... -->
    </footer>

    <!-- MODAL NICHO -->
    <div id="nichoModal">...</div>

    <script>
      // JS existente da página
    </script>

    <!-- Transições — sempre por último -->
    <script src="/transitions.js"></script>
  </body>
</html>
```

---

## Páginas para adicionar

Adicionar em todos os arquivos do projeto:

| Arquivo            | Precisa adicionar |
|--------------------|-------------------|
| `index.html`       | ✅ Sim            |
| `historia.html`    | ✅ Sim            |
| `siteParaEmpresa.html`   | ✅ Sim      |
| `siteParaAdvogado.html`  | ✅ Sim      |
| `siteParaAcademia.html`  | ✅ Sim      |
| `siteParaDentista.html`  | ✅ Sim      |
| `siteParaNutricionista.html` | ✅ Sim  |
| `nutricionista.html`     | ✅ Sim      |
| `dentista.html`          | ✅ Sim      |
| `academia.html`          | ✅ Sim      |
| `advogado.html`          | ✅ Sim      |

---

## Comportamento inteligente

O script **ignora automaticamente**:

- Links externos (outro domínio)
- Links com `target="_blank"`
- Links com atributo `download`
- Âncoras da mesma página (`#sobre`, `#planos`, etc.)
- Links `mailto:` e `tel:`
- Links `javascript:`

Ou seja: **nenhuma alteração necessária** nos links existentes.

---

## Personalização (opcional)

No topo do `transitions.js`, há 3 constantes:

```js
const FADE_DURATION   = 320;   // ms — velocidade do fade
const PROGRESS_COLOR  = null;  // null = usa --teal do CSS
const PROGRESS_HEIGHT = '2px'; // espessura da barra
```

---

## API pública (opcional)

Se precisar disparar uma transição via JS:

```js
// Navegar com transição
window.PageTransitions.navigate('/outra-pagina.html');

// Prefetch manual
window.PageTransitions.prefetch('/pagina-pesada.html');
```