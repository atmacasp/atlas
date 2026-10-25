import fs from "node:fs";

const path = "App.tsx";
const source = fs.readFileSync(path, "utf8");
let next = source;

function replaceOnce(label, from, to) {
  const first = next.indexOf(from);
  if (first < 0) throw new Error(`Migration target not found: ${label}`);
  if (next.indexOf(from, first + from.length) >= 0) {
    throw new Error(`Migration target is ambiguous (appears more than once): ${label}`);
  }
  next = next.slice(0, first) + to + next.slice(first + from.length);
}

// Replace imports independently so local atlasMarkdown changes are preserved.
replaceOnce(
  "filesystem import",
  'import * as FileSystem from "expo-file-system/legacy";',
  'import { EventBus } from "./src/core/events/EventBus";\nimport { NoteService } from "./src/features/notes/application/NoteService";\nimport { MarkdownNoteRepository, VAULT_DIR } from "./src/features/notes/infrastructure/MarkdownNoteRepository";\nimport type { Note } from "./src/features/notes/domain/Note";\nimport type { NoteEventMap } from "./src/features/notes/domain/noteEvents";'
);
replaceOnce("seed notes import", 'import { SEED_NOTES, SeedNote } from "./src/seedNotes";', "");
replaceOnce(
  "local Note type",
  'type Note = { id: string; title: string; file: string; content: string; links: string[]; tags: string[] };',
  ""
);

// Remove persistence helpers without touching Markdown-related helpers.
replaceOnce(
  "vault directory constant",
  'const VAULT_DIR = `${FileSystem.documentDirectory}knowledge-vault/`;',
  ""
);
const slugifyPattern = /function slugify\(value: string\) \{[\s\S]*?\n\}/g;
const slugifyMatches = [...next.matchAll(slugifyPattern)];
if (slugifyMatches.length !== 1) {
  throw new Error(`Migration target not found or ambiguous: slugify helper (matches: ${slugifyMatches.length})`);
}
next = next.replace(slugifyPattern, "");

// The existing atlasMarkdown refactor may already have removed WIKI_RE.
// Restore it only if the remaining linkify helper still needs it.
if (next.includes("content.replace(WIKI_RE") && !next.includes("const WIKI_RE =")) {
  replaceOnce(
    "insert wiki regex",
    'type Tab = "home" | "wiki" | "search" | "graph" | "edit" | "tags" | "settings" | "profile";',
    'type Tab = "home" | "wiki" | "search" | "graph" | "edit" | "tags" | "settings" | "profile";\nconst WIKI_RE = /\\[\\[([^\\]]+)\\]\\]/g;'
  );
}
replaceOnce(
  "note service composition",
  'type Tab = "home" | "wiki" | "search" | "graph" | "edit" | "tags" | "settings" | "profile";',
  'type Tab = "home" | "wiki" | "search" | "graph" | "edit" | "tags" | "settings" | "profile";\nconst noteService = new NoteService(new MarkdownNoteRepository(), new EventBus<NoteEventMap>());'
);

const helperStart = 'function parseNote(id: string, file: string, content: string): Note {';
const helperEnd = '\n\nexport default function App() {';
const start = next.indexOf(helperStart);
const end = next.indexOf(helperEnd, start);
if (start < 0 || end < 0 || next.indexOf(helperStart, start + helperStart.length) >= 0) {
  throw new Error("Migration target not found or ambiguous: note parsing and vault helpers");
}
next = next.slice(0, start) + next.slice(end + 2);

replaceOnce(
  "refresh persistence",
  'const next = await loadVault();',
  'const next = await noteService.getAll();'
);

const createUpdateStart = next.indexOf("    const id = editingId");
const createUpdateEndMarker = '      await refresh(id); setTab("wiki");';
const createUpdateEnd = next.indexOf(createUpdateEndMarker, createUpdateStart);
if (
  createUpdateStart < 0 ||
  createUpdateEnd < 0 ||
  next.indexOf("    const id = editingId", createUpdateStart + 1) >= 0
) {
  throw new Error("Migration target not found or ambiguous: create/update persistence");
}
const createUpdateReplacement = [
  '    const tags = [...new Set(draftTags.split(",").map(tag => tag.trim().toLocaleLowerCase("tr-TR")).filter(Boolean))];',
  '    const input = { title, content: stripFrontmatter(draftContent), tags };',
  '    try {',
  '      const saved = editingId',
  '        ? await noteService.update(editingId, input)',
  '        : await noteService.create(input);',
  '      await refresh(saved.id); setTab("wiki");',
].join("\n");
next =
  next.slice(0, createUpdateStart) +
  createUpdateReplacement +
  next.slice(createUpdateEnd + createUpdateEndMarker.length);

replaceOnce(
  "delete persistence",
  '        try { await FileSystem.deleteAsync(VAULT_DIR + active.file, { idempotent: true }); await refresh("index"); setTab("home"); }',
  '        try { await noteService.delete(active.id); await refresh("index"); setTab("home"); }'
);

if (next === source) throw new Error("Migration made no changes");
fs.writeFileSync(path, next);
console.log("Atlas note persistence migration applied.");
