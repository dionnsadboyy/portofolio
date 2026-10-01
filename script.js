(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const motionEase = "cubic-bezier(.2,.7,.2,1)";
  const smoothBehavior = reducedMotion ? "auto" : "smooth";

  if (!reducedMotion) document.documentElement.classList.add("js-motion");

  /* Navigation */
  const nav = document.querySelector(".nav-links");
  const menuToggle = document.querySelector(".menu-toggle");

  menuToggle?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("nav-open") || false;
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav?.addEventListener("click", (event) => {
    if (!event.target.closest("a")) return;
    nav.classList.remove("nav-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* Hero text and image reveal */
  const heroTitle = document.querySelector(".hero-title");
  const heroImage = document.querySelector(".hero-image-wrap");
  const heroKicker = document.querySelector(".hero-kicker");
  const heroLead = document.querySelector(".display-copy");
  const heroNote = document.querySelector(".body-copy");
  const heroActions = [...document.querySelectorAll(".hero-actions a")];

  function makeVisible(element) {
    if (!element) return;
    element.style.opacity = "1";
    element.style.visibility = "visible";
    element.style.filter = "none";
  }

  function splitCharacters(element, className) {
    if (!element) return [];
    const source = element.cloneNode(true);
    const characters = [];
    element.replaceChildren();

    const walk = (node, parent) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          [...child.textContent].forEach((character) => {
            if (/\s/.test(character)) {
              parent.appendChild(document.createTextNode(character));
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

  function revealCharacters(element, delay, duration, className) {
    const characters = splitCharacters(element, className);
    if (!characters.length) {
      makeVisible(element);
      return 0;
    }
    element.style.opacity = "1";
    characters.forEach((character, index) => {
      character.animate(
        [
          { opacity: 0, filter: "blur(2px)", transform: "translateY(.22em)" },
          { opacity: 1, filter: "blur(0)", transform: "translateY(0)" },
        ],
        {
          duration,
          delay: delay + index * 24,
          easing: motionEase,
          fill: "forwards",
        },
      );
    });
    return delay + characters.length * 24 + duration;
  }

  function animateHero() {
    if (reducedMotion) {
      [heroTitle, heroImage, heroKicker, heroLead, heroNote, ...heroActions].forEach(makeVisible);
      return;
    }

    [heroTitle, heroImage, heroKicker, heroLead, heroNote].filter(Boolean).forEach((element) => {
      element.style.opacity = "0";
    });
    heroActions.forEach((action) => {
      action.style.opacity = "0";
    });

    heroKicker?.animate(
      [
        { opacity: 0, transform: "translateY(-8px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 480, delay: 70, easing: motionEase, fill: "forwards" },
    );

    revealCharacters(heroTitle, 120, 420, "hero-title-char");

    heroImage?.animate(
      [
        { opacity: 0, transform: "translate3d(25px, 18px, 0) scale(.975)", filter: "blur(5px)" },
        { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)", filter: "blur(0)" },
      ],
      { duration: 950, delay: 330, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" },
    );

    const leadEnd = revealCharacters(heroLead, 540, 130, "typing-char");
    revealCharacters(heroNote, leadEnd + 90, 110, "typing-char");

    heroActions.forEach((action, index) => {
      action.animate(
        [
          { opacity: 0, transform: "translateY(9px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 440, delay: leadEnd + 330 + index * 95, easing: motionEase, fill: "forwards" },
      );
    });
  }

  animateHero();

  /* Scroll reveal with a small stagger inside each editorial group */
  document.querySelectorAll(".project-shot, .project-heading, .project-bottomline, .project-facts").forEach((element) => {
    element.classList.add("reveal");
  });

  const revealTargets = [...document.querySelectorAll(".reveal")];
  if (!reducedMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const group = entry.target.closest(
          ".teamcut-gallery, .dua-gallery, .bagong-gallery, .archive-list, .timeline, .process-sequence, .now-list",
        );
        const siblings = group ? [...group.querySelectorAll(":scope > .reveal")] : [entry.target];
        const index = Math.max(0, siblings.indexOf(entry.target));
        entry.target.classList.add("is-visible");
        entry.target.animate(
          [
            { opacity: 0, transform: "translate3d(0, 21px, 0)", filter: "blur(2px)" },
            { opacity: 1, transform: "translate3d(0, 0, 0)", filter: "blur(0)" },
          ],
          { duration: 620, delay: Math.min(index, 4) * 65, easing: motionEase, fill: "forwards" },
        );
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });

    revealTargets.forEach((element) => revealObserver.observe(element));
  } else {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
  }

  /* Subtle scroll-linked drift and pointer depth keep the existing kinetic feel. */
  const driftTargets = [
    ...document.querySelectorAll(".project-card, .archive-entry, .timeline-item, .process-step, .now-item"),
  ];
  let driftFrame = 0;
  let lastScrollY = window.scrollY;
  let velocity = 0;
  let targetVelocity = 0;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  function updateDrift() {
    const currentY = window.scrollY;
    targetVelocity = clamp(currentY - lastScrollY, -32, 32);
    lastScrollY = currentY;
    if (!driftFrame && !reducedMotion) driftFrame = requestAnimationFrame(animateDrift);
  }

  function animateDrift() {
    velocity += (targetVelocity - velocity) * 0.2;
    targetVelocity *= 0.84;
    driftTargets.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const position = (rect.top + rect.height * 0.5 - window.innerHeight * 0.5) / window.innerHeight;
      const offset = clamp(position * 2.2 + velocity * 0.12, -4.5, 4.5);
      element.style.setProperty("--scroll-drift", offset.toFixed(2) + "px");
    });
    if (Math.abs(velocity) > 0.12 || Math.abs(targetVelocity) > 0.12) {
      driftFrame = requestAnimationFrame(animateDrift);
    } else {
      driftFrame = 0;
      driftTargets.forEach((element) => element.style.setProperty("--scroll-drift", "0px"));
    }
  }

  if (!reducedMotion) window.addEventListener("scroll", updateDrift, { passive: true });

  /* Archive preview: Selected Work stays visible; previews live in the archive index. */
  const archivePreview = document.getElementById("archivePreview");
  const archivePreviewImage = document.getElementById("archivePreviewImage");
  const archivePreviewTitle = document.getElementById("archivePreviewTitle");
  const archiveEntries = [...document.querySelectorAll(".archive-entry[data-project-id]")];
  let activeProject = "";
  let previewTimer = 0;

  function selectArchiveEntry(entry) {
    if (!entry || !archivePreviewImage) return;
    archiveEntries.forEach((item) => {
      const active = item === entry;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    activeProject = entry.dataset.projectId || "";
    archivePreview?.classList.toggle("is-text-only", !entry.dataset.previewImage);
    archivePreview?.classList.add("is-changing");
    window.clearTimeout(previewTimer);
    previewTimer = window.setTimeout(() => {
      if (entry.dataset.previewImage) {
        archivePreviewImage.src = entry.dataset.previewImage;
        archivePreviewImage.alt = entry.dataset.previewAlt || entry.dataset.previewTitle || "Archive project";
        archivePreviewImage.hidden = false;
      } else {
        archivePreviewImage.hidden = true;
      }
      if (archivePreviewTitle) archivePreviewTitle.textContent = entry.dataset.previewTitle || "";
      archivePreview?.classList.remove("is-changing");
    }, reducedMotion ? 0 : 110);
  }

  archiveEntries.forEach((entry) => {
    entry.addEventListener("mouseenter", () => selectArchiveEntry(entry));
    entry.addEventListener("focus", () => selectArchiveEntry(entry));
    entry.addEventListener("click", () => selectArchiveEntry(entry));
  });
  const initialArchiveEntry = archiveEntries.find((entry) => entry.classList.contains("is-active"));
  if (initialArchiveEntry) activeProject = initialArchiveEntry.dataset.projectId || "";

  /* Assistant launcher and conversation history */
  const assistantLauncher = document.getElementById("assistantLauncher");
  const assistantPanel = document.getElementById("assistantPanel");
  const assistantClose = document.getElementById("assistantClose");
  const assistantForm = document.getElementById("assistantForm");
  const assistantInput = document.getElementById("assistantInput");
  const assistantMessages = document.getElementById("assistantMessages");
  const assistantSuggestions = document.getElementById("assistantSuggestions");
  const assistantHistory = [];
  const assistantFallback = "Maaf, assistant lagi bermasalah. Coba lagi sebentar atau hubungi Dion lewat email.";
  const assistantOutOfScopeSource =
    "I'm here to help you explore Dion's portfolio. Try asking about his background, projects, skills, or experience.";
  const assistantOutOfScope =
    "Aku khusus membantu menjelaskan Dion dan portfolio ini. Coba tanya soal background, project, skill, atau pengalaman.";
  let activeSection = "hero";
  let assistantBusy = false;

  function addAssistantMessage(content, role, extraClass) {
    if (!assistantMessages) return null;
    const message = document.createElement("div");
    message.className = ("assistant-message assistant-message--" + role + " " + (extraClass || "")).trim();
    message.textContent = content;
    assistantMessages.appendChild(message);
    assistantMessages.scrollTop = assistantMessages.scrollHeight;
    return message;
  }

  function resetAssistantConversation() {
    assistantHistory.splice(0, assistantHistory.length);
    if (!assistantMessages) return;
    assistantMessages.replaceChildren();
    addAssistantMessage("Tanya soal project, cerita, atau hal yang lagi Dion pelajari.", "assistant");
  }

  function closeAssistant() {
    if (!assistantPanel || !assistantLauncher) return;
    assistantPanel.classList.add("is-closing");
    assistantLauncher.setAttribute("aria-expanded", "false");
    resetAssistantConversation();
    assistantLauncher.focus();
    window.setTimeout(() => {
      assistantPanel.hidden = true;
      assistantPanel.classList.remove("is-closing");
    }, reducedMotion ? 0 : 190);
  }

  function openAssistant() {
    if (!assistantPanel || !assistantLauncher) return;
    assistantPanel.hidden = false;
    assistantLauncher.setAttribute("aria-expanded", "true");
    assistantInput?.focus();
  }

  function setAssistantBusy(isBusy) {
    assistantBusy = isBusy;
    assistantInput?.toggleAttribute("disabled", isBusy);
    assistantForm?.querySelector("button")?.toggleAttribute("disabled", isBusy);
  }

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
    const thinking = addAssistantMessage("Lagi mikir…", "assistant", "is-thinking");
    try {
      const response = await fetch("/api/portfolio-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          section: activeSection,
          project: activeProject || undefined,
          history: assistantHistory.slice(-6),
        }),
      });
      const data = await response.json();
      const providerAnswer = response.ok && data?.success && typeof data.answer === "string"
        ? data.answer
        : assistantFallback;
      const answer = providerAnswer === assistantOutOfScopeSource ? assistantOutOfScope : providerAnswer;
      thinking?.remove();
      addAssistantMessage(answer, "assistant");
      assistantHistory.push(
        { role: "user", content: message },
        { role: "assistant", content: answer.slice(0, 600) },
      );
      if (assistantHistory.length > 6) assistantHistory.splice(0, assistantHistory.length - 6);
    } catch {
      thinking?.remove();
      addAssistantMessage(assistantFallback, "assistant");
    } finally {
      setAssistantBusy(false);
      assistantInput?.focus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && assistantPanel && !assistantPanel.hidden) {
      closeAssistant();
    }
  });

  const contextSections = [
    [".hero", "hero"],
    ["#work", "selected work"],
    ["#archive", "archive"],
    ["#about", "about"],
    ["#process", "how I build"],
    ["#now", "now"],
    ["#contact", "contact"],
  ];

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) activeSection = entry.target.dataset.assistantSection;
      });
    }, { threshold: 0.32 });

    contextSections.forEach(([selector, name]) => {
      const section = document.querySelector(selector);
      if (!section) return;
      section.dataset.assistantSection = name;
      sectionObserver.observe(section);
    });
  }
})();
