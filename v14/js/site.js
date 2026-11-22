(function () {
  document.documentElement.classList.add("js");

  const head = document.querySelector(".site-head");
  const toggle = document.querySelector(".nav-toggle");
  const panel = document.querySelector(".nav-panel");
  const entrance = document.querySelector(".entrance");
  const fly = document.querySelector(".fly-logo");
  const brand = document.querySelector(".site-head .brand, a.brand");
  const isHome = document.body.classList.contains("is-home");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t * t * (3 - 2 * t); }

  let ticking = false;

  function syncHead() {
    ticking = false;
    const open = !!(panel && panel.classList.contains("is-open"));

    if (!isHome || !entrance || !fly || !head || !brand) {
      if (head) {
        head.classList.add("is-solid");
        head.classList.add("is-visible");
      }
      return;
    }

    const navH = head.offsetHeight || 112;
    const threshold = Math.max(entrance.offsetHeight - navH, 80);
    let t = Math.min(1, Math.max(0, window.scrollY / threshold));
    if (reduce) t = window.scrollY > 24 ? 1 : 0;
    const e = ease(t);

    const vw = document.documentElement.clientWidth;
    const startW = Math.min(520, vw * (vw < 700 ? 0.82 : 0.72));
    const startTop = (vw >= 961)
      ? (navH + 16)
      : Math.max(64, Math.min(132, entrance.offsetHeight * 0.13));
    const startLeft = (vw - startW) / 2;

    const slotImg = brand.querySelector(".wm-dark") || brand.querySelector("img");
    const slot = (slotImg || brand).getBoundingClientRect();
    const headBox = head.getBoundingClientRect();
    const cream = fly.querySelector(".logo-cream");
    const ratio = (cream && cream.naturalWidth) ? (cream.naturalWidth / cream.naturalHeight) : 1.91;
    const endW = Math.min(slot.width || 200, vw < 700 ? 148 : 200);
    const endH = endW / ratio;
    const endLeft = slot.left || 48;
    const endTop = headBox.top + Math.max(8, (headBox.height - endH) / 2);

    fly.style.transform = "none";
    fly.style.width = lerp(startW, endW, e) + "px";
    fly.style.height = "auto";
    fly.style.left = lerp(startLeft, endLeft, e) + "px";
    fly.style.top = lerp(startTop, endTop, e) + "px";

    const docked = t >= 0.78 || open;
    head.classList.toggle("is-solid", docked);
    head.classList.toggle("is-visible", docked);
    fly.classList.toggle("is-on-cream", docked);
  }

  function requestSync() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(syncHead);
  }

  window.addEventListener("scroll", requestSync, { passive: true });
  window.addEventListener("resize", requestSync);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(requestSync);
  }
  syncHead();

  function closePanel() {
    if (!panel) return;
    panel.classList.remove("is-open");
    document.body.classList.remove("is-nav-open");
    toggle && toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    requestSync();
  }
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      const open = !panel.classList.contains("is-open");
      panel.classList.toggle("is-open", open);
      document.body.classList.toggle("is-nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
      requestSync();
    });
    panel.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closePanel);
    });
  }

  const items = Array.from(document.querySelectorAll("[data-lightbox]"));
  const lb = document.querySelector(".lb");
  if (lb && items.length) {
    const img = lb.querySelector("img");
    const cap = lb.querySelector(".lb-cap");
    let i = 0;
    function show(n) {
      i = (n + items.length) % items.length;
      const el = items[i];
      img.src = el.getAttribute("data-full") || el.currentSrc || el.src;
      img.alt = el.alt || "";
      cap.textContent = el.getAttribute("data-caption") || el.alt || "";
      lb.hidden = false;
      document.body.style.overflow = "hidden";
    }
    function hide() {
      lb.hidden = true;
      document.body.style.overflow = "";
    }
    items.forEach(function (el, idx) {
      el.addEventListener("click", function () { show(idx); });
    });
    lb.querySelector(".lb-close").addEventListener("click", hide);
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(i - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { show(i + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) hide(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") hide();
      if (e.key === "ArrowLeft") show(i - 1);
      if (e.key === "ArrowRight") show(i + 1);
    });
  }

  const tourBtn = document.querySelector(".tour-play");
  const tourModal = document.querySelector(".modal-tour");
  if (tourBtn && tourModal) {
    tourBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      tourModal.hidden = false;
      document.body.style.overflow = "hidden";
    });
    tourModal.querySelectorAll("[data-close]").forEach(function (b) {
      b.addEventListener("click", function () {
        tourModal.hidden = true;
        document.body.style.overflow = "";
      });
    });
  }

  /* Set this to your Formspree form id (formspree.io) to send requests
     to colmovilla@gmail.com. Leave empty to use the mailto fallback. */
  var FORMSPREE_ID = "xjywaajv";
  var MAILTO = "colmovilla@gmail.com";
  var form = document.querySelector("#book-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var confirm = document.getElementById("book-confirm");
      var fallback = document.getElementById("book-fallback");
      var err = document.getElementById("book-error");
      if (confirm) confirm.hidden = true;
      if (fallback) fallback.hidden = true;
      if (err) err.hidden = true;

      var d = new FormData(form);
      var arrival = d.get("arrival") || "";
      var departure = d.get("departure") || "";
      var dates = (arrival && departure) ? (arrival + " — " + departure) : (d.get("dates") || "");
      var body = [
        "Name: " + (d.get("name") || ""),
        "Email: " + (d.get("email") || ""),
        "Arrival: " + arrival,
        "Departure: " + departure,
        "Guests: " + (d.get("guests") || ""),
        "How did you hear about us?: " + (d.get("how_heard") || ""),
        "",
        d.get("message") || ""
      ].join("\n");

      function show(el) { if (el) el.hidden = false; }
      function lock() {
        form.querySelectorAll("input,select,textarea,button").forEach(function (el) {
          if (el.type !== "hidden") el.disabled = true;
        });
      }

      if (FORMSPREE_ID) {
        var payload = new FormData(form);
        payload.set("_subject", "COLMO VILLA — request for dates");
        if (!payload.get("email")) payload.set("email", d.get("email"));
        var btn = form.querySelector('[type="submit"]');
        if (btn) btn.disabled = true;
        fetch("https://formspree.io/f/" + FORMSPREE_ID, {
          method: "POST",
          body: payload,
          headers: { "Accept": "application/json" }
        }).then(function (res) {
          if (!res.ok) throw new Error("formspree");
          show(confirm);
          lock();
        }).catch(function () {
          if (btn) btn.disabled = false;
          show(err);
        });
        return;
      }

      window.location.href = "mailto:" + MAILTO +
        "?subject=" + encodeURIComponent("COLMO VILLA — request for dates") +
        "&body=" + encodeURIComponent(body);
      show(fallback);
    });
  }
})();

