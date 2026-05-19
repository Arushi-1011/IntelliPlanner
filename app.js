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
// ── POMODORO ──
const CIRCUMFERENCE = 439.8
const DURATIONS = { focus: 1500, short: 300, long: 900 }
const MODE_LABELS = { focus: 'Focus', short: 'Short Break', long: 'Long Break' }
const MODE_COLORS = { focus: 'var(--accent)', short: 'var(--teal)', long: 'var(--amber)' }

let pomoMode       = 'focus'
let pomoSeconds    = 1500
let pomoTotal      = 1500
let pomoRunning    = false
let pomoInterval   = null
let pomoSessions   = 0
let pomoCycle      = 0
let selectedTask   = null
let focusMinutes   = 0

function updateRing() {
  const pct    = pomoSeconds / pomoTotal
  const offset = CIRCUMFERENCE * (1 - pct)
  document.getElementById('ring-prog').style.strokeDashoffset = offset
  document.getElementById('ring-prog').style.stroke = MODE_COLORS[pomoMode]
}

function updateTimerDisplay() {
  const m = String(Math.floor(pomoSeconds / 60)).padStart(2, '0')
  const s = String(pomoSeconds % 60).padStart(2, '0')
  document.getElementById('timer-display').textContent = m + ':' + s
  updateRing()
}

function setPomoMode(mode) {
  stopPomo()
  pomoMode    = mode
  pomoSeconds = DURATIONS[mode]
  pomoTotal   = DURATIONS[mode]
  document.getElementById('timer-mode-label').textContent = MODE_LABELS[mode]
  document.getElementById('toggle-btn').textContent = '▶ Start'
  document.querySelectorAll('.mode-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode)
  })
  updateTimerDisplay()
}

function stopPomo() {
  clearInterval(pomoInterval)
  pomoInterval = null
  pomoRunning  = false
}

function togglePomo() {
  if (pomoRunning) {
    stopPomo()
    document.getElementById('toggle-btn').textContent = '▶ Resume'
  } else {
    pomoRunning = true
    document.getElementById('toggle-btn').textContent = '⏸ Pause'
    pomoInterval = setInterval(() => {
      pomoSeconds--

      if (pomoMode === 'focus') {
        focusMinutes = Math.floor((pomoTotal - pomoSeconds) / 60)
        document.getElementById('stat-focus').innerHTML =
          focusMinutes + '<span style="font-size:14px">m</span>'
      }

      updateTimerDisplay()

      if (pomoSeconds <= 0) {
        stopPomo()
        document.getElementById('toggle-btn').textContent = '▶ Start'
        if (pomoMode === 'focus') {
          pomoSessions++
          pomoCycle = (pomoCycle + 1) % 4
          document.getElementById('pomo-sessions').textContent = pomoSessions
          document.getElementById('pomo-minutes').textContent  = pomoSessions * 25 + ' min focused'
          renderSessionDots()
        }
      }
    }, 1000)
  }
}

function renderSessionDots() {
  const el = document.getElementById('session-dots')
  el.innerHTML = ''
  for (let i = 0; i < 4; i++) {
    const d = document.createElement('div')
    d.className = 'dot' + (i < pomoCycle ? ' filled' : '')
    el.appendChild(d)
  }
}

function renderFocusTasks() {
  const el = document.getElementById('focus-task-list')
  el.innerHTML = ''
  const active = tasks.filter(t => !t.done).slice(0, 6)
  if (!active.length) {
    el.innerHTML = '<p style="font-size:12px;color:var(--muted)">No active tasks</p>'
    return
  }
  active.forEach(t => {
    const div = document.createElement('div')
    div.className = 'focus-task-option' + (selectedTask === t.id ? ' selected' : '')
    div.textContent = t.title.length > 32 ? t.title.slice(0, 32) + '…' : t.title
    div.addEventListener('click', () => {
      selectedTask = t.id
      renderFocusTasks()
    })
    el.appendChild(div)
  })
}

// mode buttons
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => setPomoMode(btn.dataset.mode))
})

