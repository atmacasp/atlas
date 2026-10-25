---
title: "Background Jobs, Queues ve Event-driven Architecture"
type: concept
source: mobile-app-engineering.md
---

# 18. Background Jobs, Queues ve Event-driven Architecture

## Background Job

Kullanıcıyı bekletmeden daha sonra yapılabilecek iş.

Örneğin:

```text
Workout complete
 ↓
response
 ↓
background processing
```

---

## Queue

İşleri sıraya koyar.

```text
Event
 ↓
Queue
 ↓
Worker
```

---

## Event-driven Architecture

Bir olay gerçekleşir:

```text
workout_completed
```

Sonrasında:

```text
        workout_completed
          /      |       \
         /       |        \
progression  achievement  analytics
```

çalışabilir.

Avantajı coupling'i azaltabilmesidir.

---
