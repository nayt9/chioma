# Rate Limiting

Chioma uses NestJS Throttler to protect all endpoints from abuse. Rate limits are applied per IP address (and per authenticated user for protected endpoints).

---

## Default Limits

| Endpoint group                   | Window     | Max requests | Notes          |
| -------------------------------- | ---------- | ------------ | -------------- |
| All endpoints                    | 1 minute   | 100          | Global default |
| `POST /api/auth/login`           | 15 minutes | 10           | Per IP         |
| `POST /api/auth/register`        | 1 hour     | 5            | Per IP         |
| `POST /api/auth/forgot-password` | 1 hour     | 3            | Per IP         |
| `POST /api/payments`             | 1 minute   | 20           | Per user       |
| `POST /api/auth/stellar/*`       | 1 minute   | 30           | Per IP         |
| `GET /api/*` (read operations)   | 1 minute   | 200          | Per user       |

---

## Response Headers

Every response includes rate-limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1712053860
Retry-After: 23          ← only present when limit is exceeded
```

| Header                  | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `X-RateLimit-Limit`     | Maximum requests allowed in the current window |
| `X-RateLimit-Remaining` | Requests remaining in the current window       |
| `X-RateLimit-Reset`     | Unix timestamp when the window resets          |
| `Retry-After`           | Seconds to wait before retrying (only on 429)  |

---

## Rate Limit Exceeded Response

```json
{
  "statusCode": 429,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please wait 23 seconds before retrying.",
  "timestamp": "2025-04-01T09:30:00Z",
  "path": "/api/auth/login"
}
```

---

## Client Retry Strategy

Use exponential back-off when a 429 is received:

```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch(url, options);
    if (res.status !== 429) return res;

    const retryAfter = parseInt(res.headers.get('Retry-After') ?? '5', 10);
    const delay = retryAfter * 1000 * Math.pow(2, attempt); // exponential
    await new Promise((r) => setTimeout(r, delay));
  }
  throw new Error('Rate limit retry budget exhausted');
}
```

---

## Documenting Rate Limits on Endpoints

Every rate-limited endpoint should declare the `Retry-After` header in Swagger:

```typescript
@ApiResponse({
  status: 429,
  description: 'Too many requests',
  headers: {
    'Retry-After': {
      description: 'Seconds until the rate limit window resets',
      schema: { type: 'integer', example: 30 },
    },
  },
})
```