document.querySelectorAll('.lang a[aria-disabled="true"]').forEach(function(a){
  a.addEventListener('click', function(e){ e.preventDefault(); });
});


(function(){
  var map = document.querySelector(".house-map");
  if (!map) return;
  var live = map.querySelector(".house-map-live span");
  var zones = map.querySelectorAll(".zone");
  var picks = map.querySelectorAll(".house-map-pick");

  function headOffset(){
    var head = document.querySelector(".site-head");
    return (head ? head.offsetHeight : 112) + 8;
  }
  function go(href, updateHash){
    var el = document.querySelector(href);
    if (!el) return;
    var y = el.getBoundingClientRect().top + window.scrollY - headOffset();
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    if (updateHash && history.replaceState) history.replaceState(null, "", href);
  }
  function setActive(href){
    zones.forEach(function(z){
      var on = z.getAttribute("href") === href;
      z.classList.toggle("is-active", on);
    });
    picks.forEach(function(p){
      var on = p.getAttribute("data-href") === href;
      p.classList.toggle("is-active", on);
      p.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var z = map.querySelector('.zone[href="'+href+'"]');
    if (live) live.textContent = z ? (z.getAttribute("data-label") || "Volume") : "Click or tap a volume.";
  }

  zones.forEach(function(z){
    z.addEventListener("click", function(e){
      e.preventDefault();
      var href = z.getAttribute("href");
      setActive(href);
      go(href, true);
    });
  });
  picks.forEach(function(p){
    p.addEventListener("click", function(){
      var href = p.getAttribute("data-href");
      setActive(href);
      go(href, true);
    });
  });
  if (location.hash) {
    var z = map.querySelector('.zone[href="' + location.hash + '"]');
    if (z) {
      setActive(location.hash);
      go(location.hash, false);
    }
  }
})();


(function(){
  var wrap = document.querySelector(".cal-wrap");
  if (!wrap) return;
  var title = wrap.querySelector(".cal-title");
  var sub = wrap.querySelector(".cal-sub");
  var grid = wrap.querySelector(".cal");
  var legend = wrap.querySelector(".cal-legend");
  var prev = wrap.querySelector(".cal-prev");
  var next = wrap.querySelector(".cal-next");
  if (!title || !grid || !prev || !next) return;

  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var dow = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  var y = 2027, m = 6;

  function daysInMonth(year, month){
    return new Date(year, month, 0).getDate();
  }
  function mondayOffset(year, month){
    var day = new Date(year, month - 1, 1).getDay();
    return (day + 6) % 7;
  }
  function dayClass(year, month, day){
    if (year === 2027 && month === 6){
      if (day <= 11) return "busy";
      if (day <= 18) return "open";
      if (day <= 25) return "sel";
      if (day === 26) return "out";
      return "open";
    }
    return "open";
  }
  function render(){
    var name = months[m - 1] + " " + y;
    var isJune = (y === 2027 && m === 6);
    title.textContent = name;
    if (sub) sub.textContent = isJune ? "An example stay" : "An example";
    grid.setAttribute("aria-label", "Example calendar for " + name);
    var html = "";
    var i, d;
    for (i = 0; i < dow.length; i++) html += '<span class="dow">' + dow[i] + "</span>";
    var offset = mondayOffset(y, m);
    var n = daysInMonth(y, m);
    for (i = 0; i < offset; i++) html += '<span class="empty"></span>';
    for (d = 1; d <= n; d++) html += '<span class="' + dayClass(y, m, d) + '">' + d + "</span>";
    var fill = (7 - ((offset + n) % 7)) % 7;
    for (i = 0; i < fill; i++) html += '<span class="empty"></span>';
    grid.innerHTML = html;
    if (legend){
      legend.textContent = isJune
        ? "Sand: already reserved · Outline: open · Terracotta: 19–25 June, seven nights · Dashed: departure on the 26th."
        : "Outline: open in this example.";
    }
  }
  prev.addEventListener("click", function(){
    m -= 1;
    if (m < 1){ m = 12; y -= 1; }
    render();
  });
  next.addEventListener("click", function(){
    m += 1;
    if (m > 12){ m = 1; y += 1; }
    render();
  });
})();



  function bindLateralScroll(el, opts) {
    opts = opts || {};
    var onInteract = opts.onInteract || function () {};
    var onInteractEnd = opts.onInteractEnd || function () {};
    var stepFn = opts.step || function () { return Math.max(120, el.clientWidth * 0.8); };
    var keyboard = opts.keyboard !== false;

    var wheelIdle = null;
    el.addEventListener("wheel", function (e) {
      var dx = e.deltaX;
      var dy = e.deltaY;
      if (e.deltaMode === 1) { dx *= 16; dy *= 16; }
      if (e.deltaMode === 2) { dx *= el.clientWidth; dy *= el.clientHeight; }
      if (e.shiftKey && Math.abs(dy) >= Math.abs(dx)) dx = dy;
      if (!dx) return;
      var max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      var next = Math.max(0, Math.min(max, el.scrollLeft + dx));
      if (next === el.scrollLeft) return;
      e.preventDefault();
      el.classList.add("is-dragging");
      el.scrollLeft = next;
      onInteract();
      if (wheelIdle) clearTimeout(wheelIdle);
      wheelIdle = setTimeout(function () {
        wheelIdle = null;
        el.classList.remove("is-dragging");
        onInteractEnd();
      }, 180);
    }, { passive: false });

    var startX = 0, startLeft = 0, dragging = false, moved = false;
    el.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") { onInteract(); return; }
      if (e.button !== 0) return;
      if (e.target.closest && e.target.closest("button, a, input, select, textarea")) return;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      dragging = true;
      moved = false;
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
    });
    el.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      if (!moved && Math.abs(dx) < 6) return;
      moved = true;
      el.classList.add("is-dragging");
      el.scrollLeft = startLeft - dx;
      onInteract();
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("is-dragging");
      if (moved) {
        var prevent = function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          el.removeEventListener("click", prevent, true);
        };
        el.addEventListener("click", prevent, true);
      }
      onInteractEnd();
    }
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);

    if (keyboard) {
      el.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        var dir = e.key === "ArrowLeft" ? -1 : 1;
        el.scrollBy({ left: dir * stepFn(), behavior: "smooth" });
        onInteract();
        onInteractEnd();
      });
    }
  }

