import { useState } from 'react'

const priorityColors = { low: '#4CAF50', medium: '#FF9800', high: '#f44336' }

function TodoItem({ task, isEditing, onStartEdit, onCancelEdit, onUpdate, onDelete }) {
  const [editName, setEditName] = useState(task.name)
  const [editPriority, setEditPriority] = useState(task.priority)

  const handleSave = () => {
    if (editName.trim()) onUpdate(task.id, editName, editPriority)
  }

  if (isEditing) {
    return (
      <li className="todo-item editing">
        <input value={editName} onChange={e => setEditName(e.target.value)} />
        <select value={editPriority} onChange={e => setEditPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button className="save" onClick={handleSave}>Save</button>
        <button className="cancel" onClick={onCancelEdit}>Cancel</button>
      </li>
    )
  }

  return (
    <li className="todo-item">
      <span className="task-name">{task.name}</span>
      <span className="badge" style={{ background: priorityColors[task.priority] }}>
        {task.priority}
      </span>
      <div className="actions">
        <button className="edit" onClick={onStartEdit}>✎</button>
        <button className="delete" onClick={() => onDelete(task.id)}>✕</button>
      </div>
    </li>
  )
}

export default TodoItem
