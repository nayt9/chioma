# Pagination Standards

All list endpoints use **offset-based pagination** by default. High-throughput or append-only resources (e.g. audit logs, payment history) additionally support **cursor-based pagination**.

---

## Offset Pagination

### Query parameters

| Parameter | Type          | Default     | Description                                       |
| --------- | ------------- | ----------- | ------------------------------------------------- |
| `page`    | integer ≥ 1   | 1           | Page number                                       |
| `limit`   | integer 1–100 | 20          | Items per page                                    |
| `sort`    | string        | `createdAt` | Field to sort by. Prefix with `-` for descending. |

### Example request

```
GET /api/payments?page=2&limit=20&sort=-createdAt
```

### Response shape

```json
{
  "data": [
    { "id": "pay_01HN7K", "status": "COMPLETED", "amountStroops": 5000000000 }
  ],
  "meta": {
    "total": 142,
    "page": 2,
    "limit": 20,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": true
  }
}
```

### Swagger declaration

```typescript
@ApiQuery({ name: 'page',  required: false, type: Number, example: 1,  description: 'Page number (1-indexed)' })
@ApiQuery({ name: 'limit', required: false, type: Number, example: 20, description: 'Items per page (max 100)' })
@ApiQuery({ name: 'sort',  required: false, type: String, example: '-createdAt', description: 'Sort field; prefix with - for descending' })
@ApiResponse({ status: 200, type: PaginatedPaymentsDto })
@Get()
async list(@Query() query: PaginationQueryDto) {}
```

---

## Cursor Pagination

Used for streaming resources where total count is not required or page-jumping is not needed.

### Query parameters

| Parameter   | Type                    | Default   | Description                                              |
| ----------- | ----------------------- | --------- | -------------------------------------------------------- |
| `cursor`    | string                  | —         | Opaque cursor from the previous page's `meta.nextCursor` |
| `limit`     | integer 1–100           | 20        | Items per page                                           |
| `direction` | `forward` \| `backward` | `forward` | Scroll direction                                         |

### Example request

```
GET /api/audit-logs?cursor=eyJpZCI6InBheV8wMSJ9&limit=20
```

### Response shape

```json
{
  "data": [{ "id": "log_01HN7K", "action": "PAYMENT_CREATED" }],
  "meta": {
    "limit": 20,
    "nextCursor": "eyJpZCI6ImxvZ18wMiJ9",
    "previousCursor": "eyJpZCI6ImxvZ18wMCJ9",
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

Cursors are **opaque** base64-encoded strings — clients must not construct them manually.

---

## Choosing a Pagination Type

| Use case                               | Recommendation                                     |
| -------------------------------------- | -------------------------------------------------- |
| Admin tables, search results           | Offset — users need to jump to specific pages      |
| Audit logs, transaction history, feeds | Cursor — append-only, no page-jumping needed       |
| Real-time dashboards                   | Cursor with `direction: backward` for newest-first |
