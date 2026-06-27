(function () {
  const leafPositions = [
    { x: 24, y: 34 },
    { x: 38, y: 22 },
    { x: 61, y: 20 },
    { x: 76, y: 34 },
    { x: 28, y: 54 },
    { x: 48, y: 43 },
    { x: 68, y: 55 },
    { x: 52, y: 66 },
    { x: 18, y: 25 },
    { x: 83, y: 24 }
  ];

  const lanternPositions = [
    { x: 18, y: 48 },
    { x: 34, y: 33 },
    { x: 50, y: 28 },
    { x: 67, y: 35 },
    { x: 83, y: 50 }
  ];

  const state = {
    initialized: false,
    lastFocus: null
  };

  function init() {
    if (state.initialized) return;
    state.initialized = true;

    const media = window.MoonlightMedia || {};
    const photos = selectPhotos(media);
    const videos = selectVideos(media);
    renderLeaves(photos);
    renderLanterns(videos);
    Moonlight.createFireflies(Moonlight.qs("#tree-fireflies"), 34);
    bindModal();
  }

  function selectPhotos(media) {
    if (Array.isArray(media.selectedPhotos) && media.selectedPhotos.length) {
      return media.selectedPhotos;
    }

    return (media.photos || [])
      .filter((src) => /20260517|20260614|20260521/.test(src))
      .slice(0, 8);
  }

  function selectVideos(media) {
    if (Array.isArray(media.selectedVideos) && media.selectedVideos.length) {
      return media.selectedVideos;
    }

    return (media.videos || []).slice(0, 4);
  }

  function renderLeaves(photos) {
    const mount = Moonlight.qs("#memory-leaves");
    if (!mount || mount.children.length) return;

    photos.forEach((src, index) => {
      const button = document.createElement("button");
      const position = leafPositions[index % leafPositions.length];
      button.type = "button";
      button.className = `memory-leaf${index % 3 === 0 ? " is-glowing" : ""}`;
      button.dataset.type = "photo";
      button.dataset.src = src;
      button.setAttribute("aria-label", `Open memory ${index + 1}`);
      button.style.left = `${position.x}%`;
      button.style.top = `${position.y}%`;
      button.style.setProperty("--leaf-speed", `${Moonlight.random(7, 12).toFixed(1)}s`);
      button.style.setProperty("--leaf-rotate", `${Moonlight.random(-6, 6).toFixed(2)}deg`);

      const img = document.createElement("img");
      img.src = src;
      img.alt = "A memory of Anaswara";
      img.loading = "lazy";
      img.decoding = "async";
      button.appendChild(img);
      mount.appendChild(button);
    });
  }

  function renderLanterns(videos) {
    const mount = Moonlight.qs("#memory-lanterns");
    if (!mount || mount.children.length) return;

    videos.forEach((src, index) => {
      const button = document.createElement("button");
      const position = lanternPositions[index % lanternPositions.length];
      button.type = "button";
      button.className = "memory-lantern";
      button.dataset.type = "video";
      button.dataset.src = src;
      button.setAttribute("aria-label", `Open video memory ${index + 1}`);
      button.style.left = `${position.x}%`;
      button.style.top = `${position.y}%`;
      button.style.setProperty("--lantern-speed", `${Moonlight.random(8, 14).toFixed(1)}s`);
      mount.appendChild(button);
    });
  }

  function bindModal() {
    const modal = Moonlight.qs("#media-modal");
    const stage = Moonlight.qs("#modal-stage");
    const close = Moonlight.qs("#modal-close");
    if (!modal || !stage || !close || modal.dataset.bound) return;
    modal.dataset.bound = "true";

    Moonlight.qs("#memory-tree-section").addEventListener("click", (event) => {
      const trigger = event.target.closest(".memory-leaf, .memory-lantern");
      if (!trigger) return;
      state.lastFocus = trigger;
      bloom(trigger);
      openModal(trigger.dataset.type, trigger.dataset.src);
    });

    close.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
      }
    });
  }

  function bloom(trigger) {
    trigger.classList.add("is-blooming");
    window.setTimeout(() => trigger.classList.remove("is-blooming"), 650);
  }

  function openModal(type, src) {
    const modal = Moonlight.qs("#media-modal");
    document.getElementById("tree-hint")?.classList.add("hide");
    const stage = Moonlight.qs("#modal-stage");
    stage.textContent = "";

    const element = type === "video" ? document.createElement("video") : document.createElement("img");
    element.src = src;

    if (type === "video") {
      element.controls = true;
      element.autoplay = true;
      element.playsInline = true;
    } else {
      element.alt = "A selected memory of Anaswara";
      element.decoding = "async";
    }

    stage.appendChild(element);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    Moonlight.qs("#modal-close").focus();

    element.animate([
      { opacity: 0, transform: "translateY(18px) scale(0.94)" },
      { opacity: 1, transform: "translateY(0) scale(1)" }
    ], {
      duration: 520,
      easing: "cubic-bezier(.22,1,.36,1)"
    });
  }

  function closeModal() {
    const modal = Moonlight.qs("#media-modal");
    const stage = Moonlight.qs("#modal-stage");
    const video = stage.querySelector("video");
    if (video) video.pause();
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    window.setTimeout(() => {
      stage.textContent = "";
      state.lastFocus?.focus();
    }, 260);
  }

  window.MoonlightGallery = { init };
})();
