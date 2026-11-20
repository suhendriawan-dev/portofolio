// ==================== THEME TOGGLE ====================
const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeLabel = document.querySelector(".theme-label");

function updateThemeButton() {
  const isDark = root.dataset.theme === "dark";
  themeToggle.setAttribute("aria-label", isDark ? "Aktifkan tema terang" : "Aktifkan tema gelap");
  themeLabel.textContent = isDark ? "Mode terang" : "Mode gelap";
}

themeToggle.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  if (nextTheme === "dark") {
    root.dataset.theme = "dark";
  } else {
    delete root.dataset.theme;
  }

  try {
    localStorage.setItem("portfolio-theme", nextTheme);
  } catch (error) {
    console.warn("Preferensi tema tidak dapat disimpan.", error);
  }
  updateThemeButton();
});
updateThemeButton();

// ==================== RESPONSIVE NAVIGATION ====================
const menuToggle = document.querySelector(".menu-toggle");
const navPanel = document.querySelector(".nav-panel");

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Buka menu navigasi");
  navPanel.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Buka menu navigasi" : "Tutup menu navigasi");
  navPanel.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 680) closeMenu();
});

document.addEventListener("click", (event) => {
  if (!navPanel.classList.contains("is-open")) return;
  if (navPanel.contains(event.target) || menuToggle.contains(event.target)) return;
  closeMenu();
});

navPanel.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

// ==================== TYPEWRITER & HERO ENTRANCE ====================
const typewriter = document.querySelector("[data-typewriter]");
const roles = ["Fullstack Web Developer", "PHP & Laravel Developer", "Mahasiswa Teknologi Informasi"];
let roleIndex = 0;
let characterIndex = 0;
let deletingRole = false;

if (typewriter && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  typewriter.textContent = "";

  function typeNextCharacter() {
    const role = roles[roleIndex];
    characterIndex += deletingRole ? -1 : 1;
    typewriter.textContent = role.slice(0, characterIndex);

    let delay = deletingRole ? 45 : 85;
    if (!deletingRole && characterIndex === role.length) {
      deletingRole = true;
      delay = 1300;
    } else if (deletingRole && characterIndex === 0) {
      deletingRole = false;
      roleIndex = (roleIndex + 1) % roles.length;
      delay = 280;
    }

    window.setTimeout(typeNextCharacter, delay);
  }

  window.setTimeout(typeNextCharacter, 450);
}

// ==================== NAVIGATION SCROLL STATE ====================
const siteHeader = document.querySelector(".site-header");
const scrollProgress = document.querySelector(".scroll-progress span");
const backToTop = document.querySelector(".back-to-top");

function updateScrollState() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  scrollProgress.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
  backToTop.classList.toggle("is-visible", window.scrollY > 400);
  updateActiveNavFromScroll();
}

window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", updateScrollState);

// ==================== NAVIGATION SCROLL SPY ====================
const navLinks = [...document.querySelectorAll(".nav-links a")];
const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter((section) => section instanceof HTMLElement);

function setActiveNav(sectionId) {
  navLinks.forEach((link) => {
    if (link.getAttribute("href") === `#${sectionId}`) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function updateActiveNavFromScroll() {
  const activationPoint = window.scrollY + siteHeader.offsetHeight + Math.min(280, window.innerHeight * 0.35);
  let activeSection = navSections[0];

  navSections.forEach((section) => {
    if (section.getBoundingClientRect().top + window.scrollY <= activationPoint) {
      activeSection = section;
    }
  });

  if (activeSection) setActiveNav(activeSection.id);
}

updateScrollState();

// ==================== SCROLL REVEAL ====================
const revealElements = document.querySelectorAll(".reveal");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

// ==================== CONTACT HELPERS ====================
const toast = document.querySelector(".toast");
let toastTimeout;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

const copyEmailButton = document.querySelector(".copy-email");
let copyEmailTimeout;

async function copyEmailToClipboard(email) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(email);
      return;
    } catch (error) {
      console.warn("Clipboard API gagal; mencoba metode salin alternatif.", error);
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = email;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";
  textarea.tabIndex = -1;
  document.body.appendChild(textarea);
  try {
    textarea.select();
    if (typeof document.execCommand !== "function" || !document.execCommand("copy")) {
      throw new Error("Browser tidak mendukung perintah salin.");
    }
  } finally {
    textarea.remove();
    copyEmailButton.focus();
  }
}

copyEmailButton.addEventListener("click", async () => {
  try {
    await copyEmailToClipboard(copyEmailButton.dataset.email);
    copyEmailButton.textContent = "Tersalin ✓";
    window.clearTimeout(copyEmailTimeout);
    copyEmailTimeout = window.setTimeout(() => {
      copyEmailButton.textContent = "Salin email";
    }, 2000);
  } catch (error) {
    console.error("Email tidak dapat disalin ke clipboard.", error);
    showToast("Gagal menyalin email. Silakan salin secara manual.");
  }
});

document.querySelectorAll("[data-project-detail-open]").forEach((trigger) => {
  const dialogId = trigger.getAttribute("aria-controls");
  const dialog = dialogId ? document.getElementById(dialogId) : null;
  const closeButton = dialog ? dialog.querySelector("[data-project-detail-close]") : null;

  if (!(dialog instanceof HTMLDialogElement) || !(closeButton instanceof HTMLButtonElement)) {
    throw new Error("Setiap project preview harus terhubung ke dialog detail dan tombol tutup.");
  }

  trigger.addEventListener("click", () => {
    dialog.showModal();
    document.body.classList.add("dialog-open");
  });
  closeButton.addEventListener("click", () => {
    dialog.close();
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    trigger.focus();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const openDialog = document.querySelector(".project-detail-dialog[open]");
  if (!openDialog) return;
  event.preventDefault();
  openDialog.close();
});

// ==================== FOOTER YEAR ====================
document.querySelector("#current-year").textContent = new Date().getFullYear();
