import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform,
  Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text,
  TextInput, View, useWindowDimensions
} from "react-native";
import Markdown from "react-native-markdown-display";
import Svg, { Line } from "react-native-svg";
import * as FileSystem from "expo-file-system/legacy";
import { SEED_NOTES, SeedNote } from "./src/seedNotes";

type Note = { id: string; title: string; file: string; content: string; links: string[]; tags: string[] };
type Tab = "wiki" | "search" | "graph" | "edit";
const VAULT_DIR = `${FileSystem.documentDirectory}knowledge-vault/`;
const WIKI_RE = /\[\[([^\]]+)\]\]/g;

function slugify(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `note-${Date.now()}`;
}
function titleFromMarkdown(content: string, fallback: string) {
  const fm = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  if (fm) return fm[1].replace(/["']$/, "");
  const heading = content.match(/^#\s+(.+)$/m);
  return heading?.[1]?.trim() || fallback;
}
function extractLinks(content: string) {
  return [...content.matchAll(WIKI_RE)].map(m => m[1].trim()).filter(Boolean);
}
function extractTags(content: string): string[] {
  const match = content.match(/^tags:\s*\[(.*?)\]\s*$/m);
  if (!match) return [];
  return [...match[1].matchAll(/"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|([^,]+)/g)]
    .map(m => (m[1] ?? m[2] ?? m[3] ?? "").trim().replace(/\\(["'])/g, "$1"))
    .filter(Boolean)
    .map(tag => tag.toLocaleLowerCase("tr-TR"));
}
function stripFrontmatter(content: string) {
  return content.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "");
}
function cleanMarkdown(content: string) {
  return stripFrontmatter(content).replace(/[#>*`\-\[\]!]/g, " ").replace(/\s+/g, " ").trim();
}
function escapeRegExp(value: string) {
  return value.replace(/[.*+?^$\\{}()|[\]\\]/g, "\\$&");
}
function linkedTitles(content: string, notes: Note[], sourceTitle: string): string[] {
  const found = new Set(extractLinks(content).map(title => title.toLocaleLowerCase("tr-TR")));
  const body = stripFrontmatter(content);
  for (const note of notes) {
    if (note.title.toLocaleLowerCase("tr-TR") === sourceTitle.toLocaleLowerCase("tr-TR")) continue;
    const title = note.title.trim();
    if (!title) continue;
    const pattern = new RegExp("(^|[^A-Za-z0-9_ÇĞİÖŞÜçğıöşü])" + escapeRegExp(title) + "(?=$|[^A-Za-z0-9_ÇĞİÖŞÜçğıöşü])", "iu");
    if (pattern.test(body)) found.add(title.toLocaleLowerCase("tr-TR"));
  }
  return notes.filter(note => found.has(note.title.toLocaleLowerCase("tr-TR"))).map(note => note.title);
}
function linkifyKnownTitles(content: string, notes: Note[], sourceTitle: string) {
  const explicit = content.replace(WIKI_RE, (_match, raw: string) => {
    const title = raw.trim();
    return "[" + title + "](wiki:" + encodeURIComponent(title) + ")";
  });
  const protectedChunks = explicit.split(/(\[[^\]]*\]\([^)]*\))/g);
  const titles = notes
    .filter(note => note.title.toLocaleLowerCase("tr-TR") !== sourceTitle.toLocaleLowerCase("tr-TR"))
    .map(note => note.title.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  return protectedChunks.map(chunk => {
    if (/^\[[^\]]*\]\([^)]*\)$/.test(chunk)) return chunk;
    let result = chunk;
    for (const title of titles) {
      const pattern = new RegExp("(^|[^A-Za-z0-9_ÇĞİÖŞÜçğıöşü])(" + escapeRegExp(title) + ")(?=$|[^A-Za-z0-9_ÇĞİÖŞÜçğıöşü])", "giu");
      result = result.replace(pattern, (_match, prefix: string, matched: string) => prefix + "[" + matched + "](wiki:" + encodeURIComponent(title) + ")");
    }
    return result;
  }).join("");
}

function parseNote(");
}
function linkedTitles(content: string, notes: Note[], sourceTitle: string): string[] {
  const found = new Set(extractLinks(content).map(title => title.toLocaleLowerCase("tr-TR")));
  const body = stripFrontmatter(content);
  for (const note of notes) {
    if (note.title.toLocaleLowerCase("tr-TR") === sourceTitle.toLocaleLowerCase("tr-TR")) continue;
    const title = note.title.trim();
    if (!title) continue;
    const pattern = new RegExp("(^|[^A-Za-z0-9_ÇĞİÖŞÜçğıöşü])" + escapeRegExp(title) + "(?=$|[^A-Za-z0-9_ÇĞİÖŞÜçğıöşü])", "iu");
    if (pattern.test(body)) found.add(title.toLocaleLowerCase("tr-TR"));
  }
  return notes.filter(note => found.has(note.title.toLocaleLowerCase("tr-TR"))).map(note => note.title);
}
function linkifyKnownTitles(content: string, notes: Note[], sourceTitle: string) {
  const explicit = content.replace(WIKI_RE, (_match, raw: string) => {
    const title = raw.trim();
    return "[" + title + "](wiki:" + encodeURIComponent(title) + ")";
  });
  const protectedChunks = explicit.split(/(\\[[^\\]]*\\]\\([^)]*\\))/g);
  const titles = notes
    .filter(note => note.title.toLocaleLowerCase("tr-TR") !== sourceTitle.toLocaleLowerCase("tr-TR"))
    .map(note => note.title.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  return protectedChunks.map(chunk => {
    if (/^\\[[^\\]]*\\]\\([^)]*\\)$/.test(chunk)) return chunk;
    let result = chunk;
    for (const title of titles) {
      const pattern = new RegExp("(^|[^A-Za-z0-9_ÇĞİÖŞÜçğıöşü])(" + escapeRegExp(title) + ")(?=$|[^A-Za-z0-9_ÇĞİÖŞÜçğıöşü])", "giu");
      result = result.replace(pattern, (_match, prefix: string, matched: string) => prefix + "[" + matched + "](wiki:" + encodeURIComponent(title) + ")");
    }
    return result;
  }).join("");
}

function parseNote(id: string, file: string, content: string): Note {
  return { id, file, content, title: titleFromMarkdown(content, file.replace(/\.md$/, "")), links: extractLinks(content), tags: extractTags(content) };
}
async function ensureVault() {
  const info = await FileSystem.getInfoAsync(VAULT_DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(VAULT_DIR, { intermediates: true });
  const files = await FileSystem.readDirectoryAsync(VAULT_DIR);
  if (files.filter(f => f.endsWith(".md")).length === 0) {
    for (const n of SEED_NOTES) {
      await FileSystem.writeAsStringAsync(`${VAULT_DIR}${n.file}`, n.content, { encoding: FileSystem.EncodingType.UTF8 });
    }
  }
}
async function loadVault(): Promise<Note[]> {
  await ensureVault();
  const files = (await FileSystem.readDirectoryAsync(VAULT_DIR)).filter(f => f.endsWith(".md")).sort();
  const loaded: Note[] = [];
  for (const file of files) {
    const content = await FileSystem.readAsStringAsync(`${VAULT_DIR}${file}`, { encoding: FileSystem.EncodingType.UTF8 });
    loaded.push(parseNote(file.replace(/\.md$/, ""), file, content));
  }
  return loaded;
}

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState("index");
  const [tab, setTab] = useState<Tab>("wiki");
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftTags, setDraftTags] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [vaultPath, setVaultPath] = useState(VAULT_DIR);
  const { width } = useWindowDimensions();

  const refresh = useCallback(async (keepId?: string) => {
    setBusy(true);
    try {
      const next = await loadVault();
      setNotes(next);
      setActiveId(current => {
        const wanted = keepId || current;
        return next.some(n => n.id === wanted) ? wanted : (next.find(n => n.id === "index")?.id || next[0]?.id || "");
      });
      setVaultPath(VAULT_DIR);
    } catch (e) {
      Alert.alert("Bilgi ağı yüklenemedi", String(e));
    } finally { setBusy(false); }
  }, []);

  useEffect(() => { refresh("index"); }, [refresh]);

  const active = notes.find(n => n.id === activeId) || notes[0];
  const byTitle = useMemo(() => {
    const map = new Map<string, Note>();
    notes.forEach(n => map.set(n.title.trim().toLocaleLowerCase("tr-TR"), n));
    return map;
  }, [notes]);
  const backlinks = useMemo(() => {
    if (!active) return [];
    return notes.filter(n => n.id !== active.id && linkedTitles(n.content, notes, n.title)
      .some(title => title.toLocaleLowerCase("tr-TR") === active.title.toLocaleLowerCase("tr-TR")));
  }, [notes, active]);
  const allTags = useMemo(() => [...new Set(notes.flatMap(n => n.tags))].sort((a, b) => a.localeCompare(b, "tr-TR")), [notes]);
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    return notes.filter(n => {
      const matchesText = !q || `${n.title}\n${n.content}\n${n.tags.join(" ")}`.toLocaleLowerCase("tr-TR").includes(q);
      const matchesTags = selectedTags.every(tag => n.tags.includes(tag));
      return matchesText && matchesTags;
    });
  }, [notes, query, selectedTags]);

  const openNote = (note: Note) => { setActiveId(note.id); setTab("wiki"); };
  const createNote = () => {
    setEditingId(null); setDraftTitle(""); setDraftTags(""); setDraftContent("");
    setTab("edit");
  };
  const editNote = () => {
    if (!active) return;
    setEditingId(active.id); setDraftTitle(active.title); setDraftTags(active.tags.join(", ")); setDraftContent(stripFrontmatter(active.content)); setTab("edit");
  };
  const saveNote = async () => {
    const title = draftTitle.trim();
    if (!title) { Alert.alert("Başlık gerekli", "Not için bir başlık gir."); return; }
    const id = editingId || slugify(title);
    const file = `${id}.md`;
    const tags = [...new Set(draftTags.split(",").map(tag => tag.trim().toLocaleLowerCase("tr-TR")).filter(Boolean))];
    const tagLine = `tags: [${tags.map(tag => JSON.stringify(tag)).join(", ")}]`;
    const content = `---
title: "${title.replace(/"/g, "'")}"
type: concept
${tagLine}
updated: ${new Date().toISOString().slice(0, 10)}
---

${stripFrontmatter(draftContent).trim()}
`;
    try {
      await FileSystem.writeAsStringAsync(`${VAULT_DIR}${file}`, content, { encoding: FileSystem.EncodingType.UTF8 });
      await refresh(id);
      setTab("wiki");
    } catch (e) { Alert.alert("Kaydedilemedi", String(e)); }
  };
  const removeNote = () => {
    if (!active || active.id === "index") return;
    Alert.alert("Not silinsin mi?", `"${active.title}" dosyası kalıcı olarak silinecek.`, [
      { text: "Vazgeç", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: async () => {
        try { await FileSystem.deleteAsync(`${VAULT_DIR}${active.file}`, { idempotent: true }); await refresh("index"); }
        catch (e) { Alert.alert("Silinemedi", String(e)); }
      }}
    ]);
  };

  const renderNoteRow = ({ item }: { item: Note }) => {
    const plain = cleanMarkdown(item.content);
    const q = query.trim().toLocaleLowerCase("tr-TR");
    const at = q ? plain.toLocaleLowerCase("tr-TR").indexOf(q) : -1;
    const snippet = at >= 0 ? `${at > 45 ? "…" : ""}${plain.slice(Math.max(0, at - 45), at + q.length + 85)}${at + q.length + 85 < plain.length ? "…" : ""}` : plain.slice(0, 150);
    return (
      <Pressable style={styles.resultRow} onPress={() => openNote(item)}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        <Text style={styles.resultMeta} numberOfLines={3}>{snippet || "İçerik boş."}</Text>
        {item.tags.length > 0 && <Text style={styles.tagLine}>{item.tags.map(tag => `#${tag}`).join("  ")}</Text>}
        <Text style={styles.resultMeta}>{linkedTitles(item.content, notes, item.title).length} bağlantı · {item.file}</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0E14" />
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.brand}>ATLAS</Text>
          <Text style={styles.subtitle}>Kişisel ilişkisel bilgi ağı</Text>
        </View>
        <Pressable style={styles.primaryButton} onPress={createNote}><Text style={styles.primaryButtonText}>＋ Başlık aç</Text></Pressable>
      </View>
      <View style={styles.tabs}>
        {([["wiki", "Wiki"], ["search", "Ara"], ["graph", "Graf"], ["edit", "Düzenle"]] as [Tab, string][]).map(([key, label]) => (
          <Pressable key={key} onPress={() => key === "edit" ? (active ? editNote() : createNote()) : setTab(key)}
            style={[styles.tab, tab === key && styles.tabActive]}>
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      {busy ? <View style={styles.center}><ActivityIndicator size="large" color="#22C55E" /><Text style={styles.muted}>Markdown dosyaları indeksleniyor…</Text></View> : (
        <>
          {tab === "wiki" && active && (
            <ScrollView contentContainerStyle={styles.page}>
              <Text style={styles.kicker}>MARKDOWN WIKI</Text>
              <Text style={styles.pageTitle}>{active.title}</Text>
              <Text style={styles.filePath}>{active.file}</Text>
              <View style={styles.markdown}>
                <Markdown style={markdownStyles} onLinkPress={(url) => {
                  const title = decodeURIComponent(url.replace(/^wiki:/, ""));
                  const target = byTitle.get(title.toLocaleLowerCase("tr-TR"));
                  if (target) openNote(target);
                  else Alert.alert("Sayfa bulunamadı", `“${title}” başlıklı not henüz oluşturulmadı.`);
                  return false;
                }}>
                  {linkifyKnownTitles(active.content.replace(/^---[\s\S]*?---\s*/, ""), notes, active.title)}
                </Markdown>
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Geri bağlantılar · {backlinks.length}</Text>
                {backlinks.length ? backlinks.map(n => <Pressable key={n.id} style={styles.chip} onPress={() => openNote(n)}><Text style={styles.chipText}>↖ {n.title}</Text></Pressable>) : <Text style={styles.muted}>Bu sayfaya henüz başka bir not bağlanmıyor.</Text>}
              </View>
              <View style={styles.row}>
                <Pressable style={styles.secondaryButton} onPress={editNote}><Text style={styles.secondaryButtonText}>Düzenle</Text></Pressable>
                {active.id !== "index" && <Pressable style={styles.dangerButton} onPress={removeNote}><Text style={styles.dangerText}>Sil</Text></Pressable>}
              </View>
            </ScrollView>
          )}
          {tab === "search" && (
            <View style={styles.flex}>
              <TextInput value={query} onChangeText={setQuery} placeholder="Başlık, içerik veya etiket ara…" placeholderTextColor="#7C8798" style={styles.searchInput} autoCorrect={false} />
              {allTags.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagFilters}>
                  <Pressable onPress={() => setSelectedTags([])} style={[styles.filterChip, selectedTags.length === 0 && styles.filterChipActive]}>
                    <Text style={[styles.filterChipText, selectedTags.length === 0 && styles.filterChipTextActive]}>Tüm etiketler</Text>
                  </Pressable>
                  {allTags.map(tag => {
                    const selected = selectedTags.includes(tag);
                    return <Pressable key={tag} onPress={() => setSelectedTags(current => selected ? current.filter(t => t !== tag) : [...current, tag])} style={[styles.filterChip, selected && styles.filterChipActive]}>
                      <Text style={[styles.filterChipText, selected && styles.filterChipTextActive]}>#{tag}</Text>
                    </Pressable>;
                  })}
                </ScrollView>
              ) : <Text style={styles.hint}>Henüz etiket yok. Not düzenlerken etiketleri virgülle ayırarak ekleyebilirsin.</Text>}
              <Text style={styles.resultCount}>{filtered.length} / {notes.length} sonuç · Başlık, içerik ve etiketlerde arama</Text>
              <FlatList data={filtered} keyExtractor={n => n.id} renderItem={renderNoteRow} contentContainerStyle={{ paddingBottom: 30 }} ListEmptyComponent={<Text style={styles.muted}>Sonuç bulunamadı.</Text>} />
            </View>
          )}
          {tab === "graph" && <GraphView notes={notes} active={active} onOpen={openNote} width={width} />}
          {tab === "edit" && (
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
              <ScrollView contentContainerStyle={styles.editor}>
                <Text style={styles.sectionTitle}>{editingId ? "Başlığı / entry'yi düzenle" : "Yeni başlık aç"}</Text>
                <Text style={styles.label}>Başlık</Text>
                <TextInput value={draftTitle} onChangeText={setDraftTitle} style={styles.input} placeholder="Örn. B-tree Index" placeholderTextColor="#7C8798" />
                <Text style={styles.label}>Etiketler</Text>
                <TextInput value={draftTags} onChangeText={setDraftTags} style={styles.input} placeholder="örn. react-native, performans, mimari" placeholderTextColor="#7C8798" autoCapitalize="none" />
                <Text style={styles.hint}>Etiketleri virgülle ayır. Örn. react-native, performans, mimari</Text>
                <Text style={styles.label}>Entry</Text>
                <Text style={styles.hint}>Düz metin yaz. Daha önce başlık olarak açılmış bir kelime veya ifade entry içinde geçtiğinde otomatik tıklanabilir bağlantıya dönüşür. İstersen Markdown biçimlendirmesini de kullanabilirsin.</Text>
                <TextInput value={draftContent} onChangeText={setDraftContent} style={[styles.input, styles.contentInput]} multiline textAlignVertical="top" placeholder="Entry'ni yaz…" placeholderTextColor="#7C8798" />
                <Pressable style={styles.primaryWide} onPress={saveNote}><Text style={styles.primaryButtonText}>Entry'yi kaydet</Text></Pressable>
                <Text style={styles.muted}>Dosyalar uygulamanın yerel belge dizininde tutulur: {vaultPath}</Text>
              </ScrollView>
            </KeyboardAvoidingView>
          )}
        </>
      )}
      <View style={styles.footer}><Text style={styles.footerText}>{notes.length} Markdown dosyası · Yerel öncelikli · İnternet gerekmez</Text></View>
    </SafeAreaView>
  );
}

function GraphView({ notes, active, onOpen, width }: { notes: Note[]; active?: Note; onOpen: (n: Note) => void; width: number }) {
  const nodes = notes.slice(0, 28);
  const w = Math.max(width - 24, 300), h = 460;
  const cx = w / 2, cy = h / 2;
  const radius = Math.min(w * 0.39, h * 0.38);
  const positions = nodes.map((n, i) => {
    const a = (2 * Math.PI * i / Math.max(nodes.length, 1)) - Math.PI / 2;
    return { note: n, x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius };
  });
  const posByTitle = new Map(positions.map(p => [p.note.title.toLocaleLowerCase("tr-TR"), p]));
  return (
    <ScrollView contentContainerStyle={styles.graphPage}>
      <Text style={styles.pageTitle}>Bilgi grafiği</Text>
      <Text style={styles.muted}>Bir düğüme dokunarak sayfayı aç. MVP görünümü ilk 28 notu gösterir.</Text>
      <View style={{ width: w, height: h, marginTop: 12 }}>
        <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
          {positions.flatMap(p => linkedTitles(p.note.content, notes, p.note.title).map(link => {
            const target = posByTitle.get(link.toLocaleLowerCase("tr-TR"));
            if (!target || p.note.id >= target.note.id) return [];
            return <Line key={`${p.note.id}-${target.note.id}`} x1={p.x} y1={p.y} x2={target.x} y2={target.y} stroke="#334155" strokeWidth={1.2} />;
          }))}
        </Svg>
        {positions.map(p => (
          <Pressable key={p.note.id} onPress={() => onOpen(p.note)}
            style={[styles.graphNode, {
              left: p.x - 48, top: p.y - 24,
              borderColor: p.note.id === active?.id ? "#22C55E" : "#334155",
              backgroundColor: p.note.id === active?.id ? "#123522" : "#151C27"
            }]}>
            <Text numberOfLines={2} style={styles.graphNodeText}>{p.note.title}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.hint}>Başlıklar, entry metinlerinde geçtiğinde otomatik olarak ilişkilendirilir. Daha fazla başlık için aramayı kullan.</Text>
    </ScrollView>
  );
}

const markdownStyles = {
  body: { color: "#D8DEE9", fontSize: 15, lineHeight: 24 },
  heading1: { color: "#F8FAFC", fontSize: 25, fontWeight: "700" as const, marginTop: 12 },
  heading2: { color: "#F8FAFC", fontSize: 21, fontWeight: "700" as const, marginTop: 18 },
  heading3: { color: "#E2E8F0", fontSize: 17, fontWeight: "700" as const, marginTop: 14 },
  paragraph: { marginTop: 6, marginBottom: 8 },
  code_inline: { color: "#86EFAC", backgroundColor: "#17211C", fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" },
  code_block: { color: "#D1FAE5", backgroundColor: "#111820", padding: 12, borderRadius: 10, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" },
  fence: { color: "#D1FAE5", backgroundColor: "#111820", padding: 12, borderRadius: 10 },
  link: { color: "#4ADE80", textDecorationLine: "underline" as const },
  bullet_list: { marginVertical: 5 },
  ordered_list: { marginVertical: 5 },
  blockquote: { borderLeftColor: "#22C55E", backgroundColor: "#111820", paddingHorizontal: 10 },
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B0E14" },
  flex: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingTop: 12, paddingBottom: 16 },
  brand: { color: "#22C55E", fontSize: 24, fontWeight: "900", letterSpacing: 3 },
  subtitle: { color: "#94A3B8", fontSize: 12, marginTop: 2 },
  primaryButton: { backgroundColor: "#22C55E", borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10 },
  primaryButtonText: { color: "#06130A", fontWeight: "800" },
  tabs: { flexDirection: "row", marginHorizontal: 14, marginBottom: 8, backgroundColor: "#111720", borderRadius: 12, padding: 4 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 9 },
  tabActive: { backgroundColor: "#24372D" },
  tabText: { color: "#94A3B8", fontWeight: "600", fontSize: 13 },
  tabTextActive: { color: "#86EFAC" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  muted: { color: "#94A3B8", fontSize: 13, lineHeight: 20 },
  page: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 28 },
  kicker: { color: "#22C55E", fontWeight: "800", fontSize: 11, letterSpacing: 2 },
  pageTitle: { color: "#F8FAFC", fontSize: 27, fontWeight: "800", marginTop: 7, marginBottom: 4 },
  filePath: { color: "#64748B", fontSize: 11, marginBottom: 18 },
  markdown: { marginTop: 4 },
  section: { marginTop: 26, paddingTop: 18, borderTopWidth: 1, borderTopColor: "#26303D" },
  sectionTitle: { color: "#F8FAFC", fontSize: 17, fontWeight: "800", marginBottom: 12 },
  chip: { alignSelf: "flex-start", backgroundColor: "#16241B", borderColor: "#28543A", borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99, marginBottom: 7 },
  chipText: { color: "#86EFAC", fontSize: 13, fontWeight: "600" },
  row: { flexDirection: "row", gap: 10, marginTop: 20 },
  secondaryButton: { borderColor: "#334155", borderWidth: 1, borderRadius: 10, padding: 12 },
  secondaryButtonText: { color: "#E2E8F0", fontWeight: "700" },
  dangerButton: { borderColor: "#7F1D1D", borderWidth: 1, borderRadius: 10, padding: 12 },
  dangerText: { color: "#FCA5A5", fontWeight: "700" },
  searchInput: { margin: 16, paddingHorizontal: 14, paddingVertical: 13, borderRadius: 12, backgroundColor: "#151C27", color: "#F8FAFC", borderWidth: 1, borderColor: "#26303D" },
  resultCount: { color: "#64748B", fontSize: 12, paddingHorizontal: 18, paddingBottom: 8 },
  resultRow: { paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#1E293B" },
  resultTitle: { color: "#F8FAFC", fontSize: 16, fontWeight: "700" },
  resultMeta: { color: "#94A3B8", fontSize: 12, lineHeight: 18, marginTop: 5 },
  tagLine: { color: "#86EFAC", fontSize: 11, lineHeight: 17, marginTop: 7 },
  tagFilters: { paddingHorizontal: 16, paddingBottom: 8, gap: 7, alignItems: "center" },
  filterChip: { borderColor: "#334155", borderWidth: 1, borderRadius: 99, paddingHorizontal: 11, paddingVertical: 7, backgroundColor: "#111720" },
  filterChipActive: { borderColor: "#22C55E", backgroundColor: "#162D20" },
  filterChipText: { color: "#94A3B8", fontSize: 12, fontWeight: "600" },
  filterChipTextActive: { color: "#86EFAC" },
  editor: { padding: 18, gap: 10 },
  label: { color: "#CBD5E1", fontWeight: "700", marginTop: 5 },
  hint: { color: "#64748B", fontSize: 12, lineHeight: 18, marginTop: 5, marginBottom: 8 },
  input: { color: "#F8FAFC", backgroundColor: "#151C27", borderWidth: 1, borderColor: "#334155", borderRadius: 10, padding: 12 },
  contentInput: { minHeight: 280, textAlignVertical: "top", fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", lineHeight: 21 },
  primaryWide: { alignItems: "center", backgroundColor: "#22C55E", borderRadius: 10, padding: 14, marginTop: 8 },
  graphPage: { padding: 12, paddingBottom: 30 },
  graphNode: { position: "absolute", width: 96, minHeight: 48, borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 5, paddingVertical: 6, alignItems: "center", justifyContent: "center" },
  graphNodeText: { color: "#E2E8F0", fontSize: 10, fontWeight: "700", textAlign: "center" },
  footer: { paddingVertical: 8, alignItems: "center", borderTopWidth: 1, borderTopColor: "#17202C" },
  footerText: { color: "#475569", fontSize: 10 },
});
