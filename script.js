/**
 * FLOATING LIFE OS — script.js
 * Core application logic: 3D background, habit tracking,
 * analytics, evolution engine, AI assistant.
 */

/* ============================================================
   1. THREE.JS — 3D PARTICLE BACKGROUND
   ============================================================ */
(function initThreeJS() {
  const canvas = document.getElementById('bgCanvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 80;

  /* -- Floating Particles -- */
  const particleCount = 300;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  const colorPalette = [
    new THREE.Color(0x00e5ff),
    new THREE.Color(0x7c3aed),
    new THREE.Color(0xff006e),
    new THREE.Color(0x00ff9d),
    new THREE.Color(0xffffff),
  ];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 200;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

    const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i * 3]     = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;

    sizes[i] = Math.random() * 2.5 + 0.5;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    size: 0.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  /* -- Floating Geometric Shapes -- */
  const shapes = [];
  const shapeGeos = [
    new THREE.OctahedronGeometry(3, 0),
    new THREE.TetrahedronGeometry(2.5, 0),
    new THREE.IcosahedronGeometry(2, 0),
  ];
  const shapeMat = new THREE.MeshBasicMaterial({
    color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.06,
  });

  for (let i = 0; i < 8; i++) {
    const geo = shapeGeos[i % shapeGeos.length];
    const mesh = new THREE.Mesh(geo, shapeMat.clone());
    mesh.position.set(
      (Math.random() - 0.5) * 160,
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 60 - 20
    );
    mesh.material.opacity = Math.random() * 0.06 + 0.02;
    mesh.userData.rotSpeed = { x: (Math.random() - 0.5) * 0.003, y: (Math.random() - 0.5) * 0.003 };
    mesh.userData.floatSpeed = Math.random() * 0.002 + 0.001;
    mesh.userData.floatOffset = Math.random() * Math.PI * 2;
    shapes.push(mesh);
    scene.add(mesh);
  }

  /* -- Grid Lines -- */
  const gridMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.04 });
  const gridSize = 200; const gridDivs = 20;
  const step = gridSize / gridDivs;
  for (let i = 0; i <= gridDivs; i++) {
    const x = -gridSize / 2 + i * step;
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, -60, -80),
      new THREE.Vector3(x, -60, 80),
    ]);
    scene.add(new THREE.Line(lineGeo, gridMat));
    const lineGeo2 = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-gridSize / 2, -60, -gridSize / 2 + i * step),
      new THREE.Vector3(gridSize / 2, -60, -gridSize / 2 + i * step),
    ]);
    scene.add(new THREE.Line(lineGeo2, gridMat));
  }

  /* -- Mouse parallax -- */
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* -- Animate -- */
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    particles.rotation.y = t * 0.01;
    particles.rotation.x = t * 0.003;

    camera.position.x += (mouseX * 8 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 4 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    shapes.forEach(s => {
      s.rotation.x += s.userData.rotSpeed.x;
      s.rotation.y += s.userData.rotSpeed.y;
      s.position.y += Math.sin(t * s.userData.floatSpeed + s.userData.floatOffset) * 0.01;
    });

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();


/* ============================================================
   2. DATA LAYER — localStorage persistence
   ============================================================ */
const DB = {
  KEY_HABITS: 'flos_habits',
  KEY_LOGS: 'flos_logs',
  KEY_USER: 'flos_user',
  KEY_SETTINGS: 'flos_settings',

  get habits() { return JSON.parse(localStorage.getItem(this.KEY_HABITS) || '[]'); },
  set habits(v) { localStorage.setItem(this.KEY_HABITS, JSON.stringify(v)); },

  get logs() { return JSON.parse(localStorage.getItem(this.KEY_LOGS) || '{}'); },
  set logs(v) { localStorage.setItem(this.KEY_LOGS, JSON.stringify(v)); },

  get user() {
    return JSON.parse(localStorage.getItem(this.KEY_USER) || JSON.stringify({
      xp: 0, level: 1, totalCompleted: 0, joinDate: new Date().toISOString(),
    }));
  },
  set user(v) { localStorage.setItem(this.KEY_USER, JSON.stringify(v)); },

  get settings() {
    return JSON.parse(localStorage.getItem(this.KEY_SETTINGS) || JSON.stringify({
      sound: true, theme: 'dark',
    }));
  },
  set settings(v) { localStorage.setItem(this.KEY_SETTINGS, JSON.stringify(v)); },

  todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },

  getLog(dateKey) {
    const logs = this.logs;
    return logs[dateKey] || {};
  },

  setLog(dateKey, habitId, done) {
    const logs = this.logs;
    if (!logs[dateKey]) logs[dateKey] = {};
    logs[dateKey][habitId] = done;
    this.logs = logs;
  },

  addXP(amount) {
    const user = this.user;
    user.xp += amount;
    user.totalCompleted += 1;
    // Level up: every 100 XP
    while (user.xp >= user.level * 100) {
      user.xp -= user.level * 100;
      user.level += 1;
      showToast(`🎉 LEVEL UP! You are now Level ${user.level}!`, 4000);
    }
    this.user = user;
    updateXPDisplay();
  },

  getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      days.push(key);
    }
    return days;
  },

  getDayCompletionRate(dateKey) {
    const habits = this.habits;
    if (!habits.length) return 0;
    const log = this.getLog(dateKey);
    const done = habits.filter(h => log[h.id]).length;
    return Math.round((done / habits.length) * 100);
  },

  getStreakCount() {
    let streak = 0;
    let d = new Date();
    // Don't count today if not started
    const todayLog = this.getLog(this.todayKey());
    const todayDone = Object.values(todayLog).some(v => v);
    if (!todayDone) d.setDate(d.getDate() - 1);

    while (true) {
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const rate = this.getDayCompletionRate(key);
      if (rate < 50) break; // Less than 50% doesn't count
      streak++;
      d.setDate(d.getDate() - 1);
      if (streak > 365) break;
    }
    return streak;
  },

  getHabitStreak(habitId) {
    let streak = 0;
    let d = new Date();
    d.setDate(d.getDate() - 1); // start from yesterday
    for (let i = 0; i < 365; i++) {
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const log = this.getLog(key);
      if (log[habitId]) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  },
};