document.getElementById('toggle-btn').addEventListener('click', togglePomo)
document.getElementById('reset-btn').addEventListener('click', () => {
  setPomoMode(pomoMode)
})
document.getElementById('skip-btn').addEventListener('click', () => {
  pomoSeconds = 0
})

// render focus tasks when switching to focus panel
document.querySelectorAll('.nav-item').forEach(link => {
  link.addEventListener('click', e => {
    if (link.dataset.panel === 'focus') renderFocusTasks()
  })
})

updateTimerDisplay()
// ── HABITS DATA ──
let habits = [
  { id:1, name:'Morning workout', icon:'💪', streak:7,  done:false },
  { id:2, name:'Read 30 mins',    icon:'📚', streak:4,  done:false },
  { id:3, name:'No social media', icon:'📵', streak:2,  done:false },
  { id:4, name:'Drink 2L water',  icon:'💧', streak:12, done:true  },
  { id:5, name:'Meditate',        icon:'🧘', streak:3,  done:false },
  { id:6, name:'Code 1 hour',     icon:'💻', streak:9,  done:false },
]

function renderHabits() {
  const grid = document.getElementById('habits-grid')
  grid.innerHTML = ''

  habits.forEach(h => {
    const card = document.createElement('div')
    card.className = 'habit-card' + (h.done ? ' done' : '')
    card.innerHTML = `
      <div class="habit-top">
        <span class="habit-icon">${h.icon}</span>
        <div class="habit-check">${h.done ? '✓' : ''}</div>
      </div>
      <div class="habit-name">${h.name}</div>
      <div class="habit-streak">🔥 <span>${h.streak} day streak</span></div>
    `
    card.addEventListener('click', () => {
      h.done = !h.done
      if (h.done) h.streak++
      else h.streak = Math.max(0, h.streak - 1)
      renderHabits()
    })
    grid.appendChild(card)
  })

  renderConsistency()
}

function renderConsistency() {
  const el = document.getElementById('consistency-card')
  el.innerHTML = ''

  habits.forEach(h => {
    const pct = Math.min(100, Math.round(h.streak / 14 * 100))
    const row = document.createElement('div')
    row.className = 'streak-row'
    row.innerHTML = `
      <span class="streak-name">${h.icon} ${h.name}</span>
      <div class="streak-bar-wrap">
        <div class="streak-bar" style="width:${pct}%"></div>
      </div>
      <span class="streak-count">${h.streak}d</span>
    `
    el.appendChild(row)
  })
}

// render habits when switching to habits panel
document.querySelectorAll('.nav-item').forEach(link => {
  link.addEventListener('click', () => {
    if (link.dataset.panel === 'habits') renderHabits()
  })
})
// ── ANALYTICS ──
const WEEKLY_DATA = [3, 5, 2, 6, 4, 2, 1]
const WEEK_DAYS   = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const HEAT_LEVELS = [0,1,0,2,3,1,0,2,4,3,1,0,2,3,4,1,0,2,1,3,4,0,1,2,3,1,0,2]

function renderAnalytics() {
  const total   = tasks.length
  const done    = tasks.filter(t => t.done).length
  const high    = tasks.filter(t => t.priority === 'high').length
  const overdue = tasks.filter(t => !t.done && t.due && new Date(t.due) < new Date()).length
  const rate    = total ? Math.round(done / total * 100) : 0

  document.getElementById('an-total').textContent  = total
  document.getElementById('an-rate').textContent   = rate + '%'
  document.getElementById('an-high').textContent   = high
  document.getElementById('an-overdue').textContent = overdue

  renderBarChart()
  renderHeatmap()
  renderBreakdown()
}

function renderBarChart() {
  const el  = document.getElementById('bar-chart')
  el.innerHTML = ''
  const max = Math.max(...WEEKLY_DATA)

  WEEKLY_DATA.forEach((val, i) => {
    const col = document.createElement('div')
    col.className = 'bar-col'
    col.innerHTML = `
      <div class="bar-outer">
        <div class="bar-fill" style="height:${max ? (val/max)*100 : 0}%" title="${val} tasks"></div>
      </div>
      <div class="bar-label">${WEEK_DAYS[i]}</div>
    `
    el.appendChild(col)
  })
}

