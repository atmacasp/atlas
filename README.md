# Atlas — Kişisel İlişkisel Bilgi Ağı (MVP)

Expo + React Native + TypeScript ile telefonda geliştirilmeye uygun, yerel öncelikli bir Markdown wiki.

## MVP özellikleri
- Markdown dosyaları uygulamanın yerel belge dizininde tutulur.
- İlk açılışta `mobile-app-engineering.md` içeriğinden oluşturulmuş 27 konu sayfası içe aktarılır.
- Başlık ve içerikte arama: indeks her açılışta Markdown dosyalarından otomatik çıkarılır.
- `[[Sayfa Başlığı]]` wiki bağlantıları ve backlinks.
- Tıklanabilir, temel etkileşimli bilgi grafiği.
- Not oluşturma, düzenleme ve silme.
- İnternet veya Supabase hesabı gerektirmez.

## Termux ile başlatma

> Expo SDK sürümleri zaman içinde değişebilir. Eğer `npm install` bağımlılık çakışması verirse, yeni bir Expo TypeScript projesi oluşturup `npx expo install` ile Expo uyumlu sürümleri kurmak en güvenli yoldur.

1. Node.js ve Git kurulu değilse:
   ```bash
   pkg update
   pkg install nodejs-lts git unzip
   ```
2. Bu ZIP'i telefona indirip Termux'un erişebildiği klasöre çıkar. Örneğin Downloads'a aldıysan:
   ```bash
   termux-setup-storage
   cd ~/storage/downloads
   unzip knowledge-vault-mvp.zip
   cd knowledge-vault-mvp
   ```
3. Bağımlılıkları kur:
   ```bash
   npm install
   ```
4. TypeScript kontrolü:
   ```bash
   npm run typecheck
   ```
5. Expo'yu başlat:
   ```bash
   npx expo start --tunnel
   ```
6. Telefonda Expo Go varsa QR kodu okut. Aynı cihazda Termux'ta çalışıyorsan Expo Go ile bağlantı akışını uygulamanın gösterdiği şekilde tamamla.

## Eğer SDK/bağımlılık uyumsuzluğu olursa

```bash
npx create-expo-app@latest atlas-knowledge-vault --template blank-typescript
cd atlas-knowledge-vault
npx expo install expo-file-system react-native-svg expo-status-bar
npm install react-native-markdown-display
```

Sonra bu paketteki `App.tsx`, `src/seedNotes.ts`, `app.json` ve `tsconfig.json` dosyalarını yeni projeye kopyala. `package.json` dosyasını tamamen değiştirmek yerine yeni projenin Expo tarafından oluşturulan bağımlılık sürümlerini koru.

## Veri nerede?
Runtime Markdown dosyaları `FileSystem.documentDirectory/knowledge-vault/` altında bulunur. Uygulama ilk açılışta boşsa seed notları buraya kopyalar. Arama indeksi ve backlinks, bu Markdown dosyaları okunarak bellekte yeniden oluşturulur; bu MVP'de ayrıca SQLite indeks tablosu yoktur.

## Wiki bağlantısı
Markdown içine şunu yaz:
```md
[[PostgreSQL]]
```
Bağlantı hedefi aynı başlığa sahip bir not olmalı. Hedef yoksa önce o başlıkla yeni not oluştur.

## Şu anki sınırlar
- Grafik ilk 28 notu gösterir; düğümler tıklanabilir fakat sürükleme/zoom henüz yok.
- Markdown editörü ham Markdown metnidir; WYSIWYG değildir.
- Backlinks başlık eşleşmesi üzerinden hesaplanır; gelişmiş alias ve YAML parser henüz yok.
- Bu MVP otomatik senkronizasyon/backup yapmaz. Veriler uygulamanın yerel alanındadır; uygulamayı kaldırmadan önce dışa aktarma/backup özelliği eklemek gerekir.
