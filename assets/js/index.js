// ═══════════════════════════════════════════════════════════════
//  index.js — GSAP + ScrollTrigger
//  ScrollSmoother removido (Club GSAP — requer licença paga)
//  Smooth scroll: CSS scroll-behavior nativo
// ═══════════════════════════════════════════════════════════════

// ── Custom cursor — desktop only ──────────────────────────────
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

function isBackForwardNavigation() {
  const navEntry = performance.getEntriesByType("navigation")[0];
  return navEntry?.type === "back_forward";
}

function shouldForceTop() {
  return !window.location.hash && !isBackForwardNavigation();
}

function resetScrollTop() {
  if (!shouldForceTop()) return;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

window.addEventListener("pageshow", (event) => {
  if (event.persisted || !shouldForceTop()) return;
  resetScrollTop();
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", resetScrollTop, { once: true });
} else {
  resetScrollTop();
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const testParams = new URLSearchParams(window.location.search);
const isAutomatedTest =
  /HeadlessChrome|puppeteer|playwright/i.test(navigator.userAgent) ||
  testParams.has("skipIntro") ||
  testParams.get("testMode") === "1";
const hasCoarsePointer = window.matchMedia("(pointer:coarse)").matches;
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
const lowBandwidth =
  !!connection && (connection.saveData || /(?:slow-2g|2g)/i.test(connection.effectiveType || ""));
const lowPowerCpu =
  typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
const lowDeviceMemory = typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;
const shouldReduceEffects = prefersReducedMotion || lowBandwidth || lowPowerCpu || lowDeviceMemory;
const shouldLiteEffects =
  shouldReduceEffects ||
  (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 8) ||
  (typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 8);

document.documentElement.classList.toggle("test-mode", isAutomatedTest);
document.body.classList.toggle("test-mode", isAutomatedTest);
document.documentElement.classList.toggle("fx-lite", shouldLiteEffects);
document.body.classList.toggle("fx-lite", shouldLiteEffects);

const cursor = document.getElementById("cursor");
const ring = document.getElementById("cursorRing");
let mx = 0,
  my = 0,
  rx = 0,
  ry = 0;
if (cursor && ring && window.matchMedia("(pointer:fine)").matches && !shouldReduceEffects) {
  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx - 4 + "px";
    cursor.style.top = my - 4 + "px";
  });
  (function animRing() {
    rx += (mx - rx - 15) * 0.12;
    ry += (my - ry - 15) * 0.12;
    ring.style.left = rx + "px";
    ring.style.top = ry + "px";
    requestAnimationFrame(animRing);
  })();
  document.querySelectorAll("a,button").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.style.transform = "scale(2.5)";
      ring.style.borderColor =
        getComputedStyle(document.documentElement).getPropertyValue("--teal").trim() + "99";
    });
    el.addEventListener("mouseleave", () => {
      cursor.style.transform = "scale(1)";
      ring.style.borderColor = "";
    });
  });
}

// ── Navbar scrolled ────────────────────────────────────────────
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => navbar.classList.toggle("scrolled", window.scrollY > 50), {
  passive: true,
});

// ── Hamburger ──────────────────────────────────────────────────
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");
if (hamburger && mobileMenu) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    mobileMenu.classList.toggle("open");
    document.body.style.overflow = mobileMenu.classList.contains("open") ? "hidden" : "";
  });
}
window.closeMobile = function closeMobile() {
  if (!hamburger || !mobileMenu) return;
  hamburger.classList.remove("open");
  mobileMenu.classList.remove("open");
  document.body.style.overflow = "";
};