/* ============================================================
   3. LOADING SCREEN
   ============================================================ */
const loadingMessages = [
  'INITIALIZING SYSTEMS...',
  'CALIBRATING 3D MATRIX...',
  'LOADING HABIT PROTOCOLS...',
  'SYNCING PERFORMANCE DATA...',
  'ACTIVATING AI ADVISOR...',
  'SYSTEM ONLINE',
];

(function runLoader() {
  const fill = document.getElementById('loaderFill');
  const text = document.getElementById('loaderText');
  let progress = 0;
  let msgIdx = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 18 + 8;
    if (progress > 100) progress = 100;
    fill.style.width = progress + '%';
    text.textContent = loadingMessages[Math.floor(msgIdx)] || 'SYSTEM ONLINE';
    msgIdx = Math.min(msgIdx + 0.4, loadingMessages.length - 1);

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
        initApp();
      }, 600);
    }
  }, 80);
})();


/* ============================================================
   4. APP INIT
   ============================================================ */
let currentPanel = 'dashboard';
let currentFilter = 'all';
let selectedCategory = 'health';
let soundEnabled = true;
let weeklyChart, priorityChart, forecastChart;
let chatHistory = []; // for API calls

function initApp() {
  initClock();
  updateGreeting();
  bindNavigation();
  bindHabitModal();
  bindQuickAdd();
  bindFilterBtns();
  bindChatInput();
  bindCategoryChips();
  bindSoundToggle();
  bindThemeToggle();
  bindCompletionModal();
  loadSettings();
  renderAll();
  initCharts();
  generateInsights();
  generateBadges();
  updateXPDisplay();
}


/* ============================================================
   5. CLOCK & GREETING
   ============================================================ */
function initClock() {
  function tick() {
    const now = new Date();
    document.getElementById('timeDisplay').textContent =
      now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    document.getElementById('dateDisplay').textContent =
      now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase();
  }
  tick();
  setInterval(tick, 1000);
}

function updateGreeting() {
  const h = new Date().getHours();
  let g = h < 12 ? 'GOOD MORNING' : h < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';
  document.getElementById('greetingText').textContent = `${g}, OPERATOR`;
}


/* ============================================================
   6. NAVIGATION
   ============================================================ */
function bindNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.dataset.panel;
      switchPanel(panel);
    });
  });
}

function switchPanel(name) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`panel-${name}`).classList.add('active');
  document.querySelector(`[data-panel="${name}"]`).classList.add('active');
  currentPanel = name;
  if (name === 'analytics') renderAnalytics();
  if (name === 'evolution') renderEvolution();
  if (name === 'dashboard') renderDashboard();
}


/* ============================================================
   7. RENDER ALL
   ============================================================ */
function renderAll() {
  renderDashboard();
  renderHabitMatrix();
}

function renderDashboard() {
  const habits = DB.habits;
  const today = DB.todayKey();
  const log = DB.getLog(today);

  const total = habits.length;
  const done = habits.filter(h => log[h.id]).length;
  const missed = total - done;
  const pct = total ? Math.round((done / total) * 100) : 0;

  // Score ring
  document.getElementById('dailyScore').textContent = pct;
  document.getElementById('scoreStatus').textContent = total ? `${done} OF ${total} COMPLETE` : 'NO HABITS YET';
  const circumference = 327;
  const offset = circumference - (pct / 100) * circumference;
  document.getElementById('scoreRingFill').style.strokeDashoffset = offset;

  // Quick stats
  document.getElementById('qsTotal').textContent = total;
  document.getElementById('qsDone').textContent = done;
  document.getElementById('qsMissed').textContent = missed;
  document.getElementById('miniProgressFill').style.width = pct + '%';

  // Streak
  const streak = DB.getStreakCount();
  document.getElementById('streakNum').textContent = streak;
  document.getElementById('streakFlame').textContent = streak >= 7 ? '🔥🔥🔥' : streak >= 3 ? '🔥🔥' : streak >= 1 ? '🔥' : '—';

  // Comparison
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const yk = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;
  const yPct = DB.getDayCompletionRate(yk);
  const diff = pct - yPct;
  const cmpY = document.getElementById('cmpYesterday');
  cmpY.textContent = yPct === 0 ? 'N/A' : (diff >= 0 ? `+${diff}%` : `${diff}%`);
  cmpY.style.color = diff >= 0 ? 'var(--success)' : 'var(--danger)';

  const days7 = DB.getLast7Days();
  const avg7 = Math.round(days7.reduce((s, d) => s + DB.getDayCompletionRate(d), 0) / 7);
  const diff7 = pct - avg7;
  const cmpW = document.getElementById('cmpWeek');
  cmpW.textContent = avg7 === 0 ? 'N/A' : (diff7 >= 0 ? `+${diff7}%` : `${diff7}%`);
  cmpW.style.color = diff7 >= 0 ? 'var(--success)' : 'var(--danger)';

  // Dashboard insight
  renderDashInsight(pct, diff, streak);

  // Today's mini habit list
  renderDashHabitList();
}

