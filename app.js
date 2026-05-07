/* ============================================================
   WeberBrain Evaluation – App-Logik
   ============================================================ */
(function(){
'use strict';

const KEY = 'weberbrain_clean_v4';

/* ---------- Tabs (Therapeut sieht alle, Patient nur evaluierung+ende) ---------- */
const TABS_ALL = [
  ['stamm','Stammdaten'],
  ['anamnese','Anamnese'],
  ['evaluierung','Evaluierung vor Therapie'],
  ['planung','Therapieplanung'],
  ['ende','End-Evaluierung'],
  ['auswertung','Auswertung'],
  ['settings','Einstellungen']
];
const TABS_PATIENT = [
  ['evaluierung','Evaluierung vor Therapie'],
  ['ende','End-Evaluierung']
];

/* ---------- Datenlisten ---------- */
const diagnoses = ['Alzheimer / Demenz','Parkinson','Schlaganfall','Depression','Angststörung','ADHS','Migräne / Kopfschmerz','Long COVID','SHT (Schädel-Hirn-Trauma)','PTBS','Schlafstörung','Multiple Sklerose','Epilepsie','Tinnitus','Burnout'];
const symptoms = ['Erschöpfung / Fatigue','Kopfschmerzen / Migräne','Konzentrationsprobleme','Gedächtnisprobleme','Stimmungstiefs / Depression','Angst / innere Unruhe','Schlafstörungen','Brain Fog / Benommenheit','Schwindel','Zittern / Tremor'];
/* "Soziale Isolation" entfernt */
const mood = ['Antriebslosigkeit','Reizbarkeit','Gedrückte Stimmung','Innere Unruhe'];
const vegetative = ['Schwindel','Tinnitus','Sehstörungen','Lichtempfindlichkeit','Geräuschempfindlichkeit','Übelkeit','Herzrasen','Kribbeln / Taubheitsgefühl','Sprachprobleme'];
const photos = ['Methylenblau','Curcumin liposomal','Riboflavin / Vitamin B2','Coenzym Q10 / Ubiquinol'];
const supplements = ['Sonnenmoor / Trinkmoor','Shilajit / Mumijo','Omega 3','Magnesium','Vitamin D','B-Komplex','Probiotikum','Elektrolyte','Sonstiges'];

/* Schlafdauer als feste Optionen (Patient kann nur ankreuzen) */
const SLEEP_OPTIONS = ['<5h','5-7h','7-9h','>9h'];

/* ---------- Therapieprotokolle ---------- */
const protocols = {
  'Alzheimer / Demenz':{name:'Alzheimer / Demenz',stages:[['1–3','40','25','15','Einstieg: Verträglichkeit prüfen, Gamma-Entrainment initiieren'],['4–10','40','50–75','20–25','Aufbau: kognitive Aktivierung'],['11+','40','75–100','30','Erhaltung: tägliche Heimanwendung erwägen']]},
  'Parkinson':{name:'Parkinson',stages:[['1–3','40','25','15','Vorsichtiger Einstieg; Tremor/Gleichgewicht beobachten'],['4–10','40','50–75','20–25','Aufbau: Motorik und Kognition'],['11+','40 + 10','75–100','30','Morgens 40 Hz, abends 10 Hz bei Schlaf/Angst']]},
  'Schlaganfall':{name:'Schlaganfall',stages:[['1–3','0','25','10–15','CW, zellreparativ; früh vorsichtig'],['4–10','10 / 40','50','20','10 Hz emotional, 40 Hz kognitiv'],['11+','40','75','25–30','Neuroplastizität / chronische Phase']]},
  'Depression':{name:'Depression',stages:[['1–3','10','25','15','Morgens; Alpha-Aktivierung; nicht abends'],['4–10','10','50–75','20–25','Morgens, Stimmungsstabilisierung'],['11+','0 → 10','75','30','15 min 0 Hz + 15 min 10 Hz; niemals 40 Hz bei reiner Depression']]},
  'Angststörung':{name:'Angststörung / PTBS',stages:[['1–3','10','25','10–15','Sehr vorsichtig; Hyperarousal beachten'],['4–10','10','25–50','20','Alpha-Erhöhung, autonome Regulation'],['11+','10','50–75','25–30','Langsam steigern, Traumatherapie begleiten']]},
  'PTBS':{name:'Angststörung / PTBS',stages:[['1–3','10','25','10–15','PTBS: sehr langsamer Einstieg'],['4–10','10','25–50','20','Reaktivierung beobachten'],['11+','10','50–75','25–30','Sitzungszeit schrittweise steigern']]},
  'SHT (Schädel-Hirn-Trauma)':{name:'SHT / TBI',stages:[['1–3','10','25','10–15','Entzündungsreduktion; Licht-/Geräuschempfindlichkeit beachten'],['4–10','10 / 40','50','20','10 Hz Stimmung/Schlaf, 40 Hz Kognition'],['11+','40','75','25–30','Chronisches TBI; niedrig bleiben bei Verschlechterung']]},
  'ADHS':{name:'ADHS',stages:[['1–3','40','25','10–15','Morgens vor Schule/Arbeit'],['4–10','40','50','20','Exekutivfunktionen / Arbeitsgedächtnis'],['11+','40 + 10','50–75','25–30','40 Hz morgens, 10 Hz abends bei Schlaf']]},
  'Migräne / Kopfschmerz':{name:'Migräne / Kopfschmerz',stages:[['1–3','0','25','10','Nur CW, außerhalb Attacke'],['4–10','0','25–50','15–20','Prophylaxe; nicht während Attacke'],['11+','0','50','20–25','Keine 10/40 Hz; Trigger beachten']]},
  'Schlafstörung':{name:'Schlafstörung / Insomnie',stages:[['1–3','10','25','15','Abends 1–2 h vor Schlaf'],['4–10','10','25–50','20','Schlaflatenz reduzieren'],['11+','10 + 0','50','25–30','10 Hz, danach CW; nie 40 Hz abends']]},
  'Long COVID':{name:'Burnout / Fatigue / Long COVID',stages:[['1–3','0','25','10–15','Sehr behutsam; PEM beachten'],['4–10','10','25–50','20','Autonome Balance'],['11+','10 + 40','50–75','30','10 Hz morgens, 40 Hz mittags; nie abends']]},
  'Burnout':{name:'Burnout / Fatigue / Long COVID',stages:[['1–3','0','25','10–15','Zellregeneration; behutsam'],['4–10','10','25–50','20','Regulation Nervensystem'],['11+','10 + 40','50–75','30','Aktivierung nur morgens/mittags']]},
  'Multiple Sklerose':{name:'MS / Demyelinisierung',stages:[['1–3','0','25','10–15','Vorsichtig, Fatigue beobachten'],['4–10','10','25–50','20','Autonome Regulation'],['11+','10 / 40','50','20–25','Individuell nach Symptomdominanz']]},
  'Tinnitus':{name:'Tinnitus',stages:[['1–3','0','25','10–15','Reizarm starten'],['4–10','10','25–50','20','Autonome Regulation'],['11+','10','50','20–25','Verträglichkeit maßgeblich']]},
  'Epilepsie':{name:'Epilepsie',stages:[['1–3','','','','Nur nach ärztlicher Rücksprache; Photosensitivität beachten'],['4–10','','','','Keine automatische Empfehlung'],['11+','','','','Individuelle ärztliche Verordnung erforderlich']]}
};

/* ============================================================
   STATE
   ============================================================ */
let db = load();
let currentId = db.currentId || null;
let activeTab = 'stamm';
let userMode = null; // 'therapeut' | 'patient' | null (=gesperrt)

/* ============================================================
   PERSISTENCE
   ============================================================ */
function load(){
  try{
    const data = JSON.parse(localStorage.getItem(KEY));
    if(data) return data;
  }catch(e){}
  return {
    patients:[],
    currentId:null,
    settings:{
      theme:'brown',
      logo:'',           /* leer = Default-Logo aus DEFAULT_LOGO */
      praxisName:'',
      praxisSub:'WeberBrain® Evaluation',
      pinTherapeut:'2304',
      pinPatient:'0000'
    }
  };
}
function persist(){
  db.currentId = currentId;
  localStorage.setItem(KEY, JSON.stringify(db));
}
function ensureSettings(){
  db.settings = db.settings || {};
  if(!db.settings.theme) db.settings.theme = 'brown';
  if(db.settings.logo === undefined) db.settings.logo = '';
  if(db.settings.praxisName === undefined) db.settings.praxisName = '';
  if(db.settings.praxisSub === undefined) db.settings.praxisSub = 'WeberBrain® Evaluation';
  if(db.settings.praxisAddress === undefined) db.settings.praxisAddress = '';
  if(db.settings.praxisContact === undefined) db.settings.praxisContact = '';
  if(!db.settings.pinTherapeut) db.settings.pinTherapeut = '2304';
  if(!db.settings.pinPatient) db.settings.pinPatient = '0000';
}
ensureSettings();
persist();

/* ============================================================
   HELPERS
   ============================================================ */
function cur(){ return db.patients.find(p => p.id === currentId) || null; }
function today(){ return new Date().toISOString().slice(0,10); }
function esc(s){ return String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function get(path){ return path.split('.').reduce((o,k) => o && o[k], cur()); }
function set(path, val){
  const keys = path.split('.');
  let o = cur();
  keys.slice(0,-1).forEach(k => { if(!o[k]) o[k] = {}; o = o[k]; });
  o[keys.at(-1)] = val;
}

function blankPatient(){
  return {
    id:'p_'+Date.now(),
    created:new Date().toISOString(),
    /* Sitzungs-Nr. entfernt aus stamm */
    stamm:{date:today(),name:'',birth:'',gender:'',doctor:'',facility:''},
    anamnese:{diagnoses:[],otherDiag:'',meds:'',notes:''},
    /* beschwerden bleibt im Datenmodell fuer Rueckwaertskompatibilitaet, wird nicht angezeigt */
    beschwerden:{values:{},notes:''},
    evaluierung:{values:{},sleepDuration:'',sleepQuality:'',mood:[],vegetative:[],notes:''},
    planung:{start:today(),total:20,photos:[],photoNotes:'',supplements:[],suppNotes:'',sessions:makeSessions(20)},
    ende:{values:{},sleepDuration:'',sleepQuality:'',mood:[],vegetative:[],count:'',result:'',notes:''}
  };
}
function makeSessions(n){
  return Array.from({length:Number(n)||0}, (_,i) => ({nr:i+1,date:'',hz:'',intensity:'',duration:'',note:''}));
}
function ensureShape(){
  const p = cur();
  if(!p) return;
  p.stamm = p.stamm || {};
  p.anamnese = p.anamnese || {diagnoses:[],otherDiag:'',meds:'',notes:''};
  p.beschwerden = p.beschwerden || {values:{},notes:''};
  p.evaluierung = p.evaluierung || {values:{},sleepDuration:'',sleepQuality:'',mood:[],vegetative:[],notes:''};
  p.evaluierung.values = p.evaluierung.values || {};
  p.evaluierung.mood = p.evaluierung.mood || [];
  p.evaluierung.vegetative = p.evaluierung.vegetative || [];
  p.ende = p.ende || {values:{},sleepDuration:'',sleepQuality:'',mood:[],vegetative:[],count:'',result:'',notes:''};
  p.ende.values = p.ende.values || {};
  p.ende.mood = p.ende.mood || [];
  p.ende.vegetative = p.ende.vegetative || [];
  p.planung = p.planung || {};
  p.planung.total = p.planung.total || 20;
  p.planung.sessions = p.planung.sessions || makeSessions(p.planung.total);
  adjustSessions();
}
function adjustSessions(){
  const p = cur();
  if(!p) return;
  const n = Math.max(0, Math.min(40, Number(p.planung.total)||0));
  while(p.planung.sessions.length < n) p.planung.sessions.push({nr:p.planung.sessions.length+1,date:'',hz:'',intensity:'',duration:'',note:''});
  if(p.planung.sessions.length > n) p.planung.sessions = p.planung.sessions.slice(0,n);
  p.planung.sessions.forEach((s,i) => s.nr = i+1);
}

/* ============================================================
   PIN-LOCK
   ============================================================ */
let pinBuffer = '';

function showLock(){
  userMode = null;
  pinBuffer = '';
  updatePinDisplay();
  document.getElementById('pinError').textContent = '';
  document.getElementById('lockOverlay').classList.remove('hidden');
  document.getElementById('appHeader').classList.add('hidden');
  document.getElementById('mainWrap').classList.add('hidden');
  document.getElementById('footerBar').classList.add('hidden');
  /* Logo im Lock-Screen */
  document.getElementById('lockLogo').src = db.settings.logo || DEFAULT_LOGO;
}
function hideLock(){
  document.getElementById('lockOverlay').classList.add('hidden');
  document.getElementById('appHeader').classList.remove('hidden');
  document.getElementById('mainWrap').classList.remove('hidden');
  document.getElementById('footerBar').classList.remove('hidden');
}
function updatePinDisplay(){
  document.getElementById('pinDisplay').textContent = pinBuffer.replace(/./g,'•').padEnd(4,' ').slice(0,4);
}
function tryUnlock(){
  if(pinBuffer === db.settings.pinTherapeut){
    userMode = 'therapeut';
    activeTab = 'stamm';
    hideLock();
    applyGlobalSettings();
    render();
  } else if(pinBuffer === db.settings.pinPatient){
    userMode = 'patient';
    activeTab = 'evaluierung';
    /* Patient bekommt nur den AKTUELL gewählten Patienten zu sehen */
    if(!currentId && db.patients.length > 0) currentId = db.patients[0].id;
    hideLock();
    applyGlobalSettings();
    render();
  } else {
    document.getElementById('pinError').textContent = '✗ Falscher Code';
    pinBuffer = '';
    updatePinDisplay();
  }
}

/* PIN-Pad Event-Wiring */
document.querySelectorAll('.pinBtn[data-pin]').forEach(b => {
  b.onclick = () => {
    if(pinBuffer.length < 4){
      pinBuffer += b.dataset.pin;
      updatePinDisplay();
      if(pinBuffer.length === 4) setTimeout(tryUnlock, 200);
    }
  };
});
document.getElementById('pinClear').onclick = () => {
  pinBuffer = pinBuffer.slice(0,-1);
  updatePinDisplay();
  document.getElementById('pinError').textContent = '';
};
document.getElementById('pinOk').onclick = tryUnlock;

/* Tastatur-Eingabe ebenfalls erlauben */
document.addEventListener('keydown', e => {
  if(document.getElementById('lockOverlay').classList.contains('hidden')) return;
  if(/^\d$/.test(e.key) && pinBuffer.length < 4){
    pinBuffer += e.key;
    updatePinDisplay();
    if(pinBuffer.length === 4) setTimeout(tryUnlock, 200);
  } else if(e.key === 'Backspace'){
    pinBuffer = pinBuffer.slice(0,-1);
    updatePinDisplay();
  } else if(e.key === 'Enter'){
    tryUnlock();
  }
});

/* ============================================================
   RENDER
   ============================================================ */
function getActiveTabs(){
  return userMode === 'patient' ? TABS_PATIENT : TABS_ALL;
}

function render(){
  if(userMode === null){ showLock(); return; }
  /* Sidebar im Patientenmodus ausblenden */
  document.getElementById('sidebar').style.display = userMode === 'patient' ? 'none' : '';
  document.getElementById('mainWrap').style.gridTemplateColumns = userMode === 'patient' ? '1fr' : '320px 1fr';
  /* "Neuer Patient", "Export", "Drucken", "Löschen" für Patienten ausblenden */
  document.getElementById('newPatientBtn').style.display = userMode === 'patient' ? 'none' : '';
  document.getElementById('exportBtn').style.display = userMode === 'patient' ? 'none' : '';
  document.getElementById('printBtn').style.display = userMode === 'patient' ? 'none' : '';

  renderList();
  document.getElementById('empty').classList.toggle('hidden', !!cur());
  document.getElementById('app').classList.toggle('hidden', !cur());
  if(cur()){
    ensureShape();
    /* Falls activeTab nicht in den erlaubten Tabs ist, auf ersten erlaubten setzen */
    const allowed = getActiveTabs().map(t => t[0]);
    if(!allowed.includes(activeTab)) activeTab = allowed[0];
    renderTabs();
    renderPanels();
  }
}

function renderList(){
  const q = document.getElementById('search').value.toLowerCase();
  const box = document.getElementById('patientList');
  box.innerHTML = '';
  db.patients
    .filter(p => (p.stamm.name||'Unbenannt').toLowerCase().includes(q))
    .forEach(p => {
      const d = document.createElement('div');
      d.className = 'patientItem' + (p.id === currentId ? ' active' : '');
      d.innerHTML = '<b>'+esc(p.stamm.name||'Unbenannter Patient')+'</b><br><small>'+esc(p.stamm.birth||'')+' · '+esc(p.stamm.date||'')+'</small>';
      d.onclick = () => { autosaveAndToast(); currentId = p.id; render(); };
      box.appendChild(d);
    });
}

function renderTabs(){
  const box = document.getElementById('tabs');
  box.innerHTML = '';
  getActiveTabs().forEach(([id,label]) => {
    const b = document.createElement('button');
    b.className = 'tab ' + (id === activeTab ? 'active' : '');
    b.textContent = label;
    b.onclick = () => { autosaveAndToast(); activeTab = id; render(); };
    box.appendChild(b);
  });
}

/* ---------- Field-Helpers ---------- */
function input(path,label,type='text'){
  return `<div class="field"><label>${label}</label><input data-path="${path}" type="${type}" value="${esc(get(path)||'')}"></div>`;
}
function textarea(path,label,placeholder=''){
  return `<div class="field"><label>${label}</label><textarea data-path="${path}" placeholder="${esc(placeholder)}">${esc(get(path)||'')}</textarea></div>`;
}
function chips(path,arr){
  const vals = get(path) || [];
  return `<div class="chips">${arr.map(x => `<label class="chip"><input type="checkbox" data-array="${path}" value="${esc(x)}" ${vals.includes(x)?'checked':''}>${esc(x)}</label>`).join('')}</div>`;
}
function scale(path,label){
  const val = get(path) || '';
  return `<div class="field"><label>${label}</label><div class="scale">${Array.from({length:11},(_,i)=>`<label><input name="${path}" data-path="${path}" type="radio" value="${i}" ${String(val)===String(i)?'checked':''}>${i}</label>`).join('')}</div></div>`;
}
/* Schlafdauer als Auswahl-Buttons */
function sleepDurationField(path,label){
  const val = get(path) || '';
  return `<div class="field"><label>${label}</label><div class="sleepDuration">${SLEEP_OPTIONS.map(opt=>`<label><input type="radio" name="${path}" data-path="${path}" value="${esc(opt)}" ${val===opt?'checked':''}>${esc(opt)}</label>`).join('')}</div></div>`;
}

/* ---------- Evaluierungs-Block (vor + nach Therapie identisch) ---------- */
function evalFull(prefix,title,intro){
  return `
    <h2>${title}</h2>
    <p>${intro}</p>
    <h3>Aktuelle Beschwerden (0 = keine Beschwerden, 10 = maximal)</h3>
    ${symptoms.map(s => scale(prefix+'.values.'+s, s)).join('')}
    <h3>Schlaf &amp; Stimmung</h3>
    <div class="grid">
      ${sleepDurationField(prefix+'.sleepDuration','Durchschnittliche Schlafdauer')}
      ${scale(prefix+'.sleepQuality','Schlafqualität')}
    </div>
    <h3>Stimmung / Begleitbeschwerden</h3>
    ${chips(prefix+'.mood', mood)}
    <h3>Vegetative Symptome</h3>
    ${chips(prefix+'.vegetative', vegetative)}
    ${textarea(prefix+'.notes','Besonderheiten / Nebenwirkungen / Anmerkungen')}
  `;
}

/* ---------- Therapieplanung-Helpers ---------- */
function therapySuggestion(){
  const p = cur();
  const d = (p.anamnese.diagnoses||[]).find(x => protocols[x]);
  if(!d) return '<div class="notice">Keine passende Diagnose für automatischen Vorschlag gewählt. Bitte zuerst in der Anamnese eine Diagnose ankreuzen.</div>';
  const pr = protocols[d];
  return `<div class="notice ok"><b>Therapievorschlag erkannt:</b> ${esc(pr.name)}<br>${pr.stages.map(st => `Sitzung ${st[0]}: ${st[1]||'—'} Hz · ${st[2]||'—'} % · ${st[3]||'—'} min · ${esc(st[4])}`).join('<br>')}</div>`;
}
function applyProtocolToSessions(){
  saveForm();
  const p = cur();
  const d = (p.anamnese.diagnoses||[]).find(x => protocols[x]);
  if(!d){ alert('Bitte zuerst in der Anamnese eine passende Diagnose ankreuzen.'); return; }
  const pr = protocols[d];
  adjustSessions();
  p.planung.sessions.forEach((s,i) => {
    const nr = i+1;
    const st = nr <= 3 ? pr.stages[0] : (nr <= 10 ? pr.stages[1] : pr.stages[2]);
    s.hz = st[1]; s.intensity = st[2]; s.duration = st[3]; s.note = st[4];
    if(!s.date && p.planung.start){
      const dt = new Date(p.planung.start+'T00:00:00');
      dt.setDate(dt.getDate() + i*2);
      s.date = dt.toISOString().slice(0,10);
    }
  });
  persist(); render();
}
function updateSessionCountFromField(){
  const el = document.querySelector('[data-path="planung.total"]');
  if(!el) return;
  set('planung.total', el.value);
  adjustSessions(); persist(); render();
}
function sessionHtml(i){
  const s = cur().planung.sessions[i];
  return `<div class="session"><h4>Sitzung ${i+1}</h4>
    <div class="miniGrid">
      <div class="field"><label>Datum</label><input type="date" data-session="${i}" data-key="date" value="${esc(s.date)}"></div>
      <div class="field"><label>Frequenz Hz</label><input data-session="${i}" data-key="hz" value="${esc(s.hz)}"></div>
      <div class="field"><label>Intensität %</label><input data-session="${i}" data-key="intensity" value="${esc(s.intensity)}"></div>
      <div class="field"><label>Dauer min</label><input data-session="${i}" data-key="duration" value="${esc(s.duration)}"></div>
    </div>
    <div class="field"><label>Anmerkung</label><textarea data-session="${i}" data-key="note">${esc(s.note)}</textarea></div>
  </div>`;
}

/* ---------- PANELS ---------- */
function q(panel){ return document.querySelector('[data-panel="'+panel+'"]'); }

function renderPanels(){
  document.querySelectorAll('[data-panel]').forEach(s => s.classList.toggle('hidden', s.dataset.panel !== activeTab));
  const p = cur();

  if(q('stamm')){
    /* Sitzungs-Nr. entfernt */
    q('stamm').innerHTML = `<h2>📋 Stammdaten</h2>
      <div class="grid">
        ${input('stamm.date','Datum','date')}
        ${input('stamm.name','Name, Vorname')}
        ${input('stamm.birth','Geburtsdatum','date')}
        ${input('stamm.gender','Geschlecht')}
        ${input('stamm.doctor','Behandelnde/r Arzt / Therapeut')}
        ${input('stamm.facility','Einrichtung / Praxis')}
      </div>`;
  }

  if(q('anamnese')){
    q('anamnese').innerHTML = `<h2>📝 Anamnese</h2>
      <h3>Diagnosen / Vorerkrankungen</h3>${chips('anamnese.diagnoses',diagnoses)}
      ${textarea('anamnese.otherDiag','Sonstige Diagnosen')}
      ${textarea('anamnese.meds','Aktuelle Medikation')}
      ${textarea('anamnese.notes','Anamnese-Anmerkungen')}`;
  }

  if(q('evaluierung')){
    q('evaluierung').innerHTML = evalFull('evaluierung','📊 Evaluierung vor Therapie','Vollständiger Ausgangsfragebogen: Beschwerden, Schlaf/Stimmung und vegetative Symptome. Die End-Evaluierung enthält exakt dieselben Felder für den Vergleich.');
  }

  if(q('planung')){
    q('planung').innerHTML = `<h2>📅 Therapieplanung</h2>
      <div class="grid">
        ${input('planung.start','Therapiebeginn','date')}
        ${input('planung.total','Geplante Sitzungen gesamt','number')}
      </div>
      <div class="topBtns">
        <button class="muted" id="refreshSessions">Sitzungsfenster aktualisieren</button>
        <button class="primary" id="applyProtocol">Vorschlag aus Diagnose übernehmen</button>
      </div>
      ${therapySuggestion()}
      <h3>Photosensitizer – Mehrfachauswahl</h3>${chips('planung.photos',photos)}
      ${textarea('planung.photoNotes','Photosensitizer – Dosierung / Zeitpunkt / Besonderheiten','z.B. Methylenblau 0,5 mg/kg, 45 min vor Sitzung…')}
      <h3>Begleitmedikamente / Begleitmittel – Mehrfachauswahl</h3>${chips('planung.supplements',supplements)}
      ${textarea('planung.suppNotes','Begleitmittel – Dosierung / Notizen','z.B. Sonnenmoor 25–30 ml nüchtern morgens…')}
      <h3>Sitzungsprotokoll</h3>
      <p class="notice">Die Anzahl der Sitzungsfenster richtet sich nach „Geplante Sitzungen gesamt". Bei 10 Sitzungen werden 10 Fenster erzeugt.</p>
      <div class="therapyGrid">${p.planung.sessions.map((s,i) => sessionHtml(i)).join('')}</div>`;
  }

  if(q('ende')){
    q('ende').innerHTML = `<h2>🏁 End-Evaluierung</h2>
      <div class="grid">
        ${input('ende.count','Anzahl tatsächlich durchgeführter Sitzungen','number')}
        <div class="field"><label>Gesamtergebnis</label><select data-path="ende.result"><option></option>${['Deutliche Verbesserung','Leichte Verbesserung','Keine Veränderung','Leichte Verschlechterung','Deutliche Verschlechterung'].map(x => `<option ${get('ende.result')===x?'selected':''}>${x}</option>`).join('')}</select></div>
      </div>` + evalFull('ende','📋 Fragebogen nach Therapie','Exakt derselbe Fragebogen wie bei der Evaluierung vor Therapie.');
  }

  if(q('auswertung')){
    q('auswertung').innerHTML = `<h2>📈 Patienten-Auswertung</h2>
      <p class="chartNote">Grafik: Blau = Wert vor Therapie, Grün = Wert nach Therapie. In der Tabelle bedeutet Grün Verbesserung, Rot Verschlechterung, Grau unverändert.</p>
      <canvas id="chart" width="1000" height="520"></canvas>
      <div class="report">${makeReportHtml(false)}</div>
      <button class="muted no-print" id="anonBtn">Anonymisierte Patienten-Auswertung exportieren</button>`;
  }

  if(q('settings')){
    q('settings').innerHTML = `<h2>⚙️ Einstellungen</h2>
      <h3>Praxis (erscheint im Druck-Briefkopf)</h3>
      <div class="grid">
        ${input('__settings.praxisName','Praxis-Name')}
        ${input('__settings.praxisSub','Untertitel / Zusatz')}
      </div>
      ${textarea('__settings.praxisAddress','Adresse (Straße, PLZ Ort)','z.B.\nMusterstraße 12\n9544 Feld am See\nÖsterreich')}
      ${input('__settings.praxisContact','Telefon / E-Mail / Web')}
      <h3>Erscheinung</h3>
      <div class="field"><label>Farbschema</label>
        <select id="themeSelect">
          <option value="brown">Braun/Weber</option>
          <option value="blue">Blau</option>
          <option value="green">Grün</option>
          <option value="dark">Dunkel</option>
        </select>
      </div>
      <div class="field">
        <label>Eigenes Logo (überschreibt Standard-Logo)</label>
        <input id="logoFile" type="file" accept="image/*">
        <small class="smallMuted">Wird lokal im Browser gespeichert. Klick auf „Standard-Logo wiederherstellen", um zum eingebetteten Lotus-Logo zurückzukehren.</small>
      </div>
      <button class="muted" id="resetLogoBtn">Standard-Logo wiederherstellen</button>

      <h3>Zugangscodes</h3>
      <div class="grid">
        ${input('__settings.pinTherapeut','Therapeut-Code (4-stellig)')}
        ${input('__settings.pinPatient','Patienten-Code (4-stellig)')}
      </div>
      <div class="notice">Patient sieht nur „Evaluierung vor Therapie" und „End-Evaluierung" — keine Stammdaten, keine Anamnese, keine Auswertung.</div>

      <h3>Backup</h3>
      <div class="topBtns">
        <button class="muted" id="importBtn">JSON importieren</button>
        <button class="muted" id="exportBtn2">Backup exportieren</button>
      </div>
      <input id="importFile" type="file" accept="application/json" class="hidden">`;

    /* __settings-Werte aus db.settings hydrieren */
    document.querySelector('[data-path="__settings.praxisName"]').value = db.settings.praxisName || '';
    document.querySelector('[data-path="__settings.praxisSub"]').value = db.settings.praxisSub || '';
    document.querySelector('[data-path="__settings.praxisAddress"]').value = db.settings.praxisAddress || '';
    document.querySelector('[data-path="__settings.praxisContact"]').value = db.settings.praxisContact || '';
    document.querySelector('[data-path="__settings.pinTherapeut"]').value = db.settings.pinTherapeut || '';
    document.querySelector('[data-path="__settings.pinPatient"]').value = db.settings.pinPatient || '';
  }

  wireDynamic();
  if(activeTab === 'auswertung') drawChart();
}

/* ============================================================
   FORM-WIRING
   ============================================================ */
function autosaveAndToast(label){
  /* Zwingt das aktive Eingabefeld, seinen Wert zu committen
     (wichtig auf Android, wo IME-Composition sonst haengen kann) */
  if(document.activeElement && typeof document.activeElement.blur === 'function'){
    document.activeElement.blur();
  }
  saveForm();
  showToast(label || 'Automatisch gespeichert');
}

let _toastTimer = null;
function showToast(msg){
  let t = document.getElementById('toast');
  if(!t){
    t = document.createElement('div');
    t.id = 'toast';
    t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#007a53;color:#fff;padding:10px 18px;border-radius:999px;font-weight:700;font-size:14px;box-shadow:0 4px 16px #0004;z-index:9000;opacity:0;transition:opacity .25s;pointer-events:none';
    document.body.appendChild(t);
  }
  t.textContent = '✓ '+msg;
  t.style.opacity = '1';
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { t.style.opacity = '0'; }, 1400);
}

function saveForm(){
  const p = cur();
  if(!p) return;
  /* Normale Pfade */
  document.querySelectorAll('[data-path]').forEach(el => {
    if(!el.dataset.path) return;
    if(el.type === 'radio' && !el.checked) return;
    /* Settings haben Sonder-Prefix */
    if(el.dataset.path.startsWith('__settings.')){
      const key = el.dataset.path.split('.')[1];
      db.settings[key] = el.value;
    } else {
      set(el.dataset.path, el.value);
    }
  });
  /* Mehrfachauswahl */
  document.querySelectorAll('[data-array]').forEach(el => {
    const arr = get(el.dataset.array) || [];
    const v = el.value;
    const has = arr.includes(v);
    if(el.checked && !has) arr.push(v);
    if(!el.checked && has) arr.splice(arr.indexOf(v), 1);
    set(el.dataset.array, arr);
  });
  /* Sitzungen */
  document.querySelectorAll('[data-session]').forEach(el => {
    p.planung.sessions[+el.dataset.session][el.dataset.key] = el.value;
  });
  adjustSessions();
  persist();
  renderList();
  applyGlobalSettings(); /* Praxisname etc. live updaten */
}

function wireDynamic(){
  document.querySelectorAll('input,textarea,select').forEach(el => {
    if(el.closest('#lockOverlay')) return; /* PIN-Pad nicht hier verkabeln */
    el.addEventListener('change', () => {
      saveForm();
      if(el.dataset.path === 'planung.total') render();
    });
    if(el.dataset.path === 'planung.total'){
      el.addEventListener('input', () => {
        set('planung.total', el.value);
        adjustSessions(); persist(); render();
      });
    }
  });

  const ap = document.getElementById('applyProtocol');
  if(ap) ap.onclick = applyProtocolToSessions;
  const rs = document.getElementById('refreshSessions');
  if(rs) rs.onclick = updateSessionCountFromField;

  const ts = document.getElementById('themeSelect');
  if(ts){
    ts.value = db.settings.theme || 'brown';
    ts.onchange = () => {
      db.settings.theme = ts.value;
      persist(); applyGlobalSettings();
    };
  }

  const lf = document.getElementById('logoFile');
  if(lf){
    lf.onchange = e => {
      const f = e.target.files[0];
      if(!f) return;
      const r = new FileReader();
      r.onload = () => {
        db.settings.logo = r.result;
        persist(); applyGlobalSettings();
        alert('Eigenes Logo gespeichert.');
      };
      r.readAsDataURL(f);
    };
  }

  const rl = document.getElementById('resetLogoBtn');
  if(rl){
    rl.onclick = () => {
      db.settings.logo = '';
      persist(); applyGlobalSettings();
      alert('Standard-Logo wiederhergestellt.');
    };
  }

  const eb2 = document.getElementById('exportBtn2');
  if(eb2) eb2.onclick = exportJson;

  const ib = document.getElementById('importBtn');
  if(ib) ib.onclick = () => document.getElementById('importFile').click();
  const iff = document.getElementById('importFile');
  if(iff){
    iff.onchange = e => {
      const f = e.target.files[0];
      if(!f) return;
      const r = new FileReader();
      r.onload = () => {
        try{
          const data = JSON.parse(r.result);
          if(data.patients){
            /* MERGE statt OVERWRITE: bestehende Patienten bleiben erhalten */
            const existingIds = new Set(db.patients.map(x => x.id));
            data.patients.forEach(np => {
              if(!existingIds.has(np.id)) db.patients.push(np);
            });
            if(data.settings) db.settings = Object.assign({}, db.settings, data.settings);
          } else {
            /* Einzelner Patient */
            if(!db.patients.find(x => x.id === data.id)) db.patients.push(data);
          }
          ensureSettings();
          persist(); applyGlobalSettings(); render();
          alert('Import erfolgreich (Daten zusammengeführt).');
        }catch(err){
          alert('Import fehlgeschlagen: '+err.message);
        }
      };
      r.readAsText(f);
    };
  }

  const ab = document.getElementById('anonBtn');
  if(ab) ab.onclick = exportAnon;
}

/* ============================================================
   GLOBAL SETTINGS / THEME / LOGO
   ============================================================ */
function applyGlobalSettings(){
  document.body.className = '';
  const t = db.settings.theme || 'brown';
  if(t !== 'brown') document.body.classList.add('theme-'+t);

  const logoSrc = db.settings.logo || DEFAULT_LOGO;
  const headerLogo = document.getElementById('headerLogo');
  if(headerLogo) headerLogo.src = logoSrc;
  const lockLogo = document.getElementById('lockLogo');
  if(lockLogo) lockLogo.src = logoSrc;
  const printLogo = document.getElementById('printLogo');
  if(printLogo) printLogo.src = logoSrc;

  const pn = db.settings.praxisName || '';
  const ps = db.settings.praxisSub || 'WeberBrain® Evaluation';
  const pa = db.settings.praxisAddress || '';
  const pc = db.settings.praxisContact || '';
  document.getElementById('praxisName').textContent = pn;
  document.getElementById('printPraxisName').textContent = pn || 'Praxis';
  document.getElementById('printPraxisSub').textContent = ps;
  const addrEl = document.getElementById('printPraxisAddress');
  if(addrEl){
    addrEl.textContent = pa;
    addrEl.style.display = pa ? '' : 'none';
  }
  const contactEl = document.getElementById('printPraxisContact');
  if(contactEl){
    contactEl.textContent = pc;
    contactEl.style.display = pc ? '' : 'none';
  }
}

/* ============================================================
   AUSWERTUNG / REPORT / CHART
   ============================================================ */
function trendClass(pre,post){
  if(pre===''||post===''||pre==null||post==null) return 'same';
  const d = Number(post) - Number(pre);
  return d < 0 ? 'improve' : (d > 0 ? 'worse' : 'same');
}
function trendText(pre,post){
  if(pre===''||post===''||pre==null||post==null) return 'nicht vollständig';
  const d = Number(post) - Number(pre);
  if(d < 0) return 'Verbesserung '+Math.abs(d)+' Punkt(e)';
  if(d > 0) return 'Verschlechterung '+d+' Punkt(e)';
  return 'unverändert';
}
function setCompare(before,after){
  before = before || []; after = after || [];
  const neu = after.filter(x => !before.includes(x));
  const weg = before.filter(x => !after.includes(x));
  if(!neu.length && !weg.length) return '<span class="same">unverändert</span>';
  return `${weg.length?'<span class="improve">nicht mehr: '+esc(weg.join(', '))+'</span> ':''}${neu.length?'<span class="worse">neu/weiterhin: '+esc(neu.join(', '))+'</span>':''}`;
}
/* Schlafdauer-Vergleich (textuell, da kategorial) */
function sleepDurationCompare(pre,post){
  if(!pre || !post) return '<span class="same">nicht vollständig</span>';
  if(pre === post) return `<span class="same">unverändert (${esc(pre)})</span>`;
  /* Ordnung: <5h < 5-7h < 7-9h < >9h. Mehr ist meist besser, ausser >9h was eher Hypersomnie sein kann. */
  const order = {'<5h':0,'5-7h':1,'7-9h':2,'>9h':3};
  const di = (order[post] ?? 0) - (order[pre] ?? 0);
  /* Verbesserung: aus <5h oder 5-7h zu 7-9h. Aus >9h zu 7-9h auch verbesserung. Aus 7-9h weg = verschlechterung */
  let cls = 'same', txt = `${esc(pre)} → ${esc(post)}`;
  if(post === '7-9h' && pre !== '7-9h'){ cls = 'improve'; txt += ' (Verbesserung)'; }
  else if(pre === '7-9h' && post !== '7-9h'){ cls = 'worse'; txt += ' (Verschlechterung)'; }
  else if(di > 0 && pre !== '7-9h'){ cls = 'improve'; txt += ' (mehr Schlaf)'; }
  else if(di < 0){ cls = 'worse'; txt += ' (weniger Schlaf)'; }
  return `<span class="${cls}">${txt}</span>`;
}

function makeReportHtml(anon){
  const p = cur();
  if(!p) return '';
  const name = anon ? 'ANONYM' : (p.stamm.name||'Unbenannt');

  /* Briefkopf mit Logo + Praxisangaben (auch am Bildschirm sichtbar) */
  const logoSrc = db.settings.logo || DEFAULT_LOGO;
  const praxisName = esc(db.settings.praxisName || 'Praxis');
  const praxisSub = esc(db.settings.praxisSub || 'WeberBrain® Evaluation');
  const praxisAddr = esc(db.settings.praxisAddress || '').replace(/\n/g,'<br>');
  const praxisContact = esc(db.settings.praxisContact || '');
  const dt = new Date();
  const dateStr = dt.toLocaleDateString('de-DE');

  let html = `
    <div style="display:flex;align-items:flex-start;gap:16px;border-bottom:2px solid #795044;padding-bottom:12px;margin-bottom:18px">
      <img src="${logoSrc}" style="width:64px;height:64px;object-fit:contain;flex-shrink:0;background:#fff;border-radius:8px;padding:4px" alt="Logo">
      <div style="display:flex;flex-direction:column;gap:2px;flex:1">
        <span style="font-size:18px;font-weight:800;color:#795044">${praxisName}</span>
        <span style="font-size:12px;opacity:.75">${praxisSub}</span>
        ${praxisAddr ? `<span style="font-size:11px;opacity:.75;margin-top:4px">${praxisAddr}</span>` : ''}
        ${praxisContact ? `<span style="font-size:11px;opacity:.75">${praxisContact}</span>` : ''}
      </div>
      <div style="font-size:12px;opacity:.75;text-align:right">Auswertung<br>${dateStr}</div>
    </div>
    <h3 style="margin-top:0">Patient: ${esc(name)}</h3>
    <p><b>Diagnosen:</b> ${esc((p.anamnese.diagnoses||[]).join(', ')||'-')}<br>
    <b>Geburtsdatum:</b> ${esc(p.stamm.birth||'-')}<br>
    <b>Therapiebeginn:</b> ${esc(p.planung.start||'-')}<br>
    <b>Sitzungen geplant:</b> ${esc(p.planung.total||'')} · <b>tatsächlich:</b> ${esc(p.ende.count||'-')}<br>
    <b>End-Ergebnis:</b> ${esc(p.ende.result||'-')}</p>`;

  html += '<table class="evalTable"><thead><tr><th>Parameter</th><th>Vor Therapie</th><th>Ende</th><th>Bewertung</th></tr></thead><tbody>';
  symptoms.forEach(s => {
    const pre = p.evaluierung.values?.[s] ?? '';
    const post = p.ende.values?.[s] ?? '';
    const cls = trendClass(pre,post);
    html += `<tr><td>${esc(s)}</td><td>${esc(pre||'-')}</td><td>${esc(post||'-')}</td><td class="${cls}">${trendText(pre,post)}</td></tr>`;
  });
  /* Schlafqualitaet (numerisch, hoeher=besser) */
  const sqPre = p.evaluierung.sleepQuality ?? '';
  const sqPost = p.ende.sleepQuality ?? '';
  let sqCls = 'same', sqText = 'nicht vollständig';
  if(sqPre !== '' && sqPost !== ''){
    const d = Number(sqPost) - Number(sqPre);
    if(d > 0){ sqCls = 'improve'; sqText = 'Verbesserung '+d+' Punkt(e)'; }
    else if(d < 0){ sqCls = 'worse'; sqText = 'Verschlechterung '+(-d)+' Punkt(e)'; }
    else { sqCls = 'same'; sqText = 'unverändert'; }
  }
  html += `<tr><td>Schlafqualität</td><td>${esc(sqPre||'-')}</td><td>${esc(sqPost||'-')}</td><td class="${sqCls}">${sqText}</td></tr>`;
  html += '</tbody></table>';
  html += `<h3>Schlafdauer</h3><p>Vor Therapie: <b>${esc(p.evaluierung.sleepDuration||'-')}</b> → Ende: <b>${esc(p.ende.sleepDuration||'-')}</b> · ${sleepDurationCompare(p.evaluierung.sleepDuration, p.ende.sleepDuration)}</p>`;
  html += `<h3>Stimmung / Begleitbeschwerden</h3><p>${setCompare(p.evaluierung.mood,p.ende.mood)}</p>`;
  html += `<h3>Vegetative Symptome</h3><p>${setCompare(p.evaluierung.vegetative,p.ende.vegetative)}</p>`;
  return html;
}

function makeReport(anon){
  const p = cur();
  if(!p) return '';
  const name = anon ? 'ANONYM' : (p.stamm.name||'Unbenannt');
  const lines = [
    `Patient: ${name}`,
    `Diagnosen: ${(p.anamnese.diagnoses||[]).join(', ')}`,
    `Sitzungen geplant: ${p.planung.total||''}`,
    `End-Ergebnis: ${p.ende.result||''}`,
    '',
    'Beschwerden / Schlafqualität:'
  ];
  symptoms.concat(['Schlafqualität']).forEach(s => {
    const pre = s === 'Schlafqualität' ? p.evaluierung.sleepQuality : p.evaluierung.values?.[s];
    const post = s === 'Schlafqualität' ? p.ende.sleepQuality : p.ende.values?.[s];
    lines.push(`${s}: vor ${pre??'-'} → Ende ${post??'-'} (${trendText(pre,post)})`);
  });
  lines.push(`Schlafdauer: vor ${p.evaluierung.sleepDuration||'-'} → Ende ${p.ende.sleepDuration||'-'}`);
  return lines.join('\n');
}

function drawChart(){
  const c = document.getElementById('chart');
  if(!c) return;
  /* Retina-Schaerfung */
  const dpr = window.devicePixelRatio || 1;
  const cssW = c.clientWidth || 1000;
  const cssH = 520;
  c.width = cssW * dpr; c.height = cssH * dpr;
  const ctx = c.getContext('2d');
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,cssW,cssH);

  const p = cur();
  const vals = symptoms.map(s => ({s, pre:Number(p.evaluierung.values?.[s]||0), post:Number(p.ende.values?.[s]||0)}));
  vals.push({s:'Schlafqualität', pre:Number(p.evaluierung.sleepQuality||0), post:Number(p.ende.sleepQuality||0)});

  const max = 10, left = 230, top = 25, row = 38;
  const w = Math.min(650, cssW - left - 120);
  ctx.font = '14px system-ui';
  vals.forEach((v,i) => {
    const y = top + i*row;
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text');
    ctx.fillText(v.s.slice(0,28), 10, y+14);
    ctx.fillStyle = '#dfe6ef'; ctx.fillRect(left, y, w, 8);
    ctx.fillStyle = '#0b6cf0'; ctx.fillRect(left, y, w*(v.pre/max), 10);
    ctx.fillStyle = '#007a53'; ctx.fillRect(left, y+14, w*(v.post/max), 10);
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text');
    ctx.fillText('vor '+String(v.pre), left+w+8, y+10);
    ctx.fillText('ende '+String(v.post), left+w+8, y+25);
  });
  const ly = top + vals.length*row + 10;
  ctx.fillStyle = '#0b6cf0'; ctx.fillRect(left, ly, 18, 10);
  ctx.fillStyle = '#007a53'; ctx.fillRect(left+130, ly, 18, 10);
  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text');
  ctx.fillText('Vor Therapie', left+24, ly+10);
  ctx.fillText('Ende', left+154, ly+10);
}

/* ============================================================
   IMPORT / EXPORT / DRUCK
   ============================================================ */
function exportJson(){
  saveForm();
  const blob = new Blob([JSON.stringify(db,null,2)], {type:'application/json'});
  dl(blob, 'weberbrain_patienten_backup_'+today()+'.json');
}
function exportAnon(){
  saveForm();
  const p = cur();
  if(!p){ alert('Kein Patient ausgewählt.'); return; }
  const anon = {
    created:new Date().toISOString(),
    diagnoses:p.anamnese.diagnoses,
    evaluierung:p.evaluierung,
    planung:{total:p.planung.total, photos:p.planung.photos, supplements:p.planung.supplements},
    ende:p.ende,
    report:makeReport(true)
  };
  dl(new Blob([JSON.stringify(anon,null,2)], {type:'application/json'}), 'weberbrain_anonym_'+today()+'.json');
}
function dl(blob,name){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function doPrint(){
  saveForm();
  /* Druckdatum setzen */
  const d = new Date();
  document.getElementById('printDate').textContent = 'Ausdruck: '+d.toLocaleDateString('de-DE')+' '+d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
  window.print();
}

/* ============================================================
   TOP-LEVEL EVENTS
   ============================================================ */
document.getElementById('newPatientBtn').onclick = () => {
  saveForm();
  const p = blankPatient();
  db.patients.unshift(p);
  currentId = p.id;
  activeTab = 'stamm';
  persist(); render();
  setTimeout(() => document.querySelector('[data-path="stamm.name"]')?.focus(), 100);
};
document.getElementById('saveBtn').onclick = () => { saveForm(); alert('Gespeichert.'); };
document.getElementById('exportBtn').onclick = exportJson;
document.getElementById('printBtn').onclick = doPrint;
document.getElementById('lockBtn').onclick = () => { saveForm(); showLock(); };
document.getElementById('deleteBtn').onclick = () => {
  if(!cur()) return;
  if(confirm('Aktuellen Patienten wirklich löschen?')){
    db.patients = db.patients.filter(p => p.id !== currentId);
    currentId = db.patients[0]?.id || null;
    persist(); render();
  }
};
document.getElementById('nextBtn').onclick = () => {
  autosaveAndToast();
  const tabs = getActiveTabs();
  const idx = tabs.findIndex(t => t[0] === activeTab);
  activeTab = tabs[(idx+1) % tabs.length][0];
  render();
  scrollTo({top:0, behavior:'smooth'});
};
document.getElementById('search').oninput = renderList;
window.addEventListener('beforeunload', saveForm);

/* Strg+S = Speichern */
document.addEventListener('keydown', e => {
  if((e.ctrlKey||e.metaKey) && e.key === 's'){
    e.preventDefault();
    saveForm();
    /* kurzes Feedback */
    const sb = document.getElementById('saveBtn');
    if(sb){ const orig = sb.textContent; sb.textContent = '✓ Gespeichert'; setTimeout(()=>sb.textContent = orig, 1200); }
  }
});

/* Service-Worker registrieren */
if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  });
}

/* === START: erst Lock anzeigen === */
applyGlobalSettings();
showLock();

})();