// ── Analytics tracking ────────────────────────────────────────
function normalizeAnalyticsText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function toAnalyticsSlug(value) {
  return normalizeAnalyticsText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getAnalyticsLocation(element) {
  if (!element) return "unknown";
  if (element.closest("#nichoModal")) return "nicho_modal";
  if (element.closest("#mobileMenu")) return "mobile_menu";
  if (element.closest("#navbar")) return "navbar";

  const section = element.closest("section[id], footer[id], nav[id], div[id]");
  if (section?.id) return section.id;

  return "unknown";
}

function getAnalyticsCtaType(element, href) {
  if (element.classList.contains("btn-whatsapp") || href.startsWith("https://wa.me/")) {
    return "whatsapp";
  }
  if (href.startsWith("mailto:")) return "email";
  if (/openNichoModal/.test(element.getAttribute("onclick") || "")) return "modal";
  if (href.startsWith("#")) return "internal";
  if (href.startsWith("/pages/")) return "niche_page";
  return "link";
}

function trackAnalyticsEvent(eventName, params) {
  if (typeof window.gtag !== "function") return;

  window.gtag("event", eventName, {
    page_type: "marketing_home",
    page_path: window.location.pathname,
    ...params,
  });
}

const analyticsState = {
  lastModalTrigger: null,
};

document.addEventListener(
  "click",
  (event) => {
    const trigger = event.target.closest("a, button");
    if (!trigger) return;

    const href = trigger.getAttribute("href") || "";
    const text = normalizeAnalyticsText(trigger.textContent);
    const location = getAnalyticsLocation(trigger);
    const ctaType = getAnalyticsCtaType(trigger, href);

    if (/openNichoModal/.test(trigger.getAttribute("onclick") || "")) {
      analyticsState.lastModalTrigger = {
        location,
        text,
      };
    }

    const shouldTrackClick =
      trigger.matches(".btn, .social-link, .nav-cta-link, .mobile-menu-cta, .nicho-btn") ||
      ctaType === "whatsapp" ||
      ctaType === "email";

    if (!shouldTrackClick) return;

    trackAnalyticsEvent("cta_clicked", {
      cta_text: text || "sem_texto",
      cta_location: location,
      cta_type: ctaType,
      destination: href || "none",
    });

    if (trigger.classList.contains("nicho-btn")) {
      trackAnalyticsEvent("niche_selected", {
        niche: toAnalyticsSlug(text) || "unknown",
        destination_page: href || "none",
        modal_location: location,
      });
    }
  },
  { capture: true }
);

document.querySelectorAll(".faq-item").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;

    trackAnalyticsEvent("faq_opened", {
      faq_question: normalizeAnalyticsText(item.querySelector(".faq-question")?.textContent),
      faq_location: getAnalyticsLocation(item),
    });
  });
});

