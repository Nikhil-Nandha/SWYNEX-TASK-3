'use strict';

const STORAGE = { subjects: 'ss_subjects_v2', tasks: 'ss_tasks_v2', profile: 'ss_profile_v1' };
const initialSubjects = [
  { id: 1, name: 'Data Structures', color: 'purple', icon: '⌘' },
  { id: 2, name: 'Database Systems', color: 'orange', icon: '▦' },
  { id: 3, name: 'Artificial Intelligence', color: 'green', icon: '✧' },
  { id: 4, name: 'Operating Systems', color: 'blue', icon: '◈' }
];
const todayISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const tomorrowISO = () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
function load(key, fallback) {
  try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; }
  catch { return fallback; }
}
let subjects = load(STORAGE.subjects, load('ss_subjects', null)) || initialSubjects;
let tasks = load(STORAGE.tasks, load('ss_tasks', null)) || [
  { id: 1, title: 'Revise linked lists and stacks', subject: 'Data Structures', date: todayISO(), done: false },
  { id: 2, title: 'Complete SQL practice questions', subject: 'Database Systems', date: todayISO(), done: false },
  { id: 3, title: 'Read about search algorithms', subject: 'Artificial Intelligence', date: todayISO(), done: true },
  { id: 4, title: 'Review process scheduling notes', subject: 'Operating Systems', date: tomorrowISO(), done: false },
  { id: 5, title: 'Prepare for database quiz', subject: 'Database Systems', date: tomorrowISO(), done: false }
];
let profile = load(STORAGE.profile, { name: 'Nikhil Nandha', email: '' });
let filter = 'all';

