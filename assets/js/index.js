// Custom cursor — desktop only
const cursor = document.getElementById("cursor");
const ring = document.getElementById("cursorRing");
let mx = 0,
  my = 0,
  rx = 0,
  ry = 0;
if (window.matchMedia("(pointer:fine)").matches) {
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
        getComputedStyle(document.documentElement)
          .getPropertyValue("--teal")
          .trim() + "99";
    });
    el.addEventListener("mouseleave", () => {
      cursor.style.transform = "scale(1)";
      ring.style.borderColor = "";
    });
  });
}

// Navbar scroll
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () =>
  navbar.classList.toggle("scrolled", window.scrollY > 50),
);

// Hamburger
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  mobileMenu.classList.toggle("open");
  document.body.style.overflow = mobileMenu.classList.contains("open")
    ? "hidden"
    : "";
});
function closeMobile() {
  hamburger.classList.remove("open");
  mobileMenu.classList.remove("open");
  document.body.style.overflow = "";
}

// ── Intro: cinematic sequence ─────────────────────────────
(function () {
  const intro = document.getElementById("intro");
  const introName = document.getElementById("introName");
  const introFirst = document.getElementById("introFirst");
  const introLast = document.getElementById("introLast");
  const introBar = document.getElementById("introBar");
  const barFill = document.getElementById("introBarFill");
  const barShine = document.getElementById("introBarShine");
  const introText = document.getElementById("introText");
  const heroSection = document.getElementById("hero");
  const navLogo = document.querySelector(".nav-logo");

  document.body.style.overflow = "hidden";

  // ── 1. Preload real: aguarda fontes + imagens críticas ──────
  const preloadDone = Promise.all([
    document.fonts.ready,
    new Promise((res) => {
      if (document.readyState === "complete") res();
      else window.addEventListener("load", res, { once: true });
    }),
  ]);

  // ── 2. Helpers ──────────────────────────────────────────────
  function buildLetters(el, text, cls) {
    el.innerHTML = "";
    return [...text].map((ch, i) => {
      const s = document.createElement("span");
      s.className = "intro-letter " + cls;
      s.textContent = ch === " " ? "\u00A0" : ch;
      el.appendChild(s);
      return s;
    });
  }

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  // Barra: rAF-driven, easing quadrático
  function runBar(duration) {
    return new Promise((res) => {
      introBar.classList.add("visible");
      const start = performance.now();
      function tick(now) {
        const raw = Math.min((now - start) / duration, 1);
        const eased =
          raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
        const pct = eased * 100;
        barFill.style.width = pct + "%";
        // shine: brilhinho que corre pela barra
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

  // ── 3. Sequência principal ──────────────────────────────────
  async function runIntro() {
    await preloadDone;

    const firstName = "Filipe";
    const lastName = " Rosso";
    const LETTER_GAP = 58; // ms entre letras

    // Gera spans
    const firstLetters = buildLetters(introFirst, firstName, "intro-first");
    const lastLetters = buildLetters(introLast, lastName, "intro-last");
    const allLetters = [...firstLetters, ...lastLetters];

    // Aguarda um frame para garantir que o DOM está pronto
    await wait(80);

    // ── a) Letra por letra ──
    for (let i = 0; i < allLetters.length; i++) {
      await wait(LETTER_GAP);
      allLetters[i].classList.add("on");
    }

    await wait(180);

    // ── b) Barra carrega ──
    await runBar(820);

    // ── c) Subtítulo aparece ──
    introText.classList.add("visible");
    await wait(460);

    // ── d) Zoom-out: nome escala levemente (anticipação) ──
    introName.classList.add("zoom-out");
    await wait(300);

    // ── e) Morph: calcula posição da nav-logo e voa até lá ──
    const nameBounds = introName.getBoundingClientRect();
    const logoBounds = navLogo ? navLogo.getBoundingClientRect() : null;

    if (logoBounds) {
      // Centro do nome atual
      const nameCX = nameBounds.left + nameBounds.width / 2;
      const nameCY = nameBounds.top + nameBounds.height / 2;
      // Centro do nav-logo de destino
      const logoCX = logoBounds.left + logoBounds.width / 2;
      const logoCY = logoBounds.top + logoBounds.height / 2;
      // Scale relativo (nav-logo é menor)
      const scaleX = logoBounds.width / nameBounds.width;
      const scaleY = logoBounds.height / nameBounds.height;
      const scaleTarget = Math.min(scaleX, scaleY);
      // Remove zoom-out (que adicionou scale via classe) e aplica o transform manual
      introName.classList.remove("zoom-out");

      // Pequeno rAF para garantir o remove tomou efeito
      await new Promise((r) => requestAnimationFrame(r));

      const dx = logoCX - nameCX;
      const dy = logoCY - nameCY;

      introName.style.transition =
        "transform 0.6s cubic-bezier(0.4,0,0.2,1), opacity 0.45s ease 0.1s, filter 0.45s ease 0.1s";
      introName.style.transform = `translate(${dx}px, ${dy}px) scale(${scaleTarget})`;
      introName.style.opacity = "0";
      introName.style.filter = "blur(4px)";
    } else {
      // fallback: fade out simples
      introName.style.transition = "opacity 0.5s, filter 0.5s";
      introName.style.opacity = "0";
      introName.style.filter = "blur(8px)";
    }

    // ── f) Fundo dissolve com blur ──
    await wait(120);
    intro.classList.add("exit");

    // ── g) Hero surge suavemente, com atraso mínimo ──
    await wait(180);
    heroSection.classList.add("hero-enter");

    // Limpa overlay do fluxo depois da transição
    await wait(950);
    intro.style.display = "none";
    document.body.style.overflow = "";
  }

  runIntro();
})();

// Reveal on scroll
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add("visible"), i * 70);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08 },
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// ── Modal Nicho ────────────────────────────
const nichoModal = document.getElementById("nichoModal");
const nichoCloseBtn = document.getElementById("nichoCloseBtn");

function openNichoModal() {
  nichoModal.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeNichoModal() {
  nichoModal.classList.remove("open");
  document.body.style.overflow = "";
}

nichoCloseBtn.addEventListener("click", closeNichoModal);
nichoModal.addEventListener("click", (e) => {
  if (e.target === nichoModal) closeNichoModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeNichoModal();
});

// ── Light / Dark theme toggle + ink splash ──
const themeToggle = document.getElementById("themeToggle");
const inkCanvas = document.getElementById("inkCanvas");
const inkCtx = inkCanvas.getContext("2d");

function resizeInkCanvas() {
  inkCanvas.width = window.innerWidth;
  inkCanvas.height = window.innerHeight;
}
resizeInkCanvas();
window.addEventListener("resize", resizeInkCanvas);

function launchInk(color) {
  const W = inkCanvas.width;
  const H = inkCanvas.height;
  const rect = themeToggle.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  // Drops
  const drops = [];
  const COUNT = 22;
  for (let i = 0; i < COUNT; i++) {
    const angle = ((Math.PI * 2) / COUNT) * i + (Math.random() - 0.5) * 0.4;
    const speed = 6 + Math.random() * 14;
    const size = 18 + Math.random() * 60;
    drops.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      alpha: 0.85 + Math.random() * 0.15,
      decay: 0.013 + Math.random() * 0.01,
    });
  }

  // Expanding ring bursts
  const bursts = [];
  for (let i = 0; i < 5; i++) {
    bursts.push({
      x: originX,
      y: originY,
      r: 0,
      maxR: W * (0.35 + i * 0.18),
      alpha: 0.18 - i * 0.03,
      speed: 28 + i * 12,
    });
  }

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
        Math.PI * 2,
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
        Math.PI * 2,
      );
      inkCtx.fillStyle = color;
      inkCtx.fill();
      inkCtx.restore();
    });

    frame++;
    if (alive || frame < 40) {
      requestAnimationFrame(drawInk);
    } else {
      let fa = 1;
      (function fadeOut() {
        fa -= 0.06;
        inkCtx.globalAlpha = fa;
        if (fa > 0) requestAnimationFrame(fadeOut);
        else {
          inkCtx.clearRect(0, 0, W, H);
          inkCtx.globalAlpha = 1;
        }
      })();
    }
  }
  drawInk();
}

