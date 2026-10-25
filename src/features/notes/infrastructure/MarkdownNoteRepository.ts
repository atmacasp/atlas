import * as FileSystem from "expo-file-system/legacy";
import { SEED_NOTES } from "../../../seedNotes";
import { extractAtlasWikiLinks } from "../../../atlasMarkdown";
import type { Note, NoteInput } from "../domain/Note";
import type { NoteRepository } from "../application/NoteRepository";

export const VAULT_DIR = `${FileSystem.documentDirectory}knowledge-vault/`;

const WIKI_RE = /\[\[([^\]]+)\]\]/g;

function titleFromMarkdown(content: string, fallback: string) {
  const fm = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  if (fm) return fm[1].replace(/["']$/, "");
  const heading = content.match(/^#\s+(.+)$/m);
  return heading?.[1]?.trim() || fallback;
}

function extractLinks(content: string) {
  const atlasLinks = extractAtlasWikiLinks(content);
  if (atlasLinks.length) return atlasLinks;
  return [...content.matchAll(WIKI_RE)].map(match => match[1].trim()).filter(Boolean);
}

function extractTags(content: string): string[] {
  const match = content.match(/^tags:\s*\[(.*?)\]\s*$/m);
  if (!match) return [];
  return [...match[1].matchAll(/"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|([^,]+)/g)]
    .map(match => (match[1] ?? match[2] ?? match[3] ?? "").trim().replace(/\\(["'])/g, "$1"))
    .filter(Boolean)
    .map(tag => tag.toLocaleLowerCase("tr-TR"));
}

function parseNote(id: string, file: string, content: string): Note {
  return {
    id,
    file,
    content,
    title: titleFromMarkdown(content, file.replace(/\.md$/, "")),
    links: extractLinks(content),
    tags: extractTags(content),
  };
}

function stripFrontmatter(content: string) {
  return content.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "");
}

function slugify(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `note-${Date.now()}`;
}

function buildMarkdown(input: NoteInput) {
  const tags = [...new Set(input.tags.map(tag => tag.trim().toLocaleLowerCase("tr-TR")).filter(Boolean))];
  const tagLine = "tags: [" + tags.map(tag => JSON.stringify(tag)).join(", ") + "]";
  return "---\n"
    + "title: \"" + input.title.replace(/"/g, "'") + "\"\n"
    + "type: concept\n"
    + tagLine + "\n"
    + "updated: " + new Date().toISOString().slice(0, 10) + "\n"
    + "---\n\n"
    + stripFrontmatter(input.content).trim() + "\n";
}

export class MarkdownNoteRepository implements NoteRepository {
  async ensureVault(): Promise<void> {
    const info = await FileSystem.getInfoAsync(VAULT_DIR);
    if (!info.exists) await FileSystem.makeDirectoryAsync(VAULT_DIR, { intermediates: true });

    const files = await FileSystem.readDirectoryAsync(VAULT_DIR);
    if (files.some(file => file.endsWith(".md"))) return;

    for (const note of SEED_NOTES) {
      await FileSystem.writeAsStringAsync(`${VAULT_DIR}${note.file}`, note.content, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    }
  }

  async getAll(): Promise<readonly Note[]> {
    await this.ensureVault();
    const files = (await FileSystem.readDirectoryAsync(VAULT_DIR))
      .filter(file => file.endsWith(".md"))
      .sort();

    const notes: Note[] = [];
    for (const file of files) {
      const content = await FileSystem.readAsStringAsync(`${VAULT_DIR}${file}`, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      notes.push(parseNote(file.replace(/\.md$/, ""), file, content));
    }
    return notes;
  }

  async getById(id: string): Promise<Note | null> {
    await this.ensureVault();
    const file = `${id}.md`;
    const info = await FileSystem.getInfoAsync(`${VAULT_DIR}${file}`);
    if (!info.exists) return null;
    const content = await FileSystem.readAsStringAsync(`${VAULT_DIR}${file}`, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return parseNote(id, file, content);
  }

  async create(input: NoteInput): Promise<Note> {
    await this.ensureVault();
    const id = slugify(input.title);
    const file = `${id}.md`;
    const content = buildMarkdown(input);
    await FileSystem.writeAsStringAsync(`${VAULT_DIR}${file}`, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return parseNote(id, file, content);
  }

  async update(id: string, input: NoteInput): Promise<Note> {
    await this.ensureVault();
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Note not found: ${id}`);
    const content = buildMarkdown(input);
    await FileSystem.writeAsStringAsync(`${VAULT_DIR}${existing.file}`, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return parseNote(id, existing.file, content);
  }

  async delete(id: string): Promise<void> {
    await this.ensureVault();
    const note = await this.getById(id);
    if (!note) return;
    await FileSystem.deleteAsync(`${VAULT_DIR}${note.file}`, { idempotent: true });
  }
}
