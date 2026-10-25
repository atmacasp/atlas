---
title: "Yazılım Mimarisi"
type: concept
source: mobile-app-engineering.md
---

# 1. Yazılım Mimarisi

## 1.1 Architecture nedir?

Yazılım mimarisi, uygulamanın parçalarının nasıl organize edildiğini ve birbirleriyle nasıl iletişim kurduğunu belirleyen üst düzey tasarımdır.

Syntax:

```ts
const result = foo();
```

mimari değildir.

Mimari sorular şunlardır:

- Bu kod hangi katmanda bulunmalı?
- UI doğrudan veritabanına erişmeli mi?
- Business logic nerede bulunmalı?
- Bir özellik başka bir özelliğe ne kadar bağımlı?
- Database değişirse kaç dosya etkilenir?
- Test etmek ne kadar kolay?
- Yeni geliştirici sistemi ne kadar hızlı anlayabilir?

İyi mimarinin amacı daha fazla klasör oluşturmak değil, **değişimin maliyetini düşürmektir.**

---

## 1.2 Separation of Concerns

Her parçanın mümkün olduğunca tek bir sorumluluğa odaklanmasıdır.

Kötü:

```text
WorkoutScreen
 ├─ UI
 ├─ Supabase query
 ├─ progression calculation
 ├─ validation
 ├─ analytics
 └─ notification
```

Daha sağlıklı:

```text
WorkoutScreen
    ↓
useWorkout()
    ↓
WorkoutService
    ↓
WorkoutRepository
    ↓
Supabase
```

UI'nin verinin nereden geldiğini bilmesi gerekmez.

---

## 1.3 Layered Architecture

Klasik yaklaşım:

```text
Presentation
    ↓
Application
    ↓
Domain
    ↓
Infrastructure
```

### Presentation

Ekranlar, componentler, kullanıcı etkileşimleri.

### Application

Use-case'ler ve orkestrasyon.

Örneğin:

```text
CompleteWorkout
StartWorkout
UpgradeProgram
UnlockSkill
```

### Domain

Uygulamanın iş kuralları.

Örneğin:

```text
Advanced Tuck Planche
ancak kullanıcı 15 saniyelik gerekli koşulu sağladıysa açılır.
```

Bu kural UI'ye ait değildir.

### Infrastructure

Database, API, storage, external service gibi dış dünya entegrasyonları.

---

## 1.4 Clean Architecture

Clean Architecture'ın temel fikri dependency'lerin içeriye doğru akmasıdır.

```text
UI
 ↓
Application
 ↓
Domain
 ↑
Infrastructure
```

Domain mümkün olduğunca framework/database bağımsız tutulur.

Avantajları:

- test edilebilirlik
- değiştirilebilirlik
- bağımlılıkların kontrolü
- business logic'in korunması

Dezavantajı:

- küçük projelerde gereksiz abstraction üretebilir
- fazla katman boilerplate oluşturabilir

Her projeye tam Clean Architecture uygulamak zorunda değilsin.

---

## 1.5 Modular Monolith

Senin uygulaman için çok önemli bir kavramdır.

Tek bir uygulama/backend vardır ama domain'ler modüllere ayrılır:

```text
app
├── auth
├── workouts
├── programs
├── movements
├── progression
├── achievements
├── subscriptions
└── analytics
```

Bunlar birbirinden mantıksal olarak ayrıdır ama deployment tek sistem olabilir.

Microservice değildir.

### Neden iyi?

- daha az operasyonel karmaşa
- daha kolay deployment
- transaction yönetimi daha kolay
- domain sınırları korunabilir

İlk gerçek ürünlerde çoğu zaman microservices yerine iyi tasarlanmış modular monolith daha mantıklıdır.

---

## 1.6 SOLID

### S — Single Responsibility

Bir sınıf/modülün değişmesi için tek ana nedeni olmalı.

### O — Open/Closed

Yeni davranış eklemek mevcut kodu sürekli değiştirmeyi gerektirmemeli.

### L — Liskov Substitution

Alt tür, üst türün beklenen davranışını bozmayacak şekilde kullanılabilmeli.

### I — Interface Segregation

Devasa interface'ler yerine amaca yönelik küçük interface'ler.

### D — Dependency Inversion

Üst seviye business logic, somut altyapıya doğrudan bağlanmak yerine abstraction üzerinden çalışabilir.

---

## 1.7 Dependency Injection

Bir modülün ihtiyaç duyduğu bağımlılıkları kendi içinde oluşturmak yerine dışarıdan almasıdır.

Kötü:

```text
WorkoutService
   ↓
new SupabaseClient()
```

Daha esnek:

```text
WorkoutService
   ↓
WorkoutRepository
```

Repository'nin gerçek implementasyonu Supabase olabilir; testte fake repository kullanılabilir.

---
