import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('assets/vault');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
const notes = files.map((file) => {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const title = content.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1]?.replace(/["']$/, '')
    || content.match(/^#\s+(.+)$/m)?.[1] || file.replace(/\.md$/, '');
  return { id: file.replace(/\.md$/, ''), title, file, content };
});
fs.writeFileSync('src/seedNotes.ts',
  'export type SeedNote = { id: string; title: string; file: string; content: string };\n' +
  'export const SEED_NOTES: SeedNote[] = ' + JSON.stringify(notes, null, 2) + ';\n');
console.log(`Generated seedNotes.ts from ${notes.length} Markdown files.`);
