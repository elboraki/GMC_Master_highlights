import { Component } from '@angular/core'

interface Task {
  id: number
  name: string
  priority: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Angular Todo — Benchmark'
  sub = 'Angular 17 — Change detection with Zone.js & directives'

  tasks: Task[] = []
  taskName = ''
  priority = 'medium'
  editingId: number | null = null
  editName = ''
  editPriority = 'medium'

  results: { label: string; time: number }[] = []
  running = false

  addTask() {
    if (!this.taskName.trim()) return
    this.tasks.push({
      id: Date.now(),
      name: this.taskName,
      priority: this.priority,
    })
    this.taskName = ''
    this.priority = 'medium'
  }

  deleteTask(id: number) {
    this.tasks = this.tasks.filter(t => t.id !== id)
  }

  startEdit(task: Task) {
    this.editingId = task.id
    this.editName = task.name
    this.editPriority = task.priority
  }

  cancelEdit() {
    this.editingId = null
  }

  saveEdit(id: number) {
    if (!this.editName.trim()) return
    const idx = this.tasks.findIndex(t => t.id === id)
    if (idx !== -1) {
      this.tasks[idx] = { ...this.tasks[idx], name: this.editName, priority: this.editPriority }
      this.tasks = [...this.tasks]
    }
    this.editingId = null
  }

  private generateTasks(count: number): Task[] {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      name: `Task ${i + 1}`,
      priority: ['low', 'medium', 'high'][i % 3],
    }))
  }

  private async bench(label: string, fn: () => void): Promise<{ label: string; time: number }> {
    const start = performance.now()
    fn()
    await new Promise(r => setTimeout(r, 0))
    const end = performance.now()
    return { label, time: +((end - start) * 10).toFixed(2) }
  }

  async runBenchmarks() {
    this.running = true
    this.results = []
    const rows: { label: string; time: number }[] = []

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
  }
}
