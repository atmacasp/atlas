import fs from "node:fs";

const path = new URL("../App.tsx", import.meta.url);
let source = fs.readFileSync(path, "utf8");

function replaceOnce(from, to, label) {
  const count = source.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected 1 match, found ${count}`);
  source = source.replace(from, to);
}

replaceOnce(
  'import { SEED_NOTES, SeedNote } from "./src/seedNotes";',
  'import { SEED_NOTES, SeedNote } from "./src/seedNotes";\nimport { canonicalWikiTarget, extractAtlasWikiLinks, linkifyWikiSyntax, preprocessAtlasMarkdown, wikiDisplayText } from "./src/atlasMarkdown";',
  "Atlas Markdown import"
);

replaceOnce(
  'function extractLinks(content: string) {\n  return [...content.matchAll(WIKI_RE)].map(m => m[1].trim()).filter(Boolean);\n}',
  'function extractLinks(content: string) {\n  return extractAtlasWikiLinks(content);\n}',
  "wiki link extraction"
);

replaceOnce(
  '  const explicit = content.replace(WIKI_RE, (_match, raw: string) => {\n    const title = raw.trim();\n    return "[" + title + "](wiki:" + encodeURIComponent(title) + ")";\n  });',
  '  const explicit = linkifyWikiSyntax(content);',
  "wiki link rendering"
);

replaceOnce(
  '    if (/^\\[[^\\]]*\\]\\([^)]*\\)$/.test(chunk)) return chunk;',
  '    if (/^\\[[^\\]]*\\]\\([^)]*\\)$/.test(chunk)) return chunk;',
  "protected markdown links"
);

replaceOnce(
  '  const renderedMarkdown = useMemo(() => active ? linkifyKnownTitles(stripFrontmatter(active.content), notes, active.title) : "", [active, notes]);',
  '  const renderedMarkdown = useMemo(() => {\n    if (!active) return "";\n    const prepared = preprocessAtlasMarkdown(stripFrontmatter(active.content));\n    return linkifyKnownTitles(prepared, notes, active.title);\n  }, [active, notes]);',
  "markdown preprocessing"
);

replaceOnce(
  '  const handleMarkdownLink = useCallback((url: string) => {\n    const title = decodeURIComponent(url.replace(/^wiki:/, ""));',
  '  const handleMarkdownLink = useCallback((url: string) => {\n    const title = canonicalWikiTarget(decodeURIComponent(url.replace(/^wiki:/, "")));',
  "wiki link handler"
);

replaceOnce(
  'function cleanMarkdown(content: string) {\n  return stripFrontmatter(content).replace(/[#>*`\\-\\[\\]!]/g, " ").replace(/\\s+/g, " ").trim();\n}',
  'function cleanMarkdown(content: string) {\n  return preprocessAtlasMarkdown(stripFrontmatter(content)).replace(/[#>*`\\-\\[\\]!]/g, " ").replace(/\\s+/g, " ").trim();\n}',
  "markdown snippets"
);

replaceOnce(
  '  const titles = notes\n    .filter(note => note.title.toLocaleLowerCase("tr-TR") !== sourceTitle.toLocaleLowerCase("tr-TR"))',
  '  const titles = notes\n    .filter(note => note.title.toLocaleLowerCase("tr-TR") !== sourceTitle.toLocaleLowerCase("tr-TR"))',
  "known title filter"
);

fs.writeFileSync(path, source);
console.log("Atlas Markdown reader upgrade applied to App.tsx");
console.log("Added: wiki aliases [[Target|display]], task lists, and callout preprocessing.");
