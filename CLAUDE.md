# CLAUDE.md — ReadGator

## What is this project?

ReadGator is a mobile-first knowledge capture app (React Native / Expo / TypeScript) that turns web links and text into structured markdown knowledge objects via LLM processing. iOS is the primary platform. Development happens on Windows.

## Key files to read first

- `PRD.md` — Full product spec, schema, architecture, and roadmap
- `.windsurfrules` — Coding standards, repo structure, branching rules (applies to all AI assistants, not just Windsurf)
- `docs/CONTENT_TYPES.md` — What input types the app handles and how

## Architecture in brief

```
User input → Content extraction → LLM processing → Markdown generation → SQLite index + .md file → UI
```

- **LLM calls** go through an abstract `LLMService` interface (see `services/llm/types.ts`). Dev uses Ollama; production uses a cloud API.
- **Storage** is dual: markdown files are the source of truth, SQLite is a derived search index.
- **Prompts** live in `prompts/` and are version-tracked. Never hardcode them.

## Commands

```bash
# Start dev server
npx expo start

# Run tests
npx jest

# Run tests with coverage
npx jest --coverage

# Type check
npx tsc --noEmit

# Lint
npx eslint . --ext .ts,.tsx
```

## Rules

- TypeScript strict mode. No `any`.
- British English everywhere (comments, docs, UI strings).
- Every async function must handle errors explicitly.
- LLM responses must be validated before use — never trust raw output.
- Markdown files are the source of truth, not the database.
- Write tests alongside implementation. Target >80% coverage on services/.
- Conventional commits: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`.
- Feature branches only. Never commit directly to main or dev.
- No packages that break Expo managed workflow without explicit justification.
- Keep files under 200 lines where practical.

## Common tasks

### Adding a new LLM provider
1. Create `services/llm/{provider}.ts`
2. Implement the `LLMService` interface from `services/llm/types.ts`
3. Add configuration option in settings
4. Add unit tests with mocked HTTP responses
5. Do not change any other service — the abstraction should handle it

### Adding a new content type
1. Read `docs/CONTENT_TYPES.md` for the extraction strategy
2. Create extractor in `services/extraction/{type}.ts`
3. Register it in the extraction pipeline
4. Add fixture files in `__tests__/fixtures/`
5. Add integration test: raw input → extracted content → LLM → knowledge object

### Modifying the knowledge object schema
1. Update the interface in `types/`
2. Update the markdown generator in `services/markdown/generator.ts`
3. Update the markdown parser in `services/markdown/parser.ts`
4. Update the SQLite schema (add a migration)
5. Update the LLM prompt in `prompts/`
6. Update tests
7. Update PRD.md

## Do not

- Do not add features outside MVP scope without checking PRD.md
- Do not call LLM APIs directly from components — use the service layer
- Do not store secrets in code
- Do not skip error handling on async operations
- Do not write inline styles — use StyleSheet.create()
- Do not add native modules unless absolutely necessary
