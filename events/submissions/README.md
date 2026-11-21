# Community Event Submissions

This directory allows conference organizers, researchers, and community members to submit upcoming longevity, geroscience, and healthspan conferences, symposia, and forums.

## How to Submit an Event

1. Copy [`template.json`](./template.json) to a new file named `your-event-slug.json` in this directory.
2. Fill in the required fields:
   - `id`: A unique kebab-case slug (e.g. `vienna-longevity-symposium-2027`).
   - `title`: Clean conference title.
   - `url`: Canonical HTTPS landing page or registration URL on an allowed host domain.
   - `date`: ISO `YYYY-MM-DD` start date (or publication date).
   - `date_raw`: Human-readable date string (e.g. `May 12, 2027 (10:00 – 18:00)`).
   - `publisher`: Organizing institution or society.
   - `summary`: A concise 1-2 sentence description of the scientific or technological focus.
3. Open a Pull Request. CI automatically validates your submission against `events/schemas/event-item.schema.json` and publishes it in the daily roundup upon approval.

## Exclusion Policy

Submissions linking to predatory conference aggregators (e.g. All Conference Alert, WASET, 10times, Research Leagues) or non-scientific consumer trade fairs are automatically rejected.
