# Longevity Hub

[![Deploy Longevity Hub website](https://github.com/knightkalman/longevity-hub/actions/workflows/pages.yml/badge.svg)](https://github.com/knightkalman/longevity-hub/actions/workflows/pages.yml)
[![Collect longevity news](https://github.com/knightkalman/longevity-hub/actions/workflows/longevity-news-collect.yml/badge.svg)](https://github.com/knightkalman/longevity-hub/actions/workflows/longevity-news-collect.yml)
[![Collect longevity events](https://github.com/knightkalman/longevity-hub/actions/workflows/longevity-events-collect.yml/badge.svg)](https://github.com/knightkalman/longevity-hub/actions/workflows/longevity-events-collect.yml)

An open, source-led knowledge platform uniting geroscience, longevity research news, global scientific congresses, and evidence-based health pillars.

Hosted on GitHub Pages at: [https://knightkalman.github.io/longevity-hub/](https://knightkalman.github.io/longevity-hub/)

## Overview

Longevity Hub integrates:
- **Homepage**: Introduces evidence-led lifespan science, the six pillars of healthy longevity, and live summaries from our automated feeds.
- **Longevity News (`/news/`)**: Automated, daily tracking of peer-reviewed articles from PubMed and scientific publishers across research, consumer goods, nutrients, and medical therapies.
- **Longevity Events (`/events/`)**: Comprehensive directory of global scientific conferences, symposia, and geroscience meetings categorized across Vienna, Europe, the US, Asia, and worldwide.

## Architecture & Workflows

- **Website**: Static website hosted directly via GitHub Pages from the `public/` directory.
- **Daily News Collector**: Automated GitHub Action (`.github/workflows/longevity-news-collect.yml`) runs daily at 05:17 UTC, queries source registries, validates JSON schemas, and updates `public/news/news.json`.
- **Daily Events Collector**: Automated GitHub Action (`.github/workflows/longevity-events-collect.yml`) runs daily at 05:47 UTC, collects conference and symposium records, classifies regions, validates schemas, and updates `public/events/events.json`.
- **GitHub Pages Deploy**: Automated GitHub Action (`.github/workflows/pages.yml`) deploys the updated `public/` directory on every push to `main` and on automated collection updates.

## Local Development & Testing

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run test suite:
   ```bash
   python -m unittest discover -s tests -v
   ```

3. Preview website locally:
   ```bash
   python -m http.server --directory public 8000
   ```
   Open `http://localhost:8000/` in your browser.

## Disclaimers

All content on Longevity Hub is provided for educational and scientific discovery purposes only. Listings and headlines link directly to primary publishers and do not constitute medical advice or clinical endorsement.
