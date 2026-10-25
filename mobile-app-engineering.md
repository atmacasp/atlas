# Mobil Uygulama Mühendisliği — Başucu Notları

> React Native + Expo + Supabase ile gerçek bir mobil ürün geliştirirken kullanılabilecek mimari, backend, veritabanı, güvenlik, performans, test ve DevOps referansı.

---

## İçindekiler

1. Yazılım Mimarisi
2. Domain Modeling ve DDD
3. React / React Native Mimarisi
4. Expo ve EAS
5. State Management
6. Backend ve API Tasarımı
7. PostgreSQL ve Veritabanı Mühendisliği
8. Supabase
9. Authentication ve Authorization
10. Networking
11. Cache ve Offline-first
12. Güvenlik
13. Testing
14. Performance Engineering
15. Observability
16. Analytics ve Product Engineering
17. CI/CD ve Release Engineering
18. Background Jobs, Queues ve Event-driven Architecture
19. Push Notifications ve Deep Linking
20. Dependency Management
21. System Design
22. ADR ve Teknik Karar Yönetimi
23. Cloud / DevOps
24. Distributed Systems
25. Öğrenme Sırası
26. Calisthenics App'e Uygulama
27. Hızlı Referans / Sözlük

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

# 3. React / React Native Mimarisi

## 3.1 React'in temel problemi

React component'leri state ve props değiştikçe yeniden render edebilir.

Önemli soru:

> Hangi component neden render oldu?

Bunu anlamak performans optimizasyonunun temelidir.

---

## 3.2 JS Thread / UI Thread

React Native uygulamasında JavaScript kodu ile native/UI tarafı farklı sorumluluklara sahiptir.

JS tarafında:

- business logic
- state
- event handling
- network işlemleri

gibi işler bulunabilir.

UI tarafı ise ekranın çizilmesi ve native interaction'larla ilgilidir.

Ağır JS işleri kullanıcı etkileşimini geciktirebilir.

---

## 3.3 JSI

JSI, JavaScript ile native C++/native dünyasının daha doğrudan iletişim kurabilmesini sağlayan altyapılardan biridir.

React Native'in modern mimarisinin önemli parçalarındandır.

---

## 3.4 Fabric

React Native'in modern rendering architecture'ıdır.

UI rendering tarafında daha modern ve performans odaklı bir altyapı sağlar.

---

## 3.5 TurboModules

Native module'lerin modern React Native architecture içindeki yaklaşımıdır.

Örneğin bir native capability'yi JavaScript tarafından kullanmak istediğinde native module sistemi devreye girebilir.

---

## 3.6 Hermes

React Native için kullanılan JavaScript engine'lerinden biridir.

Amaçlar arasında:

- startup performance
- memory efficiency
- React Native entegrasyonu

bulunur.

---

# 4. Expo ve EAS

Expo yalnızca `npx expo start` değildir.

Expo ekosisteminde:

```text
Expo
 ├── Expo Router
 ├── Expo SDK
 ├── Development Builds
 ├── EAS Build
 ├── EAS Submit
 └── EAS Update
```

gibi parçalar bulunur.

## Development Build

Expo Go'dan daha kontrollü native environment sağlar.

## EAS Build

Android/iOS build süreçlerini yönetmeye yardımcı olur.

## EAS Update

Native binary değiştirmeden uygun JavaScript/assets güncellemelerini dağıtmak için kullanılabilir.

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

# 6. Backend ve API Tasarımı

## 6.1 HTTP

Temel kavramlar:

```text
GET
POST
PUT
PATCH
DELETE
```

Status codes:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Content
429 Too Many Requests
500 Internal Server Error
```

---

## 6.2 Authentication

Kullanıcı kim?

Örneğin:

```text
login
 ↓
session
 ↓
access token
 ↓
authenticated request
```

---

## 6.3 Authorization

Kullanıcı ne yapabilir?

Örneğin:

```text
User A
 ↓
Program X
 ↓
editable = true
```

ama:

```text
User A
 ↓
User B's Program
 ↓
