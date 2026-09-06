/* ==========================================================
   StudyMate — vanilla JS, no backend, localStorage persistence
   ========================================================== */

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const START_HOUR = 7;   // 7am
const END_HOUR = 22;    // 10pm (exclusive)
const HOURS = Array.from({length: END_HOUR - START_HOUR}, (_, i) => START_HOUR + i);
const ROW_H = 40;

const PALETTE = ['#e0a458','#7cb88f','#8fb3d9','#c98fbf','#d97867','#8fd9c4','#c9b26a'];

/* ---------- State ---------- */
let state = load('studymate_state', {
  subjects: [
    { id: s(), name: 'Math', color: PALETTE[0] },
    { id: s(), name: 'Physics', color: PALETTE[1] },
    { id: s(), name: 'English', color: PALETTE[2] },
  ],
  blocks: [],       // {id, day(0-6), start, dur, subjectId, done, video}
  notes: [],        // {id, subjectId, text, summary, keypoints, date}
  cards: [],        // {id, subjectId, front, back, interval, due, reps}
  sessions: [],     // {id, subjectId, minutes, intention, date}
});

function s(){ return Math.random().toString(36).slice(2,10); }
function load(key, fallback){
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch(e){ return fallback; }
}
function save(){
  localStorage.setItem('studymate_state', JSON.stringify(state));
}
function subjectById(id){ return state.subjects.find(x => x.id === id); }

function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ---------- Tabs ---------- */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'flashcards') renderFlashcards();
  });
});

/* ---------- Subject select helpers (shared across the app) ---------- */
function populateSubjectSelect(selectEl, { includeAdd = true } = {}){
  const prevVal = selectEl.value;
  selectEl.innerHTML = '';
  state.subjects.forEach(subj => {
    const opt = document.createElement('option');
    opt.value = subj.id;
    opt.textContent = subj.name;
    selectEl.appendChild(opt);
  });
  if (includeAdd) {
    const opt = document.createElement('option');
    opt.value = '__add__';
    opt.textContent = '+ Add new subject...';
    selectEl.appendChild(opt);
  }
  if ([...selectEl.options].some(o => o.value === prevVal)) selectEl.value = prevVal;
}

function handleAddSubjectIfNeeded(selectEl, onAdded){
  selectEl.addEventListener('change', () => {
    if (selectEl.value === '__add__') {
      const name = prompt('New subject name:');
      if (name && name.trim()) {
        const subj = { id: s(), name: name.trim(), color: PALETTE[state.subjects.length % PALETTE.length] };
        state.subjects.push(subj);
        save();
        refreshAllSubjectSelects();
        selectEl.value = subj.id;
        renderLegend();
        if (onAdded) onAdded(subj);
      } else {
        selectEl.selectedIndex = 0;
      }
    }
  });
}

const allSubjectSelects = [];
function registerSubjectSelect(el, opts){
  populateSubjectSelect(el, opts);
  handleAddSubjectIfNeeded(el);
  allSubjectSelects.push({ el, opts });
}
function refreshAllSubjectSelects(){
  allSubjectSelects.forEach(({el, opts}) => populateSubjectSelect(el, opts));
}

