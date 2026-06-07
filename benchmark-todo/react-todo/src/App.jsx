import { useState } from 'react'
import TodoItem from './components/TodoItem'

function App() {
  const [tasks, setTasks] = useState([])
  const [taskName, setTaskName] = useState('')
  const [priority, setPriority] = useState('medium')
  const [editingId, setEditingId] = useState(null)
  const [benchmarkResults, setBenchmarkResults] = useState(null)
  const [running, setRunning] = useState(false)

  const addTask = () => {
    if (!taskName.trim()) return
    const newTask = {
      id: Date.now(),
      name: taskName,
      priority,
    }
    setTasks(prev => [...prev, newTask])
    setTaskName('')
    setPriority('medium')
  }

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const startEdit = (id) => setEditingId(id)
  const cancelEdit = () => setEditingId(null)

  const updateTask = (id, name, priority) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, name, priority } : t)))
    setEditingId(null)
  }

  const bench = async (label, fn) => {
    const start = performance.now()
    await fn()
    await new Promise(r => requestAnimationFrame(r))
    const end = performance.now()
    return { label, time: +(end - start).toFixed(2) }
  }

  const generateTasks = (count) =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      name: `Task ${i + 1}`,
      priority: ['low', 'medium', 'high'][i % 3],
    }))

  const runBenchmarks = async () => {
    setRunning(true)
    setBenchmarkResults(null)
    const rows = []

    for (const count of [100, 500, 1000]) {
      const r = await bench(`Render ${count} tasks`, async () => {
        const t = generateTasks(count)
        setTasks(t)
      })
      rows.push(r)
    }

    const r = await bench('Update 50 tasks', async () => {
      setTasks(prev => prev.map((t, i) => (i < 50 ? { ...t, name: `${t.name} ★` } : t)))
    })
    rows.push(r)

    const r2 = await bench('Delete 50 tasks', async () => {
      setTasks(prev => prev.slice(50))
    })
    rows.push(r2)

    setBenchmarkResults(rows)
    setRunning(false)
  }

  return (
    <div className="app">
      <header>
        <h1>React Todo — Benchmark</h1>
        <p>React {React.version} — Virtual DOM with diffing reconciliation</p>
      </header>

      <section className="controls">
        <input
          placeholder="Task name"
          value={taskName}
          onChange={e => setTaskName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
        />
        <select value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button onClick={addTask}>Add Task</button>
      </section>

      <section className="bench-bar">
        <button className="btn-bench" onClick={runBenchmarks} disabled={running}>
          {running ? 'Running benchmarks…' : 'Run Benchmarks'}
        </button>
        <span className="task-count">{tasks.length} tasks</span>
      </section>

      {benchmarkResults && (
        <section className="results">
          <h2>Benchmark Results (ms)</h2>
          <table>
            <thead>
              <tr><th>Operation</th><th>Time (ms)</th></tr>
            </thead>
            <tbody>
              {benchmarkResults.map((r, i) => (
                <tr key={i}><td>{r.label}</td><td>{r.time}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <ul className="todo-list">
        {tasks.map(t => (
          <TodoItem
            key={t.id}
            task={t}
            isEditing={editingId === t.id}
            onStartEdit={() => startEdit(t.id)}
            onCancelEdit={cancelEdit}
            onUpdate={updateTask}
            onDelete={deleteTask}
          />
        ))}
      </ul>
    </div>
  )
}

export default App