function renderDashInsight(pct, diff, streak) {
  const insights = [];
  if (!DB.habits.length) insights.push({ text: 'No habits configured. Add your first habit to start tracking performance.', tag: 'START HERE' });
  else if (pct === 100) insights.push({ text: '🏆 PERFECT SCORE! You completed all habits today. Outstanding discipline.', tag: 'PERFECT DAY' });
  else if (pct >= 75) insights.push({ text: `Strong performance at ${pct}% completion. Keep the momentum — you're in the top tier today.`, tag: 'HIGH PERFORMANCE' });
  else if (pct >= 50) insights.push({ text: `You're at ${pct}% today. Push through the remaining habits — the finish line is close.`, tag: 'ON TRACK' });
  else if (pct > 0) insights.push({ text: `Only ${pct}% complete today. Time to accelerate — every completed habit compounds your growth.`, tag: 'ACTION NEEDED' });
  else insights.push({ text: 'No habits completed yet today. Every master was once a beginner. Start your first habit now.', tag: 'BEGIN NOW' });

  if (streak >= 7) insights.push({ text: `🔥 ${streak}-day streak! You've built serious momentum. Protect it at all costs.`, tag: 'STREAK POWER' });

  const chosen = insights[0];
  document.getElementById('dashInsight').textContent = chosen.text;
  document.getElementById('dashInsightTag').textContent = chosen.tag;
}

function renderDashHabitList() {
  const habits = DB.habits;
  const log = DB.getLog(DB.todayKey());
  const container = document.getElementById('dashHabitList');

  if (!habits.length) {
    container.innerHTML = '<div class="empty-state">No habits yet. Add your first mission above.</div>';
    return;
  }

  const priorityColors = { high: 'var(--accent3)', medium: 'var(--accent)', low: 'var(--success)' };

  container.innerHTML = habits.map(h => {
    const isDone = log[h.id] || false;
    return `
    <div class="habit-mini-item ${isDone ? 'completed' : ''}" style="--priority-color: ${priorityColors[h.priority]}">
      <div class="habit-check ${isDone ? 'done' : ''}" onclick="toggleHabitToday('${h.id}')">
        ${isDone ? '✓' : ''}
      </div>
      <div class="habit-mini-info">
        <div class="habit-mini-name" style="${isDone ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${escHtml(h.name)}</div>
        <div class="habit-mini-meta">${h.category.toUpperCase()} ${h.timeTarget ? `· ${h.timeTarget} MIN` : ''}</div>
      </div>
      <div class="habit-priority-badge priority-${h.priority}">${h.priority.toUpperCase()}</div>
    </div>`;
  }).join('');
}


/* ============================================================
   8. HABIT MATRIX (full panel)
   ============================================================ */
function renderHabitMatrix() {
  const habits = DB.habits;
  const log = DB.getLog(DB.todayKey());
  const container = document.getElementById('habitsContainer');
  const emptyState = document.getElementById('habitsEmptyState');

  const filtered = currentFilter === 'all' ? habits : habits.filter(h => h.priority === currentFilter);

  if (!habits.length) {
    emptyState.style.display = 'flex';
    container.querySelectorAll('.habit-card').forEach(c => c.remove());
    return;
  }
  emptyState.style.display = 'none';
  container.querySelectorAll('.habit-card').forEach(c => c.remove());

  filtered.forEach((h, i) => {
    const isDone = log[h.id] || false;
    const streak = DB.getHabitStreak(h.id);
    const totalLogs = Object.values(DB.logs).filter(d => d[h.id]).length;
    const days7 = DB.getLast7Days();
    const week7Done = days7.filter(d => DB.getLog(d)[h.id]).length;
    const weekRate = Math.round((week7Done / 7) * 100);

    const card = document.createElement('div');
    card.className = `habit-card ${isDone ? 'completed' : ''}`;
    card.style.animationDelay = `${i * 0.05}s`;
    card.dataset.id = h.id;
    card.dataset.priority = h.priority;

    const catIcons = { health: '🧬', mind: '🧠', work: '⚡', fitness: '💪', social: '🌐', creative: '✦' };

    card.innerHTML = `
      <div class="habit-card-header">
        <div class="habit-card-name">${escHtml(h.name)}</div>
        <div class="habit-card-actions">
          <button class="hc-btn delete" onclick="deleteHabit('${h.id}')" title="Delete">✕</button>
        </div>
      </div>
      <div class="habit-card-meta">
        <span class="meta-chip">${catIcons[h.category] || '◎'} ${h.category.toUpperCase()}</span>
        <span class="meta-chip priority-${h.priority}">${h.priority.toUpperCase()}</span>
        ${h.timeTarget ? `<span class="meta-chip">⏱ ${h.timeTarget}M</span>` : ''}
        <span class="meta-chip">🔥 ${streak}d STREAK</span>
        <span class="meta-chip">✦ ${totalLogs} TOTAL</span>
      </div>
      <div class="habit-card-progress">
        <div class="habit-streak-label">7-DAY RATE: ${weekRate}%</div>
        <div class="habit-progress-bar">
          <div class="habit-progress-fill" style="width: ${weekRate}%"></div>
        </div>
      </div>
      ${h.notes ? `<div style="font-size:0.72rem;color:var(--text-dim);margin-bottom:0.5rem;font-family:var(--font-body)">${escHtml(h.notes)}</div>` : ''}
      <button class="habit-complete-btn ${isDone ? 'done' : ''}" onclick="toggleHabitToday('${h.id}')">
        ${isDone ? '✓ MISSION COMPLETE' : '◎ MARK COMPLETE'}
      </button>
    `;

    emptyState.insertAdjacentElement('afterend', card);
  });
}

