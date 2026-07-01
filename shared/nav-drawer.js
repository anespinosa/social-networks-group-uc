// Turns Quarto's default responsive navbar collapse into an always-on
// left-side hamburger drawer, using Bootstrap's own Collapse component
// (already bundled by Quarto) rather than a bespoke implementation.
document.addEventListener("DOMContentLoaded", function () {
  var collapseEl = document.getElementById("navbarCollapse");
  if (!collapseEl) return;

  var backdrop = document.createElement("div");
  backdrop.className = "snuc-nav-backdrop";
  document.body.appendChild(backdrop);

  function closeDrawer() {
    if (window.bootstrap && window.bootstrap.Collapse) {
      var inst = window.bootstrap.Collapse.getInstance(collapseEl);
      if (inst) inst.hide();
      else collapseEl.classList.remove("show");
    } else {
      collapseEl.classList.remove("show");
    }
  }

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
