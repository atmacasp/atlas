---
title: "PostgreSQL ve Veritabanı Mühendisliği"
type: concept
source: mobile-app-engineering.md
---

# 7. PostgreSQL ve Veritabanı Mühendisliği

## 7.1 Relational Modeling

Tablolar arasındaki ilişkileri doğru tasarlamak önemlidir.

Örneğin:

```text
users
programs
program_exercises
workout_sessions
workout_sets
```

---

## 7.2 Normalization

Veriyi gereksiz tekrar etmeden ilişkisel biçimde organize etmektir.

Ama normalization dogma değildir.

Performans veya kullanım modeli gerektiriyorsa kontrollü denormalization yapılabilir.

---

## 7.3 Constraints

Database business rule'larının bir kısmını database'e koymak güvenlidir.

Örneğin:

```text
NOT NULL
UNIQUE
FOREIGN KEY
CHECK
```

Client validation tek başına güvenlik değildir.

---

## 7.4 Index

Index bir sorguyu hızlandırabilir ancak ücretsiz değildir.

Avantaj:

```text
SELECT ... WHERE user_id = ?
```

daha hızlı olabilir.

Maliyet:

- disk kullanımı
- INSERT/UPDATE maliyeti
- bakım maliyeti

Her kolona index koymak doğru değildir.

---

## 7.5 Composite Index

Birden fazla kolonun birlikte sorgulandığı durumlarda kullanılabilir.

Örneğin:

```text
(user_id, created_at)
```

---

## 7.6 EXPLAIN ANALYZE

Bir PostgreSQL sorgusunun nasıl çalıştırıldığını anlamanın temel araçlarından biridir.

Şunları inceleyebilirsin:

- sequential scan
- index scan
- join strategy
- estimated rows
- actual rows
- execution time

---

## 7.7 Transactions

Birden fazla database işleminin tek bir atomik işlem gibi ele alınmasını sağlar.

Örneğin:

```text
WorkoutSession oluştur
+
Set kayıtlarını oluştur
+
Progression güncelle
```

bunların bir kısmı başarılı bir kısmı başarısız olursa veri tutarsızlaşabilir.

Transaction burada önemlidir.

---
