(() => {
  "use strict";
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    entry.setAttribute("role", "button");
    entry.setAttribute("tabindex", "0");
    entry.setAttribute("aria-pressed", String(entry.classList.contains("is-active")));
    entry.addEventListener("mouseenter", () => selectArchiveEntry(entry));
    entry.addEventListener("focus", () => selectArchiveEntry(entry));
    entry.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey) return;
      event.preventDefault();
      selectArchiveEntry(entry);
    });
    entry.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        selectArchiveEntry(entry);
      }
    });
  });
  const initialArchiveEntry = archiveEntries.find((entry) => entry.classList.contains("is-active"));
  if (initialArchiveEntry) activeProject = initialArchiveEntry.dataset.projectId || "";

})();
