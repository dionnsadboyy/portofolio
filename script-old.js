const projects = [
  {
    title: "Nordic Wellness",
    category: "Wellness Website",
    year: "2026",
    image:
      "https://images.unsplash.com/photo-1571095490542-844ba2b703f4?auto=format&fit=crop&w=1400&q=85",
    description:
      "A calm digital experience built around wellness, clarity, and an editorial visual language.",
  },
  {
    title: "Studio Nør",
    category: "Creative Studio",
    year: "2026",
    image:
      "https://images.unsplash.com/photo-1702450899413-579b33d08fc0?auto=format&fit=crop&w=1400&q=85",
    description:
      "A visual identity and portfolio system for a modern creative studio.",
  },
  {
    title: "Aurora Living",
    category: "Interior Brand",
    year: "2025",
    image:
      "https://images.unsplash.com/photo-1599235363454-3fee2783941c?auto=format&fit=crop&w=1400&q=85",
    description:
      "An immersive brand website translating premium interiors into a restrained digital experience.",
  },
  {
    title: "Form / Field",
    category: "Editorial Platform",
    year: "2025",
    image:
      "https://images.unsplash.com/photo-1584464441663-3d23cb39b041?auto=format&fit=crop&w=1400&q=85",
    description:
      "An editorial platform concept focused on visual storytelling and clean information architecture.",
  },
];

const nav = document.querySelector(".nav-links");
const menuToggle = document.querySelector(".menu-toggle");
const scrollTo = (selector) =>
  document
    .querySelector(selector)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });

document.querySelectorAll(".nav-links button").forEach((btn) =>
  btn.addEventListener("click", () => {
    scrollTo("#" + btn.textContent.trim());
    nav?.classList.remove("nav-open");
  }),
);
document
  .querySelector(".services-panel .text-link")
  ?.addEventListener("click", () => scrollTo("#contact"));
menuToggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("nav-open");
  menuToggle.setAttribute("aria-expanded", String(open));
});
document
  .querySelector(".monogram")
  ?.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);
document
  .querySelectorAll(".reveal")
  .forEach((el) => revealObserver.observe(el));

const backdrop = document.querySelector(".modal-backdrop");
const modalImg = document.querySelector(".project-modal>img");
const modalTitle = document.querySelector(".modal-content h2");
const modalCategory = document.querySelector(".modal-content .eyebrow");
const modalDesc = document.querySelector(".modal-content p");
const closeBtn = document.querySelector(".modal-close");
function openProject(i) {
  const p = projects[i];
  if (!p || !backdrop) return;
  modalImg.src = p.image;
  modalImg.alt = p.title + " project preview";
  modalTitle.textContent = p.title;
  modalCategory.textContent = p.category + " · " + p.year;
  modalDesc.textContent = p.description;
  backdrop.hidden = false;
  document.body.style.overflow = "hidden";
  closeBtn?.focus();
}
function closeProject() {
  if (!backdrop) return;
  backdrop.hidden = true;
  document.body.style.overflow = "";
}
document
  .querySelectorAll(".project-card")
  .forEach((card, i) => card.addEventListener("click", () => openProject(i)));
closeBtn?.addEventListener("click", closeProject);
backdrop?.addEventListener("click", (e) => {
  if (e.target === backdrop) closeProject();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !backdrop.hidden) closeProject();
});
const year = document.querySelector(".footer-bottom span");
if (year)
  year.innerHTML = year.innerHTML.replace(/2026/, new Date().getFullYear());

const archiveToggle = document.getElementById("archiveToggle");
const archiveList = document.getElementById("archiveList");
const archiveShortcut = document.getElementById("archiveShortcut");

if (archiveToggle && archiveList) {
  archiveToggle.addEventListener("click", () => {
    const isOpen = archiveToggle.getAttribute("aria-expanded") === "true";

    archiveToggle.setAttribute("aria-expanded", String(!isOpen));
    archiveList.hidden = isOpen;

    archiveToggle.classList.toggle("is-open", !isOpen);
  });
}

if (archiveShortcut && archiveToggle) {
  archiveShortcut.addEventListener("click", () => {
    document.querySelector(".project-archive")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    setTimeout(() => {
      archiveToggle.click();
    }, 450);
  });
}
