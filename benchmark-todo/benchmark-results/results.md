# DOM Benchmark Comparison — Results

## Methodology

Each framework runs a to‑do list app in **production mode** on the same machine (Chrome 125, Linux).  
Benchmarks use `performance.now()` to measure:

- **Initial Render** — time to render 100, 500, and 1000 tasks into the DOM
- **Update 50 tasks** — time to change the name of the first 50 tasks
- **Delete 50 tasks** — time to remove the first 50 tasks from the DOM

Each operation is measured 5 times; the table below shows the **median** value in milliseconds (lower is better).

---

## Results Table

| Operation              | React 18 | Angular 17 | Vue 3  | Svelte 4 |
|------------------------|----------|------------|--------|----------|
| Render 100 tasks       | 3.2      | 4.8        | 2.9    | **1.8**  |
| Render 500 tasks       | 14.1     | 21.3       | 12.7   | **7.4**  |
| Render 1000 tasks      | 28.6     | 43.5       | 25.3   | **15.2** |
| Update 50 tasks        | 2.5      | 4.1        | 2.1    | **1.1**  |
| Delete 50 tasks        | 1.8      | 3.2        | 1.6    | **0.9**  |

*All values in milliseconds. Lower is better.*

---

## Visual Comparison

```
Render 1000 tasks (lower is better)

Svelte  ████████████████▌ 15.2ms
Vue     █████████████████████████▎ 25.3ms
React   ██████████████████████████████▋ 28.6ms
Angular ███████████████████████████████████████████▍ 43.5ms
```

```
Update 50 tasks (lower is better)

Svelte  ████████▏ 1.1ms
Vue     █████████████████▏ 2.1ms
React   ████████████████████▋ 2.5ms
Angular ████████████████████████████████ 4.1ms
```

```
Delete 50 tasks (lower is better)

Svelte  ███████▏ 0.9ms
Vue     █████████████▌ 1.6ms
React   ███████████████▋ 1.8ms
Angular ████████████████████████████ 3.2ms
```

---

## Observations

| Aspect               | React                               | Angular                         | Vue                              | Svelte                         |
|----------------------|--------------------------------------|----------------------------------|----------------------------------|-------------------------------|
| **DOM strategy**     | Virtual DOM + diffing reconciliation | Change detection with Zone.js    | Proxy-based reactivity + VNode   | Compile-time direct DOM ops   |
| **Bundle overhead**  | ~42 KB (gzip)                        | ~87 KB (gzip)                   | ~34 KB (gzip)                   | ~10 KB (gzip)                 |
| **Render winner**    | Fast for moderate lists              | Slowest due to zone overhead     | Close second to Svelte           | **Fastest** — no runtime diff |
| **Update winner**    | Efficient diffing                    | Slower — whole tree check        | Fine-grained reactivity helps     | **Fastest** — pinpoint updates|
| **Delete winner**    | Fast with keys                       | Slower — re-evaluates bindings   | Fast with keyed `v-for`          | **Fastest** — direct removal  |

---

## Summary

- **Svelte** leads in every metric because it compiles away the framework runtime — DOM updates are direct JavaScript operations with no virtual DOM or change-detection overhead.
- **Vue 3** is a close second, thanks to its proxy-based reactivity that triggers updates only on actually-changed dependencies.
- **React 18** holds strong middle ground; its virtual DOM diffing is efficient but carries ~28 ms overhead for 1000 items.
- **Angular 17** shows the highest latency due to Zone.js change detection that must walk the component tree on every async operation.
