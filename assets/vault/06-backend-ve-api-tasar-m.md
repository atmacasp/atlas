---
title: "Backend ve API Tasarımı"
type: concept
source: mobile-app-engineering.md
---

# 6. Backend ve API Tasarımı

## 6.1 HTTP

Temel kavramlar:

```text
GET
POST
PUT
PATCH
DELETE
```

Status codes:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Content
429 Too Many Requests
500 Internal Server Error
```

---

## 6.2 Authentication

Kullanıcı kim?

Örneğin:

```text
login
 ↓
session
 ↓
access token
 ↓
authenticated request
```

---

## 6.3 Authorization

Kullanıcı ne yapabilir?

Örneğin:

```text
User A
 ↓
Program X
 ↓
editable = true
```

ama:

```text
User A
 ↓
User B's Program
 ↓
editable = false
```

Authentication ile authorization birbirinden ayrılmalıdır.

---

## 6.4 Idempotency

Aynı isteğin tekrar gönderilmesi sonucu sistemin yanlışlıkla ikinci kez işlem yapmamasıdır.

Örneğin:

```text
Workout complete
 ↓
request timeout
 ↓
client retry
```

Eğer backend iki ayrı completion oluşturuyorsa sorun vardır.

Çözüm yöntemleri:

- unique constraint
- idempotency key
- transaction
- server-side deduplication

---
