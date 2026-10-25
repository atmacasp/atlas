---
title: "Testing"
type: concept
source: mobile-app-engineering.md
---

# 13. Testing

## Unit Test

Tek bir davranışı test eder.

Örneğin:

```text
calculateProgression()
```

---

## Integration Test

Birden fazla parçanın birlikte çalışmasını test eder.

```text
Service
 ↓
Repository
 ↓
Database
```

---

## E2E

Gerçek kullanıcı akışını test eder:

```text
Login
 ↓
Program seç
 ↓
Workout başlat
 ↓
Set tamamla
 ↓
Workout bitir
 ↓
Progression güncellendi
```

---

## Test Piramidi

Genellikle:

```text
        E2E
       /   \
 Integration
     /       \
    Unit Tests
```

Unit testler daha hızlı ve çok sayıda olabilir.

---
