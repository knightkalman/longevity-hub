// Longevity Hub — Highline Luxury Landing Page Controller
(function () {
  const filterBtns = document.querySelectorAll("[data-summary-category]");
  const bubbles = document.querySelectorAll(".luxury-bubble");
  const filterStatus = document.getElementById("summary-filter-status");

  function applyFilter(category) {
    let visibleCount = 0;

    bubbles.forEach((bubble) => {
      const bubbleCategory = bubble.getAttribute("data-category") || "";
      const matches = category === "all" || bubbleCategory === category;

      if (matches) {
        bubble.style.display = "flex";
        visibleCount++;
      } else {
        bubble.style.display = "none";
      }
    });

    if (filterStatus) {
      filterStatus.textContent = `Showing ${visibleCount} scientific summary ${
        visibleCount === 1 ? "insight" : "insights"
      }.`;
    }
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetCat = btn.getAttribute("data-summary-category");

      filterBtns.forEach((b) => {
        const isActive = b === btn;
        b.classList.toggle("is-active", isActive);
        b.setAttribute("aria-pressed", String(isActive));
      });

      applyFilter(targetCat);
    });
  });
})();