function renderHeatmap() {
  const el = document.getElementById('heatmap')
  el.innerHTML = ''
  const levels = ['', 'l1', 'l2', 'l3', 'l4']
  HEAT_LEVELS.forEach(v => {
    const cell = document.createElement('div')
    cell.className = 'heat-cell ' + (levels[v] || '')
    el.appendChild(cell)
  })
}

function renderBreakdown() {
  const total = tasks.length

  // priority
  const pEl = document.getElementById('priority-breakdown')
  pEl.innerHTML = ''
  const priorities = [
    { key:'high',   label:'High',   color:'var(--red)'    },
    { key:'medium', label:'Medium', color:'var(--amber)'  },
    { key:'low',    label:'Low',    color:'var(--green)'  },
  ]
  priorities.forEach(p => {
    const count = tasks.filter(t => t.priority === p.key).length
    const pct   = total ? Math.round(count / total * 100) : 0
    pEl.appendChild(makeBreakdownRow(p.label, count, pct, p.color))
  })

  // category
  const cEl = document.getElementById('category-breakdown')
  cEl.innerHTML = ''
  const categories = [
    { key:'work',     label:'Work',     color:'var(--accent2)' },
    { key:'personal', label:'Personal', color:'var(--teal)'    },
  ]
  categories.forEach(c => {
    const count = tasks.filter(t => t.tag === c.key).length
    const pct   = total ? Math.round(count / total * 100) : 0
    cEl.appendChild(makeBreakdownRow(c.label, count, pct, c.color))
  })
}

function makeBreakdownRow(label, count, pct, color) {
  const row = document.createElement('div')
  row.className = 'breakdown-row'
  row.innerHTML = `
    <span class="breakdown-label">${label}</span>
    <div class="breakdown-bar-wrap">
      <div class="breakdown-bar" style="width:${pct}%; background:${color}"></div>
    </div>
    <span class="breakdown-count">${count}</span>
  `
  return row
}

// render analytics when switching to panel
document.querySelectorAll('.nav-item').forEach(link => {
  link.addEventListener('click', () => {
    if (link.dataset.panel === 'analytics') renderAnalytics()
  })
})
// ── AI PLANNER ──
let aiAddedTasks = []

