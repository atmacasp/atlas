---
title: "System Design"
type: concept
source: mobile-app-engineering.md
---

# 21. System Design

System design, "bir özellik nasıl kodlanır?" sorusundan daha büyüktür.

Örnek:

> 1 milyon kullanıcı aynı anda workout tamamlıyor. Ne olur?

Düşün:

```text
Mobile
 ↓
API
 ↓
Load balancing
 ↓
Application
 ↓
Queue
 ↓
Workers
 ↓
Database
 ↓
Cache
```

Sorular:

- Nerede bottleneck oluşur?
- Database kaldırabilir mi?
- Cache gerekli mi?
- İşlem synchronous mı olmalı?
- Queue kullanılmalı mı?
- Retry nasıl yapılacak?
- Duplicate request nasıl engellenecek?

---
