/* Pratyasa — progressive enhancement only.
   With JavaScript disabled the page is complete: every step is readable, every
   diagram stage is fully visible, and nothing is hidden behind a script. */
(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Stepper drives the diagram, and the diagram drives it back ---- */
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
    /* Click only. A focus handler here would re-fire on every Tab press and
       strobe the diagram for keyboard users; buttons already emit click on
       Enter and Space, so keyboard control is covered without it. */
    steps.forEach((s, i) => s.addEventListener("click", () => setActive(i)));

    stages.forEach((g, i) => {
      g.addEventListener("click", () => {
        setActive(i);
        const btn = steps[i];
        if (btn) btn.focus({ preventScroll: true });
      });
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
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add("in-view"));
  }

  /* ---- Current section in the nav (exposed to assistive tech, not just paint) ---- */
  const navLinks = Array.from(document.querySelectorAll(".site-head nav a"));
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => {
          if (a.getAttribute("href") === "#" + e.target.id) {
            a.setAttribute("aria-current", "true");
          } else {
            a.removeAttribute("aria-current");
          }
        });
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
})();
