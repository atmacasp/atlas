const WIKI_ALIAS_RE = /\[\[([^\]|]+)\|([^\]]+)\]\]/g;
const WIKI_RE = /\[\[([^\]]+)\]\]/g;

/**
 * Atlas-specific Markdown extensions that stay readable as plain Markdown.
 * The stored source remains standard Markdown; this layer only improves the
 * native reader presentation for task lists and GitHub-style callouts.
 */
export function preprocessAtlasMarkdown(content: string): string {
  const lines = content.split("\n");
  let inFence = false;
  const output: string[] = [];

  for (const line of lines) {
    const fence = /^\s*(```|~~~)/.test(line);
    if (fence) {
      inFence = !inFence;
      output.push(line);
      continue;
    }

    if (inFence) {
      output.push(line);
      continue;
    }

    const callout = line.match(/^\s*>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$/i);
    if (callout) {
      const label = callout[1].toLocaleUpperCase("tr-TR");
      const icon: Record<string, string> = {
        NOTE: "ℹ️",
        TIP: "💡",
        IMPORTANT: "❗",
        WARNING: "⚠️",
        CAUTION: "🛑",
      };
      output.push(`> ${icon[label] || "ℹ️"} **${label}**`);
      continue;
    }

    const task = line.match(/^(\s*)([-*+]\s+)\[([ xX])\]\s+(.*)$/);
    if (task) {
      const checked = task[3].toLocaleLowerCase("tr-TR") === "x";
      output.push(`${task[1]}${task[2]}${checked ? "☑" : "☐"} ${task[4]}`);
      continue;
    }

    output.push(line);
  }

  return output.join("\n");
}

export function canonicalWikiTarget(raw: string): string {
  const alias = raw.match(/^([^|]+)\|(.+)$/);
  return (alias ? alias[1] : raw).trim();
}

export function wikiDisplayText(raw: string): string {
  const alias = raw.match(/^([^|]+)\|(.+)$/);
  return (alias ? alias[2] : raw).trim();
}

export function extractAtlasWikiLinks(content: string): string[] {
  const result: string[] = [];
  for (const match of content.matchAll(WIKI_ALIAS_RE)) result.push(canonicalWikiTarget(match[1]));
  for (const match of content.matchAll(WIKI_RE)) {
    const raw = match[1].trim();
    if (!raw.includes("|")) result.push(canonicalWikiTarget(raw));
  }
  return result.filter(Boolean);
}

export function linkifyWikiSyntax(content: string): string {
  return content
    .replace(WIKI_ALIAS_RE, (_match, rawTarget: string, rawDisplay: string) => {
      const target = canonicalWikiTarget(rawTarget);
      const display = rawDisplay.trim();
      return `[${display}](wiki:${encodeURIComponent(target)})`;
    })
    .replace(WIKI_RE, (_match, raw: string) => {
      const target = canonicalWikiTarget(raw);
      return `[${target}](wiki:${encodeURIComponent(target)})`;
    });
}