// ── Intro cinematic sequence ───────────────────────────────────
(function () {
  const intro = document.getElementById("intro");
  const introName = document.getElementById("introName");
  const introEyebrow = document.getElementById("introEyebrow");
  const introWelcome = document.getElementById("introWelcome");
  const introFirst = document.getElementById("introFirst");
  const introLast = document.getElementById("introLast");
  const introBar = document.getElementById("introBar");
  const barFill = document.getElementById("introBarFill");
  const barShine = document.getElementById("introBarShine");
  const introText = document.getElementById("introText");
  const introLogoWrap = document.getElementById("introLogoWrap");
  const heroSection = document.getElementById("hero");
  const navLogo = document.querySelector(".nav-logo");
  const shouldSkipIntro = prefersReducedMotion || isAutomatedTest;
  const isMobileIntro = hasCoarsePointer && !shouldReduceEffects;

  if (!intro || !heroSection || shouldSkipIntro) {
    if (intro) intro.style.display = "none";
    if (heroSection) heroSection.classList.add("hero-enter");
    initGSAP();
    return;
  }

  intro.classList.toggle("intro-mobile", isMobileIntro);
  document.body.style.overflow = "hidden";

  const preloadDone = Promise.all([
    document.fonts.ready,
    new Promise((res) => {
      if (document.readyState === "complete") res();
      else window.addEventListener("load", res, { once: true });
    }),
  ]);

  function buildLetters(el, text, cls) {
    el.innerHTML = "";
    return [...text].map((ch) => {
      const s = document.createElement("span");
      s.className = "intro-letter " + (cls || "");
      s.textContent = ch === " " ? "\u00A0" : ch;
      el.appendChild(s);
      return s;
    });
  }

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function runBar(duration) {
    return new Promise((res) => {
      introBar.classList.add("visible");
      const t0 = performance.now();
      function tick(now) {
        const raw = Math.min((now - t0) / duration, 1);
        const eased = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
        const pct = eased * 100;
        barFill.style.width = pct + "%";
        barShine.style.left = pct - 3 + "%";
        barShine.style.opacity = raw > 0.02 && raw < 0.97 ? "1" : "0";
        if (raw < 1) requestAnimationFrame(tick);
        else {
          barFill.style.width = "100%";
          barShine.style.opacity = "0";
          res();
        }
      }
      requestAnimationFrame(tick);
    });
  }

  async function runIntro() {
    const timings = isMobileIntro
      ? {
          eyebrow: 110,
          welcomeLetter: 22,
          afterWelcome: 50,
          nameLetter: 30,
          beforeBar: 90,
          bar: 420,
          afterTagline: 140,
          afterLogo: 320,
          zoomOut: 150,
          beforeExit: 80,
          heroEnter: 120,
          cleanup: 360,
        }
      : {
          eyebrow: 180,
          welcomeLetter: 36,
          afterWelcome: 80,
          nameLetter: 50,
          beforeBar: 160,
          bar: 780,
          afterTagline: 280,
          afterLogo: 720,
          zoomOut: 260,
          beforeExit: 120,
          heroEnter: 200,
          cleanup: 900,
        };

    await preloadDone;

    // Eyebrow aparece primeiro (linha discreta)
    introEyebrow.classList.add("visible");
    await wait(timings.eyebrow);

    // "Welcome To," letra a letra — sutil, menor
    const welcomeLetters = buildLetters(introWelcome, "Welcome To,", "");
    for (let i = 0; i < welcomeLetters.length; i++) {
      await wait(timings.welcomeLetter);
      welcomeLetters[i].classList.add("on");
    }

    await wait(timings.afterWelcome);

    // "Rosso Labs" — Rosso normal, Labs em teal via CSS
    const firstLetters = buildLetters(introFirst, "Rosso", "");
    const lastLetters = buildLetters(introLast, "\u00A0Labs", "");
    const nameLetters = [...firstLetters, ...lastLetters];

    for (let i = 0; i < nameLetters.length; i++) {
      await wait(timings.nameLetter);
      nameLetters[i].classList.add("on");
    }

    await wait(timings.beforeBar);

    // Barra de progresso
    await runBar(timings.bar);

    // Tagline
    introText.classList.add("visible");
    await wait(timings.afterTagline);

    // Logo entra com fade+slide, depois flutua
    introLogoWrap.classList.add("visible");
    await wait(timings.afterLogo);

    // Morph: nome voa para nav-logo
    introName.classList.add("zoom-out");
    await wait(timings.zoomOut);

    const nameBounds = introName.getBoundingClientRect();
    const logoBounds = navLogo ? navLogo.getBoundingClientRect() : null;

    if (logoBounds) {
      const nameCX = nameBounds.left + nameBounds.width / 2;
      const nameCY = nameBounds.top + nameBounds.height / 2;
      const logoCX = logoBounds.left + logoBounds.width / 2;
      const logoCY = logoBounds.top + logoBounds.height / 2;
      const scaleT = Math.min(
        logoBounds.width / nameBounds.width,
        logoBounds.height / nameBounds.height
      );
      introName.classList.remove("zoom-out");
      await new Promise((r) => requestAnimationFrame(r));
      introName.style.transition = isMobileIntro
        ? "transform 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.28s ease 0.05s, filter 0.28s ease 0.05s"
        : "transform 0.6s cubic-bezier(0.4,0,0.2,1), opacity 0.45s ease 0.1s, filter 0.45s ease 0.1s";
      introName.style.transform = `translate(${logoCX - nameCX}px,${logoCY - nameCY}px) scale(${scaleT})`;
      introName.style.opacity = "0";
      introName.style.filter = "blur(4px)";
    } else {
      introName.style.transition = "opacity 0.5s, filter 0.5s";
      introName.style.opacity = "0";
      introName.style.filter = "blur(8px)";
    }

    await wait(timings.beforeExit);
    intro.classList.add("exit");
    await wait(timings.heroEnter);
    heroSection.classList.add("hero-enter");

    await wait(timings.cleanup);
    intro.style.display = "none";
    document.body.style.overflow = "";

    // Inicia GSAP depois que o intro termina e o scroll está liberado
    initGSAP();
  }

  runIntro();
})();

