# ReadGator

A mobile-first knowledge capture app that turns web links and pasted text into structured, searchable markdown knowledge objects — powered by an LLM.

Share a URL or paste some text. ReadGator fetches the content, sends it to a language model, and produces a clean one-pager: summary, key points, tags, entities, and context. Everything is stored as plain markdown on your device.

---

## What it does

- **Capture** — paste a URL or raw text; the app handles the rest
- **Extract** — fetches and strips web pages to readable content
- **Process** — sends content to a configured LLM; validates and sanitises the response
- **Store** — writes a structured `.md` file per item; indexes metadata in SQLite for fast search
- **Browse** — card-based library feed, full-text search, tag filtering

## What it is not

- Not a read-later queue (it processes content immediately)
- Not a note-taking app (no freeform editing in MVP)
- Not a cloud service (everything stays on your device)

---

## Architecture

```
User input
    │
    ▼
Extraction pipeline          (services/extraction/)
    │  URL → fetch + HTML strip + metadata
    │  Text → normalise + detect embedded URLs
    ▼
LLM service                  (services/llm/)
    │  Abstract LLMService interface
    │  Ollama implementation (dev) — swappable for any provider
    ▼
Markdown generator           (services/markdown/generator.ts)
    │
    ├──▶ .md file            (services/storage/files.ts)   ← source of truth
    └──▶ SQLite index        (services/storage/database.ts) ← derived, rebuildable
```

**Key design principles:**

- The markdown file is the source of truth. The database is a derived index and can be rebuilt from disk at any time.
- All LLM calls go through a `LLMService` interface — the rest of the app never knows which provider is active.
- Prompts live in `prompts/` and are version-tracked. Each knowledge object records which prompt version produced it.
- LLM responses are validated and sanitised before use; the app never trusts raw model output.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React Native · Expo SDK 54 (managed workflow) |
| Language | TypeScript (strict mode) |
| Routing | expo-router v6 (file-based) |
| Database | expo-sqlite v16 |
| File storage | expo-file-system v19 |
| State | React Context + useReducer |
| LLM (dev) | Ollama (local network) |
| LLM (prod) | Abstracted — pluggable |
| Tests | Jest · jest-expo |

---

## Project structure

```
read-gator/
├── app/                        # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx           # Library feed
│   │   ├── search.tsx          # Full-text search
│   │   └── settings.tsx        # LLM configuration
│   ├── capture.tsx             # Add item (modal)
│   └── item/[id].tsx           # Knowledge object detail
├── components/
│   ├── knowledge/              # KnowledgeCard, TagList
│   └── ui/                     # Generic primitives (to grow)
├── hooks/                      # useCapture, useLibrary, useSearch, useSettings
├── providers/                  # LibraryProvider (global state)
├── services/
│   ├── extraction/             # url.ts, text.ts
│   ├── llm/                    # types.ts, ollama.ts, validation.ts
│   ├── markdown/               # generator.ts, parser.ts
│   └── storage/                # database.ts, files.ts, index.ts
├── types/                      # Shared TypeScript interfaces
├── prompts/v1/                 # Versioned LLM prompt templates
├── __tests__/                  # Unit tests mirroring source structure
├── docs/                       # CONTENT_TYPES.md, ARCHITECTURE.md (planned)
├── PRD.md                      # Full product spec and roadmap
└── CLAUDE.md                   # AI assistant instructions
```

---

## Knowledge object schema

Every captured item produces a structured object stored as both markdown and a SQLite index row.

```typescript
interface KnowledgeObject {
  id: string;                      // UUID v4
  title: string;
  source: {
    url: string | null;
    type: 'article' | 'blog' | 'paper' | 'tweet' | 'thread'
        | 'video' | 'podcast' | 'text' | 'other';
    captured_at: string;           // ISO 8601
    domain: string | null;
  };
  summary: string;                 // 2–4 sentences
  key_points: string[];
  tags: {
    topics: string[];
    domain: string;
    format: string;
    priority: 'high' | 'medium' | 'low';
  };
  entities: Array<{
    name: string;
    type: 'person' | 'company' | 'product' | 'concept' | 'place';
    relevance: string;
  }>;
  why_it_matters: string;
  follow_up: string | null;
  confidence: {
    extraction_quality: 'high' | 'medium' | 'low';
    notes: string | null;
  };
  processing: {
    model: string;
    processed_at: string;
    prompt_version: string;
  };
}
```

---

## Getting started

### Prerequisites

- Node.js 20+
- Expo Go on your iOS device (same Wi-Fi network as your dev machine)
- [Ollama](https://ollama.com) running on your local machine with a model pulled:

```bash
ollama pull llama3.2:3b
```

### Install and run

```bash
git clone https://github.com/federicoandreis/read-gator.git
cd read-gator
npm install
npx expo start
```

Scan the QR code with your iPhone camera to open in Expo Go.

### Connect Ollama

By default Ollama only listens on `localhost`. Expose it on your local network:

```bash
# macOS / Linux
OLLAMA_HOST=0.0.0.0 ollama serve

# Windows (PowerShell)
$env:OLLAMA_HOST="0.0.0.0"; ollama serve
```

Allow inbound traffic on port `11434` through your firewall if needed, then in the app's **Settings** tab set the Ollama URL to your machine's local IP:

```
http://192.168.x.x:11434
```

### Commands

```bash
npx expo start          # Start dev server
npm test                # Run tests
npm run test:coverage   # Run tests with coverage report
npm run typecheck       # TypeScript type check
npm run lint            # ESLint
```

---

## Adding an LLM provider

1. Create `services/llm/{provider}.ts`
2. Implement the `LLMService` interface from `services/llm/types.ts`
3. Wire it up in `hooks/useCapture.ts` via settings
4. Add unit tests with mocked HTTP responses

The rest of the app is unaffected — the abstraction handles it.

---

## Roadmap

| Phase | Scope |
|---|---|
| **MVP** *(current)* | Manual URL + text capture, LLM processing, markdown generation, library, search, tag filtering |
| **v1.0** | iOS share extension, duplicate detection, improved extraction reliability, onboarding |
| **v1.1** | PDF ingestion, image/OCR ingestion, Obsidian export, browser extension, custom templates |
| **v2.0** | Knowledge graph visualisation, optional cloud sync, web companion, user accounts |

See [`PRD.md`](PRD.md) for the full product spec, schema, and open questions.

---

## Branching

- `main` — stable, production-ready
- `dev` — integration branch; all feature branches merge here
- `feature/*` — one branch per feature or fix

PRs go `feature/* → dev → main`.

---

## Coding standards

British English throughout. TypeScript strict mode, no `any`. See [`.windsurfrules`](.windsurfrules) and [`CLAUDE.md`](CLAUDE.md) for the full coding conventions used in this project.
