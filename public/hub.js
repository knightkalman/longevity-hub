// Longevity Hub dynamic feed loader & interactions
(function () {
  const newsPreviewEl = document.getElementById("news-preview-list");
  const eventsPreviewEl = document.getElementById("events-preview-list");
  const newsCountEl = document.getElementById("metric-news-count");
  const eventsCountEl = document.getElementById("metric-events-count");

  function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/[&<>"']/g, (c) => {
      const ent = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
      return ent[c];
    });
  }

  // Load News preview
  async function loadNewsPreview() {
    try {
      const res = await fetch("./news/news.json", { cache: "no-store" });
      if (!res.ok) throw new Error("Status " + res.status);
      const data = await res.json();
      const items = Array.isArray(data.items) ? data.items : [];

      if (newsCountEl) {
        newsCountEl.textContent = items.length + "+";
      }

      if (newsPreviewEl) {
        if (items.length === 0) {
          newsPreviewEl.innerHTML = "<li>No news headlines currently recorded.</li>";
          return;
        }

        const topItems = items.slice(0, 3);
        newsPreviewEl.innerHTML = topItems
          .map((item) => {
            const title = escapeHtml(item.title);
            const pub = escapeHtml(item.publisher || "Source publication");
            const date = escapeHtml(item.published_date || item.collected_at || "");
            const url = escapeHtml(item.canonical_url || item.url || "#");
            const cat = escapeHtml(item.category || "General");

            return `
            <li>
              <a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>
              <span class="preview-meta">${pub} · ${date.slice(0, 10)} · <span class="pillar-tag">${cat}</span></span>
            </li>
          `;
          })
          .join("");
      }
    } catch (err) {
      console.warn("Unable to load news preview:", err);
      if (newsPreviewEl) {
        newsPreviewEl.innerHTML = "<li>Follow the link below to view live Longevity News.</li>";
      }
    }
  }

  // Load Events preview
  async function loadEventsPreview() {
    try {
      const res = await fetch("./events/events.json", { cache: "no-store" });
      if (!res.ok) throw new Error("Status " + res.status);
      const data = await res.json();
      const items = Array.isArray(data.items) ? data.items : [];

      if (eventsCountEl) {
        eventsCountEl.textContent = items.length + "+";
      }

      if (eventsPreviewEl) {
        if (items.length === 0) {
          eventsPreviewEl.innerHTML = "<li>No upcoming events currently scheduled.</li>";
          return;
        }

        // Show upcoming or latest 3
        const topItems = items.slice(0, 3);
        eventsPreviewEl.innerHTML = topItems
          .map((item) => {
            const title = escapeHtml(item.title);
            const location = escapeHtml(item.location || item.city || "Worldwide");
            const date = escapeHtml(item.start_date || item.published_date || "");
            const url = escapeHtml(item.canonical_url || item.url || "#");

            return `
            <li>
              <a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>
              <span class="preview-meta">${location} · ${date.slice(0, 10)}</span>
            </li>
          `;
          })
          .join("");
      }
    } catch (err) {
      console.warn("Unable to load events preview:", err);
      if (eventsPreviewEl) {
        eventsPreviewEl.innerHTML = "<li>Follow the link below to view the full Events Calendar.</li>";
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadNewsPreview();
    loadEventsPreview();
  });
})();