// ── Modal Nicho ────────────────────────────────────────────────
const nichoModal = document.getElementById("nichoModal");
const nichoCloseBtn = document.getElementById("nichoCloseBtn");

window.openNichoModal = function openNichoModal() {
  if (!nichoModal) return;
  const trigger = analyticsState.lastModalTrigger;

  nichoModal.classList.add("open");
  document.body.style.overflow = "hidden";

  trackAnalyticsEvent("niche_modal_opened", {
    trigger_location: trigger?.location || "unknown",
    trigger_text: trigger?.text || "unknown",
  });

  analyticsState.lastModalTrigger = null;
};
function closeNichoModal(reason = "dismissed") {
  if (!nichoModal) return;
  if (!nichoModal.classList.contains("open")) return;

  nichoModal.classList.remove("open");
  document.body.style.overflow = "";

  trackAnalyticsEvent("niche_modal_closed", {
    close_reason: reason,
  });
}

if (nichoCloseBtn && nichoModal) {
  nichoCloseBtn.addEventListener("click", () => closeNichoModal("close_button"));
  nichoModal.addEventListener("click", (e) => {
    if (e.target === nichoModal) closeNichoModal("backdrop");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNichoModal("escape_key");
  });
}

// ── Theme toggle ───────────────────────────────────────────────
const inkCanvas = document.getElementById("inkCanvas");
const inkCtx = inkCanvas ? inkCanvas.getContext("2d") : null;

function resizeInkCanvas() {
  if (!inkCanvas) return;
  inkCanvas.width = window.innerWidth;
  inkCanvas.height = window.innerHeight;
}
resizeInkCanvas();
window.addEventListener("resize", resizeInkCanvas);

function launchInk(color) {
  if (!inkCanvas || !inkCtx || shouldLiteEffects) return;
  const W = inkCanvas.width,
    H = inkCanvas.height;
  const ox = W / 2,
    oy = H / 2;
  const drops = Array.from({ length: 18 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 6 + Math.random() * 14;
    return {
      x: ox,
      y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 18 + Math.random() * 60,
      alpha: 0.85 + Math.random() * 0.15,
      decay: 0.013 + Math.random() * 0.01,
    };
  });
  const bursts = Array.from({ length: 3 }, (_, i) => ({
    x: ox,
    y: oy,
    r: 0,
    maxR: W * (0.35 + i * 0.18),
    alpha: 0.18 - i * 0.03,
    speed: 28 + i * 12,
  }));
  let frame = 0;
  function drawInk() {
    inkCtx.clearRect(0, 0, W, H);
    bursts.forEach((b) => {
      b.r += b.speed;
      if (b.r < b.maxR) {
        inkCtx.beginPath();
        inkCtx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        inkCtx.strokeStyle =
          color +
          Math.round(b.alpha * 255)
            .toString(16)
            .padStart(2, "0");
        inkCtx.lineWidth = 3;
        inkCtx.stroke();
        b.alpha -= 0.003;
      }
    });
    let alive = false;
    drops.forEach((d) => {
      if (d.alpha <= 0) return;
      alive = true;
      d.x += d.vx;
      d.y += d.vy;
      d.vy += 0.35;
      d.vx *= 0.97;
      d.alpha -= d.decay;
      inkCtx.save();
      inkCtx.globalAlpha = Math.max(0, d.alpha);
      inkCtx.beginPath();
      inkCtx.ellipse(
        d.x,
        d.y,
        d.size * 0.55,
        d.size * 0.72,
        Math.atan2(d.vy, d.vx),
        0,
        Math.PI * 2
      );
      inkCtx.fillStyle = color;
      inkCtx.fill();
      inkCtx.beginPath();
      inkCtx.ellipse(
        d.x - d.vx * 1.2,
        d.y - d.vy * 1.2,
        d.size * 0.25,
        d.size * 0.18,
        0,
        0,
        Math.PI * 2
      );
      inkCtx.fillStyle = color;
      inkCtx.fill();
      inkCtx.restore();
    });
    frame++;
    if (alive || frame < 40) requestAnimationFrame(drawInk);
    else {
      let fa = 1;
      (function fo() {
        fa -= 0.06;
        inkCtx.globalAlpha = fa;
        if (fa > 0) requestAnimationFrame(fo);
        else {
          inkCtx.clearRect(0, 0, W, H);
          inkCtx.globalAlpha = 1;
        }
      })();
    }
  }
  drawInk();
}