editable = false
```

Authentication ile authorization birbirinden ayrılmalıdır.

---

## 6.4 Idempotency

Aynı isteğin tekrar gönderilmesi sonucu sistemin yanlışlıkla ikinci kez işlem yapmamasıdır.

Örneğin:

```text
Workout complete
 ↓
request timeout
 ↓
client retry
```

Eğer backend iki ayrı completion oluşturuyorsa sorun vardır.

Çözüm yöntemleri:

- unique constraint
- idempotency key
- transaction
- server-side deduplication

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

# 8. Supabase

Supabase'i tek bir ürün değil, backend platformu olarak düşün.

Temel parçalar:

```text
PostgreSQL
Auth
Storage
Realtime
Edge Functions
```

## RLS

Row Level Security database seviyesinde authorization politikaları uygulamana yardımcı olur.

Örneğin:

```text
user_id = auth.uid()
```

mantığıyla kullanıcının yalnızca kendi kayıtlarına erişmesini sağlayabilirsin.

Önemli:

> UI'daki `if` kontrolü güvenlik değildir. Database/backend authorization güvenlik sınırıdır.

---

# 9. Authentication ve Authorization

## Authentication

"Sen kimsin?"

## Authorization

"Ne yapmana izin var?"

Örneğin:

```text
User login yaptı
```

authentication.

```text
Bu programı düzenleyebilir mi?
```

authorization.

Authorization katmanları:

```text
UI
 ↓
API / Service
 ↓
Database / RLS
```

Savunma katmanları birden fazla olabilir.

---

# 10. Networking

Mobil network güvenilmezdir.

Şunlar olabilir:

```text
timeout
offline
DNS failure
server error
connection switch
app background
request duplication
```

Bu yüzden:

- timeout
- retry
- exponential backoff
- cancellation
- optimistic update
- pagination
- error handling

önemlidir.

---

## Retry

Her hatayı tekrar denemek doğru değildir.

Örneğin:

```text
500
```

yeniden denenebilir.

Ama:

```text
400 validation error
```

genellikle tekrar denenmemelidir.

---

# 11. Cache ve Offline-first

## Cache

Daha önce alınmış veriyi tekrar kullanmaktır.

Örneğin movement library sürekli değişmiyorsa her açılışta yeniden çekmek gereksiz olabilir.

Cache stratejileri:

```text
memory
local storage
database
server cache
CDN
```

---

## Cache Invalidation

Cache'in ne zaman geçersiz sayılacağıdır.

Örneğin:

```text
Program güncellendi
 ↓
eski cache artık geçersiz
```

Cache tasarımının en zor taraflarından biridir.

---

## Offline-first

Kullanıcı internet olmadan işlem yapabilir:

```text
Workout
 ↓
Local database
 ↓
Internet geldi
 ↓
Sync
 ↓
Supabase
```

Burada:

- conflict resolution
- sync queue
- retry
- deduplication

gibi problemler ortaya çıkar.

---

# 12. Güvenlik

## Client'a güvenme

Şu:

```ts
if (user.isPremium) {
  showPremiumFeature();
}
```

UI kontrolüdür.

Kullanıcı uygulamayı manipüle edebilir.

Premium yetkisinin kritik işlemlerde server tarafında doğrulanması gerekir.

---

## Secure Storage

Token veya hassas credential'lar için platformun güvenli storage mekanizmaları tercih edilir.

Android tarafında Keystore ekosistemi, iOS tarafında Keychain ekosistemi önemlidir.

---

## Input Validation

Kullanıcıdan gelen hiçbir veri otomatik olarak güvenilir kabul edilmemelidir.

Validation:

```text
client
+
server
+
database constraints
```

katmanlarında uygulanabilir.

---

## Rate Limiting

Kötüye kullanımı sınırlamak için:

```text
1000 requests / second
```

gibi sınırlamalar uygulanabilir.

Login, OTP, password reset, public API ve pahalı işlemlerde özellikle önemlidir.

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

# 15. Observability

Production'daki uygulamayı anlayabilmek için:

```text
Logs
Metrics
Traces
Errors
```

kullanılır.

---

## Error Tracking

Örneğin Sentry gibi araçlarla:

```text
error
device
OS
app version
stack trace
user context
```

incelenebilir.

---

## Structured Logging

Şunun yerine:

```text
Workout failed
```

daha yapılandırılmış veri:

```text
event: workout_complete_failed
user_id: ...
workout_id: ...
duration_ms: ...
error_code: ...
```

gibi tutulabilir.

---

## Performance Monitoring

Örneğin:

```text
screen load = 1.8s
API latency = 420ms
database query = 180ms
```

gibi metrikleri izlemek darboğaz bulmayı kolaylaştırır.

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

# 19. Push Notifications ve Deep Linking

Push notification akışı kabaca:

```text
Backend
 ↓
