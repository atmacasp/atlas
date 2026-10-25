---
title: "Push Notifications ve Deep Linking"
type: concept
source: mobile-app-engineering.md
---

# 19. Push Notifications ve Deep Linking

Push notification akışı kabaca:

```text
Backend
 ↓
Push provider
 ↓
Apple/Google infrastructure
 ↓
Device
 ↓
App
```

Önemli kavramlar:

- device token
- permissions
- notification categories
- deep links
- foreground/background behavior
- notification routing

Örneğin:

```text
"Workout zamanın geldi"
```

bildirimine tıklanınca doğrudan:

```text
/workout/today
```

ekranına geçilebilir.

---
