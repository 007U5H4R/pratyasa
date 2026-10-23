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
    /* Two drawings (row and 2×2) carry the same stages, so match by data-stage, not index */
    stages.forEach((g) => g.classList.toggle("is-active", +g.dataset.stage === n));
  }

  if (steps.length && stages.length) {
    /* Click only. A focus handler here would re-fire on every Tab press and
       strobe the diagram for keyboard users; buttons already emit click on
       Enter and Space, so keyboard control is covered without it. */
    steps.forEach((s, i) => s.addEventListener("click", () => setActive(i)));

    stages.forEach((g) => {
      g.addEventListener("click", () => {
        const n = +g.dataset.stage;
        setActive(n);
        const btn = steps[n];
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

  /* ---- Play overlay: one quiet control over the poster, native controls once running ---- */
  const video = frame && frame.querySelector("video");
  const play  = frame && frame.querySelector(".play");
  if (video && play) {
    video.removeAttribute("controls");
    play.hidden = false;
    const started = () => {
      frame.classList.add("is-playing");
      video.setAttribute("controls", "");
    };
    play.addEventListener("click", () => {
      started();
      video.focus({ preventScroll: true });
      const p = video.play();
      /* If playback is refused, the native controls are already showing */
      if (p && p.catch) p.catch(() => {});
    });
    video.addEventListener("play", started);
  }

  /* ---- Mobile menu (≤900px). Without JS the nav stays a scrollable row. ---- */
  const head   = document.querySelector(".site-head");
  const toggle = head && head.querySelector(".menu-toggle");
  if (head && toggle) {
    const setOpen = (open) => {
      head.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", () => {
      const open = !head.classList.contains("is-open");
      setOpen(open);
      /* the nav sits before the toggle in the DOM, so Tab alone would leave the menu */
      if (open && navLinks[0]) navLinks[0].focus({ preventScroll: true });
    });
    /* every header link, not just the nav: the CTA and brand also leave the menu */
    head.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && head.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", (e) => {
      if (head.classList.contains("is-open") && !head.contains(e.target)) setOpen(false);
    });
    window.matchMedia("(max-width: 900px)").addEventListener("change", () => setOpen(false));
  }

  /* ---- Certificate viewer. Without JS, data-viewer links simply open the image. ---- */
  const viewer = document.getElementById("cert-viewer");
  const openers = Array.from(document.querySelectorAll("[data-viewer]"));
  if (viewer && typeof viewer.showModal === "function" && openers.length) {
    const scroll  = viewer.querySelector(".viewer-scroll");
    const img     = scroll.querySelector("img");
    const readout = viewer.querySelector(".viewer-zoom");
    const zoomIn  = viewer.querySelector('[data-zoom="in"]');
    const zoomOut = viewer.querySelector('[data-zoom="out"]');
    const STEPS   = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];   /* multiples of fit-width */
    let scale  = 1;
    let opener = null;

    const fitWidth = () => {
      const cs = getComputedStyle(scroll);
      return scroll.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    };

    /* Zoom about the centre of the current view so the reader keeps their place */
    const apply = (next) => {
      const cx = (scroll.scrollLeft + scroll.clientWidth / 2) / (scroll.scrollWidth || 1);
      const cy = (scroll.scrollTop + scroll.clientHeight / 2) / (scroll.scrollHeight || 1);
      scale = next;
      img.style.width = Math.round(fitWidth() * scale) + "px";
      scroll.scrollLeft = cx * scroll.scrollWidth - scroll.clientWidth / 2;
      scroll.scrollTop  = cy * scroll.scrollHeight - scroll.clientHeight / 2;
      readout.textContent = Math.round(scale * 100) + "%";
      const had = document.activeElement;
      zoomOut.disabled = scale <= STEPS[0];
      zoomIn.disabled  = scale >= STEPS[STEPS.length - 1];
      /* a disabled button drops focus to <body>, outside the dialog and its key handler */
      if (had && had.disabled) scroll.focus({ preventScroll: true });
    };
    const step = (dir) => {
      const i = STEPS.indexOf(scale);
      const j = Math.min(STEPS.length - 1, Math.max(0, i + dir));
      if (j !== i) apply(STEPS[j]);
    };

    openers.forEach((a) => a.addEventListener("click", (e) => {
      /* Let modified clicks open the image in a new tab as normal */
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      opener = a;
      if (!img.getAttribute("src")) img.src = img.dataset.src;
      viewer.showModal();
      apply(1);
      scroll.scrollTop = 0;
      scroll.focus({ preventScroll: true });
    }));

    zoomIn.addEventListener("click", () => step(1));
    zoomOut.addEventListener("click", () => step(-1));
    viewer.querySelector('[data-zoom="fit"]').addEventListener("click", () => apply(1));
    /* close() leaves focus inside the hidden dialog until the async close event,
       so the paths we own hand it back at once */
    const shut = () => {
      viewer.close();
      if (opener) opener.focus({ preventScroll: true });
    };
    viewer.querySelector(".viewer-close").addEventListener("click", shut);

    viewer.addEventListener("keydown", (e) => {
      /* leave Cmd/Ctrl +/-/0 to the browser's page zoom */
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "+" || e.key === "=") { e.preventDefault(); step(1); }
      else if (e.key === "-" || e.key === "_") { e.preventDefault(); step(-1); }
      else if (e.key === "0") { e.preventDefault(); apply(1); }
    });
    /* A click on the backdrop lands on the dialog element itself */
    viewer.addEventListener("click", (e) => { if (e.target === viewer) shut(); });
    /* Escape closes natively; either way, return focus to whatever opened it */
    viewer.addEventListener("close", () => {
      if (opener) opener.focus({ preventScroll: true });
    });
    window.addEventListener("resize", () => { if (viewer.open) apply(scale); });
  }

  /* Last line on purpose: the inline head script only keeps .js if everything above ran */
  window.pratyasaReady = true;
})();
