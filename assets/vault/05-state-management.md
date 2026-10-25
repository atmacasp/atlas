---
title: "State Management"
type: concept
source: mobile-app-engineering.md
---

# 5. State Management

State'i türlerine ayırmak çok önemlidir.

## 5.1 Local UI State

Örneğin:

```text
isModalOpen
selectedTab
isExpanded
```

Genellikle component seviyesinde tutulabilir.

---

## 5.2 Client State

Uygulamanın istemci tarafındaki durumudur.

Örneğin:

```text
selectedWorkoutMode
currentFilters
```

---

## 5.3 Server State

Backend'den gelen veridir:

```text
programs
workout history
movement library
progression data
```

Server state ile UI state'i aynı şey değildir.

---

## 5.4 Persistent State

Uygulama kapanınca da korunması gereken state:

```text
onboardingCompleted
theme
local preferences
```

---

## 5.5 Derived State

Başka state'lerden hesaplanabilen değerdir.

Örneğin:

```text
completedSets / totalSets
```

Bunu gereksiz yere ayrıca state olarak saklamak consistency sorunları doğurabilir.

---
