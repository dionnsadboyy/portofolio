(() => {
  "use strict";

  /* =========================================================
     SETTINGS
  ========================================================== */

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const motionEase = "cubic-bezier(.2,.7,.2,1)";
  const smoothBehavior = prefersReducedMotion ? "auto" : "smooth";

  /* =========================================================
     PROJECT DESCRIPTIONS
  ========================================================== */

  const projectDescriptions = {
    yonngpt:
      "A personal finance product exploring AI-assisted workflows, budgeting, and a cleaner way to understand everyday spending.",

    "our-museum":
      "A personal web experience built around storytelling, visual presentation, and a more immersive way to browse content.",

    quranibot:
      "A WhatsApp chatbot project combining NLP, database-backed responses, and conversational interaction.",

    "yonn-apotek":
      "A pharmacy management project built around practical application development and database workflows.",
  };

  /* =========================================================
     HELPERS
  ========================================================== */

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const scrollTo = (selector) => {
    document.querySelector(selector)?.scrollIntoView({
      behavior: smoothBehavior,
      block: "start",
    });
  };

  const makeVisible = (el) => {
    if (!el) return;

    el.style.opacity = "1";
    el.style.visibility = "visible";
    el.style.filter = "none";
    el.style.transform = "none";
  };

  /* =========================================================
     NAVIGATION
  ========================================================== */

  const nav = document.querySelector(".nav-links");
  const menuToggle = document.querySelector(".menu-toggle");

  document.querySelectorAll(".nav-links button").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.textContent.trim();

      if (targetId) {
        scrollTo(`#${targetId}`);
      }

      nav?.classList.remove("nav-open");
      menuToggle?.setAttribute("aria-expanded", "false");
    });
  });

  document
    .querySelector(".services-panel .text-link")
    ?.addEventListener("click", () => {
      scrollTo("#contact");
    });

  menuToggle?.addEventListener("click", () => {
    if (!nav) return;

    const isOpen = nav.classList.toggle("nav-open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.querySelector(".monogram")?.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: smoothBehavior,
    });
  });

  /* =========================================================
     HERO REFERENCES
  ========================================================== */

  const heroTitle = document.querySelector(".hero-title");
  const headline = document.querySelector(".display-copy");
  const bodyCopy = document.querySelector(".body-copy");

  const heroImage = document.querySelector(".hero-image-wrap");
  const heroKicker = document.querySelector(".hero-kicker");
  const heroInfo = document.querySelector(".hero-info");

  const locationMain = document.querySelector(".location b");

  const locationSub = document.querySelector(".location small");

  const heroActions = [...document.querySelectorAll(".hero-actions a")];

  /* =========================================================
     SPLIT TEXT WITHOUT BREAKING LAYOUT
     
     IMPORTANT:
     spans remain INLINE.
     Do NOT use inline-block here.
  ========================================================== */

  function createCharacterSpans(element, className) {
    if (!element) return [];

    const source = element.cloneNode(true);
    const characters = [];

    element.innerHTML = "";
    element.style.visibility = "visible";

    const walk = (node, parent) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          [...child.textContent].forEach((character) => {
            if (character === " ") {
              parent.appendChild(document.createTextNode(" "));
              return;
            }

            const span = document.createElement("span");

            span.className = className;
            span.textContent = character;

            span.style.opacity = "0";
            span.style.filter = "blur(2px)";

            parent.appendChild(span);
            characters.push(span);
          });

          return;
        }

        if (child.nodeType === Node.ELEMENT_NODE) {
          const clone = child.cloneNode(false);

          parent.appendChild(clone);
          walk(child, clone);
        }
      });
    };

    walk(source, element);

    return characters;
  }

  /* =========================================================
     CHARACTER TYPING / REVEAL
  ========================================================== */

  async function typeReveal(
    element,
    {
      startDelay = 0,
      charDelay = 48,
      duration = 170,
      className = "typing-char",
    } = {},
  ) {
    if (!element) return 0;

    if (prefersReducedMotion) {
      makeVisible(element);
      return 0;
    }

    const characters = createCharacterSpans(element, className);

    if (!characters.length) {
      makeVisible(element);
      return 0;
    }

    element.style.opacity = "1";

    await wait(startDelay);

    characters.forEach((character, index) => {
      character.animate(
        [
          {
            opacity: 0,
            filter: "blur(2px)",
          },
          {
            opacity: 1,
            filter: "blur(0)",
          },
        ],
        {
          duration,
          delay: index * charDelay,
          easing: "ease-out",
          fill: "forwards",
        },
      );
    });

    const totalDuration = (characters.length - 1) * charDelay + duration;

    await wait(totalDuration);

    return totalDuration;
  }

  async function typePlainText(
    element,
    { startDelay = 0, charDelay = 38 } = {},
  ) {
    if (!element) return 0;

    if (prefersReducedMotion) {
      element.style.visibility = "visible";
      element.style.opacity = "1";
      return 0;
    }

    const fullText = element.textContent;

    element.textContent = "";
    element.style.visibility = "visible";
    element.style.opacity = "1";

    await wait(startDelay);

    for (const character of fullText) {
      element.textContent += character;
      await wait(charDelay);
    }

    return fullText.length * charDelay;
  }

  /* =========================================================
     HERO TITLE
  ========================================================== */

  function animateHeroTitle() {
    if (!heroTitle) return;

    if (prefersReducedMotion) {
      makeVisible(heroTitle);
      return;
    }

    const characters = createCharacterSpans(heroTitle, "hero-title-char");

    heroTitle.style.opacity = "1";

    characters.forEach((character, index) => {
      character.animate(
        [
          {
            opacity: 0,
            transform: "translateY(.35em)",
            filter: "blur(3px)",
          },
          {
            opacity: 1,
            transform: "translateY(0)",
            filter: "blur(0)",
          },
        ],
        {
          duration: 430,
          delay: 120 + index * 28,
          easing: motionEase,
          fill: "forwards",
        },
      );
    });
  }

  /* =========================================================
     HERO IMAGE
  ========================================================== */

  function animateHeroImage() {
    if (!heroImage) return;

    if (prefersReducedMotion) {
      makeVisible(heroImage);
      return;
    }

    heroImage.animate(
      [
        {
          opacity: 0,
          transform: "translate3d(28px, 18px, 0) scale(.975)",
          filter: "blur(6px)",
        },
        {
          opacity: 1,
          transform: "translate3d(0, 0, 0) scale(1)",
          filter: "blur(0)",
        },
      ],
      {
        duration: 1000,
        delay: 360,
        easing: "cubic-bezier(.16,1,.3,1)",
        fill: "forwards",
      },
    );
  }

  /* =========================================================
     HERO KICKER
  ========================================================== */

  function animateKicker() {
    if (!heroKicker) return;

    if (prefersReducedMotion) {
      makeVisible(heroKicker);
      return;
    }

    heroKicker.animate(
      [
        {
          opacity: 0,
          transform: "translateY(-8px)",
          filter: "blur(3px)",
        },
        {
          opacity: 1,
          transform: "translateY(0)",
          filter: "blur(0)",
        },
      ],
      {
        duration: 500,
        delay: 60,
        easing: motionEase,
        fill: "forwards",
      },
    );
  }

  /* =========================================================
     HERO SEQUENCE

     ORDER:
     kicker
     portfolio title
     photo
     headline typing
     body typing
     location typing
     buttons
  ========================================================== */

  async function runHeroSequence() {
    if (prefersReducedMotion) {
      [
        heroKicker,
        heroTitle,
        headline,
        bodyCopy,
        locationMain,
        locationSub,
        heroImage,
        heroInfo,
        ...heroActions,
      ].forEach(makeVisible);

      return;
    }

    animateKicker();
    animateHeroTitle();
    animateHeroImage();

    /* ---------------------------------------------------------
       HEADLINE
    ---------------------------------------------------------- */

    await typeReveal(headline, {
      startDelay: 950,
      charDelay: 48,
      duration: 165,
      className: "typing-char",
    });

    await wait(140);

    /* ---------------------------------------------------------
       BODY COPY
    ---------------------------------------------------------- */

    await typeReveal(bodyCopy, {
      startDelay: 0,
      charDelay: 34,
      duration: 125,
      className: "typing-char",
    });

    await wait(110);

    /* ---------------------------------------------------------
       LOCATION — SEPARATE ELEMENTS
       
       Do NOT target .location span because it is a flex
       container containing <b> and <small>.
    ---------------------------------------------------------- */

    await typePlainText(locationMain, {
      startDelay: 0,
      charDelay: 38,
    });

    await wait(80);

    await typePlainText(locationSub, {
      startDelay: 0,
      charDelay: 30,
    });

    await wait(230);

    /* ---------------------------------------------------------
       BUTTONS LAST
    ---------------------------------------------------------- */

    heroActions.forEach((button, index) => {
      button.animate(
        [
          {
            opacity: 0,
            transform: "translateY(10px) scale(.985)",
            filter: "blur(2px)",
          },
          {
            opacity: 1,
            transform: "translateY(0) scale(1)",
            filter: "blur(0)",
          },
        ],
        {
          duration: 500,
          delay: index * 90,
          easing: motionEase,
          fill: "forwards",
        },
      );
    });
  }

  /* =========================================================
     INITIAL HERO STATE
  ========================================================== */

  if (!prefersReducedMotion) {
    [heroKicker, heroImage].filter(Boolean).forEach((element) => {
      element.style.opacity = "0";
    });

    [heroTitle, headline, bodyCopy, locationMain, locationSub]
      .filter(Boolean)
      .forEach((element) => {
        element.style.opacity = "1";
        element.style.visibility = "hidden";
      });

    heroActions.forEach((button) => {
      button.style.opacity = "0";
    });
  }

  runHeroSequence();

  /* =========================================================
     SCROLL REVEAL
  ========================================================== */

  const revealItems = [
    ...document.querySelectorAll(
      [
        ".reveal",
        ".process-step",
        ".service-item",
        ".factory-story",
        ".factory-summary",
        ".stat",
        ".certificate-card",
        ".project-card",
      ].join(", "),
    ),
  ];

  function getRevealDirection(element) {
    if (
      element.classList.contains("service-item") ||
      element.classList.contains("factory-summary") ||
      element.closest(".services-panel")
    ) {
      return "right";
    }

    if (element.classList.contains("factory-story")) {
      return "left";
    }

    if (element.classList.contains("stat")) {
      return "left";
    }

    return "up";
  }

  function revealElement(element, index = 0) {
    if (!element) return;

    if (element.dataset.motionShown === "true") {
      return;
    }

    element.dataset.motionShown = "true";

    if (prefersReducedMotion) {
      makeVisible(element);
      return;
    }

    const direction = getRevealDirection(element);

    let initial;

    if (direction === "left") {
      initial = {
        opacity: 0,
        transform: "translateX(-30px)",
        filter: "blur(4px)",
      };
    } else if (direction === "right") {
      initial = {
        opacity: 0,
        transform: "translateX(30px)",
        filter: "blur(4px)",
      };
    } else {
      initial = {
        opacity: 0,
        transform: "translateY(28px)",
        filter: "blur(4px)",
      };
    }

    element.animate(
      [
        initial,
        {
          opacity: 1,
          transform: "translate(0, 0)",
          filter: "blur(0)",
        },
      ],
      {
        duration: 740,
        delay: Math.min(index, 5) * 75,
        easing: motionEase,
        fill: "forwards",
      },
    );
  }

  if (revealItems.length) {
    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const group = entry.target.closest(
            ".project-grid, .process-grid, .certificate-grid, .stats-strip",
          );

          const siblings = group
            ? [...group.querySelectorAll(":scope > *")]
            : [entry.target];

          const index = Math.max(0, siblings.indexOf(entry.target));

          revealElement(entry.target, index);

          observerInstance.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    revealItems.forEach((element) => {
      if (!prefersReducedMotion) {
        element.style.opacity = "0";
      }

      observer.observe(element);
    });
  }

  /* =========================================================
     PROJECT MODAL
  ========================================================== */

  const projectCards = [...document.querySelectorAll(".project-card")];

  const createModalStyles = () => {
    if (document.getElementById("project-modal-motion-styles")) {
      return;
    }

    const style = document.createElement("style");

    style.id = "project-modal-motion-styles";

    style.textContent = `
      .js-project-modal {
        position: fixed;
        inset: 0;
        z-index: 999;
        display: grid;
        place-items: center;
        padding: 22px;
        background: rgba(24, 22, 30, .48);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }

      .js-project-modal[hidden] {
        display: none;
      }

      .js-project-modal__panel {
        position: relative;
        width: min(980px, 100%);
        max-height: 92vh;
        overflow: auto;

        display: grid;
        grid-template-columns:
          minmax(0, 1.05fr)
          minmax(300px, .95fr);

        background: var(--cream);
        border: 1px solid var(--line);
        box-shadow:
          0 28px 90px rgba(24, 22, 30, .22);
      }

      .js-project-modal__image {
        display: block;
        width: 100%;
        height: 100%;
        min-height: 440px;
        object-fit: cover;
      }

      .js-project-modal__content {
        align-self: center;
        padding: 48px 42px;
      }

      .js-project-modal__title {
        margin: 0 0 18px;
        font:
          500 clamp(34px, 4vw, 54px) / 1
          "Playfair Display", serif;
        letter-spacing: -1.5px;
      }

      .js-project-modal__desc {
        margin: 0;
        max-width: 420px;
        color: var(--muted);
        font-size: 13px;
        line-height: 1.75;
      }

      .js-project-modal__meta {
        margin-top: 24px;
        color: var(--purple-deep);
        font-size: 9px;
        letter-spacing: 1.2px;
        text-transform: uppercase;
      }

      .js-project-modal__close {
        position: absolute;
        top: 14px;
        right: 14px;
        z-index: 2;

        width: 40px;
        height: 40px;

        display: grid;
        place-items: center;

        border: 0;
        border-radius: 50%;

        background: var(--cream);
        color: var(--ink);

        cursor: pointer;
        font-size: 20px;
      }

      @media (max-width: 760px) {
        .js-project-modal__panel {
          grid-template-columns: 1fr;
        }

        .js-project-modal__image {
          min-height: 250px;
          max-height: 42vh;
        }

        .js-project-modal__content {
          padding: 28px 24px 34px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .js-project-modal {
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
        }
      }
    `;

    document.head.appendChild(style);
  };

  createModalStyles();

  const createProjectModal = () => {
    const modal = document.createElement("div");

    modal.className = "js-project-modal";

    modal.hidden = true;

    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
      <div
        class="js-project-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="jsProjectModalTitle"
      >
        <button
          class="js-project-modal__close"
          type="button"
          aria-label="Close project preview"
        >
          ×
        </button>

        <img
          class="js-project-modal__image"
          alt=""
        />

        <div class="js-project-modal__content">
          <span
            class="eyebrow"
            id="jsProjectModalCategory"
          ></span>

          <h2
            class="js-project-modal__title"
            id="jsProjectModalTitle"
          ></h2>

          <p
            class="js-project-modal__desc"
          ></p>

          <div
            class="js-project-modal__meta"
          ></div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    return modal;
  };

  let projectModal = document.querySelector(".js-project-modal");

  if (!projectModal) {
    projectModal = createProjectModal();
  }

  const modalPanel = projectModal.querySelector(".js-project-modal__panel");

  const modalImage = projectModal.querySelector(".js-project-modal__image");

  const modalTitle = projectModal.querySelector("#jsProjectModalTitle");

  const modalCategory = projectModal.querySelector("#jsProjectModalCategory");

  const modalDescription = projectModal.querySelector(
    ".js-project-modal__desc",
  );

  const modalMeta = projectModal.querySelector(".js-project-modal__meta");

  const modalClose = projectModal.querySelector(".js-project-modal__close");

  let lastFocusedElement = null;

  const normalizeProjectId = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const getProjectData = (card) => {
    const image = card.querySelector(".project-image img");

    const title =
      card.querySelector(".project-meta b")?.textContent.trim() || "Project";

    const category =
      card.querySelector(".project-meta small")?.textContent.trim() ||
      "Project";

    const year = card.querySelector(".project-year")?.textContent.trim() || "";

    const datasetId = card.dataset.project?.trim();

    const projectId = datasetId || normalizeProjectId(title);

    return {
      id: projectId,
      title,
      category,
      year,
      image: image?.getAttribute("src") || "",
      alt: image?.getAttribute("alt") || title,
      description:
        projectDescriptions[projectId] ||
        "A personal project exploring design, development, and practical problem-solving.",
    };
  };

  const openProject = (card) => {
    if (!projectModal) return;

    const project = getProjectData(card);

    lastFocusedElement = document.activeElement;

    modalImage.src = project.image;

    modalImage.alt = `${project.title} project preview`;

    modalTitle.textContent = project.title;

    modalCategory.textContent = project.category;

    modalDescription.textContent = project.description;

    modalMeta.textContent = project.year;

    projectModal.hidden = false;

    projectModal.setAttribute("aria-hidden", "false");

    document.dispatchEvent(
      new CustomEvent("portfolio:project-open", {
        detail: { projectId: project.id },
      }),
    );

    document.body.style.overflow = "hidden";

    if (prefersReducedMotion) {
      makeVisible(projectModal);
      makeVisible(modalPanel);
    } else {
      projectModal.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 220,
        easing: "ease-out",
        fill: "forwards",
      });

      modalPanel.animate(
        [
          {
            opacity: 0,
            transform: "translateY(16px) scale(.985)",
          },
          {
            opacity: 1,
            transform: "translateY(0) scale(1)",
          },
        ],
        {
          duration: 500,
          easing: "cubic-bezier(.16,1,.3,1)",
          fill: "forwards",
        },
      );
    }

    modalClose?.focus();
  };

  const closeProject = () => {
    if (!projectModal || projectModal.hidden) {
      return;
    }

    if (prefersReducedMotion) {
      projectModal.hidden = true;

      projectModal.setAttribute("aria-hidden", "true");

      document.body.style.overflow = "";

      document.dispatchEvent(new CustomEvent("portfolio:project-close"));

      lastFocusedElement?.focus?.();

      return;
    }

    const animation = projectModal.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 180,
      easing: "ease-in",
      fill: "forwards",
    });

    animation.addEventListener(
      "finish",
      () => {
        projectModal.hidden = true;

        projectModal.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";

        document.dispatchEvent(new CustomEvent("portfolio:project-close"));

        lastFocusedElement?.focus?.();
      },
      { once: true },
    );
  };

  projectCards.forEach((card) => {
    card.addEventListener("click", () => openProject(card));
  });

  modalClose?.addEventListener("click", closeProject);

  projectModal?.addEventListener("click", (event) => {
    if (event.target === projectModal) {
      closeProject();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && projectModal && !projectModal.hidden) {
      closeProject();
    }
  });

  /* =========================================================
     ARCHIVE
  ========================================================== */

  const archiveToggle = document.getElementById("archiveToggle");

  const archiveList = document.getElementById("archiveList");

  const archiveShortcut = document.getElementById("archiveShortcut");

  if (archiveToggle && archiveList) {
    archiveToggle.addEventListener("click", () => {
      const isOpen = archiveToggle.getAttribute("aria-expanded") === "true";

      archiveToggle.setAttribute("aria-expanded", String(!isOpen));

      archiveList.hidden = isOpen;

      archiveToggle.classList.toggle("is-open", !isOpen);

      if (!isOpen && !prefersReducedMotion) {
        const archiveItems = [...archiveList.querySelectorAll(".archive-item")];

        archiveItems.forEach((item, index) => {
          item.animate(
            [
              {
                opacity: 0,
                transform: "translateY(12px)",
              },
              {
                opacity: 1,
                transform: "translateY(0)",
              },
            ],
            {
              duration: 420,
              delay: index * 70,
              easing: motionEase,
              fill: "forwards",
            },
          );
        });
      }
    });
  }

  if (archiveShortcut && archiveToggle) {
    archiveShortcut.addEventListener("click", () => {
      document.querySelector(".project-archive")?.scrollIntoView({
        behavior: smoothBehavior,
        block: "center",
      });

      setTimeout(() => archiveToggle.click(), prefersReducedMotion ? 0 : 450);
    });
  }

  /* =========================================================
     FOOTER YEAR
  ========================================================== */

  const footerYear = document.querySelector(".footer-bottom span");

  if (footerYear) {
    footerYear.textContent = footerYear.textContent.replace(
      /2026/,
      String(new Date().getFullYear()),
    );
  }

  /* =========================================================
     SUBTLE DESKTOP PARALLAX
  ========================================================== */

  if (
    !prefersReducedMotion &&
    heroImage &&
    window.matchMedia("(min-width: 901px)").matches
  ) {
    let ticking = false;

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;

        ticking = true;

        requestAnimationFrame(() => {
          const scrollY = Math.min(window.scrollY, 420);

          const offset = scrollY * 0.045;

          heroImage.style.translate = `0 ${offset}px`;

          ticking = false;
        });
      },
      { passive: true },
    );
  }

  /* =========================================================
     AI PORTFOLIO ASSISTANT
  ========================================================== */

  const assistantLauncher = document.getElementById("assistantLauncher");
  const assistantPanel = document.getElementById("assistantPanel");
  const assistantClose = document.getElementById("assistantClose");
  const assistantForm = document.getElementById("assistantForm");
  const assistantInput = document.getElementById("assistantInput");
  const assistantMessages = document.getElementById("assistantMessages");
  const assistantSuggestions = document.getElementById("assistantSuggestions");
  const assistantRoot = document.querySelector("[data-assistant-root]");
  const assistantHistory = [];
  const assistantFallback =
    "Maaf, assistant lagi bermasalah. Coba lagi sebentar atau hubungi Dion lewat email.";
  const assistantOutOfScopeSource =
    "I'm here to help you explore Dion's portfolio. Try asking about his background, projects, skills, or experience.";
  const assistantOutOfScope =
    "Gue khusus bantu jelasin tentang Dion dan portfolio ini. Coba tanya soal background, project, skill, atau pengalaman dia.";
  let activeSection = "hero";
  let activeProject = "";
  let assistantBusy = false;

  const addAssistantMessage = (content, role, extraClass = "") => {
    if (!assistantMessages) return null;
    const message = document.createElement("div");
    message.className =
      `assistant-message assistant-message--${role} ${extraClass}`.trim();
    message.textContent = content;
    assistantMessages.appendChild(message);
    assistantMessages.scrollTop = assistantMessages.scrollHeight;
    return message;
  };

  const resetAssistantConversation = () => {
    assistantHistory.splice(0, assistantHistory.length);
    if (!assistantMessages) return;
    assistantMessages.innerHTML = "";
    addAssistantMessage(
      "Tanya gue soal project, background, skill, atau pengalaman Dion.",
      "assistant",
    );
  };

  const closeAssistant = () => {
    if (!assistantPanel || !assistantLauncher) return;
    assistantPanel.classList.add("is-closing");
    assistantLauncher.setAttribute("aria-expanded", "false");
    resetAssistantConversation();
    assistantLauncher.focus();
    window.setTimeout(() => {
      assistantPanel.hidden = true;
      assistantPanel.classList.remove("is-closing");
    }, 200);
  };

  const openAssistant = () => {
    if (!assistantPanel || !assistantLauncher || activeProject) return;
    assistantPanel.hidden = false;
    assistantLauncher.setAttribute("aria-expanded", "true");
    assistantInput?.focus();
  };

  const setAssistantBusy = (isBusy) => {
    assistantBusy = isBusy;
    assistantInput?.toggleAttribute("disabled", isBusy);
    assistantForm?.querySelector("button")?.toggleAttribute("disabled", isBusy);
  };

  assistantLauncher?.addEventListener("click", openAssistant);
  assistantClose?.addEventListener("click", closeAssistant);
  assistantSuggestions?.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || !assistantInput) return;
    assistantInput.value = button.textContent.trim();
    assistantInput.focus();
  });
  assistantInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      assistantForm?.requestSubmit();
    }
  });
  assistantForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!assistantInput || assistantBusy) return;
    const message = assistantInput.value.trim();
    if (!message) return;
    addAssistantMessage(message, "user");
    assistantInput.value = "";
    setAssistantBusy(true);
    const thinking = addAssistantMessage(
      "Lagi mikir…",
      "assistant",
      "is-thinking",
    );
    try {
      const apiResponse = await fetch("/api/portfolio-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          section: activeSection,
          project: activeProject || undefined,
          history: assistantHistory.slice(-6),
        }),
      });
      const data = await apiResponse.json();
      const providerAnswer =
        data?.success && typeof data.answer === "string"
          ? data.answer
          : assistantFallback;
      const answer =
        providerAnswer === assistantOutOfScopeSource
          ? assistantOutOfScope
          : providerAnswer;
      thinking?.remove();
      addAssistantMessage(answer, "assistant");
      assistantHistory.push(
        { role: "user", content: message },
        { role: "assistant", content: answer.slice(0, 600) },
      );
      if (assistantHistory.length > 6)
        assistantHistory.splice(0, assistantHistory.length - 6);
    } catch {
      thinking?.remove();
      addAssistantMessage(assistantFallback, "assistant");
    } finally {
      setAssistantBusy(false);
      assistantInput.focus();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      assistantPanel &&
      !assistantPanel.hidden &&
      !activeProject
    )
      closeAssistant();
  });
  document.addEventListener("portfolio:project-open", (event) => {
    activeProject = event.detail?.projectId || "";
    assistantRoot?.setAttribute("aria-hidden", "true");
    if (assistantPanel) assistantPanel.hidden = true;
    resetAssistantConversation();
  });
  document.addEventListener("portfolio:project-close", () => {
    activeProject = "";
    assistantRoot?.removeAttribute("aria-hidden");
  });

  const contextSections = [
    [".hero", "hero"],
    ["#work", "projects"],
    [".process", "experience"],
    ["#manufacturing", "manufacturing"],
    ["#certifications", "certifications"],
    ["#contact", "contact"],
  ];
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting)
          activeSection = entry.target.dataset.assistantSection;
      });
    },
    { threshold: 0.35 },
  );
  contextSections.forEach(([selector, name]) => {
    const section = document.querySelector(selector);
    if (!section) return;
    section.dataset.assistantSection = name;
    sectionObserver.observe(section);
  });
})();
