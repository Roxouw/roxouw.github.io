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

const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () =>
  navbar.classList.toggle("scrolled", window.scrollY > 50),
);

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
document
  .querySelectorAll(".reveal, .addon-item")
  .forEach((el) => observer.observe(el));

document.querySelectorAll(".faq-q").forEach((q) => {
  q.addEventListener("click", () => {
    const item = q.parentElement;
    const isOpen = item.classList.contains("open");
    document
      .querySelectorAll(".faq-item")
      .forEach((i) => i.classList.remove("open"));
    if (!isOpen) item.classList.add("open");
  });
});

const themeToggle = document.getElementById("themeToggle");
const inkCanvas = document.getElementById("inkCanvas");
const inkCtx = inkCanvas.getContext("2d");
function resizeInk() {
  inkCanvas.width = window.innerWidth;
  inkCanvas.height = window.innerHeight;
}
resizeInk();
window.addEventListener("resize", resizeInk);

function launchInk(color) {
  const W = inkCanvas.width,
    H = inkCanvas.height;
  const rect = themeToggle.getBoundingClientRect();
  const ox = rect.left + rect.width / 2,
    oy = rect.top + rect.height / 2;
  const drops = [];
  for (let i = 0; i < 22; i++) {
    const a = ((Math.PI * 2) / 22) * i + (Math.random() - 0.5) * 0.4;
    const s = 6 + Math.random() * 14,
      sz = 18 + Math.random() * 60;
    drops.push({
      x: ox,
      y: oy,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      size: sz,
      alpha: 0.85 + Math.random() * 0.15,
      decay: 0.013 + Math.random() * 0.01,
    });
  }
  const bursts = [];
  for (let i = 0; i < 5; i++)
    bursts.push({
      x: ox,
      y: oy,
      r: 0,
      maxR: W * (0.35 + i * 0.18),
      alpha: 0.18 - i * 0.03,
      speed: 28 + i * 12,
    });
  let frame = 0;
  function draw() {
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
      requestAnimationFrame(draw);
    } else {
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
  draw();
}

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
