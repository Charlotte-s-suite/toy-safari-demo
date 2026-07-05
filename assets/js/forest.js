/* Rainforest descent — pans the fixed background from canopy (top of page) down to
   the forest floor / stream (bottom) as you scroll, so the page reads like rolling
   down through the canopy. Drives --forest-y, which safari.css maps to the background's
   vertical position. rAF-throttled; disabled for reduced-motion. */
(function () {
  "use strict";
  var root = document.documentElement;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.style.setProperty("--forest-y", "18%"); // a calm static framing instead of motion
    return;
  }
  var ticking = false;
  function update() {
    ticking = false;
    var doc = document.documentElement, body = document.body;
    var max = Math.max(doc.scrollHeight, body.scrollHeight) - window.innerHeight;
    var y = window.pageYOffset || doc.scrollTop || 0;
    var p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    root.style.setProperty("--forest-y", (p * 100).toFixed(2) + "%");
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  window.addEventListener("load", update);
  update();
})();