function bindFilterBtns() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderHabitMatrix();
    });
  });
}


/* ============================================================
   9. HABIT CRUD
   ============================================================ */
function bindHabitModal() {
  document.getElementById('openAddHabitModal').addEventListener('click', () => openHabitModal());
  document.getElementById('closeHabitModal').addEventListener('click', () => closeHabitModal());
  document.getElementById('cancelHabitBtn').addEventListener('click', () => closeHabitModal());
  document.getElementById('saveHabitBtn').addEventListener('click', () => saveHabit());
  document.getElementById('addHabitModal').addEventListener('click', e => {
    if (e.target.id === 'addHabitModal') closeHabitModal();
  });
}

function bindCategoryChips() {
  document.getElementById('categoryChips').addEventListener('click', e => {
    if (e.target.classList.contains('chip')) {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      selectedCategory = e.target.dataset.cat;
    }
  });
}

function openHabitModal() {
  document.getElementById('addHabitModal').classList.add('active');
  document.getElementById('habitName').focus();
}

function closeHabitModal() {
  document.getElementById('addHabitModal').classList.remove('active');
  document.getElementById('habitName').value = '';
  document.getElementById('habitTime').value = '';
  document.getElementById('habitNotes').value = '';
  document.getElementById('habitPriority').value = 'medium';
  document.querySelectorAll('.chip').forEach((c, i) => { c.classList.toggle('active', i === 0); });
  selectedCategory = 'health';
}

function saveHabit() {
  const name = document.getElementById('habitName').value.trim();
  if (!name) { showToast('Please enter a habit name.'); return; }

  const habit = {
    id: `h_${Date.now()}`,
    name,
    priority: document.getElementById('habitPriority').value,
    timeTarget: parseInt(document.getElementById('habitTime').value) || null,
    category: selectedCategory,
    notes: document.getElementById('habitNotes').value.trim(),
    createdAt: new Date().toISOString(),
  };

  const habits = DB.habits;
  habits.push(habit);
  DB.habits = habits;

  closeHabitModal();
  playSFX('add');
  showToast(`✓ Habit "${name}" deployed.`);
  renderAll();
}

function bindQuickAdd() {
  document.getElementById('quickAddBtn').addEventListener('click', quickAddHabit);
  document.getElementById('quickHabitName').addEventListener('keydown', e => {
    if (e.key === 'Enter') quickAddHabit();
  });
}

function quickAddHabit() {
  const name = document.getElementById('quickHabitName').value.trim();
  if (!name) return;

  const habit = {
    id: `h_${Date.now()}`,
    name,
    priority: document.getElementById('quickHabitPriority').value,
    timeTarget: parseInt(document.getElementById('quickHabitTime').value) || null,
    category: 'health',
    notes: '',
    createdAt: new Date().toISOString(),
  };

  const habits = DB.habits;
  habits.push(habit);
  DB.habits = habits;

  document.getElementById('quickHabitName').value = '';
  document.getElementById('quickHabitTime').value = '';
  playSFX('add');
  showToast(`✓ "${name}" added.`);
  renderAll();
}

function deleteHabit(id) {
  const habits = DB.habits.filter(h => h.id !== id);
  DB.habits = habits;
  showToast('Habit removed.');
  renderAll();
}


/* ============================================================
   10. TOGGLE HABIT COMPLETION
   ============================================================ */
function toggleHabitToday(id) {
  const today = DB.todayKey();
  const log = DB.getLog(today);
  const wasComplete = log[id] || false;
  DB.setLog(today, id, !wasComplete);

  if (!wasComplete) {
    // Completed!
    const habit = DB.habits.find(h => h.id === id);
    const xpEarned = { high: 30, medium: 20, low: 10 }[habit?.priority] || 15;
    DB.addXP(xpEarned);
    playSFX('complete');
    showCompletionModal(habit?.name || 'Habit', xpEarned);
  }

  renderAll();
}

function showCompletionModal(habitName, xp) {
  document.getElementById('completionHabitName').textContent = habitName;
  document.getElementById('completionXP').textContent = `+${xp} XP`;
  document.getElementById('completionModal').classList.add('active');
}

function bindCompletionModal() {
  document.getElementById('closeCompletionModal').addEventListener('click', () => {
    document.getElementById('completionModal').classList.remove('active');
  });
  document.getElementById('completionModal').addEventListener('click', e => {
    if (e.target.id === 'completionModal') document.getElementById('completionModal').classList.remove('active');
  });
}


