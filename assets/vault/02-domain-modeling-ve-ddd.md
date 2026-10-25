---
title: "Domain Modeling ve DDD"
type: concept
source: mobile-app-engineering.md
---

# 2. Domain Modeling ve DDD

## 2.1 Domain nedir?

Uygulamanın çözmeye çalıştığı gerçek problem alanıdır.

Senin uygulamanda:

```text
User
Program
Workout
WorkoutSession
Exercise
Set
Rep
Movement
Skill
Progression
Achievement
Subscription
Muscle
```

domain nesneleridir.

---

## 2.2 Entity

Kimliği önemli olan nesnedir.

Örneğin:

```text
WorkoutSession
id = 123
```

Aynı özelliklere sahip iki session yine farklı entity'lerdir çünkü kimlikleri farklıdır.

---

## 2.3 Value Object

Kimliği yerine değeri önemli olan kavramdır.

Örneğin:

```text
Duration(15 seconds)
Weight(10 kg)
Percentage(75%)
```

İki `Duration(15s)` aynı değeri temsil eder.

---

## 2.4 Bounded Context

Aynı kelime farklı domain'lerde farklı anlamlara gelebilir.

Örneğin `Program`:

```text
Workout Program
Subscription Program
Training Program
```

Domain sınırlarını netleştirmek karmaşıklığı azaltır.

---

## 2.5 Business Logic

Business logic kullanıcı arayüzü değildir.

Örneğin:

```text
Kullanıcı 15 saniye advanced tuck tuttu
        ↓
Skill progression şartları kontrol edilir
        ↓
Straddle progression açılır
```

Bu kural UI component'inde bulunmamalıdır.

---
