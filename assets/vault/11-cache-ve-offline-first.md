---
title: "Cache ve Offline-first"
type: concept
source: mobile-app-engineering.md
---

# 11. Cache ve Offline-first

## Cache

Daha önce alınmış veriyi tekrar kullanmaktır.

Örneğin movement library sürekli değişmiyorsa her açılışta yeniden çekmek gereksiz olabilir.

Cache stratejileri:

```text
memory
local storage
database
server cache
CDN
```

---

## Cache Invalidation

Cache'in ne zaman geçersiz sayılacağıdır.

Örneğin:

```text
Program güncellendi
 ↓
eski cache artık geçersiz
```

Cache tasarımının en zor taraflarından biridir.

---

## Offline-first

Kullanıcı internet olmadan işlem yapabilir:

```text
Workout
 ↓
Local database
 ↓
Internet geldi
 ↓
Sync
 ↓
Supabase
```

Burada:

- conflict resolution
- sync queue
- retry
- deduplication

gibi problemler ortaya çıkar.

---
