# ReadGator — Product Requirements Document

**Version:** 0.1 (MVP)
**Last updated:** 2026-04-03
**Status:** Planning

---

## 1. Product overview

ReadGator is a mobile-first knowledge capture app that turns shared content (web links, text, documents, images) into structured, searchable markdown knowledge objects. It acts as an autonomous knowledge organiser — not a read-later app.

The user shares a link or pastes some text. The app extracts the content, sends it to an LLM for understanding, and produces a templated one-pager with a summary, key points, tags, entities, and metadata. The output is stored as markdown and browsable through a clean, card-based interface.

### What ReadGator is

- A capture-to-knowledge compiler: messy input in, structured knowledge object out.
- Markdown-native: the markdown file is the system of record, not a database row.
- Mobile-first with an emphasis on zero-friction capture.
- An autonomous organiser that classifies, tags, and structures without user effort.

### What ReadGator is not

- Not a read-later app (it processes content, not queues it).
- Not a full note-taking system (no freeform editing in MVP).
- Not an Obsidian replacement (it feeds into tools like Obsidian, not competes with them).
- Not a social/sharing platform.

---

## 2. Target users

### Primary persona: The Curious Collector

A professional or knowledge worker who frequently encounters interesting articles, threads, papers, and resources throughout the day. They want to save and understand these without breaking their flow. They don't have time to read everything now, and they lose track of things saved to bookmarks or messaging apps.

**Jobs to be done:**
1. "I found something interesting — save it and make sense of it for me."
2. "What did I save about [topic] last month?"
3. "Show me everything I've captured, organised by theme."

### Secondary persona: The PKM Enthusiast

Uses Obsidian or similar tools. Wants structured markdown they can export and integrate into their existing system. Values portability, open formats, and control over their data.

**Jobs to be done:**
1. "Capture this into my knowledge system without manual formatting."
2. "Export my library to Obsidian in a format that just works."
3. "Let me customise the output template."

### MVP focus

The MVP serves the Curious Collector. The PKM Enthusiast's needs (export, custom templates, raw markdown access) are deferred to v1.1+.

---

## 3. MVP scope

### In scope

| Feature | Description |
|---|---|
| Manual URL capture | Paste a URL into the app, trigger processing |
| Manual text capture | Paste or type text directly, trigger processing |
| Content extraction | Fetch and extract readable content from web URLs |
| LLM processing | Send extracted content to LLM, receive structured knowledge object |
| Markdown generation | Generate a templated markdown file from the LLM output |
| Knowledge card view | Render each knowledge object as a readable card (not raw markdown) |
| Library feed | Scrollable list of all captured items, newest first |
| Search | Full-text search across all knowledge objects |
| Tag filtering | Filter library by LLM-generated tags |
| Processing queue | Visual indicator for items being processed or pending |
| Local storage | All data stored on-device using SQLite + markdown files |
| LLM abstraction layer | Configurable endpoint — Ollama for dev, cloud API for production |

### Explicitly out of scope for MVP

| Feature | Reason | Target phase |
|---|---|---|
| iOS share extension | Requires custom dev client + Apple Developer account | v1.0 |
| PDF ingestion | Separate extraction pipeline | v1.1 |
| Image/OCR ingestion | Separate extraction pipeline | v1.1 |
| Obsidian export | Needs template stabilisation first | v1.1 |
| Knowledge map/graph visualisation | Significant UI work, uncertain value | v2.0 |
| Custom templates | Power user feature, not MVP | v1.1 |
| User accounts/auth | Local-first MVP, no cloud sync | v2.0 |
| Web companion app | iOS first | v2.0 |
| Browser extension | Desktop capture | v1.1 |
| Freeform note editing | Not a note-taking app in MVP | v1.1 |
| Duplicate detection | Nice to have, not essential | v1.0 |

### MVP user flow

1. User opens the app.
2. User taps "Add" and either pastes a URL or enters/pastes text.
3. App shows the item in the library with a "Processing..." indicator.
4. App extracts content (for URLs: fetches page, strips to readable text).
5. App sends extracted content to the configured LLM endpoint.
6. LLM returns a structured knowledge object (JSON).
7. App generates a markdown file from the LLM response.
8. App stores the markdown file and indexes metadata in SQLite.
9. The library card updates to show the finished knowledge object.
10. User can tap to view the full card, search, or filter by tags.

---

## 4. Knowledge object schema

Every captured item produces a knowledge object with this structure:

```json
{
  "id": "uuid-v4",
  "title": "string",
  "source": {
    "url": "string | null",
    "type": "article | blog | paper | tweet | thread | video | podcast | text | other",
    "captured_at": "ISO 8601 timestamp",
    "domain": "string | null"
  },
  "summary": "string (2-4 sentences)",
  "key_points": ["string"],
  "tags": {
    "topics": ["string"],
    "domain": "string",
    "format": "string",
    "priority": "high | medium | low"
  },
  "entities": [
    {
      "name": "string",
      "type": "person | company | product | concept | place",
      "relevance": "string (brief note)"
    }
  ],
  "why_it_matters": "string (1-2 sentences, contextual relevance)",
  "follow_up": "string | null (suggested next action or related query)",
  "confidence": {
    "extraction_quality": "high | medium | low",
    "notes": "string | null (e.g., 'paywalled — only meta description available')"
  },
  "raw_content_preview": "string (first 500 chars of extracted text)",
  "processing": {
    "model": "string (model identifier used)",
    "processed_at": "ISO 8601 timestamp",
    "prompt_version": "string (for tracking prompt iterations)"
  }
}
```