document.addEventListener("DOMContentLoaded", () => {
  const sysDark = window.matchMedia("(prefers-color-scheme: dark)");
  const themeLogo = document.getElementById("introLogoImg");
  const themeLogo2 = document.getElementById("theme-logo2");

  const themeToggle = document.querySelector(".theme-toggle");
  let themeTransitionTimer = null;

  function beginThemeTransition() {
    document.documentElement.classList.add("theme-transition");
    document.body.classList.add("theme-transition");
    window.clearTimeout(themeTransitionTimer);
    themeTransitionTimer = window.setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
      document.body.classList.remove("theme-transition");
    }, 420);
  }

  function updateThemeImage(isLight) {
    const nextSrc = isLight
      ? "/assets/images/logo/logo-light.png"
      : "/assets/images/logo/logo-dark.png";
    if (themeLogo && themeLogo.tagName === "IMG") themeLogo.src = nextSrc;
    if (themeLogo2 && themeLogo2.tagName === "IMG") themeLogo2.src = nextSrc;
  }

  function applyThemeState(state) {
    const isLight = state === "light" ? true : state === "dark" ? false : !sysDark.matches;

    document.documentElement.classList.toggle("light-mode", isLight);
    document.body.classList.toggle("light-mode", isLight);

    if (themeToggle) {
      themeToggle.setAttribute("data-theme", state);
      themeToggle.setAttribute(
        "aria-label",
        state === "light"
          ? "Tema claro (clique para escuro)"
          : state === "dark"
            ? "Tema escuro (clique para automático)"
            : "Tema automático (clique para claro)"
      );
    }

    updateThemeImage(isLight);
  }

  applyThemeState(localStorage.getItem("theme") || "auto");

  sysDark.addEventListener("change", () => {
    if ((localStorage.getItem("theme") || "auto") === "auto") {
      applyThemeState("auto");
    }
  });

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const cur = localStorage.getItem("theme") || "auto";
      const next = cur === "auto" ? "light" : cur === "light" ? "dark" : "auto";

      localStorage.setItem("theme", next);
      beginThemeTransition();
      applyThemeState(next);

      launchInk(next === "light" || (next === "auto" && !sysDark.matches) ? "#37a5b3" : "#2dd4c8");
    });
  }
});

