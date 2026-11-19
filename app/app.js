// Leonida Trophy Guide — GTA VI (PS5): offline tracker for the 55 official trophies.
// Progress lives in localStorage; export/import move it as a JSON file. No network
// requests are made at run time: the trophy list is data/trophies.json, loaded locally.

const EARNED_KEY = 'gta6-trophy-guide-earned-v1';
const SPOILER_KEY = 'gta6-trophy-guide-spoiler-v1';

const listEl = document.getElementById('list');
const detailEl = document.getElementById('detail');
const progressText = document.getElementById('progress-text');
const progressFill = document.getElementById('progress-fill');
const progressCount = document.getElementById('progress-count');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoiler');
const kindButtons = [...document.querySelectorAll('[data-kind]')];
const viewButtons = [...document.querySelectorAll('[data-view]')];
const roadmapEl = document.getElementById('roadmap');
const trackerEl = document.getElementById('tracker');

let trophies = [];
let earned = new Set(loadEarned());
let selectedId = null;
let kindFilter = 'all';
let gradeFilter = 'all';
let query = '';
let spoiler = localStorage.getItem(SPOILER_KEY) === '1';
let view = 'tracker';

function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((n) => typeof n === 'string') : [];
  } catch {
    return [];
  }
}

function saveEarned() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned]));
}

function isStory(t) {
  return t.kinds.includes('story');
}

function isHiddenBySpoiler(t) {
  return spoiler && isStory(t) && !earned.has(t.name);
}

function gradeLabel(t) {
  return t.grade.charAt(0).toUpperCase() + t.grade.slice(1);
}

function kindLabels(t) {
  return t.kinds.map((k) => k.charAt(0).toUpperCase() + k.slice(1)).join(' · ');
}

