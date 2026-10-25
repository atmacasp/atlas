---
title: "ADR — Architecture Decision Record"
type: concept
source: mobile-app-engineering.md
---

# 22. ADR — Architecture Decision Record

Önemli teknik kararları kaydet.

Örnek:

```text
ADR-001

Context:
Workout completion işlemleri kritik.

Decision:
Progression unlock kontrolü server-side yapılacak.

Alternatives:
Client-side calculation
Database trigger
Edge Function

Consequences:
Daha güvenli.
Biraz daha fazla backend complexity.
```

Bu kayıtlar projenin mimari hafızasını oluşturur.

---
