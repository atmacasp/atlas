# ADR 0001: Modular, local-first architecture

- **Status:** Accepted as the target architecture; migration is incremental.
- **Date:** 2026-10-25

## Context

Atlas is an Expo / React Native application whose Markdown notes are stored locally. The current UI contains presentation, note persistence, Markdown preprocessing, indexing, and navigation logic in a large `App.tsx`. Continuing to add features there would make changes harder to isolate and test.

## Decision

Adopt a **modular monolith**, organized by feature and with explicit boundaries:

- **Presentation:** screens and reusable UI components. No direct filesystem access.
- **Application:** use cases that coordinate domain rules and repositories.
- **Domain:** framework-independent note models, metadata extraction, and domain event types.
- **Infrastructure:** local Markdown-file repository and other platform adapters.
- **Shared core:** small, typed utilities such as the in-process event bus.

Markdown files remain the source of truth. Search indexes, backlinks, tag indexes, and graph data are derived data and must be rebuildable from notes.

Use direct function calls for request/response work (for example, opening a note or saving a note). Publish domain events after successful persistence when multiple independent features need to react (for example, `note.created`, `note.updated`, and `note.deleted`).

Do **not** introduce event sourcing, a global event bus for UI state, a service locator, or a dependency-injection framework at this stage.

## Dependency rules

1. Presentation may depend on application interfaces/hooks and domain types.
2. Application may depend on domain types and repository interfaces.
3. Infrastructure implements repository interfaces; domain code must not import Expo or React Native.
4. Features must not import another feature's private implementation. Shared contracts belong in stable public modules.
5. Event subscribers must be fast and side-effect-aware. Derived indexes can be rebuilt from Markdown files after launch.
6. Persist a note successfully before publishing its corresponding event. A failed write must not emit a success event.
7. Keep the migration incremental: preserve existing behavior and move one responsibility at a time.

## Initial module layout

```text
src/
  core/
    events/
      EventBus.ts
  features/
    notes/
      domain/
        Note.ts
        noteEvents.ts
      application/
        NoteRepository.ts
        NoteService.ts        # introduced when persistence is extracted
      infrastructure/
        MarkdownNoteRepository.ts
      presentation/
        MarkdownEditor.tsx
        MarkdownToolbar.tsx
        MarkdownPreview.tsx
    markdown/
      atlasMarkdown.ts
    search/
    tags/
    graph/
```

## Consequences

- Boundaries can be unit-tested without mounting the whole app.
- Storage can be replaced or supplemented later without leaking filesystem APIs into UI code.
- The app gains a typed event seam for derived features without requiring every operation to become asynchronous/event-driven.
- The current `App.tsx` remains in place during the first migration steps; no wholesale rewrite is required.
