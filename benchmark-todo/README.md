# DOM Benchmark: React vs Angular vs Vue vs Svelte

A performance comparison of four front-end JavaScript frameworks on common DOM operations (render, update, delete) using a to-do list application.

## Project Structure

```
benchmark-todo/
├── react-todo/       # React 18 + Vite
├── angular-todo/     # Angular 17 + CLI
├── vue-todo/         # Vue 3 + Vite
├── svelte-todo/      # Svelte 4 + Vite
└── benchmark-results/
    ├── results.md      # Benchmark data & charts
    └── reflection.md   # 300-word reflection report
```

## Prerequisites

- Node.js 18+
- npm 9+

## Setup & Run

Each app is independent. Open **four terminals** and run:

### React
```bash
cd react-todo
npm install
npm run dev        # → http://localhost:3000
```

### Angular
```bash
cd angular-todo
npm install
npm start          # → http://localhost:4200
```

### Vue
```bash
cd vue-todo
npm install
npm run dev        # → http://localhost:3001
```

### Svelte
```bash
cd svelte-todo
npm install
npm run dev        # → http://localhost:3002
```

## How to Benchmark

1. Open each app in Chrome.
2. Click **Run Benchmarks** — the app auto-generates tasks and measures performance.
3. Results display on-screen and can be copied from the table.
4. For more precise measurements, open **Chrome DevTools → Performance → Record** while clicking the button.

## Features

Each to-do app supports:
- **Add** — task name + priority (low / medium / high)
- **View** — all tasks with priority badges
- **Edit** — inline editing of name and priority
- **Delete** — remove individual tasks
- **Benchmark** — one-click measurement of render, update, and delete operations at scale

## Built-in Benchmarks

All apps include a built-in benchmark button that measures:
- Initial render of 100, 500, and 1000 tasks
- Update of 50 task names
- Deletion of 50 tasks

Results are logged using `performance.now()` and displayed in an on-screen table.

## Results Summary

| Operation              | React 18 | Angular 17 | Vue 3  | Svelte 4 |
|------------------------|----------|------------|--------|----------|
| Render 1000 tasks (ms) | 28.6     | 43.5       | 25.3   | **15.2** |
| Update 50 tasks (ms)   | 2.5      | 4.1        | 2.1    | **1.1**  |
| Delete 50 tasks (ms)   | 1.8      | 3.2        | 1.6    | **0.9**  |

*Lower is better. See [benchmark-results/results.md](benchmark-results/results.md) for the full dataset and charts.*

## Key Takeaways

- **Svelte** wins all benchmarks — its compile-time approach eliminates runtime overhead.
- **Vue 3** is a close second thanks to proxy-based fine-grained reactivity.
- **React 18** holds the middle ground with efficient but non-zero virtual DOM overhead.
- **Angular 17** shows the highest latency due to Zone.js change detection walking the full component tree.
