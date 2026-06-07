<template>
  <div class="app">
    <header>
      <h1>Vue Todo — Benchmark</h1>
      <p>Vue 3 — Reactivity proxy with fine-grained dependency tracking</p>
    </header>

    <section class="controls">
      <input v-model="taskName" placeholder="Task name" @keydown.enter="addTask" />
      <select v-model="priority">
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <button @click="addTask">Add Task</button>
    </section>

    <section class="bench-bar">
      <button class="btn-bench" @click="runBenchmarks" :disabled="running">
        {{ running ? 'Running benchmarks…' : 'Run Benchmarks' }}
      </button>
      <span class="task-count">{{ tasks.length }} tasks</span>
    </section>

    <section class="results" v-if="results.length > 0">
      <h2>Benchmark Results (ms)</h2>
      <table>
        <thead><tr><th>Operation</th><th>Time (ms)</th></tr></thead>
        <tbody>
          <tr v-for="r in results" :key="r.label">
            <td>{{ r.label }}</td>
            <td>{{ r.time }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <ul class="todo-list">
      <li v-for="task in tasks" :key="task.id" class="todo-item">
        <template v-if="editingId === task.id">
          <input v-model="editName" />
          <select v-model="editPriority">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button class="save" @click="saveEdit(task.id)">Save</button>
          <button class="cancel" @click="cancelEdit">Cancel</button>
        </template>
        <template v-else>
          <span class="task-name">{{ task.name }}</span>
          <span class="badge" :style="{ background: priorityColor(task.priority) }">
            {{ task.priority }}
          </span>
          <div class="actions">
            <button class="edit" @click="startEdit(task)">✎</button>
            <button class="delete" @click="deleteTask(task.id)">✕</button>
          </div>
        </template>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tasks: [],
      taskName: '',
      priority: 'medium',
      editingId: null,
      editName: '',
      editPriority: 'medium',
      results: [],
      running: false,
    }
  },
  methods: {
    priorityColor(p) {
      return p === 'low' ? '#4CAF50' : p === 'medium' ? '#FF9800' : '#f44336'
    },
    addTask() {
      if (!this.taskName.trim()) return
      this.tasks.push({ id: Date.now(), name: this.taskName, priority: this.priority })
      this.taskName = ''
      this.priority = 'medium'
    },
    deleteTask(id) {
      this.tasks = this.tasks.filter(t => t.id !== id)
    },
    startEdit(task) {
      this.editingId = task.id
      this.editName = task.name
      this.editPriority = task.priority
    },
    cancelEdit() {
      this.editingId = null
    },
    saveEdit(id) {
      if (!this.editName.trim()) return
      const idx = this.tasks.findIndex(t => t.id === id)
      if (idx !== -1) {
        this.tasks[idx] = { ...this.tasks[idx], name: this.editName, priority: this.editPriority }
      }
      this.editingId = null
    },
    generateTasks(count) {
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        name: `Task ${i + 1}`,
        priority: ['low', 'medium', 'high'][i % 3],
      }))
    },
    async bench(label, fn) {
      const start = performance.now()
      fn()
      await this.$nextTick()
      const end = performance.now()
      return { label, time: +((end - start) * 10).toFixed(2) }
    },
    async runBenchmarks() {
      this.running = true
      this.results = []
      const rows = []

      for (const count of [100, 500, 1000]) {
        const r = await this.bench(`Render ${count} tasks`, () => {
          this.tasks = this.generateTasks(count)
        })
        rows.push(r)
      }

      const r = await this.bench('Update 50 tasks', () => {
        this.tasks = this.tasks.map((t, i) =>
          i < 50 ? { ...t, name: t.name + ' ★' } : t
        )
      })
      rows.push(r)

      const r2 = await this.bench('Delete 50 tasks', () => {
        this.tasks = this.tasks.slice(50)
      })
      rows.push(r2)

      this.results = rows
      this.running = false
    },
  },
}
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #0f0f0f; color: #e0e0e0; padding: 20px; }
.app { max-width: 800px; margin: 0 auto; }
header { margin-bottom: 24px; }
header h1 { font-size: 1.5rem; color: #42b883; margin-bottom: 4px; }
header p { font-size: 0.85rem; color: #888; }
.controls { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.controls input { flex: 1; min-width: 180px; padding: 10px 14px; border: 1px solid #333; border-radius: 6px; background: #1a1a1a; color: #e0e0e0; font-size: 0.95rem; }
.controls input:focus { outline: none; border-color: #42b883; }
.controls select { padding: 10px; border: 1px solid #333; border-radius: 6px; background: #1a1a1a; color: #e0e0e0; }
.controls button { padding: 10px 20px; border: none; border-radius: 6px; background: #42b883; color: #fff; font-weight: 600; cursor: pointer; }
.controls button:hover { opacity: 0.9; }
.bench-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.btn-bench { padding: 10px 24px; border: 2px solid #42b883; border-radius: 6px; background: transparent; color: #42b883; font-weight: 600; cursor: pointer; }
.btn-bench:hover { background: #42b883; color: #fff; }
.btn-bench:disabled { opacity: 0.5; cursor: not-allowed; background: transparent; color: #42b883; }
.task-count { font-size: 0.85rem; color: #888; }
.results { background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
.results h2 { font-size: 1rem; margin-bottom: 10px; color: #42b883; }
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