/* ============================================================
   11. CHARTS — Chart.js
   ============================================================ */
function initCharts() {
  Chart.defaults.color = 'rgba(180, 220, 255, 0.45)';
  Chart.defaults.borderColor = 'rgba(0, 229, 255, 0.08)';
  Chart.defaults.font.family = "'Share Tech Mono', monospace";
  Chart.defaults.font.size = 11;
}

function renderAnalytics() {
  const days7 = DB.getLast7Days();
  const labels = days7.map(d => {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  });
  const data = days7.map(d => DB.getDayCompletionRate(d));

  // Weekly chart
  const wCtx = document.getElementById('weeklyChart').getContext('2d');
  if (weeklyChart) weeklyChart.destroy();
  weeklyChart = new Chart(wCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Completion %',
        data,
        backgroundColor: data.map(v =>
          v >= 80 ? 'rgba(0, 255, 157, 0.3)' :
          v >= 50 ? 'rgba(0, 229, 255, 0.25)' :
          'rgba(255, 0, 110, 0.2)'
        ),
        borderColor: data.map(v =>
          v >= 80 ? 'rgba(0, 255, 157, 0.7)' :
          v >= 50 ? 'rgba(0, 229, 255, 0.6)' :
          'rgba(255, 0, 110, 0.5)'
        ),
        borderWidth: 1,
        borderRadius: 4,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, max: 100, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(0, 229, 255, 0.05)' } },
        x: { grid: { display: false } },
      },
    },
  });

  // Priority chart
  const habits = DB.habits;
  const high = habits.filter(h => h.priority === 'high').length;
  const med  = habits.filter(h => h.priority === 'medium').length;
  const low  = habits.filter(h => h.priority === 'low').length;

  const pCtx = document.getElementById('priorityChart').getContext('2d');
  if (priorityChart) priorityChart.destroy();
  priorityChart = new Chart(pCtx, {
    type: 'doughnut',
    data: {
      labels: ['HIGH', 'MEDIUM', 'LOW'],
      datasets: [{
        data: [high, med, low],
        backgroundColor: ['rgba(255, 0, 110, 0.4)', 'rgba(0, 229, 255, 0.35)', 'rgba(0, 255, 157, 0.3)'],
        borderColor: ['rgba(255, 0, 110, 0.8)', 'rgba(0, 229, 255, 0.7)', 'rgba(0, 255, 157, 0.6)'],
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 12, boxWidth: 10 },
        },
      },
    },
  });

  // Streak map
  const streakMap = document.getElementById('streakMap');
  streakMap.innerHTML = days7.map(d => {
    const rate = DB.getDayCompletionRate(d);
    const cls = rate >= 80 ? 'full' : rate >= 40 ? 'partial' : rate > 0 ? 'done' : '';
    const dt = new Date(d + 'T00:00:00');
    const label = dt.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    return `<div class="streak-day ${cls}">
      <div class="streak-day-label">${label}</div>
      <div class="streak-day-pct">${rate}%</div>
    </div>`;
  }).join('');

  // Habit breakdown
  const breakdown = document.getElementById('habitBreakdown');
  if (!habits.length) {
    breakdown.innerHTML = '<div class="empty-state">No habits to analyze.</div>';
    return;
  }
  breakdown.innerHTML = habits.map(h => {
    const days = DB.getLast7Days();
    const done = days.filter(d => DB.getLog(d)[h.id]).length;
    const rate = Math.round((done / 7) * 100);
    const color = rate >= 80 ? 'var(--success)' : rate >= 50 ? 'var(--accent)' : 'var(--accent3)';
    return `<div class="breakdown-item">
      <div class="breakdown-name">${escHtml(h.name)}</div>
      <div class="breakdown-bar-wrap">
        <div class="breakdown-bar" style="width:${rate}%;background:${color}"></div>
      </div>
      <div class="breakdown-pct">${rate}%</div>
    </div>`;
  }).join('');

  // Forecast chart
  const fCtx = document.getElementById('forecastChart').getContext('2d');
  if (forecastChart) forecastChart.destroy();
  const forecastData = [...data];
  const lastVal = forecastData[forecastData.length - 1] || 50;
  const trend = data.length > 1 ? (data[data.length-1] - data[0]) / data.length : 2;
  for (let i = 1; i <= 7; i++) {
    forecastData.push(Math.min(100, Math.max(0, Math.round(lastVal + trend * i + (Math.random()-0.5)*5))));
  }
  const forecastLabels = [
    ...labels,
    ...['D+1','D+2','D+3','D+4','D+5','D+6','D+7'],
  ];

  forecastChart = new Chart(fCtx, {
    type: 'line',
    data: {
      labels: forecastLabels,
      datasets: [
        {
          label: 'Actual',
          data: [...data, ...Array(7).fill(null)],
          borderColor: 'rgba(0, 229, 255, 0.8)',
          backgroundColor: 'rgba(0, 229, 255, 0.05)',
          borderWidth: 2,
          pointRadius: 4,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Forecast',
          data: [...Array(7).fill(null), ...forecastData.slice(7)],
          borderColor: 'rgba(124, 58, 237, 0.6)',
          backgroundColor: 'rgba(124, 58, 237, 0.05)',
          borderWidth: 2,
          borderDash: [5, 4],
          pointRadius: 3,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'bottom', labels: { padding: 12, boxWidth: 10 } } },
      scales: {
        y: { min: 0, max: 100, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(0, 229, 255, 0.05)' } },
        x: { grid: { display: false } },
      },
    },
  });
}


