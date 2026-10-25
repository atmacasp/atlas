---
title: "Calisthenics App'e Uygulama"
type: concept
source: mobile-app-engineering.md
---

# 26. Calisthenics App'e Uygulama

Senin uygulamanı örnek alırsak:

```text
                    Mobile App
                        │
          ┌─────────────┼─────────────┐
          ↓             ↓             ↓
        UI          Local State     Cache
          │             │             │
          └─────────────┼─────────────┘
                        ↓
                  Application
                     Services
                        ↓
                     Domain
                        ↓
                  Repository
                        ↓
                    Supabase
                        │
          ┌─────────────┼─────────────┐
          ↓             ↓             ↓
      PostgreSQL       Auth         Storage
          │
          ↓
          RLS
```

---

## Workout

```text
Workout
 ├── WorkoutSession
 ├── Exercise
 ├── Set
 ├── Rep
 └── Duration
```

---

## Progression

Örneğin:

```text
Advanced Tuck
      ↓
15 sec requirement
      ↓
Validation
      ↓
Unlock next skill
```

Buradaki kural domain/business logic'tir.

---

## Program Upgrade

```text
UI
 ↓
useProgramUpgrade()
 ↓
ProgramService
 ↓
authorization check
 ↓
database operation
 ↓
RLS
```

UI'de:

```text
editable === true
```

kontrolü UX içindir.

Asıl authorization server/database seviyesinde uygulanmalıdır.

---

## Premium

```text
Client
 ↓
UI
 ↓
Premium feature
```

yeterli değildir.

Kritik entitlement:

```text
Client
 ↓
Backend
 ↓
Revenue/Subscription provider
 ↓
Server-side entitlement
```

ile doğrulanabilir.

---

## AI Form Analysis

İleride:

```text
Camera
 ↓
Frame selection
 ↓
Pose / model inference
 ↓
Feature extraction
 ↓
Form evaluation
 ↓
Feedback
```

şeklinde ayrı bir pipeline oluşabilir.

Burada ayrıca:

- on-device inference
- server inference
- model size
- latency
- battery
- privacy
- GPU/NPU

gibi yeni system design problemleri ortaya çıkar.

---