Push provider
 ↓
Apple/Google infrastructure
 ↓
Device
 ↓
App
```

Önemli kavramlar:

- device token
- permissions
- notification categories
- deep links
- foreground/background behavior
- notification routing

Örneğin:

```text
"Workout zamanın geldi"
```

bildirimine tıklanınca doğrudan:

```text
/workout/today
```

ekranına geçilebilir.

---

# 20. Dependency Management

Modern mobil uygulama çok sayıda dependency kullanabilir.

Örneğin:

```text
React Native
Expo
Supabase
Sentry
RevenueCat
Notifications
Analytics
```

Öğren:

- semantic versioning
- lockfiles
- peer dependencies
- transitive dependencies
- vulnerability scanning
- bundle impact
- dependency updates

Her dependency'nin bir bakım maliyeti vardır.

> Bir paketi sadece "kolay olduğu için" eklemek yerine, uzun vadeli maliyetini de düşün.

---

# 21. System Design

System design, "bir özellik nasıl kodlanır?" sorusundan daha büyüktür.

Örnek:

> 1 milyon kullanıcı aynı anda workout tamamlıyor. Ne olur?

Düşün:

```text
Mobile
 ↓
API
 ↓
Load balancing
 ↓
Application
 ↓
Queue
 ↓
Workers
 ↓
Database
 ↓
Cache
```

Sorular:

- Nerede bottleneck oluşur?
- Database kaldırabilir mi?
- Cache gerekli mi?
- İşlem synchronous mı olmalı?
- Queue kullanılmalı mı?
- Retry nasıl yapılacak?
- Duplicate request nasıl engellenecek?

---

# 22. ADR — Architecture Decision Record

Önemli teknik kararları kaydet.

Örnek:

```text
ADR-001

Context:
Workout completion işlemleri kritik.

Decision:
Progression unlock kontrolü server-side yapılacak.

Alternatives:
Client-side calculation
Database trigger
Edge Function