/* ============================================================
   12. EVOLUTION ENGINE
   ============================================================ */
const TITLES = [
  [0, 'INITIATE'], [5, 'TRAINEE'], [10, 'PRACTITIONER'],
  [15, 'OPERATOR'], [20, 'SPECIALIST'], [30, 'EXPERT'],
  [50, 'MASTER'], [75, 'GRANDMASTER'], [100, 'LEGEND'],
];

function getTitle(level) {
  let title = TITLES[0][1];
  for (const [l, t] of TITLES) { if (level >= l) title = t; }
  return title;
}

function renderEvolution() {
  const user = DB.user;
  const level = user.level;
  const xpNeeded = level * 100;
  const xpPct = Math.round((user.xp / xpNeeded) * 100);

  document.getElementById('avatarLevel').textContent = `LVL ${level}`;
  document.getElementById('evoTitle').textContent = getTitle(level);
  document.getElementById('evoXpFill').style.width = xpPct + '%';
  document.getElementById('evoXpLabel').textContent = `${user.xp} / ${xpNeeded} XP`;
  document.getElementById('avatarCore').textContent = level >= 10 ? '★' : level >= 5 ? '◈' : '⬡';

  generateInsights();
  generateBadges();
  renderAnalytics(); // also render forecast
}

function generateInsights() {
  const habits = DB.habits;
  const days7 = DB.getLast7Days();
  const data7 = days7.map(d => DB.getDayCompletionRate(d));
  const avg7 = data7.reduce((s, v) => s + v, 0) / 7;
  const streak = DB.getStreakCount();
  const today = DB.getDayCompletionRate(DB.todayKey());

  const insights = [];

  if (!habits.length) {
    insights.push({ text: 'No data yet. Start by adding habits and completing them daily.', cls: 'neutral' });
    document.getElementById('insightsList').innerHTML = insights.map(i => `<div class="insight-item ${i.cls}">${i.text}</div>`).join('');
    return;
  }

  // Trend analysis
  if (data7.length >= 2) {
    const recent3 = data7.slice(-3).reduce((s,v) => s+v, 0) / 3;
    const prev3 = data7.slice(0, 3).reduce((s,v) => s+v, 0) / 3;
    const trendDiff = Math.round(recent3 - prev3);
    if (trendDiff > 10) insights.push({ text: `📈 Upward trajectory: You are ${trendDiff}% more consistent recently than earlier this week.`, cls: 'positive' });
    else if (trendDiff < -10) insights.push({ text: `📉 Declining pattern detected: ${Math.abs(trendDiff)}% drop in recent performance. Recalibrate your approach.`, cls: 'negative' });
    else insights.push({ text: '📊 Consistent performance this week. Stability is the foundation of mastery.', cls: 'neutral' });
  }

  // Streak insight
  if (streak >= 7) insights.push({ text: `🔥 ${streak}-day streak! You are in the top tier of performers. Protect your chain.`, cls: 'positive' });
  else if (streak >= 3) insights.push({ text: `🔥 ${streak}-day streak building. Momentum is forming — don't break it now.`, cls: 'positive' });
  else insights.push({ text: '💡 Build a streak by completing 50%+ of habits daily. Streaks compound into life-changing habits.', cls: 'neutral' });

  // Best/worst habit analysis
  if (habits.length >= 2) {
    const habitRates = habits.map(h => ({
      name: h.name,
      rate: Math.round(days7.filter(d => DB.getLog(d)[h.id]).length / 7 * 100),
    })).sort((a, b) => b.rate - a.rate);

    const best = habitRates[0];
    const worst = habitRates[habitRates.length - 1];
    if (best.rate > 0) insights.push({ text: `⭐ Your strongest habit is "${best.name}" at ${best.rate}% this week. Use it as your anchor.`, cls: 'positive' });
    if (worst.rate < 50) insights.push({ text: `⚠ "${worst.name}" needs attention at only ${worst.rate}% this week. Identify what's blocking it.`, cls: 'negative' });
  }

  // Time-of-day insight (based on hour of last log)
  const h = new Date().getHours();
  if (h >= 21 && today < 50) insights.push({ text: '🌙 Your completion rate tends to drop late evening. Consider front-loading high-priority habits before 6 PM.', cls: 'negative' });
  if (h < 10 && today > 0) insights.push({ text: '🌅 Morning performer detected. You are building powerful AM momentum.', cls: 'positive' });

  // XP pace
  const user = DB.user;
  if (user.xp > 0) insights.push({ text: `⚡ You have earned ${user.xp} XP toward Level ${user.level + 1}. ${user.level * 100 - user.xp} XP remaining to advance.`, cls: 'neutral' });

  document.getElementById('insightsList').innerHTML =
    insights.slice(0, 5).map(i => `<div class="insight-item ${i.cls}">${i.text}</div>`).join('') ||
    '<div class="insight-item neutral">Complete more habits to unlock insights.</div>';
}

