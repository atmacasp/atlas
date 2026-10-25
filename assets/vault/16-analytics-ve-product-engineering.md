---
title: "Analytics ve Product Engineering"
type: concept
source: mobile-app-engineering.md
---

# 16. Analytics ve Product Engineering

Analytics sadece "kaç kişi uygulamayı açtı" değildir.

Event örnekleri:

```text
app_opened
workout_started
set_completed
workout_completed
program_created
skill_unlocked
premium_viewed
purchase_started
purchase_completed
```

---

## Funnel

Örneğin:

```text
1000 users
 ↓
700 workout başladı
 ↓
450 tamamladı
 ↓
180 ikinci workout yaptı
 ↓
50 premium ekranına gitti
 ↓
15 satın aldı
```

Burada hangi aşamada kullanıcı kaybettiğini anlayabilirsin.

---

## Feature Flags

Bir özelliği herkese aynı anda açmak zorunda değilsin.

```text
AI form analysis
 ↓
5%
 ↓
25%
 ↓
50%
 ↓
100%
```

Bu progressive rollout yaklaşımıdır.

---