Consequences:
Daha güvenli.
Biraz daha fazla backend complexity.
```

Bu kayıtlar projenin mimari hafızasını oluşturur.

---

# 23. Cloud / DevOps

Temel altyapı kavramları:

```text
DNS
TLS
CDN
Reverse Proxy
Load Balancer
Container
Object Storage
Serverless
Database
Queue
Worker
```

Docker öğrenmek bu dünyayı anlamayı kolaylaştırır.

Cloud platformlarında:

- AWS
- GCP
- Azure
- Cloudflare

gibi ekosistemler bulunur.

Hepsini uzman seviyesinde öğrenmek gerekmez.

---

# 24. Distributed Systems

Daha ileri seviye konular:

## CAP

Distributed sistemlerde consistency, availability ve partition tolerance arasındaki trade-off'ları anlamaya yardımcı olan temel modeldir.

## Eventual Consistency

Bir sistemin tüm kopyalarının anında aynı değerde olması yerine zaman içinde aynı duruma ulaşmasıdır.

## Retry

Network hatalarında tekrar deneme.

Ama retry duplicate işlem oluşturabilir.

Bu yüzden:

```text
retry
+
idempotency
```

birlikte düşünülmelidir.

## Concurrency

Aynı veriye aynı anda birden fazla işlem eriştiğinde ortaya çıkan problemlerdir.

Örneğin iki request aynı anda:

```text
progression unlock
```

yapmaya çalışabilir.

---

# 25. Öğrenme Sırası

## Aşama 1 — Şimdi

```text
1. Software Architecture
2. PostgreSQL
3. Database Indexing
4. RLS / Authorization
5. State Management
6. Networking
7. Error Handling
8. Testing
9. Git
10. React Native Performance
```

## Aşama 2

```text
11. System Design
12. Caching
13. Offline-first
14. Background Jobs
15. Queues
16. Event-driven Architecture
17. Observability
18. CI/CD
19. Security
20. Domain Modeling
```

## Aşama 3

```text
21. Distributed Systems
22. Docker
23. Cloud Architecture
24. Advanced PostgreSQL
25. Infrastructure as Code
26. Event Streaming
27. Kubernetes
28. Microservices
```

### Önemli

Microservices ve Kubernetes'e çok erken atlama.

Gerçek bir ürün için:

```text
Modular Monolith
+
PostgreSQL
+
iyi authorization
+
test
+
observability
+
CI/CD
```

çoğu erken aşama ürün için microservices'ten daha değerli olabilir.

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

# 27. Hızlı Referans / Sözlük

| Kavram | Kısa anlam |
|---|---|
| Architecture | Sistemin üst düzey yapısı |
| Domain | Çözülen problem alanı |
| Entity | Kimliği olan domain nesnesi |
| Value Object | Değeriyle tanımlanan nesne |
| Service | Belirli bir iş davranışını gerçekleştiren katman |
| Repository | Veri erişimini abstraction altında toplar |
| Authentication | Kullanıcı kim? |
| Authorization | Kullanıcı ne yapabilir? |
| RLS | Database seviyesinde satır erişim politikası |
| API | Sistemler arası iletişim arayüzü |
| REST | HTTP kaynakları üzerinden API tasarım yaklaşımı |
| JWT | Token tabanlı veri taşıma formatı |
| Idempotency | Aynı işlemin tekrarının güvenli olması |
| Cache | Daha hızlı erişim için geçici/kopya veri |
| Queue | İşlerin sıraya alınması |
| Worker | Queue'daki işleri işleyen süreç |
| Event | Sistem içinde gerçekleşen olay |
| Observability | Sistemin dışarıdan davranışını anlayabilme |
| Logging | Olay kayıtları |
| Metrics | Sayısal sistem ölçümleri |
| Tracing | Bir işlemin sistem boyunca izlenmesi |
| CI | Değişikliklerin otomatik test/kontrol edilmesi |
| CD | Release/deployment sürecinin otomasyonu |
| E2E | Kullanıcı akışını uçtan uca test etme |
| Offline-first | Network yokken de çalışmayı önceliklendirme |
| Modular Monolith | Tek deployment, net ayrılmış modüller |
| Microservice | Bağımsız deploy edilebilen servis |
| Event-driven | Sistemlerin olaylar üzerinden iletişim kurması |
| Domain Logic | Uygulamanın gerçek iş kuralları |
| Technical Debt | Hızlı/eksik teknik kararların gelecekte oluşturduğu maliyet |
| ADR | Mimari kararların kayıt altına alınması |

---

# Sonraki Adım

Bu dokümanı ezberlemeye çalışma.

Her konu için şu dört soruyu sor:

```text
1. Bu nedir?
2. Hangi problemi çözüyor?
3. Hangi durumda kullanılır?
4. Benim uygulamamda nerede karşıma çıkıyor?
```

Asıl öğrenme burada gerçekleşir.

Örneğin `idempotency` öğrenirken:

```text
Teori
 ↓
"Tekrar gönderilen request'in ikinci kez işlem
oluşturmasını engellemek"
 ↓
Calisthenics App
 ↓
"Workout completion iki kere kaydedilmesin"
 ↓
PostgreSQL UNIQUE constraint
+
server-side validation
 ↓
Gerçek deneyim
```

Bu yöntemle kavramlar soyut bilgi olmaktan çıkıp uygulamanın mimarisine dönüşür.