/* ---------- Legend ---------- */
function renderLegend(){
  const box = document.getElementById('subjectLegend');
  box.innerHTML = '';
  state.subjects.forEach(subj => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<span class="legend-dot" style="background:${subj.color}"></span>${subj.name}`;
    box.appendChild(item);
  });
}

/* ==========================================================
   TIMETABLE
   ========================================================== */
function renderTimetable(){
  const grid = document.getElementById('timetableGrid');
  grid.innerHTML = '';

  // header row
  const header = document.createElement('div');
  header.className = 'grid-header';
  header.innerHTML = `<div class="head-cell time-head"></div>` +
    DAYS.map(d => `<div class="head-cell day-head">${d}</div>`).join('');
  grid.appendChild(header);

  // body
  const body = document.createElement('div');
  body.className = 'grid-body';

  const timeCol = document.createElement('div');
  timeCol.className = 'time-col';
  HOURS.forEach(h => {
    const tc = document.createElement('div');
    tc.className = 'time-cell';
    tc.textContent = formatHour(h);
    timeCol.appendChild(tc);
  });
  body.appendChild(timeCol);

  DAYS.forEach((_, dayIdx) => {
    const dayCol = document.createElement('div');
    dayCol.className = 'day-col';

    HOURS.forEach((h, hourIdx) => {
      const cell = document.createElement('div');
      cell.className = 'slot-cell';
      cell.dataset.day = dayIdx;
      cell.dataset.hour = h;
      cell.addEventListener('click', (e) => openSlotPopover(e, dayCol, dayIdx, h));
      dayCol.appendChild(cell);
    });

    // render blocks for this day
    state.blocks.filter(b => b.day === dayIdx).forEach(b => {
      const subj = subjectById(b.subjectId);
      if (!subj) return;
      const startIdx = HOURS.indexOf(b.start);
      if (startIdx === -1) return;
      const el = document.createElement('div');
      el.className = 'block' + (b.done ? ' done' : '');
      el.style.top = (startIdx * ROW_H + 2) + 'px';
      el.style.height = (b.dur * ROW_H - 4) + 'px';
      el.style.background = subj.color;
      el.innerHTML = `${subj.name}${b.video ? '<div class="block-video-flag">▶ video linked</div>' : ''}`;
      el.title = b.done ? 'Completed — click to reopen' : 'Click to mark complete / remove';
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        handleBlockClick(b.id);
      });
      dayCol.appendChild(el);
    });

    body.appendChild(dayCol);
  });

  grid.appendChild(body);
}

function formatHour(h){
  const period = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}${period}`;
}

function handleBlockClick(blockId){
  const block = state.blocks.find(b => b.id === blockId);
  if (!block) return;
  const choice = confirm('Mark this block as done? (Cancel to remove it instead)');
  if (choice) {
    block.done = true;
    toast('Nice work — block marked complete.');
  } else {
    const reallyRemove = confirm('Remove this block from your timetable?');
    if (reallyRemove) state.blocks = state.blocks.filter(b => b.id !== blockId);
  }
  save();
  renderTimetable();
}

/* ---- Slot popover (add a block) ---- */
let activePopover = null;
function openSlotPopover(e, dayCol, dayIdx, hour){
  closePopover();
  const pop = document.createElement('div');
  pop.className = 'slot-popover';
  const hourIdx = HOURS.indexOf(hour);
  pop.style.top = (hourIdx * ROW_H) + 'px';
  pop.style.left = '4px';

  pop.innerHTML = `
    <label style="margin-top:0">Subject</label>
    <select class="pop-subject"></select>
    <label>Duration</label>
    <select class="pop-duration">
      <option value="1">1 hour</option>
      <option value="2">2 hours</option>
      <option value="3">3 hours</option>
    </select>
    <div class="popover-actions">
      <button class="btn btn-ghost pop-cancel">Cancel</button>
      <button class="btn btn-primary pop-add">Add</button>
    </div>
  `;
  dayCol.appendChild(pop);
  activePopover = pop;

  const subjSel = pop.querySelector('.pop-subject');
  populateSubjectSelect(subjSel);

  pop.querySelector('.pop-cancel').addEventListener('click', (ev) => { ev.stopPropagation(); closePopover(); });
  pop.querySelector('.pop-add').addEventListener('click', (ev) => {
    ev.stopPropagation();
    const dur = parseInt(pop.querySelector('.pop-duration').value, 10);
    const subjectId = subjSel.value;
    if (hour + dur > END_HOUR) { toast("That runs past the day's schedule — try a shorter block."); return; }
    const overlap = state.blocks.some(b => b.day === dayIdx && hour < b.start + b.dur && hour + dur > b.start);
    if (overlap) { toast('That overlaps an existing block.'); return; }
    state.blocks.push({ id: s(), day: dayIdx, start: hour, dur, subjectId, done: false, video: null });
    save();
    closePopover();
    renderTimetable();
    toast('Block added to your timetable.');
  });

  pop.addEventListener('click', ev => ev.stopPropagation());
  setTimeout(() => document.addEventListener('click', closePopover, { once: true }), 0);
}
function closePopover(){
  if (activePopover) { activePopover.remove(); activePopover = null; }
}

/* ---- Auto-plan to exam ---- */
document.getElementById('autoPlanBtn').addEventListener('click', () => {
  const subjectId = document.getElementById('examSubjectSelect').value;
  const dateStr = document.getElementById('examDateInput').value;
  if (!subjectId || subjectId === '__add__') { toast('Pick a subject first.'); return; }
  if (!dateStr) { toast('Pick an exam date first.'); return; }

  const examDate = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0,0,0,0);
  const daysUntil = Math.round((examDate - today) / 86400000);
  if (daysUntil <= 0) { toast('Pick a date in the future.'); return; }

  let added = 0;
  const daysToUse = Math.min(daysUntil, 14); // plan up to 2 weeks out
  for (let d = 0; d < daysToUse && added < daysToUse; d++) {
    const dayIdx = (new Date().getDay() + d - 1 + 7) % 7; // align to Mon-based index
    for (const h of HOURS) {
      const overlap = state.blocks.some(b => b.day === dayIdx && h < b.start + b.dur && h + 1 > b.start);
      if (!overlap) {
        state.blocks.push({ id: s(), day: dayIdx, start: h, dur: 1, subjectId, done: false, video: null });
        added++;
        break;
      }
    }
  }
  save();
  renderTimetable();
  toast(`Added ${added} study block(s) leading up to your exam.`);
});

