# Content Type Matrix

This document defines how ReadGator handles each input type: what's in scope, how content is extracted, known edge cases, and expected quality.

---

## MVP content types

### 1. Web URL

**Status:** MVP

**Extraction method:**
1. Fetch the URL via HTTP GET with a browser-like User-Agent header.
2. Parse the HTML response.
3. Extract readable content using a library like Mozilla's Readability algorithm (via `@mozilla/readability` or a JS port).
4. Extract metadata: title, description, Open Graph tags, canonical URL, author, publish date.
5. Strip HTML to clean text. Preserve paragraph structure.
6. Send extracted text + metadata to the LLM.

**Expected quality:** High for standard articles, blog posts, and documentation. Medium for pages heavy on JavaScript rendering. Low for paywalled or login-required content.

**Edge cases and mitigations:**

| Edge case | Detection | Mitigation |
|---|---|---|
| Paywalled content | Very short extracted text (< 100 chars) relative to expected article length; or known paywall domains | Use available metadata (title, description, OG tags) as input. Flag as low-confidence extraction. |
| JS-rendered pages (SPAs) | Extraction returns empty or boilerplate-only content | Fall back to meta description + title. Flag as low-confidence. Consider server-side rendering service in v1.1. |
| Non-article pages (e.g., homepages, dashboards, app UIs) | Readability algorithm fails or returns low-quality output | Use meta description and title. LLM classifies as "other" content type. |
| URL returns non-HTML (PDF, image, redirect chain) | Content-Type header check | If PDF: queue for PDF pipeline (v1.1). If image: queue for image pipeline (v1.1). If redirect: follow up to 5 hops. |
| URL is dead or returns error | HTTP status code ≥ 400 or timeout | Store the URL with an error state. Allow manual retry. |
| Very long articles (> 10,000 words) | Character count after extraction | Truncate to a configurable limit (default: 8,000 words) before sending to LLM. Note truncation in confidence metadata. |
| Non-English content | Language detection on extracted text | Process as-is — the LLM should handle major languages. Note detected language in metadata. Quality may vary for less common languages. |
| Duplicate URL | URL already exists in library | Prompt user: "You've already captured this. View existing or re-process?" |

**Test fixtures needed:**
- Standard article HTML (e.g., a blog post with paragraphs, headings, images)
- Paywalled article HTML (minimal content, paywall modal)
- JS-heavy page HTML (minimal server-rendered content)
- Non-article page HTML (homepage with navigation, multiple sections)
- Very long article HTML (> 10,000 words)
- HTML with non-English content

### 2. Pasted text

**Status:** MVP

**Extraction method:**
1. Accept raw text input from the user (typed or pasted).
2. Normalise whitespace (collapse multiple newlines, trim).
3. Attempt to detect if the text contains a URL (regex check). If so, offer to process as a URL instead.
4. Send normalised text directly to the LLM.

**Expected quality:** Depends entirely on the input quality. The LLM works with whatever the user provides.

**Edge cases and mitigations:**

| Edge case | Detection | Mitigation |
|---|---|---|
| Very short text (< 50 chars) | Character count | Process anyway, but the knowledge object may be sparse. LLM should still produce something useful. |
| Very long text (> 10,000 words) | Character count | Truncate to configurable limit before LLM processing. Note truncation. |
| Text is actually a URL | Regex match for URL pattern | Prompt user: "This looks like a URL. Shall I fetch and process the page?" |
| Text is code or structured data | Heuristic detection (e.g., lots of braces, indentation patterns) | LLM should classify as "code" or "data" content type. May need a different template section layout in future. |
| Text is in a non-Latin script | Character detection | Process as-is. Note language. |
| Empty or whitespace-only input | Trim and check length | Reject with user-friendly message. |

**Test fixtures needed:**
- Standard paragraph text (2-3 paragraphs)
- Single sentence
- Very long text blob
- Text containing URLs
- Code snippet
- Non-English text

---

## v1.1 content types

### 3. PDF document

**Status:** v1.1

**Extraction method (planned):**
1. User shares or uploads a PDF.
2. Extract text using a PDF parsing library (e.g., `pdf-parse` or `pdf.js`).
3. If text extraction yields little content (scanned PDF), run OCR.
4. Send extracted text to LLM.

**Known challenges:**
- PDF text extraction quality varies enormously. Academic papers with two-column layouts are particularly tricky.
- Scanned PDFs require OCR, which is slow and less accurate.
- PDFs can be very large. Need a file size limit and/or page limit.
- On-device PDF processing on mobile is resource-constrained.

**Recommendation:** For MVP, if a URL points to a PDF, detect it via Content-Type header and show a "PDF support coming soon" message rather than failing silently.

### 4. Image (screenshot, photo of text)

**Status:** v1.1

**Extraction method (planned):**
1. User shares or uploads an image.
2. Run OCR to extract text (Apple's Vision framework on iOS, or a cloud OCR service).
3. If the image contains no text (e.g., a photo, diagram), describe it using a multimodal LLM.
4. Send extracted text or description to LLM.

**Known challenges:**
- OCR accuracy depends heavily on image quality, lighting, and font.
- Multimodal LLM calls are more expensive than text-only.
- Images can be very large. Need compression and size limits.

**Recommendation:** Defer entirely to v1.1. The extraction pipeline is fundamentally different from text/URL and would delay the MVP.

### 5. Browser extension capture

**Status:** v1.1

**Extraction method (planned):**
1. Browser extension captures the current page's URL, title, selected text (if any), and full page HTML.
2. Sends to ReadGator backend or local app via deep link / API.
3. Processing follows the URL pipeline, but with the advantage of having the full rendered HTML rather than a server-side fetch.

**Advantage:** Solves the JS-rendering problem because the extension captures the page as the browser has rendered it.

---

## Content type detection logic

When the user provides input, the app should determine the content type before routing to the correct extraction pipeline:

```
Input → Is it a URL?
         ├─ Yes → Fetch URL
         │        ├─ Content-Type: text/html → URL extraction pipeline
         │        ├─ Content-Type: application/pdf → PDF pipeline (v1.1, or show message)
         │        ├─ Content-Type: image/* → Image pipeline (v1.1, or show message)
         │        └─ Other → Store URL + metadata only, flag as unsupported type
         └─ No  → Is it text?
                   ├─ Contains a URL? → Ask user: "Process as URL or as text?"
                   └─ Plain text → Text extraction pipeline
```

---

## LLM input format

Regardless of the content type, the extraction pipeline should produce a standardised input for the LLM:

```typescript
interface ExtractedContent {
  /** The main text content to analyse */
  text: string;
  /** Where this content came from */
  source: {
    type: 'url' | 'text' | 'pdf' | 'image';
    url?: string;
    title?: string;
    author?: string;
    publishDate?: string;
    domain?: string;
    description?: string;
  };
  /** How reliable the extraction was */
  extractionQuality: 'high' | 'medium' | 'low';
  /** Any notes about extraction issues */
  extractionNotes?: string;
  /** Was the content truncated? */
  truncated: boolean;
  /** Original content length in characters */
  originalLength: number;
}
```

This interface is the contract between extraction and LLM processing. Every new content type just needs to produce an `ExtractedContent` object.
