<script>
  let tasks = []
  let taskName = ''
  let priority = 'medium'
  let editingId = null
  let editName = ''
  let editPriority = 'medium'
  let results = []
  let running = false

  const priorityColor = (p) =>
    p === 'low' ? '#4CAF50' : p === 'medium' ? '#FF9800' : '#f44336'

  function addTask() {
    if (!taskName.trim()) return
    tasks = [...tasks, { id: Date.now(), name: taskName, priority }]
    taskName = ''
    priority = 'medium'
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id)
  }

  function startEdit(task) {
    editingId = task.id
    editName = task.name
    editPriority = task.priority
  }

  function cancelEdit() {
    editingId = null
  }

  function saveEdit(id) {
    if (!editName.trim()) return
    tasks = tasks.map(t =>
      t.id === id ? { ...t, name: editName, priority: editPriority } : t
    )
    editingId = null
  }

  function generateTasks(count) {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      name: `Task ${i + 1}`,
      priority: ['low', 'medium', 'high'][i % 3],
    }))
  }

  async function bench(label, fn) {
    const start = performance.now()
    fn()
    await tick()
    const end = performance.now()
    return { label, time: +((end - start) * 10).toFixed(2) }
  }

  async function runBenchmarks() {
    running = true
    results = []
    const rows = []

    for (const count of [100, 500, 1000]) {
      const r = await bench(`Render ${count} tasks`, () => {
        tasks = generateTasks(count)
      })
      rows.push(r)
    }

    const r = await bench('Update 50 tasks', () => {
      tasks = tasks.map((t, i) =>
        i < 50 ? { ...t, name: t.name + ' ★' } : t
      )
    })
    rows.push(r)

    const r2 = await bench('Delete 50 tasks', () => {
      tasks = tasks.slice(50)
    })
    rows.push(r2)

    results = rows
    running = false
  }
</script>

<div class="app">
  <header>
    <h1>Svelte Todo — Benchmark</h1>
    <p>Svelte 4 — Compile-time DOM updates with minimal runtime</p>
  </header>

  <section class="controls">
    <input bind:value={taskName} placeholder="Task name" on:keydown={(e) => e.key === 'Enter' && addTask()} />
    <select bind:value={priority}>
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </select>
    <button on:click={addTask}>Add Task</button>
  </section>

  <section class="bench-bar">
    <button class="btn-bench" on:click={runBenchmarks} disabled={running}>
      {running ? 'Running benchmarks…' : 'Run Benchmarks'}
    </button>
    <span class="task-count">{tasks.length} tasks</span>
  </section>

  {#if results.length > 0}
    <section class="results">
      <h2>Benchmark Results (ms)</h2>
      <table>
        <thead><tr><th>Operation</th><th>Time (ms)</th></tr></thead>
        <tbody>
          {#each results as r}
            <tr><td>{r.label}</td><td>{r.time}</td></tr>
          {/each}
        </tbody>
      </table>
    </section>
  {/if}

  <ul class="todo-list">
    {#each tasks as task (task.id)}
      <li class="todo-item">
        {#if editingId === task.id}
          <input bind:value={editName} />
          <select bind:value={editPriority}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button class="save" on:click={() => saveEdit(task.id)}>Save</button>
          <button class="cancel" on:click={cancelEdit}>Cancel</button>
        {:else}
          <span class="task-name">{task.name}</span>
          <span class="badge" style="background: {priorityColor(task.priority)}">
            {task.priority}
          </span>
          <div class="actions">
            <button class="edit" on:click={() => startEdit(task)}>✎</button>
            <button class="delete" on:click={() => deleteTask(task.id)}>✕</button>
          </div>
        {/if}
      </li>
    {/each}
  </ul>
</div>

<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :global(body) { font-family: system-ui, -apple-system, sans-serif; background: #0f0f0f; color: #e0e0e0; padding: 20px; }
  .app { max-width: 800px; margin: 0 auto; }
  header { margin-bottom: 24px; }
  header h1 { font-size: 1.5rem; color: #ff3e00; margin-bottom: 4px; }
  header p { font-size: 0.85rem; color: #888; }

  .controls { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
  .controls input { flex: 1; min-width: 180px; padding: 10px 14px; border: 1px solid #333; border-radius: 6px; background: #1a1a1a; color: #e0e0e0; font-size: 0.95rem; }
  .controls input:focus { outline: none; border-color: #ff3e00; }
  .controls select { padding: 10px; border: 1px solid #333; border-radius: 6px; background: #1a1a1a; color: #e0e0e0; }
  .controls button { padding: 10px 20px; border: none; border-radius: 6px; background: #ff3e00; color: #fff; font-weight: 600; cursor: pointer; }
  .controls button:hover { opacity: 0.9; }

  .bench-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
  .btn-bench { padding: 10px 24px; border: 2px solid #ff3e00; border-radius: 6px; background: transparent; color: #ff3e00; font-weight: 600; cursor: pointer; }
  .btn-bench:hover { background: #ff3e00; color: #fff; }
  .btn-bench:disabled { opacity: 0.5; cursor: not-allowed; background: transparent; color: #ff3e00; }
  .task-count { font-size: 0.85rem; color: #888; }

  .results { background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
  .results h2 { font-size: 1rem; margin-bottom: 10px; color: #ff3e00; }
  .results table { width: 100%; border-collapse: collapse; }
  .results th, .results td { text-align: left; padding: 6px 12px; border-bottom: 1px solid #333; font-size: 0.9rem; }
  .results th { color: #888; font-weight: 500; }

  .todo-list { list-style: none; display: flex; flex-direction: column; gap: 6px; }
  .todo-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 6px; }
  .todo-item .task-name { flex: 1; font-size: 0.95rem; }
  .todo-item .badge { padding: 2px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; color: #fff; }
  .todo-item .actions { display: flex; gap: 4px; }
  .todo-item button { padding: 4px 10px; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
  .todo-item .edit { background: #2d2d2d; color: #ccc; }
  .todo-item .edit:hover { background: #3d3d3d; }
  .todo-item .delete { background: #2d2d2d; color: #f44336; }
  .todo-item .delete:hover { background: #3d2d2d; }
  .todo-item .save { background: #4CAF50; color: #fff; }
  .todo-item .cancel { background: #555; color: #fff; }
</style>