// ── Vitrine sobreposta ─────────────────────────────────────────
(function () {
  const stage = document.getElementById("showcaseStage");
  const dotsWrap = document.getElementById("showcaseDots");
  const toggle = document.getElementById("deviceToggle");
  const prevBtn = document.querySelector(".photo-nav.prev");
  const nextBtn = document.querySelector(".photo-nav.next");
  const wrap = document.getElementById("showcaseWrap");

  if (!stage) return;

  const cards = Array.from(stage.querySelectorAll(".project-shot"));
  const n = cards.length;
  if (!n) return;

  const INTERVAL = 4200;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let current = 0,
    autoTimer = null,
    isPaused = false,
    transitioning = false;

  // Dots
  const dots = [];
  if (dotsWrap) {
    cards.forEach((_, i) => {
      const d = document.createElement("button");
      d.className = "showcase-dot" + (i === 0 ? " active" : "");
      d.setAttribute("aria-label", "Slide " + (i + 1));
      d.setAttribute("role", "tab");
      d.setAttribute("aria-selected", i === 0 ? "true" : "false");
      d.addEventListener("click", () => goTo(i, true));
      dotsWrap.appendChild(d);
      dots.push(d);
    });
  }

  function updateDots() {
    dots.forEach((d, i) => {
      d.classList.toggle("active", i === current);
      d.setAttribute("aria-selected", String(i === current));
    });
  }

  function getState(i) {
    const diff = (((i - current) % n) + n) % n;
    if (diff === 0) return "active";
    if (diff === 1) return "next";
    if (diff === n - 1) return "prev";
    if (diff === 2) return "far-next";
    if (diff === n - 2) return "far-prev";
    return "hidden";
  }

  function applyStates() {
    cards.forEach((card, i) => {
      const s = getState(i);
      card.dataset.state = s;
      card.setAttribute("tabindex", s === "active" ? "0" : "-1");
      card.setAttribute("aria-hidden", s === "active" ? "false" : "true");
    });
    updateDots();
  }

  function goTo(idx, manual = false) {
    const previous = current;
    if (transitioning && !manual) return;
    transitioning = true;
    current = ((idx % n) + n) % n;
    applyStates();

    if (manual && previous !== current) {
      trackAnalyticsEvent("showcase_navigation_used", {
        from_project: normalizeAnalyticsText(
          cards[previous]?.querySelector(".shot-caption")?.textContent
        ),
        to_project: normalizeAnalyticsText(
          cards[current]?.querySelector(".shot-caption")?.textContent
        ),
        device_view: wrap?.classList.contains("device-desktop") ? "desktop" : "mobile",
      });
    }

    setTimeout(
      () => {
        transitioning = false;
      },
      reducedMotion ? 0 : 550
    );
    if (manual) {
      isPaused = true;
      setTimeout(() => {
        isPaused = false;
      }, 2500);
    }
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      if (!isPaused) goTo(current + 1);
    }, INTERVAL);
  }

  function applyDevice(device) {
    if (toggle) {
      toggle.querySelectorAll(".device-option").forEach((btn) => {
        const active = btn.dataset.device === device;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-selected", String(active));
      });
    }
    cards.forEach((card) => {
      card.querySelector(".shot-desktop")?.classList.toggle("hidden", device !== "desktop");
      card.querySelector(".shot-mobile")?.classList.toggle("hidden", device !== "mobile");
    });
    wrap?.classList.toggle("device-desktop", device === "desktop");
    wrap?.classList.toggle("device-mobile", device === "mobile");
  }

  // Events
  toggle?.querySelectorAll(".device-option").forEach((btn) =>
    btn.addEventListener("click", () => {
      applyDevice(btn.dataset.device);
      trackAnalyticsEvent("showcase_device_selected", {
        device_view: btn.dataset.device || "unknown",
      });
    })
  );

  nextBtn?.addEventListener("click", () => goTo(current + 1, true));
  prevBtn?.addEventListener("click", () => goTo(current - 1, true));

  document.addEventListener("keydown", (e) => {
    const r = wrap?.getBoundingClientRect();
    if (!r || r.top >= window.innerHeight || r.bottom <= 0) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(current + 1, true);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(current - 1, true);
    }
  });

  wrap?.addEventListener("mouseenter", () => {
    isPaused = true;
  });
  wrap?.addEventListener("mouseleave", () => {
    isPaused = false;
  });
  document.addEventListener("visibilitychange", () => {
    isPaused = document.hidden;
  });

  // Swipe
  let tx = 0,
    ty = 0;
  stage.addEventListener(
    "touchstart",
    (e) => {
      tx = e.touches[0].clientX;
      ty = e.touches[0].clientY;
      isPaused = true;
    },
    { passive: true }
  );
  stage.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].clientX - tx;
      const dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40)
        goTo(dx < 0 ? current + 1 : current - 1, true);
      setTimeout(() => {
        isPaused = false;
      }, 2000);
    },
    { passive: true }
  );

  // Clicar em card não-ativo navega para ele
  cards.forEach((card, i) =>
    card.addEventListener("click", (e) => {
      if (card.dataset.state !== "active") {
        e.preventDefault();
        goTo(i, true);
        return;
      }

      trackAnalyticsEvent("showcase_project_clicked", {
        project_name: normalizeAnalyticsText(card.querySelector(".shot-caption")?.textContent),
        project_destination: card.getAttribute("href") || "none",
        device_view: wrap?.classList.contains("device-desktop") ? "desktop" : "mobile",
      });
    })
  );

  // Init
  applyDevice("mobile");
  applyStates();
  if (!reducedMotion && !shouldLiteEffects) startAuto();
})();

