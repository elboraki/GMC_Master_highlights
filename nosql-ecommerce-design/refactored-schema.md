# Refactored Schema — Analytics & High Availability

## New Requirements

1. **Analytics** — run large-scale queries on product trends and sales data.
2. **High Availability** — guarantee availability and partition tolerance under user growth.

## Design Strategy

| Strategy | Application |
|---|---|
| **Sharding** | Distribute `orders` and `analytics_events` across nodes by `user_id` and `timestamp`. |
| **Replication** | `w=majority` writes; replica sets with 3 nodes each for automatic failover. |
| **Denormalization** | Pre-aggregated collections for fast analytical queries without impacting transactional workload. |

## Refactored Schema

### Orders (unchanged document structure, now sharded)
```json
{
  "_id": ObjectId,
  "order_id": "ORD-8821",
  "user_id": ObjectId,
  "customer": { ... },
  "items": [ ... ],
  "total_amount": 79.99,
  "status": "shipped",
  "delivery_status": "in_transit",
  "created_at": ISODate,
  "updated_at": ISODate
}
```
- **Shard key:** `{ "user_id": "hashed" }` — even distribution of writes.
- **Routers:** Mongos proxies distribute queries to the correct shard.

### Product Catalog (unchanged, replicated across AZs)
```json
{
  "_id": ObjectId,
  "sku": "PRD-1001",
  "name": "Wireless Headphones",
  "description": "Noise-cancelling Bluetooth headphones",
  "category": "Electronics",
  "price": 79.99,
  "stock": 250,
  "tags": ["headphones", "bluetooth", "audio"]
}
```
- **Replica:** 3 nodes across availability zones for high availability.

### Daily Sales Aggregates (new denormalized collection)
```json
{
  "_id": ObjectId,
  "date": "2026-06-01",
  "category": "Electronics",
  "product_id": ObjectId,
  "product_name": "Wireless Headphones",
  "total_sold": 142,
  "total_revenue": 11358.58,
  "avg_price": 79.99,
  "by_status": {
    "completed": 130,
    "refunded": 8,
    "cancelled": 4
  }
}
```
- **Index:** `{ "date": 1, "category": 1 }`
- **Population:** Periodic batch job (e.g., hourly) from raw `orders` data.
- **Purpose:** Answers "What were the top-selling products last week?" in milliseconds instead of scanning millions of orders.

### Real-Time Analytics Events (time-series collection)
```json
{
  "_id": ObjectId,
  "event": "product_view",
  "product_id": ObjectId,
  "user_id": ObjectId,
  "timestamp": ISODate,
  "metadata": { "source": "search", "session_id": "abc123" }
}
```
- **TTL index:** Auto-delete events older than 90 days.
- **Shard key:** `{ "timestamp": 1 }` — range-based sharding for time-series data.

## Availability & Partition Tolerance

| Concern | Implementation |
|---|---|
| High Availability | Replica sets with 3 members per shard; automatic failover < 5s. |
| Partition Tolerance | Reads from secondaries allowed (eventual consistency) when primary is unreachable. |
| Write Safety | `w: "majority"` + `j: true` for critical order writes; `w: 1` for analytics events. |
| Read Preference | `primaryPreferred` for orders, `secondaryPreferred` for catalog and aggregates. |

## Query Examples

**Analytics — Top 5 categories by revenue (last 30 days):**
```js
db.daily_sales_aggregates.aggregate([
  { $match: { date: { $gte: past30days } } },
  { $group: { _id: "$category", totalRevenue: { $sum: "$total_revenue" } } },
  { $sort: { totalRevenue: -1 } },
  { $limit: 5 }
])
```

**Real-time — product views per hour:**
```js
db.analytics_events.aggregate([
  { $match: { event: "product_view", timestamp: { $gte: past1hour } } },
  { $group: { _id: { $dateToString: { format: "%Y-%m-%d-%H", date: "$timestamp" } }, count: { $sum: 1 } } }
])
```
