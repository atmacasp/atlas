---
title: "Performance Engineering"
type: concept
source: mobile-app-engineering.md
---

# 14. Performance Engineering

Performansı sadece React'e indirgeme.

```text
Performance
 ├── UI
 ├── JavaScript
 ├── Native
 ├── Network
 ├── Backend
 ├── Database
 ├── Images
 └── Device
```

---

## React Performance

Önce problemi ölç.

Sonra:

- component boundaries
- state locality
- memoization
- stable references
- list virtualization

gibi teknikleri değerlendir.

`useMemo` veya `useCallback` her yerde kullanılacak performans ilacı değildir.

---

## Mobil liste performansı

Büyük listelerde:

- virtualization
- pagination
- lazy loading
- image caching

önemlidir.

---

## Memory

Bellek sızıntıları ve gereksiz büyük object/image kullanımı düşük donanımlı cihazlarda ciddi sorun yaratabilir.

---
