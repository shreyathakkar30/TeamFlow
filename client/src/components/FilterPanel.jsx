export default function FilterPanel({ filters, onChange, options }) {
  const handle = (field) => (e) => onChange({ ...filters, [field]: e.target.value });

  return (
    <div className="flex flex-wrap gap-3">
      {options.status && (
        <select className="input w-auto" value={filters.status || ''} onChange={handle('status')}>
          <option value="">All statuses</option>
          {options.status.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}
      {options.priority && (
        <select className="input w-auto" value={filters.priority || ''} onChange={handle('priority')}>
          <option value="">All priorities</option>
          {options.priority.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      )}
      {options.project && (
        <select className="input w-auto" value={filters.project || ''} onChange={handle('project')}>
          <option value="">All projects</option>
          {options.project.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      )}
      {options.assignedTo && (
        <select className="input w-auto" value={filters.assignedTo || ''} onChange={handle('assignedTo')}>
          <option value="">Anyone assigned</option>
          {options.assignedTo.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>
      )}
      <select
        className="input w-auto"
        value={filters.sortBy || 'createdAt'}
        onChange={handle('sortBy')}
      >
        <option value="createdAt">Sort: Newest</option>
        <option value="dueDate">Sort: Due date</option>
        <option value="priority">Sort: Priority</option>
        <option value="status">Sort: Status</option>
      </select>
    </div>
  );
}
