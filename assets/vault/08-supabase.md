---
title: "Supabase"
type: concept
source: mobile-app-engineering.md
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
