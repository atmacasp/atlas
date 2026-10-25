import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform,
  Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text,
  TextInput, View, useWindowDimensions
} from "react-native";
import Markdown from "react-native-markdown-display";
import Svg, { Line } from "react-native-svg";
import * as FileSystem from "expo-file-system/legacy";
import { SEED_NOTES, SeedNote } from "./src/seedNotes";

type Note = { id: string; title: string; file: string; content: string; links: string[]; tags: string[] };
type Tab = "home" | "wiki" | "search" | "graph" | "edit" | "tags" | "settings" | "profile";
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
    if (!titles.length) return chunk;
    const alternatives = titles.map(escapeRegExp).join("|");
    const pattern = new RegExp("(^|[^A-Za-z0-9_ÇĞİÖŞÜçğıöşü])(" + alternatives + ")(?=$|[^A-Za-z0-9_ÇĞİÖŞÜçğıöşü])", "giu");
    return chunk.replace(pattern, (_match, prefix: string, matched: string) => {
      const canonical = titles.find(title => title.toLocaleLowerCase("tr-TR") === matched.toLocaleLowerCase("tr-TR")) || matched;
      return prefix + "[" + matched + "](wiki:" + encodeURIComponent(canonical) + ")";
    });
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
  const [tab, setTab] = useState<Tab>("home");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftTags, setDraftTags] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [profileName, setProfileName] = useState("");
  const [profileDraft, setProfileDraft] = useState("");
  const [compactMode, setCompactMode] = useState(false);
  const [showFileNames, setShowFileNames] = useState(false);
  const { width } = useWindowDimensions();
  const settingsPath = VAULT_DIR + "settings.json";

  const refresh = useCallback(async (keepId?: string) => {
    setBusy(true);
    try {
      const next = await loadVault();
      setNotes(next);
      setActiveId(current => {
        const wanted = keepId || current;
        return next.some(n => n.id === wanted) ? wanted : (next.find(n => n.id === "index")?.id || next[0]?.id || "");
      });
      try {
        const info = await FileSystem.getInfoAsync(settingsPath);
        if (info.exists) {
          const saved = JSON.parse(await FileSystem.readAsStringAsync(settingsPath, { encoding: FileSystem.EncodingType.UTF8 }));
          const name = typeof saved.profileName === "string" ? saved.profileName : "";
          setProfileName(name); setProfileDraft(name);
          setCompactMode(saved.compactMode === true); setShowFileNames(saved.showFileNames === true);
        }
      } catch { /* Optional settings must not block note loading. */ }
    } catch (e) { Alert.alert("Notlar açılamadı", String(e)); }
    finally { setBusy(false); }
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
      const matchesText = !q || (n.title + "\n" + n.content + "\n" + n.tags.join(" ")).toLocaleLowerCase("tr-TR").includes(q);
      return matchesText && selectedTags.every(tag => n.tags.includes(tag));
    });
  }, [notes, query, selectedTags]);

  const navigate = (nextTab: Tab) => { setTab(nextTab); setDrawerOpen(false); };
  const openNote = (note: Note) => { setActiveId(note.id); navigate("wiki"); };
  const createNote = () => { setEditingId(null); setDraftTitle(""); setDraftTags(""); setDraftContent(""); navigate("edit"); };
  const editNote = () => {
    if (!active) return;
    setEditingId(active.id); setDraftTitle(active.title); setDraftTags(active.tags.join(", "));
    setDraftContent(stripFrontmatter(active.content)); navigate("edit");
  };
  const saveSettings = async (patch: Record<string, unknown>) => {
    const current = { profileName, compactMode, showFileNames, ...patch };
    try {
      await FileSystem.writeAsStringAsync(settingsPath, JSON.stringify(current, null, 2), { encoding: FileSystem.EncodingType.UTF8 });
      if (typeof current.profileName === "string") { setProfileName(current.profileName); setProfileDraft(current.profileName); }
      if (typeof current.compactMode === "boolean") setCompactMode(current.compactMode);
      if (typeof current.showFileNames === "boolean") setShowFileNames(current.showFileNames);
    } catch (e) { Alert.alert("Ayar kaydedilemedi", String(e)); }
  };
  const saveNote = async () => {
    const title = draftTitle.trim();
    if (!title) { Alert.alert("Başlık gerekli", "Not için bir başlık gir."); return; }
    const id = editingId || slugify(title);
    const file = id + ".md";
    const tags = [...new Set(draftTags.split(",").map(tag => tag.trim().toLocaleLowerCase("tr-TR")).filter(Boolean))];
    const tagLine = "tags: [" + tags.map(tag => JSON.stringify(tag)).join(", ") + "]";
    const content = "---\ntitle: \"" + title.replace(/"/g, "'") + "\"\ntype: concept\n" + tagLine + "\nupdated: " + new Date().toISOString().slice(0, 10) + "\n---\n\n" + stripFrontmatter(draftContent).trim() + "\n";
    try {
      await FileSystem.writeAsStringAsync(VAULT_DIR + file, content, { encoding: FileSystem.EncodingType.UTF8 });
      await refresh(id); setTab("wiki");
    } catch (e) { Alert.alert("Not kaydedilemedi", String(e)); }
  };
  const removeNote = () => {
    if (!active || active.id === "index") return;
    Alert.alert("Not silinsin mi?", "“" + active.title + "” kalıcı olarak silinecek.", [
      { text: "Vazgeç", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: async () => {
        try { await FileSystem.deleteAsync(VAULT_DIR + active.file, { idempotent: true }); await refresh("index"); setTab("home"); }
        catch (e) { Alert.alert("Not silinemedi", String(e)); }
      }}
    ]);
  };

  const renderNoteRow = ({ item }: { item: Note }) => {
    const plain = cleanMarkdown(item.content);
    const q = query.trim().toLocaleLowerCase("tr-TR");
    const at = q ? plain.toLocaleLowerCase("tr-TR").indexOf(q) : -1;
    const snippet = at >= 0 ? (at > 45 ? "…" : "") + plain.slice(Math.max(0, at - 45), at + q.length + 85) + (at + q.length + 85 < plain.length ? "…" : "") : plain.slice(0, 150);
    return (
      <Pressable style={[styles.resultRow, styles.noteCard, compactMode && styles.noteCardCompact]} onPress={() => openNote(item)}>
        <View style={styles.noteRowHeading}><Text style={styles.resultTitle}>{item.title}</Text><Text style={styles.rowArrow}>›</Text></View>
        {!compactMode && <Text style={styles.resultMeta} numberOfLines={3}>{snippet || "İçerik boş."}</Text>}
        <View style={styles.noteRowBottom}>
          {item.tags.length > 0 && <Text style={styles.tagLine} numberOfLines={1}>{item.tags.map(tag => "#" + tag).join("  ")}</Text>}
          <Text style={styles.cardMeta}>{linkedTitles(item.content, notes, item.title).length} bağlantı{showFileNames ? " · " + item.file : ""}</Text>
        </View>
      </Pressable>
    );
  };

  const titles: Record<Tab, string> = {
    home: "Notlar", wiki: active?.title || "Not", search: "Ara", graph: "Bağlantılar",
    edit: editingId ? "Notu düzenle" : "Not ekle", tags: "Etiketler", settings: "Ayarlar", profile: "Profil"
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0E14" />
      <View style={styles.header}>
        <Pressable accessibilityLabel="Menüyü aç" style={styles.menuButton} onPress={() => setDrawerOpen(true)}><Text style={styles.menuGlyph}>☰</Text></Pressable>
        <View style={styles.headerTitleWrap}><Text style={styles.headerTitle} numberOfLines={1}>{titles[tab]}</Text>{tab === "home" && <Text style={styles.headerMeta}>{notes.length} not</Text>}</View>
        {tab !== "edit" && tab !== "settings" && tab !== "profile" && <Pressable accessibilityLabel="Ara" style={styles.menuButton} onPress={() => navigate("search")}><Text style={styles.searchGlyph}>⌕</Text></Pressable>}
        {tab !== "edit" && <Pressable style={styles.primaryButton} onPress={createNote}><Text style={styles.primaryButtonText}>＋ Not ekle</Text></Pressable>}
      </View>

      {busy ? <View style={styles.center}><ActivityIndicator size="large" color="#A3E635" /></View> : (
        <View style={styles.flex}>
          {tab === "home" && <View style={styles.flex}>
            <View style={styles.sectionHeader}><Text style={styles.sectionHeading}>Tüm notlar</Text><Pressable onPress={() => navigate("tags")}><Text style={styles.smallActionText}>Etiketler ↗</Text></Pressable></View>
            <FlatList data={[...notes].sort((a, b) => a.title.localeCompare(b.title, "tr-TR"))} keyExtractor={n => n.id} renderItem={renderNoteRow} contentContainerStyle={styles.listContent} ListEmptyComponent={<EmptyState title="Henüz not yok" action="İlk notunu ekle" onPress={createNote} />} />
          </View>}

          {tab === "wiki" && active && <ScrollView contentContainerStyle={styles.page}>
            <View style={styles.documentToolbar}><View style={styles.documentHeading}><Text style={styles.pageTitle}>{active.title}</Text>{showFileNames && <Text style={styles.filePath}>{active.file}</Text>}</View>
              <Pressable style={styles.menuButton} onPress={editNote}><Text style={styles.actionGlyph}>✎</Text></Pressable>
              {active.id !== "index" && <Pressable style={styles.menuButton} onPress={removeNote}><Text style={styles.deleteGlyph}>⋯</Text></Pressable>}
            </View>
            {active.tags.length > 0 && <View style={styles.documentTags}>{active.tags.map(tag => <Pressable key={tag} onPress={() => { setSelectedTags([tag]); navigate("search"); }} style={styles.documentTag}><Text style={styles.documentTagText}>#{tag}</Text></Pressable>)}</View>}
            <View style={styles.markdown}><Markdown style={markdownStyles} onLinkPress={(url) => {
              const title = decodeURIComponent(url.replace(/^wiki:/, ""));
              const target = byTitle.get(title.toLocaleLowerCase("tr-TR"));
              if (target) openNote(target); else Alert.alert("Sayfa bulunamadı", "“" + title + "” başlıklı not henüz oluşturulmadı.");
              return false;
            }}>{linkifyKnownTitles(stripFrontmatter(active.content), notes, active.title)}</Markdown></View>
            <View style={styles.section}><View style={styles.sectionHeaderInline}><Text style={styles.sectionTitle}>Geri bağlantılar</Text><Text style={styles.countPill}>{backlinks.length}</Text></View>
              {backlinks.length ? backlinks.map(n => <Pressable key={n.id} style={styles.backlinkRow} onPress={() => openNote(n)}><Text style={styles.backlinkIcon}>↖</Text><Text style={styles.backlinkText}>{n.title}</Text><Text style={styles.rowArrow}>›</Text></Pressable>) : <Text style={styles.muted}>Henüz bağlantı yok.</Text>}
            </View>
          </ScrollView>}

          {tab === "search" && <View style={styles.flex}>
            <View style={styles.searchBox}><Text style={styles.searchGlyph}>⌕</Text><TextInput value={query} onChangeText={setQuery} placeholder="Notlarda ara..." placeholderTextColor="#7C8798" style={styles.searchInput} autoCorrect={false} returnKeyType="search" /><Pressable onPress={() => { setQuery(""); setSelectedTags([]); }}><Text style={styles.clearSearch}>{query || selectedTags.length ? "×" : ""}</Text></Pressable></View>
            {allTags.length > 0 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagFilters}>
              <Pressable onPress={() => setSelectedTags([])} style={[styles.filterChip, selectedTags.length === 0 && styles.filterChipActive]}><Text style={[styles.filterChipText, selectedTags.length === 0 && styles.filterChipTextActive]}>Tümü</Text></Pressable>
              {allTags.map(tag => { const selected = selectedTags.includes(tag); return <Pressable key={tag} onPress={() => setSelectedTags(current => selected ? current.filter(t => t !== tag) : [...current, tag])} style={[styles.filterChip, selected && styles.filterChipActive]}><Text style={[styles.filterChipText, selected && styles.filterChipTextActive]}>#{tag}</Text></Pressable>; })}
            </ScrollView>}
            <Text style={styles.resultCount}>{filtered.length} sonuç</Text>
            <FlatList data={filtered} keyExtractor={n => n.id} renderItem={renderNoteRow} contentContainerStyle={styles.listContent} ListEmptyComponent={<EmptyState title="Sonuç bulunamadı" action="Aramayı temizle" onPress={() => { setQuery(""); setSelectedTags([]); }} />} />
          </View>}

          {tab === "graph" && <GraphView notes={notes} active={active} onOpen={openNote} width={width} />}
          {tab === "tags" && <ScrollView contentContainerStyle={styles.settingsPage}><Text style={styles.sectionSubheading}>{allTags.length} etiket</Text>
            {allTags.length ? allTags.map(tag => <Pressable key={tag} style={styles.settingRow} onPress={() => { setSelectedTags([tag]); setQuery(""); navigate("search"); }}><Text style={styles.settingHash}>#</Text><View style={styles.settingCopy}><Text style={styles.settingTitle}>{tag}</Text><Text style={styles.settingDescription}>{notes.filter(n => n.tags.includes(tag)).length} not</Text></View><Text style={styles.rowArrow}>›</Text></Pressable>) : <EmptyState title="Henüz etiket yok" action="Not ekle" onPress={createNote} />}
          </ScrollView>}

          {tab === "edit" && <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}><ScrollView contentContainerStyle={styles.editor} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Başlık</Text><TextInput value={draftTitle} onChangeText={setDraftTitle} style={styles.input} placeholder="Notun başlığı" placeholderTextColor="#7C8798" returnKeyType="next" />
            <Text style={styles.label}>Etiketler</Text><TextInput value={draftTags} onChangeText={setDraftTags} style={styles.input} placeholder="Örn. fikirler, yazılım" placeholderTextColor="#7C8798" autoCapitalize="none" />
            <Text style={styles.label}>İçerik</Text><TextInput value={draftContent} onChangeText={setDraftContent} style={[styles.input, styles.contentInput]} multiline textAlignVertical="top" placeholder="Aklındakileri yaz..." placeholderTextColor="#7C8798" />
            <View style={styles.editorActions}><Pressable style={styles.cancelButton} onPress={() => navigate(editingId ? "wiki" : "home")}><Text style={styles.cancelButtonText}>Vazgeç</Text></Pressable><Pressable style={styles.primaryWide} onPress={saveNote}><Text style={styles.primaryButtonText}>Kaydet</Text></Pressable></View>
          </ScrollView></KeyboardAvoidingView>}

          {tab === "profile" && <ScrollView contentContainerStyle={styles.settingsPage}>
            <View style={styles.profileHero}><View style={styles.avatar}><Text style={styles.avatarText}>{(profileName.trim()[0] || "A").toLocaleUpperCase("tr-TR")}</Text></View><Text style={styles.profileName}>{profileName || "Profilin"}</Text></View>
            <Text style={styles.label}>Görünen ad</Text><TextInput value={profileDraft} onChangeText={setProfileDraft} style={styles.input} placeholder="Adını yaz" placeholderTextColor="#7C8798" />
            <Pressable style={styles.primaryWide} onPress={() => saveSettings({ profileName: profileDraft.trim() })}><Text style={styles.primaryButtonText}>Profili kaydet</Text></Pressable>
            <View style={styles.statsGrid}><View style={styles.statCard}><Text style={styles.statValue}>{notes.length}</Text><Text style={styles.statLabel}>Not</Text></View><View style={styles.statCard}><Text style={styles.statValue}>{allTags.length}</Text><Text style={styles.statLabel}>Etiket</Text></View><View style={styles.statCard}><Text style={styles.statValue}>{notes.reduce((sum, n) => sum + linkedTitles(n.content, notes, n.title).length, 0)}</Text><Text style={styles.statLabel}>Bağlantı</Text></View></View>
          </ScrollView>}

          {tab === "settings" && <ScrollView contentContainerStyle={styles.settingsPage}>
            <Text style={styles.settingsGroupTitle}>Görünüm</Text>
            <SettingToggle title="Kompakt not listesi" description="Daha fazla notu aynı anda göster." value={compactMode} onPress={() => saveSettings({ compactMode: !compactMode })} />
            <SettingToggle title="Dosya adlarını göster" description="Markdown dosya adlarını görüntüle." value={showFileNames} onPress={() => saveSettings({ showFileNames: !showFileNames })} />
            <Text style={styles.settingsGroupTitle}>Çalışma alanı</Text>
            <Pressable style={styles.settingRow} onPress={() => refresh()}><Text style={styles.settingHash}>↻</Text><View style={styles.settingCopy}><Text style={styles.settingTitle}>Notları yenile</Text><Text style={styles.settingDescription}>Yerel dosyalardan yeniden yükle.</Text></View><Text style={styles.rowArrow}>›</Text></Pressable>
            <Pressable style={styles.settingRow} onPress={() => navigate("graph")}><Text style={styles.settingHash}>⌘</Text><View style={styles.settingCopy}><Text style={styles.settingTitle}>Bağlantı grafiği</Text><Text style={styles.settingDescription}>Notlar arasındaki ilişkileri görüntüle.</Text></View><Text style={styles.rowArrow}>›</Text></Pressable>
          </ScrollView>}
        </View>
      )}

      <Modal visible={drawerOpen} transparent animationType="fade" onRequestClose={() => setDrawerOpen(false)}>
        <View style={styles.drawerRoot}><Pressable style={styles.drawerScrim} onPress={() => setDrawerOpen(false)} />
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}><View style={styles.drawerMark}><Text style={styles.drawerMarkText}>A</Text></View><View style={styles.drawerBrandCopy}><Text style={styles.drawerBrand}>Atlas</Text><Text style={styles.drawerSub}>{profileName || "Kişisel alan"}</Text></View><Pressable style={styles.drawerClose} onPress={() => setDrawerOpen(false)}><Text style={styles.drawerCloseText}>×</Text></Pressable></View>
            <Pressable style={styles.drawerCreate} onPress={createNote}><Text style={styles.drawerCreatePlus}>＋</Text><Text style={styles.drawerCreateText}>Not ekle</Text></Pressable>
            <Text style={styles.drawerSectionLabel}>ÇALIŞMA ALANI</Text>
            <DrawerItem glyph="▤" label="Notlar" active={tab === "home"} onPress={() => navigate("home")} />
            <DrawerItem glyph="⌕" label="Ara" active={tab === "search"} onPress={() => navigate("search")} />
            <DrawerItem glyph="#" label="Etiketler" active={tab === "tags"} onPress={() => navigate("tags")} />
            <DrawerItem glyph="⌘" label="Bağlantı grafiği" active={tab === "graph"} onPress={() => navigate("graph")} />
            <Text style={styles.drawerSectionLabel}>KİŞİSEL</Text>
            <DrawerItem glyph="◉" label="Profil" active={tab === "profile"} onPress={() => navigate("profile")} />
            <DrawerItem glyph="⚙" label="Ayarlar" active={tab === "settings"} onPress={() => navigate("settings")} />
            <View style={styles.drawerBottom}><Text style={styles.drawerBottomMeta}>{notes.length} not · {allTags.length} etiket</Text></View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function EmptyState({ title, action, onPress }: { title: string; action: string; onPress: () => void }) {
  return <View style={styles.emptyState}><View style={styles.emptyIcon}><Text style={styles.emptyIconText}>✦</Text></View><Text style={styles.emptyTitle}>{title}</Text><Pressable onPress={onPress} style={styles.emptyAction}><Text style={styles.emptyActionText}>{action} ↗</Text></Pressable></View>;
}
function SettingToggle({ title, description, value, onPress }: { title: string; description: string; value: boolean; onPress: () => void }) {
  return <Pressable style={styles.settingRow} onPress={onPress}><View style={styles.settingCopy}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.settingDescription}>{description}</Text></View><View style={[styles.toggleTrack, value && styles.toggleTrackOn]}><View style={[styles.toggleThumb, value && styles.toggleThumbOn]} /></View></Pressable>;
}
function DrawerItem({ glyph, label, active, onPress }: { glyph: string; label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.drawerItem, active && styles.drawerItemActive]}><Text style={[styles.drawerGlyph, active && styles.drawerGlyphActive]}>{glyph}</Text><Text style={[styles.drawerItemText, active && styles.drawerItemTextActive]}>{label}</Text>{active && <View style={styles.drawerActiveMark} />}</Pressable>;
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
  menuButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#151C27", borderWidth: 1, borderColor: "#26303D", alignItems: "center", justifyContent: "center" },
  menuGlyph: { color: "#E2E8F0", fontSize: 18 },
  searchGlyph: { color: "#D8DEE9", fontSize: 23, lineHeight: 27 },
  headerTitleWrap: { flex: 1, minWidth: 0, paddingLeft: 3 },
  headerTitle: { color: "#F8FAFC", fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  headerMeta: { color: "#94A3B8", fontSize: 11, marginTop: 2 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 19, paddingBottom: 12 },
  sectionHeading: { color: "#F8FAFC", fontSize: 16, fontWeight: "800" },
  smallActionText: { color: "#A3E635", fontSize: 12, fontWeight: "700" },
  listContent: { paddingHorizontal: 14, paddingBottom: 30, gap: 9 },
  noteCard: { backgroundColor: "#111720", borderWidth: 1, borderColor: "#202A38", borderRadius: 15, padding: 14 },
  noteCardCompact: { paddingVertical: 10 },
  noteRowHeading: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowArrow: { color: "#6B778A", fontSize: 20 },
  noteRowBottom: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  cardMeta: { color: "#64748B", fontSize: 10 },
  documentToolbar: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  documentHeading: { flex: 1, minWidth: 0 },
  documentTags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 15 },
  documentTag: { backgroundColor: "#1A2A1B", borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5 },
  documentTagText: { color: "#A7F3D0", fontSize: 11, fontWeight: "600" },
  sectionHeaderInline: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  countPill: { color: "#A3E635", backgroundColor: "#1D2A18", overflow: "hidden", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, fontSize: 11 },
  backlinkRow: { flexDirection: "row", alignItems: "center", gap: 9, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#1E293B" },
  backlinkIcon: { color: "#A3E635", fontSize: 15 },
  backlinkText: { flex: 1, color: "#E2E8F0", fontSize: 13 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, margin: 15, paddingHorizontal: 12, borderRadius: 13, backgroundColor: "#151C27", borderWidth: 1, borderColor: "#26303D" },
  clearSearch: { color: "#94A3B8", fontSize: 22, paddingHorizontal: 4 },
  settingsPage: { padding: 17, paddingBottom: 32, gap: 7 },
  settingsGroupTitle: { color: "#64748B", fontSize: 11, fontWeight: "800", letterSpacing: 1.2, marginTop: 17, marginBottom: 6 },
  settingRow: { flexDirection: "row", alignItems: "center", gap: 11, padding: 13, backgroundColor: "#111720", borderWidth: 1, borderColor: "#202A38", borderRadius: 13, marginBottom: 6 },
  settingHash: { width: 28, color: "#A3E635", fontSize: 18, textAlign: "center" },
  settingCopy: { flex: 1 },
  settingTitle: { color: "#E2E8F0", fontSize: 13, fontWeight: "700" },
  settingDescription: { color: "#94A3B8", fontSize: 11, lineHeight: 16, marginTop: 3 },
  toggleTrack: { width: 40, height: 24, borderRadius: 99, backgroundColor: "#334155", padding: 3, justifyContent: "center" },
  toggleTrackOn: { backgroundColor: "#4D7C0F" },
  toggleThumb: { width: 18, height: 18, borderRadius: 99, backgroundColor: "#E2E8F0" },
  toggleThumbOn: { alignSelf: "flex-end", backgroundColor: "#D9F99D" },
  profileHero: { alignItems: "center", paddingVertical: 24 },
  avatar: { width: 72, height: 72, borderRadius: 24, backgroundColor: "#26351B", borderWidth: 1, borderColor: "#4D7C0F", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { color: "#D9F99D", fontSize: 30, fontWeight: "800" },
  profileName: { color: "#F8FAFC", fontSize: 20, fontWeight: "800" },
  statsGrid: { flexDirection: "row", gap: 8, marginTop: 22 },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 16, backgroundColor: "#111720", borderRadius: 13, borderWidth: 1, borderColor: "#202A38" },
  statValue: { color: "#D9F99D", fontSize: 22, fontWeight: "800" },
  statLabel: { color: "#94A3B8", fontSize: 11, marginTop: 4 },
  editorActions: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 6 },
  cancelButton: { borderWidth: 1, borderColor: "#334155", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 13, marginTop: 8 },
  cancelButtonText: { color: "#CBD5E1", fontWeight: "700" },
  emptyState: { alignItems: "center", paddingHorizontal: 25, paddingVertical: 48 },
  emptyIcon: { width: 52, height: 52, borderRadius: 17, backgroundColor: "#1D2A18", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  emptyIconText: { color: "#A3E635", fontSize: 23 },
  emptyTitle: { color: "#E2E8F0", fontSize: 15, fontWeight: "700", marginBottom: 13 },
  emptyAction: { paddingHorizontal: 12, paddingVertical: 9, backgroundColor: "#1D2A18", borderRadius: 10 },
  emptyActionText: { color: "#D9F99D", fontSize: 12, fontWeight: "700" },
  drawerRoot: { flex: 1, flexDirection: "row" },
  drawerScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.62)" },
  drawer: { width: 290, maxWidth: "84%", backgroundColor: "#0F141C", paddingHorizontal: 14, paddingTop: 22, paddingBottom: 14, borderRightWidth: 1, borderRightColor: "#26303D" },
  drawerHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 22 },
  drawerMark: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#A3E635", alignItems: "center", justifyContent: "center" },
  drawerMarkText: { color: "#17200B", fontSize: 18, fontWeight: "900" },
  drawerBrandCopy: { flex: 1 },
  drawerBrand: { color: "#F8FAFC", fontSize: 17, fontWeight: "800" },
  drawerSub: { color: "#94A3B8", fontSize: 11, marginTop: 3 },
  drawerClose: { width: 30, height: 30, borderRadius: 9, backgroundColor: "#1B2330", alignItems: "center", justifyContent: "center" },
  drawerCloseText: { color: "#CBD5E1", fontSize: 22, lineHeight: 24 },
  drawerCreate: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, backgroundColor: "#A3E635", marginBottom: 20 },
  drawerCreatePlus: { color: "#17200B", fontSize: 20, fontWeight: "800" },
  drawerCreateText: { color: "#17200B", fontSize: 13, fontWeight: "800" },
  drawerSectionLabel: { color: "#64748B", fontSize: 10, fontWeight: "800", letterSpacing: 1.1, marginTop: 9, marginBottom: 8, marginLeft: 8 },
  drawerItem: { flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 11, paddingVertical: 11, borderRadius: 10, marginBottom: 3 },
  drawerItemActive: { backgroundColor: "#202D18" },
  drawerGlyph: { width: 22, color: "#94A3B8", fontSize: 17, textAlign: "center" },
  drawerGlyphActive: { color: "#D9F99D" },
  drawerItemText: { flex: 1, color: "#B8C1CE", fontSize: 13, fontWeight: "600" },
  drawerItemTextActive: { color: "#ECFCCB", fontWeight: "700" },
  drawerActiveMark: { width: 5, height: 5, borderRadius: 99, backgroundColor: "#A3E635" },
  drawerBottom: { flex: 1, justifyContent: "flex-end", paddingTop: 20, paddingBottom: 5 },
  drawerBottomMeta: { color: "#64748B", fontSize: 11, paddingHorizontal: 8 }
});