// ── GSAP ScrollTrigger ─────────────────────────────────────────
function initGSAP() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    initFallback();
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion || shouldReduceEffects) {
    initFallback();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Navbar
  ScrollTrigger.create({
    start: "top -50px",
    onEnter: () => navbar.classList.add("scrolled"),
    onLeaveBack: () => navbar.classList.remove("scrolled"),
  });

  // Hero backgrounds parallax + hero-passed
  const hero = document.getElementById("hero");
  const glow = document.querySelector(".hero-glow");
  const glow2 = document.querySelector(".hero-glow-2");
  const grid = document.querySelector(".hero-grid");
  const scrollI = hero?.querySelector(".scroll-indicator");

  if (hero && !reducedMotion) {
    // Backgrounds movem-se para cima mais devagar que o scroll
    // → parecem fixos enquanto o conteúdo sobe
    [glow, { el: glow, y: "-28%" }, glow2, { el: glow2, y: "-18%" }, grid, { el: grid, y: "-12%" }];

    [
      [glow, "-28%"],
      [glow2, "-18%"],
      [grid, "-12%"],
    ].forEach(([el, y]) => {
      if (!el) return;
      gsap.to(el, {
        y,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.8 },
      });
    });

    // Scroll indicator desaparece
    if (scrollI) {
      gsap.to(scrollI, {
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "20% top", scrub: true },
      });
    }
  }

  // hero-passed — esconde backgrounds fixos quando hero sai da tela
  ScrollTrigger.create({
    trigger: hero,
    start: "bottom top",
    onEnter: () => document.body.classList.add("hero-passed"),
    onLeaveBack: () => document.body.classList.remove("hero-passed"),
  });

  // Reveals
  document.querySelectorAll(".reveal").forEach((el, i) => {
    if (reducedMotion) {
      el.classList.add("visible");
      return;
    }
    gsap.fromTo(
      el,
      { opacity: 0, y: 22 },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: "power2.out",
        delay: (i % 3) * 0.06,
        scrollTrigger: { trigger: el, start: "top 92%", toggleActions: "play none none none" },
      }
    );
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
}

// ── Fallback (GSAP offline ou reduced-motion) ──────────────────
function initFallback() {
  // Hero passed
  const hero = document.getElementById("hero");
  const scrollI = hero?.querySelector(".scroll-indicator");
  window.addEventListener(
    "scroll",
    () => {
      const sy = window.scrollY;
      document.body.classList.toggle(
        "hero-passed",
        hero ? hero.getBoundingClientRect().bottom <= 0 : false
      );
      if (scrollI) scrollI.style.opacity = String(Math.max(0, 1 - sy / 150));
    },
    { passive: true }
  );

  // Reveals
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add("visible"), i * 70);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
}