function save() {
  try {
    localStorage.setItem(STORAGE.subjects, JSON.stringify(subjects));
    localStorage.setItem(STORAGE.tasks, JSON.stringify(tasks));
    localStorage.setItem(STORAGE.profile, JSON.stringify(profile));
  } catch { showToast('Storage is unavailable. Changes may not persist.'); }
}
function esc(value) { return String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
function dateLabel(value) {
  const d = new Date(value + 'T00:00:00');
  if (value === todayISO()) return 'Today';
  if (value === tomorrowISO()) return 'Tomorrow';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
function showToast(message) {
  const toast = document.getElementById('toast'); toast.textContent = message;
  toast.classList.add('show'); window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2400);
}
function setError(id, message) {
  const field = document.getElementById(id); const error = document.getElementById(id + 'Error');
  if (error) error.textContent = message || '';
  if (field) field.setAttribute('aria-invalid', message ? 'true' : 'false');
}
function go(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('[data-page]').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  const names = { home:'Dashboard', subjects:'My subjects', tasks:'Task manager', progress:'Progress tracker', login:'Welcome' };
  document.getElementById('crumb').textContent = names[page] || 'Dashboard';
  render(); window.scrollTo({ top: 0, behavior: 'smooth' });
}
function openModal(id) {
  if (id === 'taskModal') {
    const select = document.getElementById('taskSubject');
    select.innerHTML = subjects.map(s => `<option value="${esc(s.name)}">${esc(s.name)}</option>`).join('');
    document.getElementById('taskDate').min = todayISO();
    document.getElementById('taskDate').value = todayISO();
    document.getElementById('noSubjectsHint').hidden = subjects.length > 0;
    document.getElementById('saveTaskButton').disabled = subjects.length === 0;
  }
  document.getElementById(id).classList.add('open');
  const first = document.querySelector('#' + id + ' input:not([type=hidden])'); if (first) first.focus();
}
document.addEventListener('click', e => {
  const page = e.target.closest('[data-page]'); if (page) { go(page.dataset.page); return; }
  const action = e.target.closest('[data-action]'); if (action?.dataset.action === 'add-task') { openModal('taskModal'); return; }
  const close = e.target.closest('[data-close]'); if (close) close.closest('.modal-backdrop').classList.remove('open');
});
function color(c) { return { purple:'#7168df', orange:'#e9a05c', green:'#58b986', blue:'#6499db', pink:'#dc82a7' }[c] || '#7168df'; }
function taskMarkup(t) {
  return `<div class="task-row ${t.done ? 'completed' : ''}">
    <button class="check ${t.done ? 'checked' : ''}" data-toggle="${t.id}" aria-label="${t.done ? 'Mark incomplete' : 'Complete task'}" aria-pressed="${t.done}">${t.done ? '✓' : ''}</button>
    <div class="task-info"><strong>${esc(t.title)}</strong><small>${esc(t.subject)}</small></div>
    <span class="due">${dateLabel(t.date)}</span>
    <button class="delete-task" data-delete="${t.id}" aria-label="Delete ${esc(t.title)}" title="Delete task">×</button>
  </div>`;
}
function subjectStats(s) {
  const related = tasks.filter(t => t.subject === s.name);
  return { count: related.length, progress: related.length ? Math.round(related.filter(t => t.done).length / related.length * 100) : 0 };
}
function subjectMarkup(s, card = false) {
  const stats = subjectStats(s);
  return card
    ? `<article class="subject-card"><div class="subject-card-top"><span class="subject-symbol ${s.color}">${esc(s.icon || '▤')}</span><span class="muted">${stats.count} tasks</span></div><h3>${esc(s.name)}</h3><p>${stats.count} study activities</p><div class="track"><i style="width:${stats.progress}%;background:${color(s.color)}"></i></div><div class="subject-foot"><span>Task completion</span><strong>${stats.progress}%</strong></div></article>`
    : `<div class="subject-line"><i class="subject-dot" style="background:${color(s.color)}"></i><div class="subject-meta"><strong>${esc(s.name)}</strong><small>${stats.progress}% complete · ${stats.count} tasks</small></div><div class="mini-track"><i style="width:${stats.progress}%;background:${color(s.color)}"></i></div></div>`;
}
function render() {
  const pending = tasks.filter(t => !t.done), done = tasks.filter(t => t.done);
  document.getElementById('taskCount').textContent = pending.length;
  document.getElementById('stat-subjects').textContent = subjects.length;
  document.getElementById('stat-pending').textContent = pending.length;
  document.getElementById('stat-done').textContent = done.length;
  document.getElementById('studentGreeting').textContent = profile.name || 'Student';
  document.getElementById('homeTasks').innerHTML = tasks.filter(t => t.date === todayISO()).slice(0, 4).map(taskMarkup).join('') || '<div class="empty-state">No tasks for today. Add one when you are ready ✨</div>';
  document.getElementById('homeSubjects').innerHTML = subjects.slice(0, 4).map(s => subjectMarkup(s)).join('') || '<div class="empty-state">No subjects yet. Add your first subject.</div>';
  document.getElementById('subjectGrid').innerHTML = subjects.map(s => subjectMarkup(s, true)).join('') || '<div class="empty-state">No subjects yet. Add a subject to organise your study plan.</div>';
  const shown = tasks.filter(t => filter === 'all' || (filter === 'pending' ? !t.done : t.done));
  document.getElementById('allTasks').innerHTML = shown.map(taskMarkup).join('') || `<div class="empty-state">${tasks.length ? 'No tasks in this filter.' : 'You have no tasks yet. Create your first task to get started ✨'}</div>`;
  document.getElementById('taskSummary').textContent = `${pending.length} pending · ${done.length} completed`;
  const rate = tasks.length ? Math.round(done.length / tasks.length * 100) : 0;
  document.getElementById('completionPct').textContent = rate + '%';
  document.getElementById('progressRing').style.background = `conic-gradient(var(--purple) 0 ${rate}%,#eeedf5 ${rate}% 100%)`;
  document.getElementById('completedLegend').textContent = done.length;
  document.getElementById('pendingLegend').textContent = pending.length;
  document.getElementById('progressSubjects').innerHTML = subjects.map(s => {
    const stats = subjectStats(s);
    return `<div class="progress-row"><strong>${esc(s.name)}</strong><div class="track"><i style="width:${stats.progress}%;background:${color(s.color)}"></i></div><span>${stats.progress}%</span></div>`;
  }).join('') || '<div class="empty-state">Add a subject to see progress here.</div>';
}

document.addEventListener('click', e => {
  const toggle = e.target.closest('[data-toggle]');
  if (toggle) { const task = tasks.find(t => t.id === Number(toggle.dataset.toggle)); if (!task) return; task.done = !task.done; save(); render(); showToast(task.done ? 'Task completed. Nice work!' : 'Task moved to pending'); return; }
  const remove = e.target.closest('[data-delete]');
  if (remove) { const task = tasks.find(t => t.id === Number(remove.dataset.delete)); if (!task) return; if (!window.confirm(`Delete “${task.title}”?`)) return; tasks = tasks.filter(t => t.id !== task.id); save(); render(); showToast('Task deleted'); }
});
document.getElementById('filters').addEventListener('click', e => {
  const button = e.target.closest('[data-filter]'); if (!button) return;
  filter = button.dataset.filter;
  document.querySelectorAll('.filter').forEach(item => item.classList.toggle('active', item === button)); render();
});
document.getElementById('taskForm').addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('taskTitle').value.trim();
  const subject = document.getElementById('taskSubject').value;
  const date = document.getElementById('taskDate').value;
  let valid = true;
  setError('taskTitle', ''); setError('taskDate', '');
  if (title.length < 3) { setError('taskTitle', 'Enter at least 3 characters.'); valid = false; }
  if (title.length > 80) { setError('taskTitle', 'Keep the title under 80 characters.'); valid = false; }
  if (!subject || !subjects.some(s => s.name === subject)) { showToast('Please add or select a valid subject.'); valid = false; }
  if (!date || date < todayISO()) { setError('taskDate', 'Choose today or a future date.'); valid = false; }
  if (!valid) return;
  tasks.unshift({ id: Date.now(), title, subject, date, done: false }); save(); e.target.reset();
  document.getElementById('taskModal').classList.remove('open'); go('tasks'); showToast('Task saved on this device');
});
document.getElementById('taskTitle').addEventListener('input', () => setError('taskTitle', ''));
document.getElementById('taskDate').addEventListener('change', () => setError('taskDate', ''));
document.getElementById('addSubject').addEventListener('click', () => openModal('subjectModal'));
document.getElementById('subjectForm').addEventListener('submit', e => {
  e.preventDefault(); const name = document.getElementById('subjectName').value.trim();
  setError('subjectName', '');
  if (name.length < 2 || name.length > 40) { setError('subjectName', 'Use 2–40 characters for the subject name.'); return; }
  if (subjects.some(s => s.name.toLowerCase() === name.toLowerCase())) { setError('subjectName', 'This subject already exists.'); return; }
  subjects.push({ id: Date.now(), name, color: document.getElementById('subjectColor').value, icon: '▤' });
  save(); e.target.reset(); document.getElementById('subjectModal').classList.remove('open'); render(); showToast('Subject added successfully');
});
document.getElementById('subjectName').addEventListener('input', () => setError('subjectName', ''));
document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault(); const name = document.getElementById('studentName').value.trim();
  const email = document.getElementById('studentEmail').value.trim();
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Enter a valid name and email address.'); return; }
  profile = { name, email }; save(); render(); showToast('Profile saved on this device'); go('home');
});
document.getElementById('today').textContent = new Date().toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
document.getElementById('studentName').value = profile.name || '';
render();
