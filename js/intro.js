(function () {
  function initIntro() {
    const gift = Moonlight.qs("#gift-box");
    const particleField = Moonlight.qs("#intro-particles");
    if (!gift) return;

    Moonlight.createParticles(particleField, 52, {
      minSize: 3,
      maxSize: 8,
      color: "rgba(242, 212, 141, 0.9)"
    });

    gift.addEventListener("click", () => openGift(gift), { once: true });
  }

  function openGift(gift) {
    gift.disabled = true;

    if (Moonlight.hasGsap()) {
      openWithGsap(gift);
      return;
    }

    openWithNativeMotion(gift);
  }

  function openWithGsap(gift) {
    const particles = Moonlight.qsa("#intro-particles .particle");
    gsap.set(particles, { x: 0, y: 0, opacity: 0, scale: 0.3 });

    gsap.timeline({ onComplete: Moonlight.revealPassword })
      .to(".gift-lid", { y: -38, x: -25, rotation: -32, duration: 0.9, ease: "back.out(1.85)" })
      .to(".gift-bow-left", { rotation: -70, x: -16, y: -5, duration: 0.65, ease: "power2.out" }, "-=0.62")
      .to(".gift-bow-right", { rotation: 70, x: 16, y: -5, duration: 0.65, ease: "power2.out" }, "-=0.65")
      .to(".gift-ribbon-vertical", { scaleY: 0, transformOrigin: "50% 0%", duration: 0.55, ease: "power2.inOut" }, "-=0.32")
      .to(".gift-ribbon-horizontal", { scaleX: 0.05, transformOrigin: "50% 50%", duration: 0.5, ease: "power2.inOut" }, "-=0.5")
      .to(particles, {
        opacity: () => gsap.utils.random(0.45, 1),
        scale: () => gsap.utils.random(0.8, 1.7),
        x: () => gsap.utils.random(-270, 270),
        y: () => gsap.utils.random(-250, 190),
        duration: 1.7,
        stagger: 0.01,
        ease: "power3.out"
      }, "-=0.15")
      .to(".gift-base", { y: 14, scale: 0.82, opacity: 0.45, duration: 0.75, ease: "power2.inOut" }, "-=1.15")
      .to(gift, { opacity: 0, scale: 0.08, y: -34, duration: 0.9, ease: "power2.in" }, "-=0.45")
      .to(particles, { opacity: 0, scale: 0.22, y: "-=80", duration: 0.8, stagger: 0.004, ease: "sine.in" }, "-=0.2");
  }

  function openWithNativeMotion(gift) {
    const particles = Moonlight.qsa("#intro-particles .particle");
    const lid = Moonlight.qs(".gift-lid");
    const base = Moonlight.qs(".gift-base");

    lid?.animate([
      { transform: "translateX(-50%) translateY(0) rotate(0deg)" },
      { transform: "translateX(calc(-50% - 25px)) translateY(-38px) rotate(-32deg)" }
    ], { duration: 900, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards" });

    base?.animate([
      { transform: "translateX(-50%) translateY(0) scale(1)", opacity: 1 },
      { transform: "translateX(-50%) translateY(14px) scale(.82)", opacity: 0.45 }
    ], { duration: 950, easing: "ease-out", fill: "forwards" });

    particles.forEach((particle, index) => {
      particle.animate([
        { opacity: 0, transform: "translate3d(0,0,0) scale(.3)" },
        { opacity: 1, transform: `translate3d(${Moonlight.random(-260, 260)}px, ${Moonlight.random(-240, 180)}px, 0) scale(${Moonlight.random(0.8, 1.6)})` },
        { opacity: 0, transform: `translate3d(${Moonlight.random(-180, 180)}px, ${Moonlight.random(-310, -120)}px, 0) scale(.22)` }
      ], {
        duration: 1700,
        delay: index * 8,
        easing: "cubic-bezier(.22,1,.36,1)",
        fill: "forwards"
      });
    });

    gift.animate([
      { opacity: 1, transform: "translate3d(0,0,0) scale(.86)" },
      { opacity: 0, transform: "translate3d(0,-34px,0) scale(.08)" }
    ], { duration: 900, delay: 900, easing: "ease-in", fill: "forwards" }).onfinish = Moonlight.revealPassword;
  }

  document.addEventListener("DOMContentLoaded", initIntro);
})();