(function () {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme) {
    if (savedTheme === "light") {
      document.documentElement.classList.add("light-mode");
    }
  } else {
    const prefersLight = window.matchMedia(
      "(prefers-color-scheme: light)",
    ).matches;

    if (prefersLight) {
      document.documentElement.classList.add("light-mode");
    }
  }
})();

// Aplica tema salvo + sincroniza body e html
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.documentElement.classList.add("light-mode");
  document.body.classList.add("light-mode");
}

themeToggle.addEventListener("click", () => {
  const isLight = document.documentElement.classList.toggle("light-mode");
  document.body.classList.toggle("light-mode", isLight);
  localStorage.setItem("theme", isLight ? "light" : "dark");
  launchInk(isLight ? "#37a5b3" : "#2dd4c8");
});

const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(e) {
  const saved = localStorage.getItem("theme");

  if (saved === "dark") {
    document.documentElement.classList.remove("light-mode");
    return;
  }

  if (saved === "light") {
    document.documentElement.classList.add("light-mode");
    return;
  }

  // system mode
  if (e.matches) {
    document.documentElement.classList.remove("light-mode");
  } else {
    document.documentElement.classList.add("light-mode");
  }
}

// apply on load
applyTheme(mediaQuery);

// listen system changes
mediaQuery.addEventListener("change", applyTheme);

// toggle button (3 states)
function toggleTheme() {
  const current = localStorage.getItem("theme");

  if (!current) {
    localStorage.setItem("theme", "light");
  } else if (current === "light") {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.removeItem("theme");
  }

  applyTheme(mediaQuery);
}