function visibleTrophies() {
  const q = query.trim().toLowerCase();
  return trophies.filter((t) => {
    if (kindFilter !== 'all' && !t.kinds.includes(kindFilter)) return false;
    if (gradeFilter !== 'all' && t.grade !== gradeFilter) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.name)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  progressText.textContent = `${done} of ${total} earned · ${pct}% to the Platinum`;
  progressCount.textContent = `${done}/${total}`;
  progressFill.style.width = `${pct}%`;
  document.title = `GTA VI Trophy Guide — ${done}/${total} earned`;
}

function trophyRow(t) {
  const row = document.createElement('article');
  row.className = 'trophy' + (earned.has(t.name) ? ' earned' : '') + (t.id === selectedId ? ' selected' : '');
  row.dataset.id = String(t.id);

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.name);
  box.setAttribute('aria-label', `Mark ${t.name} earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.name);
    else earned.delete(t.name);
    saveEarned();
    render();
  });

  const body = document.createElement('button');
  body.type = 'button';
  body.className = 'trophy-body';
  body.addEventListener('click', () => {
    selectedId = t.id;
    location.hash = `trophy-${t.id}`;
    render();
  });

  const name = document.createElement('span');
  name.className = 'trophy-name';
  const desc = document.createElement('span');
  desc.className = 'trophy-desc';
  if (isHiddenBySpoiler(t)) {
    name.textContent = 'Hidden story trophy — earn it to reveal';
    desc.textContent = 'Spoiler mode is on. This story trophy stays hidden until you earn it.';
  } else {
    name.textContent = t.name;
    desc.textContent = t.description;
  }

  const meta = document.createElement('span');
  meta.className = 'trophy-meta';
  const grade = document.createElement('span');
  grade.className = `grade grade-${t.grade}`;
  grade.textContent = gradeLabel(t);
  meta.append(grade);
  const kinds = document.createElement('span');
  kinds.className = 'kinds';
  kinds.textContent = kindLabels(t);
  meta.append(kinds);
  if (t.missable) {
    const flag = document.createElement('span');
    flag.className = 'missable';
    flag.textContent = 'MISSABLE';
    meta.append(flag);
  }
  if (t.count) {
    const count = document.createElement('span');
    count.className = 'count';
    count.textContent = `×${t.count}`;
    meta.append(count);
  }

  body.append(name, desc, meta);
  row.append(box, body);
  return row;
}

function renderList() {
  const shown = visibleTrophies();
  listEl.replaceChildren();
  if (!shown.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = kindFilter === 'online'
      ? 'No online trophies in this list — all 55 trophies are earned in single-player.'
      : 'No trophies match these filters.';
    listEl.append(empty);
    return;
  }
  for (const t of shown) listEl.append(trophyRow(t));
}

function renderDetail() {
  const t = trophies.find((x) => x.id === selectedId) ?? trophies[0];
  if (!t) {
    detailEl.textContent = '';
    return;
  }
  selectedId = t.id;
  detailEl.replaceChildren();

  const head = document.createElement('div');
  head.className = 'detail-head';
  const title = document.createElement('h2');
  title.textContent = isHiddenBySpoiler(t) ? 'Hidden story trophy' : t.name;
  const grade = document.createElement('span');
  grade.className = `grade grade-${t.grade}`;
  grade.textContent = gradeLabel(t);
  head.append(title, grade);

  const official = document.createElement('p');
  official.className = 'detail-official';
  official.textContent = isHiddenBySpoiler(t)
    ? 'Spoiler mode hides this trophy until you earn it.'
    : `Official: “${t.description}”`;

  const guide = document.createElement('p');
  guide.className = 'detail-guide';
  guide.textContent = isHiddenBySpoiler(t)
    ? 'Tick the box next to this trophy in the checklist to reveal its guide.'
    : t.guide;

  const facts = document.createElement('dl');
  facts.className = 'detail-facts';
  const factRows = [
    ['Kind', kindLabels(t)],
    ['Missable', t.missable ? 'Yes — do it as you go (see the roadmap)' : 'No'],
    ['Roadmap stage', `Stage ${t.stage}`],
  ];
  if (t.count) factRows.push(['Count to track', String(t.count)]);
  for (const [k, v] of factRows) {
    const dt = document.createElement('dt');
    dt.textContent = k;
    const dd = document.createElement('dd');
    dd.textContent = v;
    facts.append(dt, dd);
  }

  const sources = document.createElement('div');
  sources.className = 'detail-sources';
  const srcTitle = document.createElement('h3');
  srcTitle.textContent = 'Sources';
  const srcList = document.createElement('ul');
  for (const s of t.sources) {
    const li = document.createElement('li');
    li.textContent = s;
    srcList.append(li);
  }
  sources.append(srcTitle, srcList);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'mark-button';
  toggle.textContent = earned.has(t.name) ? 'Mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => {
    if (earned.has(t.name)) earned.delete(t.name);
    else earned.add(t.name);
    saveEarned();
    render();
  });

  detailEl.append(head, official, guide, facts, sources, toggle);
}

const STAGES = [
  {
    n: 1,
    title: 'Play the story',
    text: 'Chapters 1–4, the named missions (Gone Fishing, Breakfast Run, The Cartel Heist, Child’s Play, Headliners, VCIA Takedown, Operation Savage Glory), the five side-character finales (Andy, Kenton, Billy, Randy, Tyrone) and the final mission. Every one of these is unmissable — just play the story in order. 19 trophies, both golds included.',
  },
  {
    n: 2,
    title: 'Do it as you go — the one missable',
    text: 'Positive Mental Attitude: meditate at all 18 spots across Leonida. The launch-day lists flag this as the list’s only missable trophy, so meditate at each spot the moment you find it instead of saving them for later. Everything else can wait until after the story.',
  },
  {
    n: 3,
    title: 'Activities and skills',
    text: 'After the story, work the activities: 250 stunts, 42 Shooting Range golds, 14 Top Fun drone-race wins, 20 race wins, 8 stranger strands, 50 challenges, the fishing challenge against Cal, one arcade game, the hunts, the robberies (shops, jewelry, vaults, armored trucks, gang operations) and the money goals — $250,000 laundered, $100,000 spent. 29 trophies, all repeatable.',
  },
  {
    n: 4,
    title: 'Collectibles and the map',
    text: 'Sweep the map: 3 collectible card sets, WAiNK It at 100 locations, 100 vehicles discovered, all 52 areas of Leonida, all 8 garage properties and 10 Scooter Bros registrations. 6 trophies — use the in-game collections and map screens to track what is left.',
  },
  {
    n: 5,
    title: 'Cleanup and the Platinum',
    text: 'Check the in-game stats page for 100% completion (A Long Road, gold), then the Platinum — Vice Got a Price! — pops with it. Nothing in this guide needs a second playthrough except the one missable in Stage 2.',
  },
];

function renderRoadmap() {
  roadmapEl.replaceChildren();
  const warn = document.createElement('div');
  warn.className = 'missable-callout';
  const warnTitle = document.createElement('h3');
  warnTitle.textContent = '⚠ One missable trophy';
  const warnText = document.createElement('p');
  warnText.textContent = 'Positive Mental Attitude — meditate at all 18 spots across Leonida. It is the only trophy the launch-day lists flag as missable. Do it as you go; every other trophy is story progression or a repeatable activity you can finish after the story.';
  warn.append(warnTitle, warnText);
  roadmapEl.append(warn);

  for (const s of STAGES) {
    const card = document.createElement('article');
    card.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = `Stage ${s.n} — ${s.title}`;
    const p = document.createElement('p');
    p.textContent = s.text;
    const inStage = trophies.filter((t) => t.stage === s.n);
    const done = inStage.filter((t) => earned.has(t.name)).length;
    const count = document.createElement('p');
    count.className = 'stage-count';
    count.textContent = `${done} of ${inStage.length} earned in this stage`;
    const names = document.createElement('p');
    names.className = 'stage-names';
    names.textContent = inStage.map((t) => (isHiddenBySpoiler(t) ? 'Hidden story trophy' : t.name)).join(' · ');
    card.append(h, p, count, names);
    roadmapEl.append(card);
  }
}

function render() {
  renderProgress();
  renderList();
  renderDetail();
  renderRoadmap();
  spoilerEl.checked = spoiler;
  trackerEl.hidden = view !== 'tracker';
  roadmapEl.hidden = view !== 'roadmap';
  for (const b of viewButtons) b.setAttribute('aria-pressed', String(b.dataset.view === view));
  for (const b of kindButtons) b.setAttribute('aria-pressed', String(b.dataset.kind === kindFilter));
}

function exportProgress() {
  const payload = { game: 'Grand Theft Auto VI', exportedAt: new Date().toISOString(), earned: [...earned] };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  const raw = JSON.parse(await file.text());
  const names = Array.isArray(raw) ? raw : raw.earned;
  if (!Array.isArray(names)) throw new Error('not a progress file');
  const known = new Set(trophies.map((t) => t.name));
  earned = new Set(names.filter((n) => typeof n === 'string' && known.has(n)));
  saveEarned();
  render();
}

document.getElementById('export').addEventListener('click', exportProgress);
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    await importProgress(file);
  } catch {
    alert('That file is not a trophy-progress export from this guide.');
  }
  e.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    saveEarned();
    render();
  }
});
searchEl.addEventListener('input', () => {
  query = searchEl.value;
  renderList();
});
gradeEl.addEventListener('change', () => {
  gradeFilter = gradeEl.value;
  renderList();
});
spoilerEl.addEventListener('change', () => {
  spoiler = spoilerEl.checked;
  localStorage.setItem(SPOILER_KEY, spoiler ? '1' : '0');
  render();
});
for (const b of kindButtons) {
  b.addEventListener('click', () => {
    kindFilter = b.dataset.kind;
    render();
  });
}
for (const b of viewButtons) {
  b.addEventListener('click', () => {
    view = b.dataset.view;
    render();
  });
}

const doc = await (await fetch('data/trophies.json')).json();
trophies = doc.trophies;
const hash = /^trophy-(\d+)$/.exec(location.hash.slice(1));
if (hash && trophies.some((t) => t.id === Number(hash[1]))) selectedId = Number(hash[1]);
render();