(function(){
  var root = document.querySelector("[data-day-marquee]");
  if (!root) return;
  var wrap = root.closest(".day-marquee-wrap") || root;
  var prev = wrap.querySelector(".day-prev");
  var next = wrap.querySelector(".day-next");
  var figures = Array.from(root.querySelectorAll(".day-set figure"));
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var timer = null;
  var idle = null;
  var hovering = false;
  var focused = false;
  var touching = false;
  var onScreen = false;
  var DELAY = 4000;
  var IDLE = 5000;

  root.setAttribute("tabindex", "0");
  root.setAttribute("role", "region");
  root.setAttribute("aria-label", "One day at Colmo");

  function step(){
    var first = figures[0];
    if (!first) return 200;
    var set = root.querySelector(".day-set");
    var gap = set ? (parseFloat(getComputedStyle(set).gap) || 14) : 14;
    return first.getBoundingClientRect().width + gap;
  }
  function wrapIndex(i){
    var n = figures.length;
    if (!n) return 0;
    return ((i % n) + n) % n;
  }
  function currentIndex(){
    var w = step();
    if (!w) return 0;
    return wrapIndex(Math.round(root.scrollLeft / w));
  }
  function go(i, instant){
    i = wrapIndex(i);
    var left = i * step();
    if (instant || reduce) {
      var prevB = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      root.scrollLeft = left;
      root.style.scrollBehavior = prevB;
    } else {
      root.scrollTo({ left: left, behavior: "smooth" });
    }
  }
  function stop(){
    if (timer) { clearInterval(timer); timer = null; }
    if (idle) { clearTimeout(idle); idle = null; }
  }
  function play(){
    stop();
    if (reduce || hovering || focused || touching || !onScreen || figures.length < 2) return;
    timer = setInterval(function(){
      go(currentIndex() + 1);
    }, DELAY);
  }
  function schedulePlay(){
    if (idle) clearTimeout(idle);
    idle = setTimeout(function(){ idle = null; play(); }, IDLE);
  }

  bindLateralScroll(root, {
    step: step,
    keyboard: true,
    onInteract: function(){ stop(); },
    onInteractEnd: function(){ schedulePlay(); }
  });

  function manual(dir){
    go(currentIndex() + dir);
    stop();
    schedulePlay();
  }
  if (prev) prev.addEventListener("click", function(){ manual(-1); });
  if (next) next.addEventListener("click", function(){ manual(1); });

  wrap.addEventListener("mouseenter", function(){ hovering = true; stop(); });
  wrap.addEventListener("mouseleave", function(){ hovering = false; schedulePlay(); });
  root.addEventListener("focusin", function(){ focused = true; stop(); });
  root.addEventListener("focusout", function(){
    if (!root.contains(document.activeElement)) { focused = false; schedulePlay(); }
  });
  wrap.addEventListener("touchstart", function(){ touching = true; stop(); }, { passive: true });
  wrap.addEventListener("touchend", function(){ touching = false; schedulePlay(); });
  wrap.addEventListener("touchcancel", function(){ touching = false; schedulePlay(); });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function(entries){
      var e = entries[0];
      onScreen = !!(e && e.isIntersecting && e.intersectionRatio >= 0.35);
      if (onScreen) play();
      else stop();
    }, { threshold: [0, 0.35, 0.6] });
    io.observe(wrap);
  } else {
    onScreen = true;
    play();
  }
})();

  /* The House zone carousels: arrows, dots, swipe, keyboard, autoplay */
  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    var track = root.querySelector(".carousel-track");
    var slides = Array.from(root.querySelectorAll(".carousel-slide"));
    var prev = root.querySelector(".carousel-prev");
    var next = root.querySelector(".carousel-next");
    var dots = Array.from(root.querySelectorAll(".carousel-dot"));
    if (!track || !slides.length) return;

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var index = 0;
    var timer = null;
    var hovering = false;
    var focused = false;
    var touching = false;
    var onScreen = false;
    var DELAY = 4000;

    function slideWidth() {
      var first = slides[0];
      var gap = parseFloat(getComputedStyle(track).gap) || 0;
      return first.getBoundingClientRect().width + gap;
    }

    function wrap(i) {
      var n = slides.length;
      return ((i % n) + n) % n;
    }

    function currentIndex() {
      var w = slideWidth();
      if (!w) return 0;
      return wrap(Math.round(track.scrollLeft / w));
    }

    function sync(i) {
      index = i;
      dots.forEach(function (dot, n) {
        var on = n === i;
        dot.classList.toggle("is-active", on);
        if (on) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
      if (prev) prev.disabled = false;
      if (next) next.disabled = false;
    }

    function go(i, instant) {
      i = wrap(i);
      var left = i * slideWidth();
      if (instant || reduce) {
        var prevBehavior = track.style.scrollBehavior;
        track.style.scrollBehavior = "auto";
        track.scrollLeft = left;
        track.style.scrollBehavior = prevBehavior;
      } else {
        track.scrollTo({ left: left, behavior: "smooth" });
      }
      sync(i);
    }

    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    function play() {
      stop();
      if (reduce || hovering || focused || touching || !onScreen || slides.length < 2) return;
      timer = setInterval(function () {
        go(currentIndex() + 1);
      }, DELAY);
    }

    var ticking = false;
    track.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        sync(currentIndex());
      });
    }, { passive: true });

    function manual(i) {
      go(i);
      stop();
      schedulePlay();
    }

    var idle = null;
    var IDLE = 5000;
    function schedulePlay() {
      if (idle) clearTimeout(idle);
      idle = setTimeout(function () { idle = null; play(); }, IDLE);
    }
    var _stop = stop;
    stop = function () {
      if (idle) { clearTimeout(idle); idle = null; }
      _stop();
    };

    bindLateralScroll(track, {
      keyboard: false,
      step: slideWidth,
      onInteract: function () { touching = true; stop(); },
      onInteractEnd: function () { touching = false; schedulePlay(); }
    });

    if (prev) prev.addEventListener("click", function () { manual(currentIndex() - 1); });
    if (next) next.addEventListener("click", function () { manual(currentIndex() + 1); });

    dots.forEach(function (dot, n) {
      dot.addEventListener("click", function () { manual(n); });
    });

    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); manual(currentIndex() - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); manual(currentIndex() + 1); }
      if (e.key === "Home") { e.preventDefault(); manual(0); }
      if (e.key === "End") { e.preventDefault(); manual(slides.length - 1); }
    });

    root.addEventListener("mouseenter", function () { hovering = true; stop(); });
    root.addEventListener("mouseleave", function () { hovering = false; schedulePlay(); });
    root.addEventListener("focusin", function () { focused = true; stop(); });
    root.addEventListener("focusout", function () {
      if (!root.contains(document.activeElement)) { focused = false; schedulePlay(); }
    });
    root.addEventListener("touchstart", function () { touching = true; stop(); }, { passive: true });
    root.addEventListener("touchend", function () { touching = false; schedulePlay(); });
    root.addEventListener("touchcancel", function () { touching = false; schedulePlay(); });

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        var e = entries[0];
        onScreen = !!(e && e.isIntersecting && e.intersectionRatio >= 0.35);
        if (onScreen) play();
        else stop();
      }, { threshold: [0, 0.35, 0.6] });
      io.observe(root);
    } else {
      onScreen = true;
      play();
    }

    window.addEventListener("resize", function () { go(currentIndex(), true); });
    sync(0);
  });