### Markdown template (generated from schema)

```markdown
# {title}

## Source
- **URL:** {source.url}
- **Type:** {source.type}
- **Captured:** {source.captured_at}
- **Domain:** {source.domain}

## Summary
{summary}

## Key points
- {key_points[0]}
- {key_points[1]}
- ...

## Tags
- **Topics:** {tags.topics joined}
- **Domain:** {tags.domain}
- **Format:** {tags.format}
- **Priority:** {tags.priority}

## Entities
- **{entities[0].name}** ({entities[0].type}): {entities[0].relevance}
- ...

## Why this matters
{why_it_matters}

## Follow-up
{follow_up}

---
*Processed by {processing.model} on {processing.processed_at} | Prompt v{processing.prompt_version}*
*Extraction confidence: {confidence.extraction_quality}*
{confidence.notes}
```

---

## 5. Architecture overview

### Tech stack

| Layer | Technology | Rationale |
|---|---|---|
| Mobile framework | React Native (Expo) | Cross-platform, Windows dev → iOS deploy via EAS Build, mature ecosystem |
| Language | TypeScript | Type safety, better tooling, Expo default |
| Local database | SQLite (expo-sqlite) | Metadata index, search, fast queries |
| File storage | expo-file-system | Markdown files stored on-device |
| LLM (dev) | Ollama on local network | Free, local, iterable |
| LLM (prod) | Abstracted — user API key or managed proxy | Swappable without app changes |
| Content extraction | Server-side or on-device HTTP + parsing | See content type matrix |

### Data flow

```
[User input] → [Capture layer] → [Extraction pipeline] → [LLM service] → [Markdown generator] → [Storage layer]
                                                                                                         ↓
                                                                                                  [SQLite index]
                                                                                                         ↓
                                                                                                  [UI: Library / Card / Search]
```

### Storage design

- **Markdown files:** One `.md` file per knowledge object, stored in app documents directory. Filename: `{id}.md`.
- **SQLite database:** Index of all knowledge objects with searchable fields (title, tags, source URL, captured_at, processed_at, content type). Used for fast queries, search, and filtering. The database is derived from the markdown files — if the database is lost, it can be rebuilt by re-parsing the markdown.
- **Raw content cache:** Optional. Store extracted text for reprocessing if the prompt or model changes. Stored as `{id}.raw.txt`.

### LLM abstraction

```typescript
interface LLMService {
  process(content: ExtractedContent): Promise<KnowledgeObject>;
  healthCheck(): Promise<boolean>;
}

// Implementations:
// - OllamaService (dev: HTTP to local Ollama)
// - AnthropicService (production: Claude API)
// - OpenAIService (production: GPT API)
// - GenericOpenAIService (any OpenAI-compatible endpoint)
```

The active service is determined by app configuration. The rest of the app never knows or cares which LLM is being used.

---

## 6. Success metrics (MVP)

| Metric | Target | How measured |
|---|---|---|
| Capture to processed | < 30 seconds for a standard article URL | Timer in processing pipeline |
| LLM output quality | > 80% of knowledge objects require no manual correction | Manual review of first 50 objects |
| Extraction success rate | > 90% of non-paywalled URLs produce usable content | Error tracking in extraction pipeline |
| Daily active captures | User captures 3+ items/day in first week | Local analytics |
| Search relevance | User finds target item in top 3 results | Manual testing |

---

## 7. Risks and mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Content extraction fails on many sites | Core pipeline broken | Medium | Fallback to meta description + title; flag low-confidence extractions |
| LLM hallucinate tags or summaries | Trust erosion | Medium | Confidence scoring; raw content preview for verification; prompt iteration |
| Ollama too slow for good dev experience | Slow iteration | Low | Use a smaller model (e.g., llama3.2:3b) for dev; cloud API for prompt testing |
| iOS share extension harder than expected | Key UX feature delayed | Medium | MVP works without it; manual paste is the fallback |
| Markdown template too rigid for varied content | Poor output quality | Medium | Adaptive sections based on content type; iterate template early |
| SQLite + file storage sync issues | Data loss or inconsistency | Low | SQLite is the index, markdown is the source of truth; rebuild index from files |

---

## 8. Phased roadmap

### MVP (current scope)
Manual capture (URL + text), LLM processing, markdown generation, card-based library, search, tag filtering, processing queue.

### v1.0
iOS share extension, duplicate detection, improved extraction reliability, onboarding flow.

### v1.1
PDF ingestion, image/OCR ingestion, Obsidian export, browser extension, custom templates, freeform note editing on cards.

### v2.0
Knowledge map visualisation, cloud sync (optional), web companion app, user accounts, collaborative features.

---

## 9. Open questions

1. **Content types for MVP:** Currently scoped to URLs and pasted text. Should PDFs be in MVP if they are a primary use case for the builder?
2. **LLM model for production:** Which provider/model is the default recommendation for users who don't bring their own API key?
3. **Monetisation:** Free with BYO API key? Freemium with managed LLM credits? Subscription? Deferred but worth noting.
4. **Offline behaviour:** What happens if the LLM endpoint is unreachable? Queue and retry? Or require connectivity?
5. **Tag taxonomy:** Should there be a fixed tag vocabulary, a fully open one, or a hybrid (LLM suggests, user can add)?
