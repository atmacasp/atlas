import fs from "node:fs";

const path = "App.tsx";
const source = fs.readFileSync(path, "utf8");
let next = source;

function replaceOnce(label, from, to) {
  if (!next.includes(from)) throw new Error(`Migration target not found: ${label}`);
  next = next.replace(from, to);
}

replaceOnce(
  "imports",
  'import * as FileSystem from "expo-file-system/legacy";\nimport { SEED_NOTES, SeedNote } from "./src/seedNotes";\n\ntype Note = { id: string; title: string; file: string; content: string; links: string[]; tags: string[] };',
  'import * as FileSystem from "expo-file-system/legacy";\nimport { EventBus } from "./src/core/events/EventBus";\nimport { NoteService } from "./src/features/notes/application/NoteService";\nimport { MarkdownNoteRepository, VAULT_DIR } from "./src/features/notes/infrastructure/MarkdownNoteRepository";\nimport type { Note } from "./src/features/notes/domain/Note";\nimport type { NoteEventMap } from "./src/features/notes/domain/noteEvents";'
);

replaceOnce(
  "vault helpers",
  'const VAULT_DIR = `${FileSystem.documentDirectory}knowledge-vault/`;\nconst WIKI_RE = /\\[\\[([^\\]]+)\\]\\]/g;\n\nfunction slugify(value: string) {\n  return value.normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "")\n    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `note-${Date.now()}`;\n}',
  'const WIKI_RE = /\\[\\[([^\\]]+)\\]\\]/g;\nconst noteService = new NoteService(new MarkdownNoteRepository(), new EventBus<NoteEventMap>());'
);

const helperStart = 'function parseNote(id: string, file: string, content: string): Note {';
const helperEnd = '\n\nexport default function App() {';
const start = next.indexOf(helperStart);
const end = next.indexOf(helperEnd, start);
if (start < 0 || end < 0) throw new Error("Migration target not found: note parsing helpers");
next = next.slice(0, start) + next.slice(end + 2);

replaceOnce(
  "refresh persistence",
  'const next = await loadVault();',
  'const next = await noteService.getAll();'
);

replaceOnce(
  "create/update persistence",
  '    const id = editingId || slugify(title);\n    const file = id + ".md";\n    const tags = [...new Set(draftTags.split(",").map(tag => tag.trim().toLocaleLowerCase("tr-TR")).filter(Boolean))];\n    const tagLine = "tags: [" + tags.map(tag => JSON.stringify(tag)).join(", ") + "]";\n    const content = "---\\ntitle: \\"" + title.replace(/"/g, "'") + "\\"\\ntype: concept\\n" + tagLine + "\\nupdated: " + new Date().toISOString().slice(0, 10) + "\\n---\\n\\n" + stripFrontmatter(draftContent).trim() + "\\n";\n    try {\n      await FileSystem.writeAsStringAsync(VAULT_DIR + file, content, { encoding: FileSystem.EncodingType.UTF8 });\n      await refresh(id); setTab("wiki");',
  '    const tags = [...new Set(draftTags.split(",").map(tag => tag.trim().toLocaleLowerCase("tr-TR")).filter(Boolean))];\n    const input = { title, content: stripFrontmatter(draftContent), tags };\n    try {\n      const saved = editingId\n        ? await noteService.update(editingId, input)\n        : await noteService.create(input);\n      await refresh(saved.id); setTab("wiki");'
);

replaceOnce(
  "delete persistence",
  '        try { await FileSystem.deleteAsync(VAULT_DIR + active.file, { idempotent: true }); await refresh("index"); setTab("home"); }',
  '        try { await noteService.delete(active.id); await refresh("index"); setTab("home"); }'
);

if (next === source) throw new Error("Migration made no changes");
fs.writeFileSync(path, next);
console.log("Atlas note persistence migration applied.");
