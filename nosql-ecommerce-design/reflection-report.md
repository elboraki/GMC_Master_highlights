# Reflection Report

## Challenges During the Schema Refactor

The main challenge was reconciling the analytical query requirements with the transactional schema originally designed for high write throughput. The initial document-based design optimized for fast order writes and product lookups, but scanning raw order documents to answer aggregate questions like "top-selling products by category" would have been prohibitively slow at scale. Introducing pre-aggregated collections introduced tension around data freshness — stale aggregates can misinform business decisions, so we had to carefully balance the aggregation batch interval (hourly) against the need for near-real-time insights.

Another challenge was managing the complexity of sharding. While hashed sharding on `user_id` distributes writes evenly, it makes range-based analytical queries across users expensive. We solved this by adding a separate time-series analytics events collection sharded on `timestamp`, effectively splitting the system into an operational layer (orders, products) and an analytical layer (aggregates, events).

## How the New Requirements Affected Design Decisions

The analytics requirement pushed us toward **denormalization** — daily sales aggregates that store pre-computed sums and counts. The high-availability requirement drove **replication** (3-node replica sets per shard) and careful read-preference tuning to tolerate node failures without downtime. We also introduced a **time-series collection** for real-time events with a TTL index, separating operational concerns from analytical ones.

## Improvements in Scalability, Availability, and Query Performance

**Scalability:** Sharding the orders and analytics events collections distributes load horizontally. New shards can be added as data grows without downtime.

**Availability:** Replica sets with automatic failover ensure the system remains operational even if entire nodes fail. Reads fall back to secondaries when the primary is unreachable, maintaining partition tolerance.

**Query Performance:** The pre-aggregated daily sales collection reduces analytical query latency from minutes (scanning millions of orders) to milliseconds (reading a few hundred aggregate documents). The time-series events collection keeps raw data accessible for drill-down while the TTL index prevents unbounded storage growth.