const ALL_BADGES = [
  { id: 'first_habit', icon: '🌱', name: 'FIRST STEP', check: () => DB.habits.length >= 1 },
  { id: 'five_habits', icon: '⚡', name: 'BUILDER', check: () => DB.habits.length >= 5 },
  { id: 'first_complete', icon: '✓', name: 'ACHIEVER', check: () => DB.user.totalCompleted >= 1 },
  { id: 'streak_3', icon: '🔥', name: '3-DAY FIRE', check: () => DB.getStreakCount() >= 3 },
  { id: 'streak_7', icon: '🔥', name: 'WEEK BLAZE', check: () => DB.getStreakCount() >= 7 },
  { id: 'streak_30', icon: '💎', name: 'MONTH LORD', check: () => DB.getStreakCount() >= 30 },
  { id: 'perfect_day', icon: '★', name: 'PERFECT DAY', check: () => DB.getDayCompletionRate(DB.todayKey()) === 100 },
  { id: 'level_5', icon: '🏆', name: 'LEVEL 5', check: () => DB.user.level >= 5 },
  { id: 'level_10', icon: '👑', name: 'LEVEL 10', check: () => DB.user.level >= 10 },
  { id: 'total_50', icon: '🎯', name: '50 DONE', check: () => DB.user.totalCompleted >= 50 },
  { id: 'total_100', icon: '🌟', name: '100 DONE', check: () => DB.user.totalCompleted >= 100 },
  { id: 'xp_500', icon: '💫', name: '500 XP', check: () => { const u = DB.user; return u.xp + (u.level - 1) * 100 >= 500 || u.totalCompleted * 15 >= 500; } },
];

function generateBadges() {
  const grid = document.getElementById('badgesGrid');
  grid.innerHTML = ALL_BADGES.map(b => {
    const earned = b.check();
    return `<div class="badge-item ${earned ? 'earned' : 'locked'}" title="${b.name}">
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-name">${b.name}</div>
    </div>`;
  }).join('');
}


/* ============================================================
   13. XP DISPLAY
   ============================================================ */
function updateXPDisplay() {
  const user = DB.user;
  const xpNeeded = user.level * 100;
  const pct = Math.round((user.xp / xpNeeded) * 100);

  document.getElementById('userLevel').textContent = user.level;
  document.getElementById('xpPoints').textContent = `${user.xp} XP`;
  document.getElementById('xpBarMini').style.width = pct + '%';
  document.getElementById('avatarLevel')?.setAttribute('textContent', `LVL ${user.level}`);
}


/* ============================================================
   14. AI ASSISTANT
   ============================================================ */
function bindChatInput() {
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');

  sendBtn.addEventListener('click', () => sendMessage());
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });

  // Quick prompts
  document.getElementById('quickPrompts').addEventListener('click', e => {
    if (e.target.classList.contains('qp-btn')) {
      document.getElementById('chatInput').value = e.target.dataset.prompt;
      sendMessage();
    }
  });
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  input.style.height = 'auto';
  appendChatMsg('user', text);

  const aiStatus = document.getElementById('aiStatus');
  const sendBtn = document.getElementById('sendBtn');
  const orbCore = document.querySelector('.orb-core');
  aiStatus.textContent = 'PROCESSING';
  aiStatus.className = 'ai-status thinking';
  sendBtn.disabled = true;
  orbCore?.classList.add('thinking');

  // Build context about user's data
  const context = buildAIContext();

  // Add to history
  chatHistory.push({ role: 'user', content: text });

  try {
    const reply = await callClaudeAPI(context, chatHistory);
    chatHistory.push({ role: 'assistant', content: reply });
    appendChatMsg('ai', reply);
  } catch (err) {
    // Fallback to rule-based responses
    const reply = generateLocalResponse(text, context);
    chatHistory.push({ role: 'assistant', content: reply });
    appendChatMsg('ai', reply);
  }

  aiStatus.textContent = 'READY';
  aiStatus.className = 'ai-status';
  sendBtn.disabled = false;
  orbCore?.classList.remove('thinking');
}

function buildAIContext() {
  const habits = DB.habits;
  const today = DB.todayKey();
  const log = DB.getLog(today);
  const days7 = DB.getLast7Days();
  const data7 = days7.map(d => DB.getDayCompletionRate(d));
  const avg7 = Math.round(data7.reduce((s, v) => s + v, 0) / 7);
  const streak = DB.getStreakCount();
  const user = DB.user;
  const todayRate = DB.getDayCompletionRate(today);

  const habitSummary = habits.map(h => {
    const done7 = days7.filter(d => DB.getLog(d)[h.id]).length;
    return `${h.name} (${h.priority} priority, ${Math.round(done7/7*100)}% this week${log[h.id] ? ', DONE TODAY' : ''})`;
  }).join('; ');

  return `You are the AI Advisor inside "Floating Life OS", a futuristic habit tracking system. 
You are direct, motivating, and data-driven like a high-performance coach.

USER DATA:
- Level: ${user.level} (${getTitle(user.level)})
- Total completions: ${user.totalCompleted}
- Current streak: ${streak} days
- Today's completion rate: ${todayRate}%
- 7-day average: ${avg7}%
- Weekly rates (oldest to newest): ${data7.join('%, ')}%
- Habits: ${habitSummary || 'No habits configured yet'}

Respond concisely (2-4 sentences max unless analysis is requested). Be specific with their data. Be motivating but honest.`;
}

async function callClaudeAPI(systemPrompt, history) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: history.slice(-10), // Keep last 10 messages for context
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  return data.content[0]?.text || 'Unable to generate response.';
}

