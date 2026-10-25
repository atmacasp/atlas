---
title: "Networking"
type: concept
source: mobile-app-engineering.md
---

# 10. Networking

Mobil network güvenilmezdir.

Şunlar olabilir:

```text
timeout
offline
DNS failure
server error
connection switch
app background
request duplication
```

Bu yüzden:

- timeout
- retry
- exponential backoff
- cancellation
- optimistic update
- pagination
- error handling

önemlidir.

---

## Retry

Her hatayı tekrar denemek doğru değildir.

Örneğin:

```text
500
```

yeniden denenebilir.

Ama:

```text
400 validation error
```

genellikle tekrar denenmemelidir.

---