/* ==========================================================
   FOCUS TIMER
   ========================================================== */
let timerState = {
  totalSeconds: 25 * 60,
  remaining: 25 * 60,
  running: false,
  interval: null,
  subjectId: null,
};

const CIRC = 2 * Math.PI * 90; // 565.5

function initTimerUI(){
  document.getElementById('ringProgress').style.strokeDasharray = CIRC;
  updateTimerDisplay();
}

document.querySelectorAll('#durationChips .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    if (timerState.running) { toast('Pause the timer before changing duration.'); return; }
    document.querySelectorAll('#durationChips .chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const mins = parseInt(chip.dataset.min, 10);
    timerState.totalSeconds = mins * 60;
    timerState.remaining = mins * 60;
    updateTimerDisplay();
  });
});

document.getElementById('startPauseBtn').addEventListener('click', () => {
  const btn = document.getElementById('startPauseBtn');
  if (!timerState.running) {
    const subjSel = document.getElementById('timerSubjectSelect');
    timerState.subjectId = subjSel.value;
    const subj = subjectById(timerState.subjectId);
    document.getElementById('timerSubjectLabel').textContent = subj ? subj.name : 'General focus';
    timerState.running = true;
    btn.textContent = 'Pause';
    timerState.interval = setInterval(tick, 1000);
    requestNotifPermission();
  } else {
    timerState.running = false;
    btn.textContent = 'Resume';
    clearInterval(timerState.interval);
  }
});

document.getElementById('resetBtn').addEventListener('click', () => {
  timerState.running = false;
  clearInterval(timerState.interval);
  timerState.remaining = timerState.totalSeconds;
  document.getElementById('startPauseBtn').textContent = 'Start';
  updateTimerDisplay();
});

function tick(){
  timerState.remaining--;
  updateTimerDisplay();
  if (timerState.remaining <= 0) {
    clearInterval(timerState.interval);
    timerState.running = false;
    onSessionComplete();
  }
}

function updateTimerDisplay(){
  const m = Math.floor(timerState.remaining / 60).toString().padStart(2,'0');
  const sec = (timerState.remaining % 60).toString().padStart(2,'0');
  document.getElementById('timerClock').textContent = `${m}:${sec}`;
  const frac = timerState.remaining / timerState.totalSeconds;
  document.getElementById('ringProgress').style.strokeDashoffset = CIRC * (1 - frac);
}

