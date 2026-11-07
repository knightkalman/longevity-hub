// Longevity Hub dynamic feed loader & reactive featured bubbles
(function () {
  const newsPreviewEl = document.getElementById("news-preview-list");
  const eventsPreviewEl = document.getElementById("events-preview-list");
  const newsCountEl = document.getElementById("metric-news-count");
  const eventsCountEl = document.getElementById("metric-events-count");
  const bubblesContainerEl = document.getElementById("featured-bubbles-container");
  const countAllEl = document.getElementById("count-all");
  const countUpcomingEl = document.getElementById("count-upcoming");
  const countPastEl = document.getElementById("count-past");
  const bubbleFilterBtns = document.querySelectorAll("[data-bubble-filter]");

  const MONTH_MAP = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
  };

  const LOCATION_LABELS = {
    vienna: "Vienna",
    europe: "Europe",
    us: "US",
    asia: "Asia",
    other: "Global"
  };

  function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/[&<>"']/g, (c) => {
      const ent = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
      return ent[c];
    });
  }

  function safeUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
    } catch {
      return null;
    }
  }

  function parseMonthToken(token) {
    if (!token) return null;
    const clean = token.trim().replace(/\.$/, "").toLowerCase();
    if (/^\d{1,2}$/.test(clean)) {
      const num = Number(clean);
      return num >= 1 && num <= 12 ? num : null;
    }
    return MONTH_MAP[clean.slice(0, 3)] ?? null;
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function lastDayOfMonth(year, month) {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
  }

  function resolveEffectiveDateIso(item) {
    if (typeof item.publication_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.publication_date)) {
      return item.publication_date;
    }
    const raw = (item.publication_date_raw || "").trim();
    if (raw) {
      const ymd = raw.match(/^(\d{4})[\s/-]+([A-Za-z]+|\d{1,2})[\s/-]+(\d{1,2})$/);
      if (ymd) {
        const year = Number(ymd[1]);
        const month = parseMonthToken(ymd[2]);
        const day = Number(ymd[3]);
        if (month && day >= 1 && day <= 31) {
          return `${year}-${pad2(month)}-${pad2(day)}`;
        }
      }
      const ym = raw.match(/^(\d{4})[\s/-]+([A-Za-z]+|\d{1,2})(?:-([A-Za-z]+|\d{1,2}))?$/);
      if (ym) {
        const year = Number(ym[1]);
        const month = parseMonthToken(ym[3] || ym[2]);
        if (month) {
          return `${year}-${pad2(month)}-${pad2(lastDayOfMonth(year, month))}`;
        }
      }
      if (/^\d{4}$/.test(raw)) {
        return `${Number(raw)}-01-01`;
      }
    }
    return null;
  }

  function formatDisplayDate(isoDate, rawDate) {
    if (isoDate) {
      const parts = isoDate.split("-");
      if (parts.length === 3) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const m = Number(parts[1]) - 1;
        const d = Number(parts[2]);
        const y = parts[0];
        if (m >= 0 && m < 12) {
          return `${d} ${months[m]} ${y}`;
        }
      }
    }
    return rawDate || "2026";
  }

  function formatLocation(item) {
    const primary = item.location;
    if (primary === "vienna") return "Vienna";
    if (primary === "europe") return "Europe";
    if (primary === "us") return "US";
    if (primary === "asia") return "Asia";
    if (Array.isArray(item.location_groups) && item.location_groups.length > 0) {
      const firstGroup = item.location_groups.find((g) => LOCATION_LABELS[g]);
      if (firstGroup) return LOCATION_LABELS[firstGroup];
    }
    return LOCATION_LABELS[primary] || "Global";
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

  // Load Events and render reactive featured bubbles
  async function loadEventsAndFeaturedBubbles() {
    try {
      const res = await fetch("./events/events.json", { cache: "no-store" });
      if (!res.ok) throw new Error("Status " + res.status);
      const feed = await res.json();
      const items = Array.isArray(feed.items) ? feed.items : [];

      if (eventsCountEl) {
        eventsCountEl.textContent = items.length + "+";
      }

      let referenceDateIso = new Date().toISOString().slice(0, 10);
      if (
        typeof feed.last_successful_collection === "string" &&
        /^\d{4}-\d{2}-\d{2}/.test(feed.last_successful_collection)
      ) {
        referenceDateIso = feed.last_successful_collection.slice(0, 10);
      }

      // Valid items with resolved date
      const validEvents = [];
      for (const item of items) {
        if (!item || !item.title) continue;
        const url = safeUrl(item.source_url || item.url || item.canonical_url);
        if (!url) continue;
        const iso = resolveEffectiveDateIso(item) || "2026-01-01";
        validEvents.push({
          ...item,
          _resolvedUrl: url,
          _isoDate: iso,
          _isUpcoming: iso >= referenceDateIso,
        });
      }

      // Partition into upcoming and past
      const upcoming = validEvents.filter((item) => item._isUpcoming);
      const past = validEvents.filter((item) => !item._isUpcoming);

      // Sort upcoming ascending (soonest event first)
      upcoming.sort((a, b) => a._isoDate.localeCompare(b._isoDate) || String(a.title).localeCompare(String(b.title)));

      // Sort past descending (closest past event first)
      past.sort((a, b) => b._isoDate.localeCompare(a._isoDate) || String(b.title).localeCompare(String(a.title)));

      // Select up to 10 in total: first upcoming ones, then closest past
      const targetUpcoming = Math.min(upcoming.length, 6);
      const targetPast = Math.min(past.length, 10 - targetUpcoming);
      let featured = [...upcoming.slice(0, targetUpcoming), ...past.slice(0, targetPast)];

      // If still under 10, fill from upcoming if available
      if (featured.length < 10 && upcoming.length > targetUpcoming) {
        const remainingNeeded = 10 - featured.length;
        featured = [...featured, ...upcoming.slice(targetUpcoming, targetUpcoming + remainingNeeded)];
      }

      // Update preview card in #portals
      if (eventsPreviewEl) {
        if (featured.length === 0) {
          eventsPreviewEl.innerHTML = "<li>No upcoming events currently scheduled.</li>";
        } else {
          eventsPreviewEl.innerHTML = featured
            .slice(0, 3)
            .map((item) => {
              const title = escapeHtml(item.title);
              const loc = escapeHtml(formatLocation(item));
              const date = escapeHtml(formatDisplayDate(item._isoDate, item.publication_date_raw));
              const badge = item._isUpcoming
                ? '<span class="bubble-pill bubble-pill-upcoming" style="padding:2px 8px;font-size:10px;">Upcoming</span>'
                : '<span class="bubble-pill bubble-pill-past" style="padding:2px 8px;font-size:10px;">Recent</span>';

              return `
              <li>
                <a href="${item._resolvedUrl}" target="_blank" rel="noopener noreferrer">${title}</a>
                <span class="preview-meta">${badge} ${loc} · ${date}</span>
              </li>
            `;
            })
            .join("");
        }
      }

      // Render stylish bubbles
      if (bubblesContainerEl) {
        if (featured.length === 0) {
          bubblesContainerEl.innerHTML = `
            <div class="bubbles-loading">
              <span>No featured events currently available.</span>
            </div>
          `;
          return;
        }

        const upcomingCount = featured.filter((i) => i._isUpcoming).length;
        const pastCount = featured.filter((i) => !i._isUpcoming).length;

        if (countAllEl) countAllEl.textContent = String(featured.length);
        if (countUpcomingEl) countUpcomingEl.textContent = String(upcomingCount);
        if (countPastEl) countPastEl.textContent = String(pastCount);

        bubblesContainerEl.innerHTML = featured
          .map((item) => {
            const isUp = item._isUpcoming;
            const timeframeClass = isUp ? "is-upcoming" : "is-past";
            const timeframeType = isUp ? "upcoming" : "past";
            const statusBadge = isUp
              ? '<span class="bubble-pill bubble-pill-upcoming"><span class="pulse-dot"></span> Upcoming</span>'
              : '<span class="bubble-pill bubble-pill-past">Recent Past</span>';
            const locLabel = escapeHtml(formatLocation(item));
            const dateStr = escapeHtml(formatDisplayDate(item._isoDate, item.publication_date_raw));
            const title = escapeHtml(item.title);
            const pub = escapeHtml(item.publisher || "Scientific Meeting");
            const author = item.author ? `<span> · ${escapeHtml(item.author)}</span>` : "";

            const hiddenTags = new Set(["needs_review", item.location, ...(item.location_groups || [])]);
            const tags = (item.tags || [])
              .filter((t) => !hiddenTags.has(t))
              .slice(0, 3)
              .map((t) => `<span class="bubble-tag-pill">${escapeHtml(t.replaceAll("_", " "))}</span>`)
              .join("");

            return `
            <article class="event-bubble ${timeframeClass}" data-timeframe="${timeframeType}" data-location="${escapeHtml(item.location || "global")}">
              <div class="bubble-top">
                <div class="bubble-badges">
                  ${statusBadge}
                  <span class="bubble-pill bubble-pill-loc">${locLabel}</span>
                </div>
                <span class="bubble-date">${dateStr}</span>
              </div>
              <h3 class="bubble-title">
                <a href="${item._resolvedUrl}" target="_blank" rel="noopener noreferrer">
                  ${title}
                  <span class="bubble-arrow" aria-hidden="true">↗</span>
                </a>
              </h3>
              <div class="bubble-meta">
                <span class="bubble-publisher">${pub}</span>
                ${author}
              </div>
              ${tags ? `<div class="bubble-tags">${tags}</div>` : ""}
            </article>
          `;
          })
          .join("");

        // Wire reactive filter buttons
        bubbleFilterBtns.forEach((btn) => {
          btn.addEventListener("click", () => {
            const filterValue = btn.dataset.bubbleFilter;
            bubbleFilterBtns.forEach((b) => {
              const active = b === btn;
              b.classList.toggle("is-active", active);
              b.setAttribute("aria-pressed", String(active));
            });

            const bubbles = bubblesContainerEl.querySelectorAll(".event-bubble");
            bubbles.forEach((bubble) => {
              const bTimeframe = bubble.dataset.timeframe;
              const matches = filterValue === "all" || bTimeframe === filterValue;
              bubble.classList.toggle("is-filtered-out", !matches);
            });
          });
        });
      }
    } catch (err) {
      console.warn("Unable to load events or featured bubbles:", err);
      if (eventsPreviewEl) {
        eventsPreviewEl.innerHTML = "<li>Follow the link below to view the full Events Calendar.</li>";
      }
      if (bubblesContainerEl) {
        bubblesContainerEl.innerHTML = `
          <div class="bubbles-loading">
            <span>Unable to load featured events right now. Please explore the directory directly below.</span>
          </div>
        `;
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadNewsPreview();
    loadEventsAndFeaturedBubbles();
  });
})();