async function callClaude(goal) {
  // simulate network delay so it feels real
  await new Promise(r => setTimeout(r, 1200))

  const g = goal.toLowerCase()

  // keyword-based smart responses
  if (g.includes('interview') || g.includes('job') || g.includes('hiring')) {
    return [
      { title: 'Research the company — products, culture, recent news', priority: 'high',   estimate: '1 hr',   tag: 'work',     notes: 'Check LinkedIn, Glassdoor and their blog' },
      { title: 'Revise core CS fundamentals and data structures',        priority: 'high',   estimate: '3 hr',   tag: 'work',     notes: 'Focus on arrays, trees, graphs' },
      { title: 'Practice 5 LeetCode medium problems',                    priority: 'high',   estimate: '2 hr',   tag: 'work',     notes: 'Time yourself — 20 min per problem' },
      { title: 'Prepare answers for behavioural questions (STAR method)', priority: 'medium', estimate: '45 min', tag: 'work',     notes: 'Write out 3 stories from past experience' },
      { title: 'Do a mock system design walkthrough',                     priority: 'medium', estimate: '1 hr',   tag: 'work',     notes: 'Practice explaining out loud' },
      { title: 'Prepare 5 thoughtful questions to ask the interviewer',   priority: 'low',    estimate: '20 min', tag: 'work',     notes: 'Shows genuine interest' },
    ]
  }

  if (g.includes('fitness') || g.includes('workout') || g.includes('gym') || g.includes('weight')) {
    return [
      { title: 'Define your fitness goal and set a 30-day target',       priority: 'high',   estimate: '20 min', tag: 'personal', notes: 'Be specific — e.g. lose 2kg, run 5km' },
      { title: 'Create a weekly workout schedule',                        priority: 'high',   estimate: '30 min', tag: 'personal', notes: 'Mix cardio and strength training' },
      { title: 'Meal prep for the week — high protein, low processed',    priority: 'medium', estimate: '2 hr',   tag: 'personal', notes: 'Sundays work best for meal prep' },
      { title: 'Download a tracking app and log workouts daily',          priority: 'medium', estimate: '15 min', tag: 'personal', notes: 'MyFitnessPal or Strong app' },
      { title: 'Buy or organise any missing equipment',                   priority: 'low',    estimate: '30 min', tag: 'personal', notes: 'Resistance bands are cheap and versatile' },
    ]
  }

  if (g.includes('learn') || g.includes('study') || g.includes('course') || g.includes('skill')) {
    return [
      { title: 'Define exactly what you want to learn and why',           priority: 'high',   estimate: '20 min', tag: 'personal', notes: 'Clear goals prevent aimless studying' },
      { title: 'Find the best resource — course, book or docs',           priority: 'high',   estimate: '30 min', tag: 'personal', notes: 'Check reviews before committing' },
      { title: 'Block 1 hour daily in your calendar for focused study',   priority: 'high',   estimate: '15 min', tag: 'personal', notes: 'Consistency beats long sessions' },
      { title: 'Build a small project to apply what you learn',           priority: 'medium', estimate: '3 hr',   tag: 'work',     notes: 'Projects stick better than tutorials' },
      { title: 'Join a community or find a study partner',                priority: 'low',    estimate: '20 min', tag: 'personal', notes: 'Discord and Reddit work great for this' },
    ]
  }

  if (g.includes('project') || g.includes('build') || g.includes('app') || g.includes('website')) {
    return [
      { title: 'Write a clear project brief — goal, scope, deadline',    priority: 'high',   estimate: '30 min', tag: 'work',     notes: 'One page is enough to start' },
      { title: 'Break the project into milestones',                       priority: 'high',   estimate: '45 min', tag: 'work',     notes: 'Each milestone should be shippable' },
      { title: 'Set up project repo, folder structure and README',        priority: 'high',   estimate: '30 min', tag: 'work',     notes: 'Good structure saves time later' },
      { title: 'Build the core feature first — ignore extras',            priority: 'high',   estimate: '3 hr',   tag: 'work',     notes: 'MVP mindset — get it working first' },
      { title: 'Share an early version and get feedback',                 priority: 'medium', estimate: '30 min', tag: 'work',     notes: 'Real feedback beats assumptions' },
      { title: 'Write tests for critical paths',                          priority: 'low',    estimate: '1 hr',   tag: 'work',     notes: 'At minimum test the happy path' },
    ]
  }

  if (g.includes('read') || g.includes('book')) {
    return [
      { title: 'Choose your next book and add it to a reading list',      priority: 'high',   estimate: '15 min', tag: 'personal', notes: 'Goodreads is great for tracking' },
      { title: 'Block 30 mins every morning or night for reading',        priority: 'high',   estimate: '10 min', tag: 'personal', notes: 'Same time every day builds the habit' },
      { title: 'Take notes or highlight key ideas as you read',           priority: 'medium', estimate: '5 min',  tag: 'personal', notes: 'Even one sentence per chapter helps' },
      { title: 'Summarise each chapter in your own words',                priority: 'medium', estimate: '10 min', tag: 'personal', notes: 'Forces you to actually process it' },
      { title: 'Share or discuss what you learned with someone',          priority: 'low',    estimate: '20 min', tag: 'personal', notes: 'Teaching is the best way to learn' },
    ]
  }

  // default fallback for anything else
  const words = goal.split(' ').slice(0, 3).join(' ')
  return [
    { title: `Research and define the scope of: ${words}`,               priority: 'high',   estimate: '30 min', tag: 'work',     notes: 'Start with a clear definition of done' },
    { title: `Break "${words}" into smaller sub-goals`,                   priority: 'high',   estimate: '20 min', tag: 'work',     notes: 'Smaller steps are easier to start' },
    { title: `Find the best resources and references`,                    priority: 'medium', estimate: '30 min', tag: 'work',     notes: 'Don\'t reinvent the wheel' },
    { title: `Schedule dedicated time blocks this week`,                  priority: 'medium', estimate: '15 min', tag: 'personal', notes: 'Block it in your calendar now' },
    { title: `Complete first working version or draft`,                   priority: 'high',   estimate: '2 hr',   tag: 'work',     notes: 'Done is better than perfect' },
    { title: `Review progress and adjust the plan`,                       priority: 'low',    estimate: '20 min', tag: 'work',     notes: 'Weekly reviews keep you on track' },
  ]
}
function renderAiResultsTo(items, containerId = 'ai-results') {
  const el = document.getElementById(containerId)
  el.innerHTML = ''

  items.forEach((item, i) => {
    const card = document.createElement('div')
    card.className = 'ai-result-card'
    card.innerHTML = `
      <div class="ai-result-body">
        <div class="ai-result-title">${item.title}</div>
        <div class="ai-result-meta">
          <span><span class="result-dot dot-${item.priority}"></span>${item.priority}</span>
          <span>⏱ ${item.estimate}</span>
          <span>${item.tag}</span>
          <span style="font-style:italic">${item.notes || ''}</span>
        </div>
      </div>
      <button class="ai-add-btn" data-index="${i}">+ Add</button>
    `

    card.querySelector('.ai-add-btn').addEventListener('click', function () {
      const t = {
        id:       nextId++,
        title:    item.title,
        priority: item.priority,
        tag:      item.tag,
        due:      '',
        done:     false,
      }
      tasks.push(t)
      aiAddedTasks.push(t)

      this.textContent = '✓ Added'
      this.classList.add('added')
      this.disabled = true

      updateStats()
      renderDashTasks()
      renderAiAddedList()
    })

    el.appendChild(card)
  })
}

