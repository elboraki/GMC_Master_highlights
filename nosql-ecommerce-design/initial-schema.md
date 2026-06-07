# Initial NoSQL Schema Design — E-Commerce Application

## 1. NoSQL Model Choice

**Document-based (MongoDB)** — chosen for flexible schema, rich queries, and native support for nested objects. It balances performance with developer productivity for an e-commerce catalog and order management system.

## 2. Key Entities & Schema

### Users
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "name": "Jane Doe",
  "password_hash": "...",
  "addresses": [
    { "street": "123 Main St", "city": "Springfield", "zip": "12345" }
  ],
  "created_at": ISODate
}
```
- **Index:** `email` (unique)

### Products (Catalog)
```json
{
  "_id": ObjectId,
  "sku": "PRD-1001",
  "name": "Wireless Headphones",
  "description": "Noise-cancelling Bluetooth headphones",
  "category": "Electronics",
  "price": 79.99,
  "stock": 250,
  "tags": ["headphones", "bluetooth", "audio"],
  "created_at": ISODate
}
```
- **Indexes:** `sku` (unique), `category`, `name` (text index for full-text search), `price`
- **Text search:** MongoDB text index on `name` and `description` fields.

### Orders
```json
{
  "_id": ObjectId,
  "order_id": "ORD-8821",
  "user_id": ObjectId,
  "customer": {
    "name": "Jane Doe",
    "email": "user@example.com",
    "shipping_address": { "street": "123 Main St", "city": "Springfield" }
  },
  "items": [
    { "product_id": ObjectId, "sku": "PRD-1001", "name": "Wireless Headphones", "qty": 1, "unit_price": 79.99 }
  ],
  "total_amount": 79.99,
  "status": "shipped",
  "delivery_status": "in_transit",
  "created_at": ISODate,
  "updated_at": ISODate
}
```
- **Indexes:** `order_id` (unique), `user_id`, `status`, `created_at`
- **Write concern:** `majority` — ensures order status consistency under high write throughput.

## 3. Scalability & Consistency

| Concern | Strategy |
|---|---|
| Thousands of TPS | Shard `orders` collection on `user_id` to distribute write load across nodes. |
| Fast product lookups | Secondary indexes on `sku`, `category`, and a text index on `name`/`description`. |
| Order consistency | Use `majority` write concern; order updates are idempotent. |
| Product catalog reads | Read from secondaries (eventual consistency acceptable for catalog). |
| High write throughput | Batch order writes when possible; avoid large document growth. |
