---
title: "Güvenlik"
type: concept
source: mobile-app-engineering.md
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
