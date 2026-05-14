// ── DATA ──
let tasks = [
  { id:1, title:'Review pull requests for auth module', priority:'high', tag:'work', due:'2026-05-15', done:false },
  { id:2, title:'Write unit tests for payment service',  priority:'high', tag:'work', due:'2026-05-16', done:false },
  { id:3, title:'Read 30 pages of Clean Architecture',   priority:'medium', tag:'personal', due:'2026-05-14', done:true },
  { id:4, title:'Plan weekend hiking trip',              priority:'low',  tag:'personal', due:'2026-05-18', done:false },
]
let nextId = 5

// ── SCORING ──
function scoreTask(t) {
  let s = 50
  if (t.priority === 'high')   s += 40
  if (t.priority === 'medium') s += 20
  if (t.due) {
    const diff = (new Date(t.due) - new Date()) / (1000 * 3600 * 24)
    if (diff < 0) s += 30
    else if (diff < 1) s += 25
    else if (diff < 3) s += 15
    else if (diff < 7) s += 5
  }
  return Math.min(99, s)
}

// ── RENDER TASK CARD ──
function renderTaskCard(task, container) {
  const tmpl = document.getElementById('task-template').content.cloneNode(true)
  const card  = tmpl.querySelector('.task-card')

  if (task.done) card.classList.add('done')

  // check button
  const check = card.querySelector('.task-check')
  if (task.done) { check.classList.add('checked'); check.textContent = '✓' }
  check.addEventListener('click', () => toggleTask(task.id))

  // title
  card.querySelector('.task-title').textContent = task.title

  // tags
  const tags = card.querySelector('.task-tags')
  tags.innerHTML = `<span class="tag ${task.priority}">${task.priority}</span>
                    <span class="tag ${task.tag}">${task.tag}</span>`

  // due
  if (task.due) card.querySelector('.task-due').textContent = task.due

  // score
  card.querySelector('.task-score').textContent = scoreTask(task)

  // delete
  card.querySelector('.task-delete').addEventListener('click', () => deleteTask(task.id))

  container.appendChild(card)
}

// ── RENDER DASHBOARD TASKS ──
function renderDashTasks() {
  const el = document.getElementById('dash-task-list')
  el.innerHTML = ''
  const top = [...tasks]
    .filter(t => !t.done)
    .sort((a, b) => scoreTask(b) - scoreTask(a))
    .slice(0, 5)

  if (!top.length) {
    el.innerHTML = '<p style="color:var(--muted);font-size:13px;padding:16px 0">All caught up! ✓</p>'
    return
  }
  top.forEach(t => renderTaskCard(t, el))
}

// ── UPDATE STATS ──
function updateStats() {
  const total = tasks.length
  const done  = tasks.filter(t => t.done).length
  document.getElementById('stat-total').textContent = total
  document.getElementById('stat-done').textContent  = done
  document.getElementById('stat-pct').textContent   = total ? Math.round(done/total*100) + '% done' : '0% done'
  document.getElementById('task-badge').textContent = tasks.filter(t => !t.done).length
}

// ── TOGGLE / DELETE ──
function toggleTask(id) {
  const t = tasks.find(t => t.id === id)
  if (t) t.done = !t.done
  updateStats()
  renderDashTasks()
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id)
  updateStats()
  renderDashTasks()
}

// ── INIT ──
updateStats()
renderDashTasks()
// ── NAVIGATION ──
let currentFilter = 'all'
let searchQuery   = ''

document.querySelectorAll('.nav-item').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault()
    const panel = link.dataset.panel

    // update nav active state
    document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'))
    link.classList.add('active')

    // switch panel
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'))
    document.getElementById('panel-' + panel).classList.add('active')

    // render panel content
    if (panel === 'tasks') renderAllTasks()
  })
})

// ── RENDER ALL TASKS ──
function renderAllTasks() {
  const el = document.getElementById('all-task-list')
  el.innerHTML = ''

  let filtered = tasks.filter(t => {
    if (currentFilter === 'active' && t.done)              return false
    if (currentFilter === 'done'   && !t.done)             return false
    if (currentFilter === 'high'   && t.priority !== 'high') return false
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  }).sort((a, b) => scoreTask(b) - scoreTask(a))

  if (!filtered.length) {
    el.innerHTML = '<p style="color:var(--muted);font-size:13px;padding:16px 0">No tasks found.</p>'
    return
  }
  filtered.forEach(t => renderTaskCard(t, el))
}

// ── FILTER BUTTONS ──
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    currentFilter = btn.dataset.filter
    renderAllTasks()
  })
})

// ── SEARCH ──
document.getElementById('search-input').addEventListener('input', e => {
  searchQuery = e.target.value
  renderAllTasks()
})

// ── ADD TASK ──
document.getElementById('add-btn').addEventListener('click', () => {
  const title = document.getElementById('new-title').value.trim()
  if (!title) return

  tasks.push({
    id:       nextId++,
    title,
    priority: document.getElementById('new-priority').value,
    tag:      document.getElementById('new-tag').value,
    due:      document.getElementById('new-due').value,
    done:     false,
  })

  document.getElementById('new-title').value = ''
  document.getElementById('new-due').value   = ''

  updateStats()
  renderAllTasks()
  renderDashTasks()
})