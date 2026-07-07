/* YOUBIKEYCAR — interactions & animation choreography */
(function () {
  "use strict";

  var docEl = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof gsap !== "undefined";
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (hasGsap && !reduced) docEl.classList.add("js");

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  /* ── text splitting ─────────────────────────────────── */
  /* wraps each word in a nowrap span so lines can only break
     between words, then splits words into animatable chars */
  function splitChars(el) {
    var text = el.textContent;
    el.setAttribute("aria-label", text);
    el.textContent = "";
    var chars = [];
    text.split(" ").forEach(function (word, wi, arr) {
      var wordSpan = document.createElement("span");
      wordSpan.className = "word";
      wordSpan.setAttribute("aria-hidden", "true");
      for (var i = 0; i < word.length; i++) {
        var span = document.createElement("span");
        span.className = "char";
        span.textContent = word[i];
        wordSpan.appendChild(span);
        chars.push(span);
      }
      el.appendChild(wordSpan);
      if (wi < arr.length - 1) el.appendChild(document.createTextNode(" "));
    });
    return chars;
  }

  /* ── live Munich clock ──────────────────────────────── */
  function startClock() {
    var els = [document.getElementById("navClock"), document.getElementById("footClock")];
    function tick() {
      try {
        var now = new Date().toLocaleTimeString("de-DE", {
          timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit"
        });
        els.forEach(function (el) { if (el) el.textContent = now; });
      } catch (e) { /* older browsers: leave placeholder */ }
    }
    tick();
    setInterval(tick, 15000);
  }

  /* ── contact form → WhatsApp ────────────────────────── */
  function initForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var msg =
        "Hallo YOUBIKEYCAR!%0A" +
        "Name: " + encodeURIComponent(d.get("name") || "-") + "%0A" +
        "Telefon: " + encodeURIComponent(d.get("phone") || "-") + "%0A" +
        "Fahrzeug: " + encodeURIComponent(d.get("car") || "-") + "%0A" +
        "Anliegen: " + encodeURIComponent(d.get("service") || "-") + "%0A" +
        "Nachricht: " + encodeURIComponent(d.get("msg") || "-");
      window.open("https://wa.me/4915735989735?text=" + msg, "_blank", "noopener");
    });
  }

  /* ── services accordion ─────────────────────────────── */
  function initServices() {
    var rows = document.querySelectorAll(".service-row");
    rows.forEach(function (row) {
      var head = row.querySelector(".service-head");
      head.addEventListener("click", function () {
        var open = row.classList.contains("is-open");
        rows.forEach(function (r) {
          r.classList.remove("is-open");
          r.querySelector(".service-head").setAttribute("aria-expanded", "false");
        });
        if (!open) {
          row.classList.add("is-open");
          head.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  /* ── mobile menu ────────────────────────────────────── */
  function initMenu(lenis) {
    var burger = document.getElementById("navBurger");
    var overlay = document.getElementById("menuOverlay");
    if (!burger || !overlay) return;
    var links = overlay.querySelectorAll(".menu-links a");
    var isOpen = false;

    function set(open) {
      isOpen = open;
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      overlay.setAttribute("aria-hidden", String(!open));
      if (hasGsap && !reduced) {
        if (open) {
          gsap.set(overlay, { visibility: "visible" });
          gsap.to(overlay, { opacity: 1, duration: 0.4, ease: "power2.out" });
          gsap.fromTo(links, { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: "power3.out", delay: 0.1 });
        } else {
          gsap.to(overlay, {
            opacity: 0, duration: 0.35, ease: "power2.in",
            onComplete: function () { gsap.set(overlay, { visibility: "hidden" }); }
          });
        }
      } else {
        overlay.style.visibility = open ? "visible" : "hidden";
        overlay.style.opacity = open ? "1" : "0";
      }
      if (lenis) { open ? lenis.stop() : lenis.start(); }
      document.body.style.overflow = open ? "hidden" : "";
    }

    burger.addEventListener("click", function () { set(!isOpen); });
    links.forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
    overlay.querySelectorAll(".menu-footer a").forEach(function (a) {
      a.addEventListener("click", function () { set(false); });
    });
  }

  /* ── custom cursor ──────────────────────────────────── */
  function initCursor() {
    if (!finePointer || !hasGsap || reduced) return;
    var dot = document.getElementById("cursorDot");
    var ring = document.getElementById("cursorRing");
    var label = document.getElementById("cursorLabel");
    if (!dot || !ring) return;

    var xTo = gsap.quickTo(ring, "x", { duration: 0.4, ease: "power3.out" });
    var yTo = gsap.quickTo(ring, "y", { duration: 0.4, ease: "power3.out" });
    var xToDot = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power2.out" });
    var yToDot = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power2.out" });
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

    var shown = false;
    window.addEventListener("pointermove", function (e) {
      if (!shown) { gsap.to([dot, ring], { opacity: 1, duration: 0.3 }); shown = true; }
      xTo(e.clientX); yTo(e.clientY);
      xToDot(e.clientX); yToDot(e.clientY);
    }, { passive: true });

    var labels = { call: "ANRUFEN", open: "ÖFFNEN" };
    document.querySelectorAll("[data-cursor]").forEach(function (el) {
      var mode = el.getAttribute("data-cursor");
      el.addEventListener("mouseenter", function () {
        if (labels[mode]) {
          label.textContent = labels[mode];
          ring.classList.add("is-label");
        } else {
          ring.classList.add("is-hover");
        }
      });
      el.addEventListener("mouseleave", function () {
        ring.classList.remove("is-label", "is-hover");
      });
    });
  }

  /* ── magnetic buttons ───────────────────────────────── */
  function initMagnetic() {
    if (!finePointer || !hasGsap || reduced) return;
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      var strength = 22;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var relX = e.clientX - r.left - r.width / 2;
        var relY = e.clientY - r.top - r.height / 2;
        gsap.to(el, {
          x: (relX / r.width) * strength,
          y: (relY / r.height) * strength,
          duration: 0.4, ease: "power3.out"
        });
      });
      el.addEventListener("mouseleave", function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  /* ── tilt cards ─────────────────────────────────────── */
  function initTilt() {
    if (!finePointer || !hasGsap || reduced) return;
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, {
          rotationY: px * 8, rotationX: -py * 8,
          transformPerspective: 700, duration: 0.5, ease: "power2.out"
        });
      });
      card.addEventListener("mouseleave", function () {
        gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" });
      });
    });
  }

  /* ── counters ───────────────────────────────────────── */
  function runCounters(scopeEl) {
    if (!hasGsap) return;
    (scopeEl || document).querySelectorAll("[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      var obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.8, ease: "power3.out",
        onUpdate: function () { el.textContent = Math.round(obj.v); }
      });
    });
  }

  /* ── main boot ──────────────────────────────────────── */
  ready(function () {
    startClock();
    initForm();
    initServices();

    /* No GSAP (CDN blocked) or reduced motion: static but fully usable */
    if (!hasGsap || reduced) {
      var pre = document.getElementById("preloader");
      if (pre) pre.remove();
      document.querySelectorAll("[data-count]").forEach(function (el) {
        el.textContent = el.getAttribute("data-count");
      });
      initMenu(null);
      window.addEventListener("scroll", function () {
        var nav = document.getElementById("nav");
        if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 40);
        var fc = document.getElementById("floatCta");
        if (fc) fc.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.7);
      }, { passive: true });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    /* Lenis smooth scroll */
    var lenis = null;
    if (typeof Lenis !== "undefined") {
      lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1.05 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

    /* anchor scrolling */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.4 });
        else target.scrollIntoView({ behavior: "smooth" });
      });
    });

    initMenu(lenis);
    initCursor();
    initMagnetic();
    initTilt();

    /* split all headline targets */
    var heroChars = [];
    document.querySelectorAll(".hero-title [data-split]").forEach(function (el) {
      heroChars = heroChars.concat(splitChars(el));
    });
    var splitTargets = [];
    document.querySelectorAll(".section-title [data-split], .contact-title [data-split]").forEach(function (el) {
      splitTargets.push({ el: el, chars: splitChars(el) });
    });
    var footChars = null;
    var footWord = document.querySelector("[data-split-footer]");
    if (footWord) footChars = splitChars(footWord);

    /* ── preloader → hero intro ── */
    var pre = document.getElementById("preloader");
    var bar = document.getElementById("preloaderBar");
    var pct = document.getElementById("preloaderPct");

    function heroIntro() {
      var tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.to(heroChars, { y: 0, duration: 1.1, stagger: 0.028 }, 0)
        .to("[data-hero-fade]", {
          opacity: 1, duration: 1, stagger: 0.12,
          onStart: function () { runCounters(document.querySelector(".hero-stats")); }
        }, 0.45);
    }
    gsap.set(heroChars, { yPercent: 0, y: "115%" });

    if (pre) {
      var letters = pre.querySelectorAll(".preloader-word span");
      var progress = { v: 0 };
      var tl = gsap.timeline();
      tl.to(letters, { y: 0, duration: 0.9, stagger: 0.05, ease: "power4.out" }, 0)
        .to(progress, {
          v: 100, duration: 1.3, ease: "power2.inOut",
          onUpdate: function () {
            var v = Math.round(progress.v);
            if (bar) bar.style.width = v + "%";
            if (pct) pct.textContent = v + "%";
          }
        }, 0.2)
        .to(pre.querySelector(".preloader-inner"), { opacity: 0, y: -30, duration: 0.45, ease: "power2.in" })
        .to(pre.querySelector(".p2"), { scaleY: 1, transformOrigin: "bottom", duration: 0.5, ease: "power3.inOut" }, "-=0.15")
        .to(pre, {
          yPercent: -100, duration: 0.8, ease: "power4.inOut",
          onStart: heroIntro,
          onComplete: function () { pre.remove(); }
        }, "+=0.05");
    } else {
      heroIntro();
    }

    /* ── nav behaviour ── */
    var nav = document.getElementById("nav");
    var floatCta = document.getElementById("floatCta");
    ScrollTrigger.create({
      start: 40,
      onUpdate: function (self) {
        nav.classList.add("is-scrolled");
        if (self.direction === 1 && self.scroll() > 400) nav.classList.add("is-hidden");
        else nav.classList.remove("is-hidden");
      },
      onLeaveBack: function () { nav.classList.remove("is-scrolled", "is-hidden"); }
    });
    if (floatCta) {
      ScrollTrigger.create({
        trigger: ".marquee", start: "top 80%",
        onEnter: function () { floatCta.classList.add("is-visible"); },
        onLeaveBack: function () { floatCta.classList.remove("is-visible"); }
      });
    }

    /* ── hero scroll → 3D scene + parallax out ── */
    ScrollTrigger.create({
      trigger: ".hero", start: "top top", end: "bottom top", scrub: true,
      onUpdate: function (self) {
        if (window.MKScene) window.MKScene.setScroll(self.progress);
      }
    });
    gsap.to(".hero-inner", {
      yPercent: -12, opacity: 0.25, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 30%", scrub: true }
    });

    /* ── marquee: infinite + scroll-velocity reactive ── */
    var track = document.getElementById("marqueeTrack");
    if (track) {
      var marqueeTween = gsap.to(track, { xPercent: -50, duration: 22, ease: "none", repeat: -1 });
      ScrollTrigger.create({
        onUpdate: function (self) {
          var v = Math.abs(self.getVelocity()) / 900;
          marqueeTween.timeScale(gsap.utils.clamp(1, 5, 1 + v));
        }
      });
    }

    /* ── story: scroll-driven night scenes ── */
    var scenes = document.querySelectorAll(".story-scene");
    var storyFill = document.getElementById("storyFill");
    var storyIndex = document.getElementById("storyIndex");
    if (scenes.length) {
      ScrollTrigger.create({
        trigger: ".story", start: "top top", end: "bottom bottom", scrub: true,
        onUpdate: function (self) {
          var p = self.progress;
          var idx = Math.min(scenes.length - 1, Math.floor(p * scenes.length));
          scenes.forEach(function (s, i) { s.classList.toggle("is-active", i === idx); });
          if (storyFill) storyFill.style.transform = "scaleX(" + p + ")";
          if (storyIndex) storyIndex.textContent = "0" + (idx + 1);
        }
      });
    }

    /* ── split section titles reveal ── */
    splitTargets.forEach(function (t) {
      gsap.set(t.chars, { y: "115%" });
      gsap.to(t.chars, {
        y: 0, duration: 0.9, stagger: 0.02, ease: "power4.out",
        scrollTrigger: { trigger: t.el, start: "top 88%", once: true }
      });
    });

    /* ── generic reveals ── */
    gsap.utils.toArray("[data-reveal]").forEach(function (el) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true }
      });
    });

    /* ── service rows entrance ── */
    gsap.from(".service-row", {
      opacity: 0, y: 50, duration: 0.9, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".service-list", start: "top 85%", once: true }
    });

    /* ── footer word rise ── */
    if (footChars) {
      gsap.set(footChars, { y: "100%" });
      gsap.to(footChars, {
        y: 0, duration: 1, stagger: 0.045, ease: "power4.out",
        scrollTrigger: { trigger: ".footer-word", start: "top 95%", once: true }
      });
    }

    /* ── FAQ open animation ── */
    document.querySelectorAll(".faq-item").forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (item.open) {
          gsap.from(item.querySelector("p"), { opacity: 0, y: 12, duration: 0.5, ease: "power2.out" });
        }
      });
    });

    /* ── big phone number micro-wiggle on hover ── */
    var bigPhone = document.getElementById("bigPhone");
    if (bigPhone && finePointer) {
      bigPhone.addEventListener("mouseenter", function () {
        gsap.fromTo(bigPhone, { rotate: 0 }, {
          keyframes: [{ rotate: -1.2 }, { rotate: 1.2 }, { rotate: 0 }],
          duration: 0.4, ease: "power1.inOut"
        });
      });
    }

    /* refresh after fonts load to fix trigger positions */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  });
})();