function onSessionComplete(){
  document.getElementById('startPauseBtn').textContent = 'Start';
  const subj = subjectById(timerState.subjectId);
  const minutes = Math.round(timerState.totalSeconds / 60);
  const intention = document.getElementById('timerIntention').value;

  state.sessions.unshift({ id: s(), subjectId: timerState.subjectId, minutes, intention, date: new Date().toISOString() });
  state.sessions = state.sessions.slice(0, 8);

  // mark a matching open block as done, if one exists for today
  const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0
  const match = state.blocks.find(b => b.day === todayIdx && b.subjectId === timerState.subjectId && !b.done);
  if (match) match.done = true;

  save();
  renderSessionLog();
  renderTimetable();
  notify('Session complete', `${minutes} min on ${subj ? subj.name : 'your focus session'} — nice work.`);
  toast('Session complete! Logged to your timetable.');
  timerState.remaining = timerState.totalSeconds;
  updateTimerDisplay();
}

function renderSessionLog(){
  const list = document.getElementById('sessionLogList');
  list.innerHTML = '';
  if (!state.sessions.length) {
    list.innerHTML = '<li style="border:none">No sessions yet.</li>';
    return;
  }
  state.sessions.forEach(sess => {
    const subj = subjectById(sess.subjectId);
    const li = document.createElement('li');
    const d = new Date(sess.date);
    li.innerHTML = `<span>${subj ? subj.name : 'General'} · ${sess.minutes}m</span><span>${d.toLocaleDateString(undefined,{month:'short',day:'numeric'})}</span>`;
    list.appendChild(li);
  });
}

function requestNotifPermission(){
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}
function notify(title, body){
  if ('Notification' in window && Notification.permission === 'granted') {
    try { new Notification(title, { body }); } catch(e) {}
  }
}

/* ==========================================================
   NOTES — naive client-side summarizer (no API key required)
   ========================================================== */
document.getElementById('summarizeBtn').addEventListener('click', () => {
  const subjSel = document.getElementById('noteSubjectSelect');
  const text = document.getElementById('noteInput').value.trim();
  if (!text) { toast('Paste some notes first.'); return; }
  if (subjSel.value === '__add__' || !subjSel.value) { toast('Pick a subject.'); return; }

  const { summary, keypoints } = summarize(text);
  state.notes.unshift({
    id: s(), subjectId: subjSel.value, text, summary, keypoints, date: new Date().toISOString()
  });
  save();
  document.getElementById('noteInput').value = '';
  renderNotes();
  toast('Note summarized and saved.');
});

