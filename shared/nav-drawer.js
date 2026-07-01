// Turns Quarto's default responsive navbar collapse into an always-on
// left-side hamburger drawer, using Bootstrap's own Collapse component
// (already bundled by Quarto) rather than a bespoke implementation.
document.addEventListener("DOMContentLoaded", function () {
  var collapseEl = document.getElementById("navbarCollapse");
  if (!collapseEl) return;

  var backdrop = document.createElement("div");
  backdrop.className = "snuc-nav-backdrop";
  document.body.appendChild(backdrop);

  // Quarto nests the collapse inside <header class="fixed-top">, which is
  // its own stacking context (Bootstrap gives it a z-index). Left there,
  // our higher z-index on #navbarCollapse only wins *within* that context,
  // so the body-level backdrop above ends up drawn on top anyway and
  // silently swallows clicks on the nav links. Re-parent the drawer to
  // <body>, after the backdrop, so both compete in the same (root)
  // stacking context and DOM order agrees with the z-index.
  document.body.appendChild(collapseEl);

  function closeDrawer() {
    if (window.bootstrap && window.bootstrap.Collapse) {
      var inst = window.bootstrap.Collapse.getInstance(collapseEl);
      if (inst) inst.hide();
      else collapseEl.classList.remove("show");
    } else {
      collapseEl.classList.remove("show");
    }
  }

  // Once open, the drawer's own panel visually covers the hamburger
  // button that opened it, so it can't be used to close again. Give the
  // drawer its own explicit close control.
  var closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "snuc-nav-close";
  closeBtn.setAttribute("aria-label", "Close menu");
  closeBtn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>';
  closeBtn.addEventListener("click", closeDrawer);
  collapseEl.insertBefore(closeBtn, collapseEl.firstChild);

  collapseEl.addEventListener("show.bs.collapse", function () {
    backdrop.classList.add("show");
  });
  collapseEl.addEventListener("hide.bs.collapse", function () {
    backdrop.classList.remove("show");
  });
  backdrop.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDrawer();
  });
});
