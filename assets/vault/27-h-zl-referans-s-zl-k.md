---
title: "Hızlı Referans / Sözlük"
type: concept
source: mobile-app-engineering.md
---

# 27. Hızlı Referans / Sözlük

| Kavram | Kısa anlam |
|---|---|
| Architecture | Sistemin üst düzey yapısı |
| Domain | Çözülen problem alanı |
| Entity | Kimliği olan domain nesnesi |
| Value Object | Değeriyle tanımlanan nesne |
| Service | Belirli bir iş davranışını gerçekleştiren katman |
| Repository | Veri erişimini abstraction altında toplar |
| Authentication | Kullanıcı kim? |
| Authorization | Kullanıcı ne yapabilir? |
| RLS | Database seviyesinde satır erişim politikası |
| API | Sistemler arası iletişim arayüzü |
| REST | HTTP kaynakları üzerinden API tasarım yaklaşımı |
| JWT | Token tabanlı veri taşıma formatı |
| Idempotency | Aynı işlemin tekrarının güvenli olması |
| Cache | Daha hızlı erişim için geçici/kopya veri |
| Queue | İşlerin sıraya alınması |
| Worker | Queue'daki işleri işleyen süreç |
| Event | Sistem içinde gerçekleşen olay |
| Observability | Sistemin dışarıdan davranışını anlayabilme |
| Logging | Olay kayıtları |
| Metrics | Sayısal sistem ölçümleri |
| Tracing | Bir işlemin sistem boyunca izlenmesi |
| CI | Değişikliklerin otomatik test/kontrol edilmesi |
| CD | Release/deployment sürecinin otomasyonu |
| E2E | Kullanıcı akışını uçtan uca test etme |
| Offline-first | Network yokken de çalışmayı önceliklendirme |
| Modular Monolith | Tek deployment, net ayrılmış modüller |
| Microservice | Bağımsız deploy edilebilen servis |
| Event-driven | Sistemlerin olaylar üzerinden iletişim kurması |
| Domain Logic | Uygulamanın gerçek iş kuralları |
| Technical Debt | Hızlı/eksik teknik kararların gelecekte oluşturduğu maliyet |
| ADR | Mimari kararların kayıt altına alınması |

---

# Sonraki Adım

Bu dokümanı ezberlemeye çalışma.

Her konu için şu dört soruyu sor:

```text
1. Bu nedir?
2. Hangi problemi çözüyor?
3. Hangi durumda kullanılır?
4. Benim uygulamamda nerede karşıma çıkıyor?
```

Asıl öğrenme burada gerçekleşir.

Örneğin `idempotency` öğrenirken:

```text
Teori
 ↓
"Tekrar gönderilen request'in ikinci kez işlem
oluşturmasını engellemek"
 ↓
Calisthenics App
 ↓
"Workout completion iki kere kaydedilmesin"
 ↓
PostgreSQL UNIQUE constraint
+
server-side validation
 ↓
Gerçek deneyim
```

Bu yöntemle kavramlar soyut bilgi olmaktan çıkıp uygulamanın mimarisine dönüşür.
