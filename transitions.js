/**
 * transitions.js — Sistema de transição entre páginas
 * Drop-in: adicionar <script src="/transitions.js"></script> em qualquer página
 *
 * Features:
 *  • Fade-out/in suave ao navegar
 *  • Barra de progresso no topo (estilo GitHub)
 *  • Preload no hover dos links (prefetch antecipado)
 *  • Respeita links externos, âncoras, download e target="_blank"
 *  • Compatível com o tema claro/escuro (lê localStorage)
 */

(function () {
  "use strict";

  /* ── Config ──────────────────────────────────────────────── */
  const FADE_DURATION = 320; // ms fade-out antes de navegar
  const PROGRESS_COLOR = null; // null = usa --teal do CSS, ou '#2dd4c8'
  const PROGRESS_HEIGHT = "2px";

  /* ── Estado ──────────────────────────────────────────────── */
  let progressBar = null;
  let progressTimer = null;
  let isNavigating = false;
  const prefetched = new Set();

  /* ── Utilitários ─────────────────────────────────────────── */
  function isSameSite(url) {
    try {
      const u = new URL(url, location.href);
      return u.hostname === location.hostname;
    } catch {
      return false;
    }
  }

  function isSkippable(el) {
    return (
      !el.href ||
      el.target === "_blank" ||
      el.hasAttribute("download") ||
      el.getAttribute("href").startsWith("#") ||
      el.getAttribute("href").startsWith("mailto:") ||
      el.getAttribute("href").startsWith("tel:") ||
      el.getAttribute("href").startsWith("javascript:") ||
      !isSameSite(el.href)
    );
  }

  function getTealColor() {
    if (PROGRESS_COLOR) return PROGRESS_COLOR;
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue("--teal")
      .trim();
    return v || "#2dd4c8";
  }

  /* ── Barra de progresso ──────────────────────────────────── */
  function createProgressBar() {
    if (progressBar) return;
    progressBar = document.createElement("div");
    progressBar.id = "__pg-bar";
    Object.assign(progressBar.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "0%",
      height: PROGRESS_HEIGHT,
      background: getTealColor(),
      zIndex: "99999",
      transition: "width .4s cubic-bezier(.16,1,.3,1), opacity .3s ease",
      opacity: "0",
      pointerEvents: "none",
      borderRadius: "0 2px 2px 0",
      boxShadow: "0 0 8px " + getTealColor() + "88",
    });
    document.body.appendChild(progressBar);
  }

  function progressStart() {
    createProgressBar();
    const color = getTealColor();
    progressBar.style.background = color;
    progressBar.style.boxShadow = "0 0 8px " + color + "88";
    progressBar.style.opacity = "1";
    progressBar.style.width = "0%";
    progressBar.style.transition = "none";

    // Force reflow
    progressBar.getBoundingClientRect();

    progressBar.style.transition = "width 2.5s cubic-bezier(.16,1,.3,1)";
    progressBar.style.width = "85%";

    clearTimeout(progressTimer);
  }

  function progressFinish() {
    if (!progressBar) return;
    progressBar.style.transition = "width .2s ease, opacity .3s ease .15s";
    progressBar.style.width = "100%";
    clearTimeout(progressTimer);
    progressTimer = setTimeout(() => {
      progressBar.style.opacity = "0";
      setTimeout(() => {
        progressBar.style.width = "0%";
      }, 300);
    }, 200);
  }

  /* ── Overlay fade ────────────────────────────────────────── */
  function createOverlay() {
    let overlay = document.getElementById("__pg-overlay");
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.id = "__pg-overlay";
    const isDark =
      !document.documentElement.classList.contains("light-mode") &&
      !document.body.classList.contains("light-mode");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "99998",
      background: isDark ? "#131416" : "#f4f5f7",
      opacity: "0",
      pointerEvents: "none",
      transition: `opacity ${FADE_DURATION}ms cubic-bezier(.16,1,.3,1)`,
    });
    document.body.appendChild(overlay);
    return overlay;
  }

  function fadeOut(callback) {
    const overlay = createOverlay();
    // Update color to match current theme
    const isDark =
      !document.documentElement.classList.contains("light-mode") &&
      !document.body.classList.contains("light-mode");
    overlay.style.background = isDark ? "#131416" : "#f4f5f7";
    overlay.style.pointerEvents = "all";

    // Force reflow
    overlay.getBoundingClientRect();
    overlay.style.opacity = "1";

    setTimeout(callback, FADE_DURATION);
  }

  function fadeIn() {
    const overlay = document.getElementById("__pg-overlay");
    if (!overlay) return;

    // Restore theme before fading in
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      document.documentElement.classList.add("light-mode");
      document.body.classList.add("light-mode");
    }

    overlay.style.background = savedTheme === "light" ? "#f4f5f7" : "#131416";
    overlay.style.transition = `opacity ${FADE_DURATION * 1.2}ms cubic-bezier(.16,1,.3,1)`;

    // Small delay so browser has painted
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.opacity = "0";
        overlay.style.pointerEvents = "none";
        progressFinish();
      });
    });
  }

  /* ── Prefetch ────────────────────────────────────────────── */
  function prefetch(url) {
    if (prefetched.has(url)) return;
    prefetched.add(url);
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;
    link.as = "document";
    document.head.appendChild(link);
  }

  /* ── Navegação ───────────────────────────────────────────── */
  function navigate(url) {
    if (isNavigating) return;
    isNavigating = true;

    progressStart();
    fadeOut(() => {
      location.href = url;
    });
  }

  const MIN_TIME = 250;
  const start = performance.now();

  fadeOut(() => {
    const elapsed = performance.now() - start;
    const wait = Math.max(0, MIN_TIME - elapsed);

    setTimeout(() => {
      location.href = url;
    }, wait);
  });
  /* ── Intercepta cliques ──────────────────────────────────── */
  document.addEventListener(
    "click",
    function (e) {
      // Walk up the DOM to find <a>
      let el = e.target;
      while (el && el.tagName !== "A") el = el.parentElement;
      if (!el || isSkippable(el)) return;

      // Mesma página — só scroll suave, sem transição
      const samePageUrl = new URL(el.href, location.href);
      if (
        samePageUrl.pathname === location.pathname &&
        samePageUrl.search === location.search
      )
        return;

      e.preventDefault();
      navigate(el.href);
    },
    true,
  );

  /* ── Prefetch no hover ───────────────────────────────────── */
  let hoverTimer = null;
  document.addEventListener("mouseover", function (e) {
    let el = e.target;
    while (el && el.tagName !== "A") el = el.parentElement;
    if (!el || isSkippable(el)) return;

    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => prefetch(el.href), 80);
  });

  document.addEventListener("mouseout", function () {
    clearTimeout(hoverTimer);
  });

  /* ── Touch prefetch (mobile) ─────────────────────────────── */
  document.addEventListener(
    "touchstart",
    function (e) {
      let el = e.target;
      while (el && el.tagName !== "A") el = el.parentElement;
      if (!el || isSkippable(el)) return;
      prefetch(el.href);
    },
    { passive: true },
  );

  /* ── Entrada na página (fade in) ─────────────────────────── */
  if (document.readyState === "loading") {
    // Create overlay immediately to prevent flash of content
    createOverlay();
    const overlay = document.getElementById("__pg-overlay");
    if (overlay) overlay.style.opacity = "1";

    document.addEventListener("DOMContentLoaded", fadeIn);
  } else {
    fadeIn();
  }

  /* ── Botão voltar/avançar do browser ─────────────────────── */
  window.addEventListener("pageshow", function (e) {
    isNavigating = false;
    if (e.persisted) {
      // Página veio do bfcache — re-faz o fade in
      fadeIn();
    }
  });
  window.scrollTo(0, 0);
  /* ── Expõe API pública (opcional) ────────────────────────── */
  window.PageTransitions = {
    navigate,
    prefetch,
  };
})();
