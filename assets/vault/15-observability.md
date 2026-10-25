---
title: "Observability"
type: concept
source: mobile-app-engineering.md
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
