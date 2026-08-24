/* Pratyasa — progressive enhancement only.
   With JavaScript disabled the page is complete: every step is readable,
   every diagram stage is visible, and nothing is hidden behind a script. */
(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Stepper drives the diagram ---- */
  const steps  = Array.from(document.querySelectorAll(".step"));
  const stages = Array.from(document.querySelectorAll(".diagram [data-stage]"));

  function setActive(n) {
    steps.forEach((s, i) => {
      const on = i === n;
      s.classList.toggle("is-active", on);
      if (on) s.setAttribute("aria-current", "step");
      else s.removeAttribute("aria-current");
    });
    stages.forEach((g, i) => g.classList.toggle("is-active", i === n));
  }

  if (steps.length && stages.length) {
    steps.forEach((s, i) => {
      s.addEventListener("click", () => setActive(i));
      s.addEventListener("focus", () => setActive(i));
    });
    setActive(0);
  }

  /* ---- Scroll reveals ---- */
  const revealables = document.querySelectorAll(".reveal");
  if (!reduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in-view");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add("in-view"));
  }

  /* ---- Active section in the nav ---- */
  const navLinks = Array.from(document.querySelectorAll(".site-head nav a"));
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) =>
          a.classList.toggle("is-current", a.getAttribute("href") === "#" + e.target.id)
        );
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---- Video error state ---- */
  const frame    = document.querySelector(".media-frame");
  const source   = frame && frame.querySelector("source");
  const fallback = frame && frame.querySelector(".video-fallback");
  if (source && fallback) {
    source.addEventListener("error", () => {
      frame.classList.add("is-broken");
      fallback.hidden = false;
    });
  }

  /* ---- Install prompt (only when the browser offers one) ---- */
  let deferredPrompt = null;
  const installBtn = document.getElementById("install-btn");

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.hidden = false;
  });

  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch (_) { /* dismissed */ }
      deferredPrompt = null;
      installBtn.hidden = true;
    });
  }

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    if (installBtn) installBtn.hidden = true;
  });
})();
