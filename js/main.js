(function () {
  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const hasGsap = () => Boolean(window.gsap);

  const app = {
    heroStarted: false,
    moonClicks: 0,
    audio: null,
    audioReady: false,
    parallax: { tx: 0, ty: 0, x: 0, y: 0, raf: null },
    progressRaf: null
  };

  function showScreen(screen) {
    if (!screen) return;
    screen.hidden = false;
    screen.classList.add("is-active");
  }

  function hideScreen(screen) {
    if (!screen) return;
    screen.classList.remove("is-active");
    screen.hidden = true;
  }

  function revealPassword() {
    const intro = qs("#intro-screen");
    const password = qs("#password-screen");
    const input = qs("#password-input");
    showScreen(password);

    if (hasGsap()) {
      gsap.timeline({
        onComplete: () => {
          hideScreen(intro);
          input?.focus();
        }
      })
        .to(intro, { autoAlpha: 0, duration: 0.9, ease: "power2.inOut" })
        .fromTo(password, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.15, ease: "power2.out" }, "-=0.2")
        .fromTo(".password-card", { y: 28, scale: 0.98 }, { y: 0, scale: 1, duration: 1.15, ease: "power3.out" }, "-=0.82");
      return;
    }

    hideScreen(intro);
    password.style.opacity = "1";
    input?.focus();
  }

  function showHero(options = {}) {
    if (app.heroStarted && !options.force) return;
    app.heroStarted = true;

    const password = qs("#password-screen");
    const hero = qs("#hero-screen");
    showScreen(hero);
    revealJourneySections();
    prepareHero();

    const finish = () => {
      hideScreen(password);
      document.body.classList.add("experience-open");
      startHeroSequence(options.instant);
      window.MoonlightGallery?.init();
      localStorage.setItem("moonlightVisited", "true");
    };

    if (options.instant) {
      hideScreen(qs("#intro-screen"));
      finish();
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    if (hasGsap()) {
      gsap.timeline({ defaults: { ease: "power2.inOut" }, onComplete: finish })
        .to(password, { autoAlpha: 0, duration: 0.95 })
        .fromTo(hero, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.25 }, "-=0.35");
      return;
    }

    finish();
  }

  function revealJourneySections() {
    qsa(".journey-section").forEach((section) => {
      section.hidden = false;
    });
  }

  function prepareHero() {
    createStars();
    createParticles(qs("#hero-particles"), 74, {
      minSize: 2,
      maxSize: 5,
      color: "rgba(218, 196, 255, 0.72)"
    });
    createFireflies(qs("#fireflies"), 28);
    bindParallax();
    bindMoon();
    bindMusicControls();
    bindCake();
    bindEnvelope();
    observeReveals();
    startShootingStars();
  }

  function startHeroSequence(instant = false) {
    const moon = qs("#moon");
    const ocean = qs(".ocean");
    const portrait = qs(".hero-portrait");
    const subject = qs(".hero-subject");
    const vinyl = qs("#vinyl-player");
    if (!hasGsap() || instant) {
        qsa(".hero-line").forEach(line => line.style.opacity = "1");
        if (moon) moon.style.setProperty("--moon-rise", "0vh");
        if (ocean) ocean.style.opacity = "1";
        if (portrait) portrait.style.opacity = "1";
        if (vinyl) vinyl.classList.add("is-visible");
        return;
    }
    /* ---------- INITIAL STATE ---------- */
    gsap.set(".star", {
        opacity: 0
    });
    gsap.set(moon, {
        opacity: 0
    });
    gsap.set(ocean, {
        opacity: 0
    });
    gsap.set(portrait, {
        opacity: 0,
        scale: 1.03
    });
    gsap.set(subject, {
        opacity: 0,
        y: 18,
        scale: 1.02
    });
    gsap.set(".hero-line", {
        opacity: 0,
        y: 28,
        filter: "blur(12px)"
    });
    gsap.set(vinyl, {
        opacity: 0,
        y: 18
    });
    /* ---------- CINEMATIC TIMELINE ---------- */
    gsap.timeline()
        // stars
        .to(".star", {
            opacity: 1,
            duration: 2.2,
            stagger: 0.006,
            ease: "sine.out"
        })
        // moon fades in
        .to(moon, {
            opacity: 1,
            duration: 1.2,
            ease: "power2.out"
        })
        // moon rises
        .to(moon, {
            "--moon-rise": "0vh",
            duration: 3.8,
            ease: "power2.out"
        })
        // ocean
        .to(ocean, {
            opacity: 1,
            duration: 2.0,
            ease: "sine.out"
        }, "-=2.8")
        // portrait appears AFTER moon
        .to(portrait, {
            opacity: 1,
            scale: 1,
            duration: 2.3,
            ease: "power2.out"
        }, "-=1.8")

        .to(subject, {
            opacity: 0.62,
            y: 0,
            scale: 1,
            duration: 2.0,
            ease: "power2.out"
        }, "-=2.0")
        // vinyl
        .to(vinyl, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out"
        }, "-=1.3")
        // first line
        .to("#line-one", {
            opacity: 1,
            y: 0,
            filter: "blur(0)",
            duration: 1.2
        }, "+=0.6")
        // second line
        .to("#line-two", {
            opacity: 1,
            y: 0,
            filter: "blur(0)",
            duration: 1.4
        }, "+=1.2")
        // third line
        .to("#line-three", {
            opacity: 1,
            y: 0,
            filter: "blur(0)",
            duration: 1.4
        }, "+=1.3");
}

  function createParticles(container, count, options = {}) {
    if (!container || container.children.length) return;
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < count; index += 1) {
      const particle = document.createElement("span");
      particle.className = options.className || "particle";
      const size = random(options.minSize || 2, options.maxSize || 6);
      particle.style.setProperty("--size", `${size}px`);
      particle.style.left = `${random(8, 92)}%`;
      particle.style.top = `${random(8, 92)}%`;
      particle.style.setProperty("--particle-color", options.color || "rgba(242, 212, 141, 0.88)");
      fragment.appendChild(particle);
    }

    container.appendChild(fragment);
  }

  function createStars() {
    const stars = qs("#stars");
    if (!stars || stars.children.length) return;
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < 150; index += 1) {
      const star = document.createElement("span");
      star.className = "star";
      const size = random(1, index % 9 === 0 ? 4.2 : 2.6);
      star.style.left = `${random(0, 100)}%`;
      star.style.top = `${random(0, 72)}%`;
      star.style.setProperty("--size", `${size}px`);
      star.style.setProperty("--star-alpha", `${random(0.28, 0.9)}`);
      star.style.setProperty("--star-glow", `${random(7, 18)}px`);
      star.style.setProperty("--delay", `${random(0, 8)}s`);
      star.style.setProperty("--twinkle", `${random(3.5, 9)}s`);
      fragment.appendChild(star);
    }

    stars.appendChild(fragment);
  }

  function createFireflies(container, count) {
    if (!container || container.children.length) return;
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < count; index += 1) {
      const firefly = document.createElement("span");
      firefly.className = container.id === "tree-fireflies" ? "tree-firefly" : "firefly";
      firefly.style.left = `${random(5, 95)}%`;
      firefly.style.top = `${random(18, 88)}%`;
      firefly.style.setProperty("--drift-x", `${random(-110, 110)}px`);
      firefly.style.setProperty("--drift-y", `${random(-150, 70)}px`);
      firefly.style.setProperty("--duration", `${random(8, 15)}s`);
      firefly.style.setProperty("--delay", `${random(0, 8)}s`);
      fragment.appendChild(firefly);
    }

    container.appendChild(fragment);
  }

  function bindParallax() {
    const hero = qs("#hero-screen");
    if (!hero || hero.dataset.parallaxBound) return;
    hero.dataset.parallaxBound = "true";

    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      app.parallax.tx = (event.clientX - rect.left) / rect.width - 0.5;
      app.parallax.ty = (event.clientY - rect.top) / rect.height - 0.5;
      if (!app.parallax.raf) app.parallax.raf = requestAnimationFrame(updateParallax);
    });

    hero.addEventListener("pointerleave", () => {
      app.parallax.tx = 0;
      app.parallax.ty = 0;
      if (!app.parallax.raf) app.parallax.raf = requestAnimationFrame(updateParallax);
    });
  }

  function updateParallax() {
    app.parallax.x += (app.parallax.tx - app.parallax.x) * 0.075;
    app.parallax.y += (app.parallax.ty - app.parallax.y) * 0.075;
    const x = app.parallax.x;
    const y = app.parallax.y;

    document.documentElement.style.setProperty("--moon-x", `${x * 2}px`);
    document.documentElement.style.setProperty("--moon-y", `${y * 2}px`);
    document.documentElement.style.setProperty("--stars-x", `${x * 4}px`);
    document.documentElement.style.setProperty("--stars-y", `${y * 4}px`);
    document.documentElement.style.setProperty("--portrait-x", `${x * 6}px`);
    document.documentElement.style.setProperty("--portrait-y", `${y * 6}px`);
    document.documentElement.style.setProperty("--particles-x", `${x * 10}px`);
    document.documentElement.style.setProperty("--particles-y", `${y * 10}px`);

    if (Math.abs(app.parallax.tx - x) > 0.002 || Math.abs(app.parallax.ty - y) > 0.002) {
      app.parallax.raf = requestAnimationFrame(updateParallax);
    } else {
      app.parallax.raf = null;
    }
  }

  function startShootingStars() {
    const stars = qs("#stars");
    if (!stars || stars.dataset.shooting) return;
    stars.dataset.shooting = "true";

    const launch = () => {
      const star = document.createElement("span");
      star.className = "shooting-star";
      star.style.left = `${random(10, 76)}%`;
      star.style.top = `${random(6, 28)}%`;
      star.style.transform = "rotate(-18deg)";
      stars.appendChild(star);

      if (hasGsap()) {
        gsap.fromTo(star, { opacity: 0, x: 0, y: 0 }, {
          opacity: 1,
          x: -270,
          y: 126,
          duration: 1.35,
          ease: "power2.out",
          onComplete: () => star.remove()
        });
      } else {
        star.animate([
          { opacity: 0, transform: "translate3d(0,0,0) rotate(-18deg)" },
          { opacity: 1 },
          { opacity: 0, transform: "translate3d(-270px,126px,0) rotate(-18deg)" }
        ], { duration: 1350, easing: "ease-out" }).onfinish = () => star.remove();
      }

      window.setTimeout(launch, random(20000, 30000));
    };

    window.setTimeout(launch, random(7000, 12000));
  }

  function bindMoon() {
    const moon = qs("#moon");
    const message = qs("#moon-message");
    const player = qs("#vinyl-player");
    if (!moon || moon.dataset.bound) return;
    moon.dataset.bound = "true";

    moon.addEventListener("click", () => {
      player?.classList.add("is-visible");
      moon.classList.remove("is-rippling");
      void moon.offsetWidth;
      moon.classList.add("is-rippling");
      app.moonClicks += 1;

      if (app.moonClicks === 1) {
        message.textContent = "Tap again to begin the music.";
        return;
      }

      toggleMusic(true);
    });
  }

  function bindMusicControls() {
    if (qs("#music-toggle")?.dataset.bound) return;
    const toggle = qs("#music-toggle");
    const mute = qs("#mute-toggle");
    const volume = qs("#volume-slider");

    toggle?.addEventListener("click", () => toggleMusic());
    toggle?.setAttribute("data-bound", "true");

    mute?.addEventListener("click", () => {
      const audio = ensureAudio();
      audio.muted = !audio.muted;
      mute.textContent = audio.muted ? "Unmute" : "Mute";
    });

    volume?.addEventListener("input", () => {
      const audio = ensureAudio();
      audio.volume = Number(volume.value);
      audio.muted = audio.volume === 0;
      mute.textContent = audio.muted ? "Unmute" : "Mute";
    });
  }

  function ensureAudio() {
    if (!app.audio) {
      app.audio = new Audio("assets/audio/banaras-pattu-katti.mp3");
      app.audio.loop = true;
      app.audio.volume = Number(qs("#volume-slider")?.value || 0.72);
      app.audio.addEventListener("timeupdate", updateMusicProgress);
      app.audio.addEventListener("loadedmetadata", updateMusicProgress);
    }
    return app.audio;
  }

  function toggleMusic(forcePlay = false) {
    const player = qs("#vinyl-player");
    const message = qs("#moon-message");
    const audio = ensureAudio();

    if (!forcePlay && !audio.paused) {
      audio.pause();
      player?.classList.remove("is-playing");
      return;
    }

    audio.play()
      .then(() => {
        app.audioReady = true;
        message.textContent = "";
        player?.classList.add("is-visible", "is-playing");
        startProgressLoop();
      })
      .catch(() => {
        message.textContent = "Music will begin once added.";
        player?.classList.add("is-visible");
        player?.classList.remove("is-playing");
      });
  }

  function startProgressLoop() {
    if (app.progressRaf) return;
    const tick = () => {
      updateMusicProgress();
      app.progressRaf = app.audio && !app.audio.paused ? requestAnimationFrame(tick) : null;
    };
    app.progressRaf = requestAnimationFrame(tick);
  }

  function bindCake() {
    const cake = qs("#candle-button");
    const result = qs("#wish-result");
    const hint = qs("#cake-hint");

    if (!cake || cake.dataset.bound) return;
    cake.dataset.bound = "true";

    cake.addEventListener("click", () => {

      if (cake.classList.contains("is-wished")) return;

      cake.classList.add("is-wished");

      /* Hide hint */
      hint?.classList.add("hide");

      burstParticles(cake, 34);

      result.textContent =
        "May every wish you whispered tonight find its way to you.";

      /* Fade in */
      result.classList.add("show");

    });
}

  function bindEnvelope() {

    const envelope = qs("#envelope");
    const hint = qs("#gift-hint");
    const friend = qs("#friend-message");

    if (!envelope || envelope.dataset.bound) return;

    envelope.dataset.bound = "true";

    envelope.addEventListener("click", () => {

        hint?.classList.add("hide");

        envelope.classList.add("is-open");

        friend?.classList.add("show");

    });

}

  function burstParticles(source, count) {
    const rect = source.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height * 0.28;

    for (let index = 0; index < count; index += 1) {
      const dot = document.createElement("span");
      dot.className = "particle wish-particle";
      dot.style.position = "fixed";
      dot.style.left = `${centerX}px`;
      dot.style.top = `${centerY}px`;
      dot.style.setProperty("--size", `${random(3, 7)}px`);
      dot.style.zIndex = "60";
      document.body.appendChild(dot);
      dot.animate([
        { opacity: 1, transform: "translate3d(0,0,0) scale(1)" },
        { opacity: 0, transform: `translate3d(${random(-120, 120)}px, ${random(-220, -70)}px, 0) scale(0.25)` }
      ], { duration: random(1100, 1800), easing: "cubic-bezier(.22,1,.36,1)" }).onfinish = () => dot.remove();
    }
  }

  function observeReveals() {
    const targets = qsa(".wish-card, .ending-copy, .section-heading");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        if (entry.target.classList.contains("ending-copy")) {
          qs(".universe-note")?.animate([
            { opacity: 0, transform: "translateY(16px)" },
            { opacity: 1, transform: "translateY(0)" }
          ], { duration: 1800, delay: 1400, fill: "forwards", easing: "ease-out" });
        }
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });

    targets.forEach((target) => observer.observe(target));
  }

  function initReturningVisitor() {
    const overlay = qs("#returning-visitor");
    if (!overlay) return;

    if (localStorage.getItem("moonlightVisited") === "true") {
      overlay.hidden = false;
    }

    qs("#continue-journey")?.addEventListener("click", () => {
      overlay.hidden = true;
      showHero({ instant: true, force: true });
    });

    qs("#start-again")?.addEventListener("click", () => {
      localStorage.removeItem("moonlightVisited");
      overlay.hidden = true;
      window.scrollTo({ top: 0, behavior: "auto" });
      document.body.classList.remove("experience-open");
      hideScreen(qs("#password-screen"));
      hideScreen(qs("#hero-screen"));
      showScreen(qs("#intro-screen"));
      app.heroStarted = false;
    });
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  document.addEventListener("DOMContentLoaded", initReturningVisitor);

  window.Moonlight = {
    qs,
    qsa,
    hasGsap,
    createParticles,
    createFireflies,
    revealPassword,
    showHero,
    random
  };
})();