---
title: "CI/CD ve Release Engineering"
type: concept
source: mobile-app-engineering.md
---

# 17. CI/CD ve Release Engineering

Kodun:

```text
Git
 ↓
CI
 ↓
Test
 ↓
Lint
 ↓
Typecheck
 ↓
Build
 ↓
Release
```

akışından geçebilir.

---

## CI

Continuous Integration.

Her değişiklikte otomatik kontroller:

```text
npm test
tsc
eslint
```

---

## CD

Continuous Delivery / Deployment.

Başarılı değişikliklerin release sürecinin otomatikleştirilmesi.

---

## Environments

En azından mantıksal olarak:

```text
development
staging
production
```

ayrımını düşün.

Production database'i üzerinde deney yapmak tehlikelidir.

---
