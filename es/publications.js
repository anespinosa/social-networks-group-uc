// Transforms the plain year-grouped publications list into a filterable
// gallery of horizontal cards (type chip + citation). The Markdown list stays
// the single source of truth; this runs only where .snuc-pubs exists.
(function () {
  function init() {
    var root = document.querySelector(".snuc-pubs");
    if (!root) return;

    // Group members — highlight their names wherever they appear in a citation.
    var memberPatterns = [
      /Espinosa[-\s]Rada,\s*A\.(?:\s*N\.)?/g,
      /Arias(?:[-\s]Yurisch)?,\s*K\.(?:\s*A\.)?/g,
      /Luengo(?:[-\s]Aravena)?,\s*D\.(?:\s*E\.)?/g
    ];
    function highlightMembers(html) {
      memberPatterns.forEach(function (re) {
        html = html.replace(re, function (m) { return '<span class="pub-me">' + m + "</span>"; });
      });
      return html;
    }

    var lang = (document.documentElement.lang || "en").slice(0, 2);
    var L = lang === "es"
      ? { all: "Todas", article: "Artículos", chapter: "Libros y capítulos", other: "Tesis y preprints" }
      : { all: "All", article: "Journal articles", chapter: "Books & chapters", other: "Theses & preprints" };

    // Collect every citation <li> in document order (already reverse-chron).
    var items = [];
    root.querySelectorAll("li").forEach(function (li) {
      var text = li.textContent || "";
      var html = li.innerHTML;
      var yearMatch = text.match(/\((\d{4})[a-z]?\)/);
      var year = yearMatch ? yearMatch[1] : "";

      var venue = "";
      var em = li.querySelector("em");
      if (em) venue = em.textContent || "";

      var type = "article";
      if (/dissertation|tesis\b/i.test(text)) {
        type = "thesis";
      } else if (/(^|[.\s])(In|En)\s+<em>/.test(html) || /\(Eds?\.\)/.test(text) || /\(pp\.\s/.test(text)) {
        type = "chapter";
      } else if (/SSRN|SocArXiv|arXiv|OSF|preprint/i.test(venue)) {
        type = "preprint";
      }
      // Filter group: article | chapter | other
      var group = (type === "article") ? "article" : (type === "chapter" ? "chapter" : "other");

      items.push({ html: html, year: year, type: type, group: group });
    });

    if (!items.length) return;

    var icons = {
      article: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h13l3 3v13H4z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>',
      chapter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M9 3v14"/></svg>',
      thesis: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/></svg>',
      preprint: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/></svg>'
    };

    var counts = { all: items.length, article: 0, chapter: 0, other: 0 };
    items.forEach(function (it) { counts[it.group]++; });

    // Build filter bar.
    var bar = document.createElement("div");
    bar.className = "pub-filters";
    var tabsDef = [
      { key: "all", label: L.all },
      { key: "article", label: L.article },
      { key: "chapter", label: L.chapter },
      { key: "other", label: L.other }
    ];
    tabsDef.forEach(function (t, i) {
      if (t.key !== "all" && counts[t.key] === 0) return;
      var b = document.createElement("button");
      b.className = "pub-tab" + (i === 0 ? " is-active" : "");
      b.setAttribute("data-filter", t.key);
      b.type = "button";
      b.innerHTML = t.label + ' <span class="pub-tab-count">' + counts[t.key] + "</span>";
      bar.appendChild(b);
    });

    // Build card list.
    var list = document.createElement("div");
    list.className = "pub-list";
    items.forEach(function (it) {
      var card = document.createElement("article");
      card.className = "pub-card";
      card.setAttribute("data-group", it.group);
      card.innerHTML =
        '<div class="pub-visual pub-' + it.group + '">' +
          '<span class="pub-icon">' + (icons[it.type] || icons.article) + "</span>" +
          '<span class="pub-year">' + it.year + "</span>" +
        "</div>" +
        '<div class="pub-body">' + highlightMembers(it.html) + "</div>";
      list.appendChild(card);
    });

    // Swap the old year sections for the new UI.
    root.innerHTML = "";
    root.appendChild(bar);
    root.appendChild(list);

    // Filtering.
    bar.addEventListener("click", function (e) {
      var tab = e.target.closest(".pub-tab");
      if (!tab) return;
      bar.querySelectorAll(".pub-tab").forEach(function (t) { t.classList.remove("is-active"); });
      tab.classList.add("is-active");
      var f = tab.getAttribute("data-filter");
      list.querySelectorAll(".pub-card").forEach(function (card) {
        var show = (f === "all") || (card.getAttribute("data-group") === f);
        card.classList.toggle("is-hidden", !show);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
