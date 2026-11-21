(function () {
  document.documentElement.classList.add("js");

  const head = document.querySelector(".site-head");
  const toggle = document.querySelector(".nav-toggle");
  const panel = document.querySelector(".nav-panel");
  const entrance = document.querySelector(".entrance");
  const fly = document.querySelector(".fly-logo");
  const brand = document.querySelector(".brand");
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
    const startTop = Math.max(64, Math.min(132, entrance.offsetHeight * 0.13));
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
    toggle && toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    requestSync();
  }
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      const open = !panel.classList.contains("is-open");
      panel.classList.toggle("is-open", open);
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

  const form = document.querySelector("#book-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const d = new FormData(form);
      const body = [
        "Name: " + (d.get("name") || ""),
        "Email: " + (d.get("email") || ""),
        "Dates: " + (d.get("dates") || ""),
        "Guests: " + (d.get("guests") || ""),
        "",
        d.get("message") || ""
      ].join("\n");
      window.location.href = "mailto:madalena.seabra@gmail.com?subject=" +
        encodeURIComponent("COLMO VILLA — request for dates") +
        "&body=" + encodeURIComponent(body);
    });
  }
})();

document.querySelectorAll('.lang a[aria-disabled="true"]').forEach(function(a){
  a.addEventListener('click', function(e){ e.preventDefault(); });
});


(function(){
  var map = document.querySelector(".house-map");
  if (!map) return;
  var live = map.querySelector(".house-map-live");
  var zones = map.querySelectorAll(".zone");
  var picks = map.querySelectorAll(".house-map-pick");
  var idle = live ? live.innerHTML : "";
  function labelFor(z){
    if (!live) return;
    if (!z) { live.innerHTML = idle; return; }
    live.innerHTML = "<strong>" + (z.getAttribute("data-label") || "") +
      "</strong><span>" + (z.getAttribute("data-note") || "") + "</span>";
  }
  function syncPicks(z){
    var href = z ? (z.getAttribute("href") || "") : "";
    picks.forEach(function(p){
      var on = href && p.getAttribute("data-href") === href;
      p.classList.toggle("is-active", on);
      p.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  function activate(z, scroll){
    zones.forEach(function(x){ x.classList.remove("is-active"); });
    if (z) z.classList.add("is-active");
    labelFor(z);
    syncPicks(z);
    if (scroll && z) {
      var href = z.getAttribute("href") || "";
      if (href.charAt(0) === "#") {
        var target = document.querySelector(href);
        if (target) target.scrollIntoView({behavior:"smooth", block:"start"});
      }
    }
  }
  zones.forEach(function(z){
    z.addEventListener("mouseenter", function(){ labelFor(z); syncPicks(z); });
    z.addEventListener("focus", function(){ labelFor(z); syncPicks(z); });
    z.addEventListener("click", function(e){
      var href = z.getAttribute("href") || "";
      if (href.charAt(0) === "#") e.preventDefault();
      activate(z, href.charAt(0) === "#");
    });
  });
  picks.forEach(function(p){
    p.addEventListener("click", function(){
      var z = map.querySelector('.zone[href="' + (p.getAttribute("data-href") || "") + '"]');
      activate(z || null, false);
    });
  });
  map.addEventListener("mouseleave", function(){
    var a = map.querySelector(".zone.is-active");
    labelFor(a || null);
    syncPicks(a || null);
  });
  var initial = map.querySelector('.zone[href="#kitchen"]');
  if (initial) activate(initial, false);
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
