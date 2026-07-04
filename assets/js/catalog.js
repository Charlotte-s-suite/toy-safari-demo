/* ============================================================================
   Toy Safari — data-driven catalog renderer + smart gift-finder API
   Reads assets/data/products.json + categories.json and fills any element with
   a [data-catalog] attribute. Exposes window.ToySafari for the gift feature.
   Self-contained (vanilla JS, injects its own modal styles). No build step.
   ========================================================================= */
(function () {
  "use strict";
  var BASE = document.currentScript && document.currentScript.src
    ? document.currentScript.src.replace(/assets\/js\/catalog\.js.*$/, "")
    : "";
  var DATA = { products: [], categories: [], byId: {}, byCat: {}, cats: {} };
  var readyCbs = [], isReady = false;

  function j(url) { return fetch(url, { cache: "no-cache" }).then(function (r) {
    if (!r.ok) throw new Error(url + " " + r.status); return r.json();
  }); }

  function money(n) { return "$" + Number(n).toLocaleString(undefined, { minimumFractionDigits: (n % 1 ? 2 : 0), maximumFractionDigits: 2 }); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function stars(n) { n = Math.round(n || 5); return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n); }

  function card(p) {
    var cat = DATA.cats[p.category] || {};
    var msrp = p.msrp && p.msrp > p.price ? '<s>' + money(p.msrp) + '</s>' : '';
    var age = p.ageLabel ? '<span class="cat-age">' + esc(p.ageLabel) + '</span>' : '';
    return '<a class="card" href="javascript:void(0)" data-id="' + esc(p.id) + '">' +
      '<div class="ph"><img src="' + esc(BASE + p.image) + '" alt="' + esc(p.title) + '" loading="lazy">' +
      '<div class="badges"><span class="pill" style="background:var(--blue-soft);color:var(--blue-deep)">' + esc(cat.emoji || "") + " " + esc(cat.name || p.category) + '</span></div>' +
      age + '<div class="heart">♡</div></div>' +
      '<div class="body"><div class="brand-line">' + esc(p.brand || "Toy Safari") + '</div>' +
      '<h3>' + esc(p.title) + '</h3>' +
      '<div class="stars"><span class="st">' + stars(p.rating) + '</span> <span>' + (p.rating || 5) + '.0</span> <span style="color:var(--muted)">(' + (p.reviews || 0) + ')</span></div>' +
      '<div class="foot"><div class="price">' + money(p.price) + msrp + '</div><button class="add" aria-label="Add to cart">+</button></div>' +
      '</div></a>';
  }

  function fillGrids() {
    var grids = document.querySelectorAll("[data-catalog]");
    grids.forEach(function (el) {
      var key = el.getAttribute("data-catalog");
      var limit = parseInt(el.getAttribute("data-limit") || "0", 10);
      var list = key === "all" ? DATA.products.slice() : (DATA.byCat[key] || []);
      if (limit > 0) list = list.slice(0, limit);
      if (!list.length) { el.innerHTML = '<p style="grid-column:1/-1;color:var(--muted);font-weight:700;padding:20px">Products coming soon — this category is being stocked.</p>'; return; }
      el.innerHTML = list.map(card).join("");
      var countEl = document.querySelector('[data-catalog-count="' + key + '"]');
      if (countEl) countEl.textContent = (DATA.byCat[key] || DATA.products).length;
    });
    document.querySelectorAll("[data-catalog]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        var a = e.target.closest(".card[data-id]"); if (!a) return;
        e.preventDefault(); openDetail(a.getAttribute("data-id"));
      });
    });
  }

  /* ---------- product detail modal ---------- */
  function ensureModal() {
    if (document.getElementById("ts-modal")) return;
    var style = document.createElement("style");
    style.textContent =
      "#ts-scrim{position:fixed;inset:0;background:rgba(15,12,25,.6);backdrop-filter:blur(4px);z-index:200;display:none;align-items:center;justify-content:center;padding:24px}" +
      "#ts-scrim.on{display:flex}" +
      "#ts-modal{background:#fff;border-radius:22px;max-width:860px;width:100%;max-height:88vh;overflow:auto;box-shadow:0 30px 80px rgba(0,0,0,.4)}" +
      ".ts-md{display:grid;grid-template-columns:1fr 1fr;gap:0}" +
      ".ts-md .pic{background:#f6f3ec;display:grid;place-items:center;padding:28px}" +
      ".ts-md .pic img{width:100%;max-height:380px;object-fit:contain;mix-blend-mode:multiply}" +
      ".ts-md .info{padding:30px 32px}" +
      ".ts-md .bl{font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--amber-deep)}" +
      ".ts-md h2{font-family:'Fredoka';font-weight:600;font-size:26px;color:var(--ink);margin:6px 0 8px;line-height:1.1}" +
      ".ts-md .pr{font-family:'Fredoka';font-weight:700;font-size:28px;color:var(--green-deep);margin:8px 0}" +
      ".ts-md .pr s{font-size:16px;color:var(--muted);margin-left:8px}" +
      ".ts-md p.d{font-weight:600;color:var(--ink-soft);font-size:15px;line-height:1.6;margin:12px 0}" +
      ".ts-md .tags{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}" +
      ".ts-md .tags span{background:var(--green-soft);color:var(--green-deep);font-weight:800;font-size:11px;padding:5px 10px;border-radius:7px}" +
      ".ts-md .specs{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line);border:1px solid var(--line);border-radius:10px;overflow:hidden;margin-top:14px}" +
      ".ts-md .specs .s{background:#fff;padding:9px 12px}.ts-md .specs .k{font-size:10px;font-weight:800;text-transform:uppercase;color:var(--muted)}.ts-md .specs .v{font-weight:800;font-size:13px;color:var(--ink)}" +
      ".ts-md .cta{display:flex;gap:10px;margin-top:18px}.ts-md .cta .btn{flex:1;justify-content:center}" +
      "#ts-x{position:sticky;top:0;float:right;margin:12px 12px -40px 0;background:#fff;border:1px solid var(--line);border-radius:50%;width:36px;height:36px;font-size:18px;cursor:pointer;z-index:2}" +
      "@media(max-width:680px){.ts-md{grid-template-columns:1fr}.ts-md .pic img{max-height:240px}}";
    document.head.appendChild(style);
    var scrim = document.createElement("div"); scrim.id = "ts-scrim";
    scrim.innerHTML = '<div id="ts-modal"><button id="ts-x" aria-label="Close">✕</button><div id="ts-modal-body"></div></div>';
    document.body.appendChild(scrim);
    scrim.addEventListener("click", function (e) { if (e.target === scrim || e.target.id === "ts-x") scrim.classList.remove("on"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") scrim.classList.remove("on"); });
  }
  function openDetail(id) {
    var p = DATA.byId[id]; if (!p) return; ensureModal();
    var cat = DATA.cats[p.category] || {};
    var specs = Object.keys(p.specs || {}).map(function (k) { return '<div class="s"><div class="k">' + esc(k) + '</div><div class="v">' + esc(p.specs[k]) + '</div></div>'; }).join("");
    var tags = [].concat(p.interests || [], p.skills || []).slice(0, 8).map(function (t) { return "<span>" + esc(t.replace(/-/g, " ")) + "</span>"; }).join("");
    var msrp = p.msrp && p.msrp > p.price ? '<s>' + money(p.msrp) + '</s>' : '';
    document.getElementById("ts-modal-body").innerHTML =
      '<div class="ts-md"><div class="pic"><img src="' + esc(BASE + p.image) + '" alt="' + esc(p.title) + '"></div>' +
      '<div class="info"><div class="bl">' + esc(cat.emoji || "") + " " + esc(p.brand || "") + " · " + esc(p.ageLabel || "") + '</div>' +
      '<h2>' + esc(p.title) + '</h2>' +
      '<div class="stars"><span class="st">' + stars(p.rating) + '</span> <span>' + (p.rating || 5) + '.0 (' + (p.reviews || 0) + ')</span></div>' +
      '<div class="pr">' + money(p.price) + msrp + '</div>' +
      '<p class="d">' + esc(p.description || p.shortDesc || "") + '</p>' +
      (tags ? '<div class="tags">' + tags + '</div>' : '') +
      (specs ? '<div class="specs">' + specs + '</div>' : '') +
      '<div class="cta"><button class="btn btn-amber">Add to cart · ' + money(p.price) + '</button><button class="btn btn-ghost">🎈 Gift wrap</button></div>' +
      '</div></div>';
    document.getElementById("ts-scrim").classList.add("on");
  }

  /* ---------- smart gift-finder (the seam for the future feature) ---------- */
  function giftFinder(opts) {
    opts = opts || {};
    var age = opts.ageMonths, ints = (opts.interests || []), sks = (opts.skills || []);
    var out = DATA.products.filter(function (p) {
      if (age != null && !(p.ageMinMonths <= age && age <= (p.ageMaxMonths + 6))) return false;
      if (opts.priceMax != null && p.price > opts.priceMax) return false;
      if (opts.priceMin != null && p.price < opts.priceMin) return false;
      if (opts.category && p.category !== opts.category) return false;
      if (opts.gender && p.genderAppeal !== "neutral" && p.genderAppeal !== opts.gender) return false;
      return true;
    }).map(function (p) {
      var score = 0;
      ints.forEach(function (i) { if ((p.interests || []).indexOf(i) >= 0) score += 3; if ((p.themes || []).indexOf(i) >= 0) score += 1; });
      sks.forEach(function (s) { if ((p.skills || []).indexOf(s) >= 0) score += 2; });
      (opts.occasions || []).forEach(function (o) { if ((p.giftOccasions || []).indexOf(o) >= 0) score += 1; });
      score += (p.rating || 5) / 10;
      return { p: p, score: score };
    });
    out.sort(function (a, b) { return b.score - a.score; });
    var limit = opts.limit || 12;
    return out.slice(0, limit).map(function (x) { return x.p; });
  }

  /* ---------- boot ---------- */
  window.ToySafari = {
    get products() { return DATA.products; },
    get categories() { return DATA.categories; },
    byCategory: function (slug) { return (DATA.byCat[slug] || []).slice(); },
    get: function (id) { return DATA.byId[id]; },
    giftFinder: giftFinder,
    renderInto: function (selector, list) { var el = document.querySelector(selector); if (el) el.innerHTML = (list || []).map(card).join(""); },
    open: openDetail,
    ready: function (cb) { if (isReady) cb(); else readyCbs.push(cb); }
  };

  Promise.all([
    j(BASE + "assets/data/products.json").catch(function () { return { products: [] }; }),
    j(BASE + "assets/data/categories.json").catch(function () { return { categories: [] }; })
  ]).then(function (r) {
    DATA.products = (r[0].products || []).filter(function (p) { return p && p.id; });
    DATA.categories = r[1].categories || [];
    DATA.categories.forEach(function (c) { DATA.cats[c.id] = c; });
    DATA.products.forEach(function (p) {
      DATA.byId[p.id] = p;
      (DATA.byCat[p.category] = DATA.byCat[p.category] || []).push(p);
    });
    fillGrids();
    // total-count labels (e.g. the shop hero) even when no data-catalog="all" grid exists
    document.querySelectorAll('[data-catalog-count="all"]').forEach(function (el) { el.textContent = DATA.products.length; });
    isReady = true; readyCbs.forEach(function (cb) { try { cb(); } catch (e) { console.error(e); } });
    document.dispatchEvent(new CustomEvent("toysafari:ready", { detail: DATA }));
  });
})();