// Fallback local AI response if API fails
function generateLocalResponse(text, context) {
  const lower = text.toLowerCase();
  const habits = DB.habits;
  const today = DB.todayKey();
  const log = DB.getLog(today);
  const done = habits.filter(h => log[h.id]).length;
  const total = habits.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const streak = DB.getStreakCount();
  const days7 = DB.getLast7Days();
  const avg7 = Math.round(days7.reduce((s, d) => s + DB.getDayCompletionRate(d), 0) / 7);

  if (!total) return "You haven't configured any habits yet. Add your first habit protocol to begin tracking performance. Every transformation starts with a single commitment.";

  if (lower.includes('motivat') || lower.includes('motivate')) {
    const quotes = [
      `You're at ${pct}% today with a ${streak}-day streak. Every rep builds the person you're becoming. The version of you 6 months from now is watching right now.`,
      `${streak > 0 ? `${streak} consecutive days of showing up.` : 'A new streak starts with today.'} Your habits are your identity. Each completion is a vote for who you want to be.`,
      `${pct}% complete today. ${total - done} habits remain. The gap between who you are and who you want to be is measured in the actions you take in the next hour.`,
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  if (lower.includes('analyz') || lower.includes('performance') || lower.includes('insights')) {
    const habitRates = habits.map(h => ({
      name: h.name,
      rate: Math.round(days7.filter(d => DB.getLog(d)[h.id]).length / 7 * 100),
    })).sort((a, b) => b.rate - a.rate);
    const best = habitRates[0];
    const worst = habitRates[habitRates.length - 1];
    return `Performance Analysis: Today ${pct}%, 7-day average ${avg7}%, ${streak}-day streak. Your strongest habit this week is "${best.name}" (${best.rate}%). Focus area: "${worst.name}" at ${worst.rate}% — this is your biggest growth lever.`;
  }

  if (lower.includes('improv') || lower.includes('suggest') || lower.includes('weak')) {
    const habitRates = habits.map(h => ({
      name: h.name,
      rate: Math.round(days7.filter(d => DB.getLog(d)[h.id]).length / 7 * 100),
    })).sort((a, b) => a.rate - b.rate);
    const worst = habitRates[0];
    return worst.rate < 70
      ? `Your primary optimization target is "${worst.name}" — only ${worst.rate}% completion this week. I recommend scheduling it at a fixed time, stacking it with an existing habit, and reducing friction by preparing ahead.`
      : `Impressive consistency across all habits! Your lowest is still ${worst.rate}%. At this level, consider adding a stretch goal or increasing the time target on your highest-priority habits.`;
  }

  if (lower.includes('streak')) {
    return streak > 0
      ? `You're on a ${streak}-day streak. At 7 days, habits become routines. At 21 days, they become automatic. At 66 days, they become identity. Keep going.`
      : 'No active streak. Every master has been where you are now. A single day of execution restarts everything.';
  }

  // Default
  const defaults = [
    `Today: ${pct}% complete (${done}/${total} habits). 7-day average: ${avg7}%. ${streak > 0 ? `${streak}-day streak active — protect it.` : 'Start a streak by completing 50%+ of habits today.'}`,
    `Your data shows a 7-day average of ${avg7}%. The science is clear: 66 days of consistency builds automatic behavior. You are at day ${streak} of your current streak.`,
    `${done} of ${total} habits complete today. The compound effect means that ${avg7}% consistency today will make you dramatically different in 90 days.`,
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

function appendChatMsg(role, text) {
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.innerHTML = `
    <div class="msg-icon">${role === 'ai' ? '◉' : '◈'}</div>
    <div class="msg-bubble">
      <div class="msg-name">${role === 'ai' ? 'LIFE OS ADVISOR' : 'OPERATOR'}</div>
      <div class="msg-text">${escHtml(text)}</div>
    </div>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}


/* ============================================================
   15. SETTINGS
   ============================================================ */
function loadSettings() {
  const s = DB.settings;
  soundEnabled = s.sound;
  if (s.theme === 'light') document.body.classList.add('theme-light');
}

function bindSoundToggle() {
  document.getElementById('soundToggle').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    const s = DB.settings;
    s.sound = soundEnabled;
    DB.settings = s;
    showToast(`Sound ${soundEnabled ? 'ON' : 'OFF'}`);
  });
}

function bindThemeToggle() {
  document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('theme-light');
    const s = DB.settings;
    s.theme = document.body.classList.contains('theme-light') ? 'light' : 'dark';
    DB.settings = s;
  });
}


/* ============================================================
   16. SOUND EFFECTS (Web Audio API)
   ============================================================ */
let audioCtx;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playSFX(type) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'complete') {
      // Victory chime: ascending notes
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'add') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(528, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) { /* silent fail */ }
}


/* ============================================================
   17. TOAST NOTIFICATIONS
   ============================================================ */
let toastTimeout;
function showToast(msg, duration = 2500) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('visible'), duration);
}


/* ============================================================
   18. UTILITIES
   ============================================================ */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Add SVG gradient definition for score ring
document.addEventListener('DOMContentLoaded', () => {
  const svg = document.querySelector('.score-ring');
  if (svg) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#7c3aed"/>
        <stop offset="100%" stop-color="#00e5ff"/>
      </linearGradient>`;
    svg.insertBefore(defs, svg.firstChild);
  }
});

/* ============================================================
   19. PWA SERVICE WORKER REGISTRATION
   ============================================================ */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