function renderAiAddedList() {
  const el = document.getElementById('ai-added-list')
  el.innerHTML = ''
  if (!aiAddedTasks.length) {
    el.innerHTML = '<p style="color:var(--muted);font-size:13px;padding:8px 0">Tasks you add from AI will appear here.</p>'
    return
  }
  aiAddedTasks.forEach(t => renderTaskCard(t, el))
}

document.getElementById('ai-btn').addEventListener('click', async () => {
  const goal = document.getElementById('ai-input').value.trim()
  if (!goal) return

  const btn      = document.getElementById('ai-btn')
  const thinking = document.getElementById('ai-thinking')
  const errorEl  = document.getElementById('ai-error')

  btn.disabled           = true
  thinking.style.display = 'flex'
  errorEl.style.display  = 'none'
  document.getElementById('ai-results').innerHTML = ''

  try {
    const items = await callClaude(goal)
    renderAiResultsTo(items)
  } catch (e) {
    errorEl.style.display = 'block'
    errorEl.textContent   = '⚠ ' + (e.message || 'Could not reach Claude API.')
  }

  thinking.style.display = 'none'
  btn.disabled           = false
})
// ── AI ON DASHBOARD ──
document.getElementById('ai-btn-dash').addEventListener('click', async () => {
  const goal    = document.getElementById('ai-input-dash').value.trim()
  if (!goal) return

  const btn      = document.getElementById('ai-btn-dash')
  const thinking = document.getElementById('ai-thinking-dash')
  const errorEl  = document.getElementById('ai-error-dash')

  btn.disabled           = true
  thinking.style.display = 'flex'
  errorEl.style.display  = 'none'
  document.getElementById('ai-results-dash').innerHTML = ''

  try {
    const items = await callClaude(goal)
    renderAiResultsTo(items, 'ai-results-dash')
  } catch (e) {
    errorEl.style.display = 'block'
    errorEl.textContent   = '⚠ ' + (e.message || 'Something went wrong.')
  }

  thinking.style.display = 'none'
  btn.disabled           = false
})