// Lightweight extractive summarizer: scores sentences by word-frequency
// (no external API needed — works fully offline)
function summarize(text){
  const sentences = text.replace(/\s+/g,' ').split(/(?<=[.?!])\s+/).filter(x => x.trim().length > 0);
  if (sentences.length <= 3) {
    return { summary: text, keypoints: sentences.slice(0, 3).map(clean) };
  }
  const stopwords = new Set(['the','a','an','is','are','was','were','of','in','on','to','and','or','for','with','as','by','that','this','it','be','at','from','which','these','those','their','its']);
  const freq = {};
  const words = text.toLowerCase().match(/[a-z']+/g) || [];
  words.forEach(w => { if (!stopwords.has(w) && w.length > 2) freq[w] = (freq[w]||0)+1; });

  const scored = sentences.map((sent, i) => {
    const sw = (sent.toLowerCase().match(/[a-z']+/g) || []);
    const score = sw.reduce((sum,w) => sum + (freq[w]||0), 0) / Math.max(sw.length,1);
    return { sent, i, score };
  });

  const topCount = Math.min(3, Math.ceil(sentences.length * 0.3));
  const top = [...scored].sort((a,b) => b.score - a.score).slice(0, topCount).sort((a,b) => a.i - b.i);
  const summary = top.map(t => clean(t.sent)).join(' ');
  const keypoints = top.map(t => clean(t.sent));
  return { summary, keypoints };
}
function clean(str){ return str.trim().replace(/\s+/g,' '); }

function renderNotes(){
  const list = document.getElementById('notesList');
  if (!state.notes.length) {
    list.innerHTML = '<p class="empty-state">No notes yet — your saved summaries will appear here.</p>';
    return;
  }
  list.innerHTML = '';
  state.notes.forEach(note => {
    const subj = subjectById(note.subjectId);
    const card = document.createElement('div');
    card.className = 'note-card';
    const d = new Date(note.date);
    card.innerHTML = `
      <div class="note-card-head">
        <span class="note-subject-tag" style="background:${subj ? subj.color : '#888'}">${subj ? subj.name : 'General'}</span>
        <span class="note-date">${d.toLocaleDateString(undefined,{month:'short',day:'numeric'})}</span>
      </div>
      <p class="note-summary">${note.summary}</p>
      <ul class="note-keypoints">${note.keypoints.map(k => `<li>${k}</li>`).join('')}</ul>
      <div class="note-card-actions">
        <button class="link-btn" data-action="flashcard" data-id="${note.id}">Turn into flashcards</button>
        <button class="link-btn" data-action="delete" data-id="${note.id}">Delete</button>
      </div>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.notes = state.notes.filter(n => n.id !== btn.dataset.id);
      save(); renderNotes();
    });
  });
  list.querySelectorAll('[data-action="flashcard"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const note = state.notes.find(n => n.id === btn.dataset.id);
      if (!note) return;
      note.keypoints.forEach(kp => {
        state.cards.push({
          id: s(), subjectId: note.subjectId,
          front: `What does this mean: "${kp.slice(0, 60)}${kp.length>60?'...':''}"?`,
          back: kp, interval: 1, due: new Date().toISOString(), reps: 0
        });
      });
      save();
      toast(`${note.keypoints.length} flashcard(s) created from this note.`);
    });
  });
}

/* ==========================================================
   FLASHCARDS — simple spaced repetition (SM-2-ish, simplified)
   ========================================================== */
document.getElementById('addCardBtn').addEventListener('click', () => {
  document.getElementById('cardModalBackdrop').classList.add('open');
});
document.getElementById('cancelCardBtn').addEventListener('click', () => {
  document.getElementById('cardModalBackdrop').classList.remove('open');
});
document.getElementById('saveCardBtn').addEventListener('click', () => {
  const subjSel = document.getElementById('cardSubjectSelect');
  const front = document.getElementById('cardFront').value.trim();
  const back = document.getElementById('cardBack').value.trim();
  if (!front || !back || subjSel.value === '__add__') { toast('Fill in subject, front and back.'); return; }
  state.cards.push({ id: s(), subjectId: subjSel.value, front, back, interval: 1, due: new Date().toISOString(), reps: 0 });
  save();
  document.getElementById('cardFront').value = '';
  document.getElementById('cardBack').value = '';
  document.getElementById('cardModalBackdrop').classList.remove('open');
  renderFlashcards();
  toast('Flashcard added.');
});

let currentCard = null;
let cardFlipped = false;

function dueCards(){
  const now = new Date();
  return state.cards.filter(c => new Date(c.due) <= now);
}

function renderFlashcards(){
  const stats = document.getElementById('flashStats');
  const due = dueCards();
  stats.innerHTML = `<span><b>${state.cards.length}</b> total cards</span><span><b>${due.length}</b> due now</span>`;

  const stage = document.getElementById('flashStage');
  if (!due.length) {
    stage.innerHTML = '<p class="empty-state">No cards due right now. Add one, or come back later.</p>';
    currentCard = null;
    return;
  }
  currentCard = due[0];
  cardFlipped = false;
  drawCard();
}

function drawCard(){
  const stage = document.getElementById('flashStage');
  const subj = subjectById(currentCard.subjectId);
  stage.innerHTML = `
    <div class="flashcard" id="flashcardEl">
      <span class="fc-tag" style="background:${subj ? subj.color : '#888'}">${subj ? subj.name : 'General'}</span>
      <div class="fc-body" id="fcBody">${cardFlipped ? currentCard.back : currentCard.front}</div>
      <div class="fc-hint">${cardFlipped ? '' : 'Click the card to reveal the answer'}</div>
      ${cardFlipped ? `
      <div class="rate-row">
        <button class="rate-btn rate-again" data-r="again">Again</button>
        <button class="rate-btn rate-hard" data-r="hard">Hard</button>
        <button class="rate-btn rate-good" data-r="good">Good</button>
        <button class="rate-btn rate-easy" data-r="easy">Easy</button>
      </div>` : ''}
    </div>
  `;
  document.getElementById('fcBody').parentElement.addEventListener('click', (e) => {
    if (e.target.closest('.rate-btn')) return;
    cardFlipped = true;
    drawCard();
  });
  if (cardFlipped) {
    stage.querySelectorAll('.rate-btn').forEach(btn => {
      btn.addEventListener('click', () => rateCard(btn.dataset.r));
    });
  }
}

function rateCard(rating){
  const intervals = { again: 0.02, hard: 1, good: 3, easy: 7 }; // days
  const days = intervals[rating];
  currentCard.reps = (currentCard.reps || 0) + 1;
  currentCard.interval = days;
  const due = new Date();
  due.setTime(due.getTime() + days * 86400000);
  currentCard.due = due.toISOString();
  save();
  renderFlashcards();
}

/* ==========================================================
   VIDEOS — targeted search links (no API key required)
   ========================================================== */
const QUICK_TOPICS = ['Photosynthesis','Integration by parts','Newton\'s laws','Big-O notation','French Revolution','Cell division'];

function renderQuickTags(){
  const box = document.getElementById('videoQuickTags');
  box.innerHTML = '';
  QUICK_TOPICS.forEach(topic => {
    const tag = document.createElement('span');
    tag.className = 'qtag';
    tag.textContent = topic;
    tag.addEventListener('click', () => {
      document.getElementById('videoTopicInput').value = topic;
      runVideoSearch(topic);
    });
    box.appendChild(tag);
  });
}

document.getElementById('videoSearchBtn').addEventListener('click', () => {
  const topic = document.getElementById('videoTopicInput').value.trim();
  if (!topic) { toast('Type a topic first.'); return; }
  runVideoSearch(topic);
});

function runVideoSearch(topic){
  const results = document.getElementById('videoResults');
  const encoded = encodeURIComponent(topic);
  const sources = [
    { name: 'YouTube', desc: `Search YouTube for "${topic}"`, url: `https://www.youtube.com/results?search_query=${encoded}+explained` },
    { name: 'Khan Academy', desc: `Search Khan Academy for "${topic}"`, url: `https://www.khanacademy.org/search?page_search_query=${encoded}` },
    { name: 'Crash Course (YouTube)', desc: `Crash Course-style overview of "${topic}"`, url: `https://www.youtube.com/results?search_query=crash+course+${encoded}` },
  ];
  results.innerHTML = sources.map(src => `
    <div class="video-result-card">
      <h4>${src.name}</h4>
      <p>${src.desc}</p>
      <a class="link-btn" href="${src.url}" target="_blank" rel="noopener">Open search →</a>
    </div>
  `).join('');

  // offer to attach this topic's video search to a matching timetable block
  const matchSubj = state.subjects.find(sub => topic.toLowerCase().includes(sub.name.toLowerCase()));
  if (matchSubj) {
    const openBlock = state.blocks.find(b => b.subjectId === matchSubj.id && !b.video);
    if (openBlock) {
      openBlock.video = sources[0].url;
      save();
      renderTimetable();
      toast(`Linked this search to your next ${matchSubj.name} block.`);
    }
  }
}

/* ==========================================================
   Streak calculation
   ========================================================== */
function computeStreak(){
  const daysWithSessions = new Set(state.sessions.map(s => new Date(s.date).toDateString()));
  let streak = 0;
  let d = new Date();
  while (daysWithSessions.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  document.getElementById('streakPill').textContent = `🔥 ${streak} day streak`;
}

/* ==========================================================
   Init
   ========================================================== */
function init(){
  registerSubjectSelect(document.getElementById('examSubjectSelect'));
  registerSubjectSelect(document.getElementById('timerSubjectSelect'));
  registerSubjectSelect(document.getElementById('noteSubjectSelect'));
  registerSubjectSelect(document.getElementById('cardSubjectSelect'));

  renderLegend();
  renderTimetable();
  initTimerUI();
  renderSessionLog();
  renderNotes();
  renderFlashcards();
  renderQuickTags();
  computeStreak();

  // default exam date input to two weeks out
  const twoWeeks = new Date();
  twoWeeks.setDate(twoWeeks.getDate() + 14);
  document.getElementById('examDateInput').value = twoWeeks.toISOString().slice(0,10);
}

init();
