---
title: "Distributed Systems"
type: concept
source: mobile-app-engineering.md
---

# 24. Distributed Systems

Daha ileri seviye konular:

## CAP

Distributed sistemlerde consistency, availability ve partition tolerance arasındaki trade-off'ları anlamaya yardımcı olan temel modeldir.

## Eventual Consistency

Bir sistemin tüm kopyalarının anında aynı değerde olması yerine zaman içinde aynı duruma ulaşmasıdır.

## Retry

Network hatalarında tekrar deneme.

Ama retry duplicate işlem oluşturabilir.

Bu yüzden:

```text
retry
+
idempotency
```

birlikte düşünülmelidir.

## Concurrency

Aynı veriye aynı anda birden fazla işlem eriştiğinde ortaya çıkan problemlerdir.

Örneğin iki request aynı anda:

```text
progression unlock
```

yapmaya çalışabilir.

---
