/* ============================================================
   WeberBrain Evaluation – App-Logik
   ============================================================ */
(function(){
'use strict';

const KEY = 'weberbrain_clean_v4';
const APP_VERSION = '1.21';
const APP_RELEASE_DATE = '2026-05-10';

/* ---------- Tabs (Therapeut sieht alle, Patient nur evaluierung+ende) ---------- */
const TABS_ALL = [
  ['stamm','Stammdaten'],
  ['anamnese','Anamnese'],
  ['evaluierung','Evaluierung vor Therapie'],
  ['planung','Therapieplanung'],
  ['ende','End-Evaluierung'],
  ['auswertung','Auswertung'],
  ['forschung','Forschungs-Auswertung'],
  ['settings','Einstellungen']
];
const TABS_PATIENT = [
  ['evaluierung','Evaluierung vor Therapie'],
  ['ende','End-Evaluierung']
];

/* ---------- Datenlisten ---------- */
const diagnoses = ['Alzheimer / Demenz','Parkinson','Schlaganfall','Depression','Angststörung','ADHS','Migräne / Kopfschmerz','Long COVID','SHT (Schädel-Hirn-Trauma)','PTBS','Schlafstörung','Multiple Sklerose','Epilepsie','Tinnitus','Burnout','Borreliose'];
const symptoms = ['Erschöpfung / Fatigue','Kopfschmerzen / Migräne','Konzentrationsprobleme','Gedächtnisprobleme','Stimmungstiefs / Depression','Angst / innere Unruhe','Schlafstörungen','Brain Fog / Benommenheit','Schwindel','Zittern / Tremor'];
/* "Soziale Isolation" entfernt */
const mood = ['Antriebslosigkeit','Reizbarkeit'];
const vegetative = ['Tinnitus','Sehstörungen','Lichtempfindlichkeit','Geräuschempfindlichkeit','Übelkeit','Herzrasen','Kribbeln / Taubheitsgefühl','Sprachprobleme'];
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

/* === ERHALTUNGS-PROTOKOLLE (Weber Protocol Book 2025) ===
   Pro Diagnose: Empfehlung für Frequenz pro Woche und Gesamtdauer.
   Bei dauerhaften Erhaltungstherapien (Demenz, Parkinson) werden 52 Wochen
   als Default genommen, kann beliebig erhoeht/erneuert werden.
   note erscheint im UI als Begruendungstext fuer die Empfehlung. */
const maintenanceProtocols = {
  'Alzheimer / Demenz':         {freq:2, weeks:52, note:'Neurodegenerativ – glymphatische Clearance braucht kontinuierliche Stimulation. Dauerhaft 1–2×/Woche, kein Absetzen empfohlen.'},
  'Parkinson':                  {freq:2, weeks:52, note:'Neurodegenerativ – dauerhaft 1–2×/Woche, kein Absetzen empfohlen.'},
  'Schlaganfall':               {freq:2, weeks:36, note:'Nach Akutphase 1–2×/Woche für 6–12 Monate. Bei chronischen Defiziten ggf. dauerhaft fortsetzen.'},
  'Depression':                 {freq:1, weeks:16, note:'1×/Woche für 3–6 Monate, danach individuell auf alle 2 Wochen reduzieren.'},
  'Angststörung':               {freq:1, weeks:16, note:'1×/Woche für 3–6 Monate, dann individuell ausschleichen.'},
  'PTBS':                       {freq:1, weeks:16, note:'1×/Woche für 3–6 Monate, in Abstimmung mit Traumatherapie.'},
  'Long COVID':                 {freq:1, weeks:16, note:'1×/Woche für 3–6 Monate. PEM weiter beobachten.'},
  'Burnout':                    {freq:1, weeks:16, note:'1×/Woche für 3–6 Monate, dann nach Bedarf.'},
  'SHT (Schädel-Hirn-Trauma)':  {freq:1, weeks:24, note:'1×/Woche für 6 Monate. Bei chronischem TBI längere Erhaltung.'},
  'Schlafstörung':              {freq:1, weeks:12, note:'Bei Bedarf 1×/Woche, abendlich vor dem Schlafengehen.'},
  'Migräne / Kopfschmerz':      {freq:1, weeks:24, note:'1×/Woche prophylaktisch. Nicht während akuter Attacke.'},
  'ADHS':                       {freq:1, weeks:24, note:'1×/Woche Erhaltung, idealerweise vormittags.'},
  'Multiple Sklerose':          {freq:2, weeks:52, note:'Symptomdominanz-abhängig 1–2×/Woche, dauerhaft.'},
  'Tinnitus':                   {freq:1, weeks:16, note:'1×/Woche solange Verträglichkeit gut bleibt.'},
  'Epilepsie':                  {freq:0, weeks:0,  note:'Keine automatische Empfehlung – ärztliche Verordnung erforderlich.'}
};

/* Sucht in der Anamnese die erste passende Erhaltungs-Empfehlung */
function maintenanceSuggestionFor(diagnoses){
  for(const d of (diagnoses || [])){
    if(maintenanceProtocols[d]) return {diagnosis:d, ...maintenanceProtocols[d]};
  }
  return null;
}

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
  /* Auto-Backup: bei jeder Aenderung den 3-Min-Timer neu starten */
  scheduleAutoBackup();
}

/* === AUTO-BACKUP nach 3 Min Inaktivitaet === */
let _autoBackupTimer = null;
let _lastBackupHash = null;       /* Was wurde zuletzt gesichert? */
let _hasUnsavedChanges = false;   /* Ist die aktuelle DB neuer als das letzte Backup? */

function dataHash(){
  /* Schneller Hash der DB - reicht um Aenderungen zu erkennen */
  const s = localStorage.getItem(KEY) || '';
  let h = 0;
  for(let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h;
}

function scheduleAutoBackup(){
  /* _hasUnsavedChanges immer pflegen (auch bei deaktiviertem autoBackup),
     damit der Lock-Trigger entscheiden kann ob es etwas zu sichern gibt */
  const currentHash = dataHash();
  if(currentHash !== _lastBackupHash) _hasUnsavedChanges = true;

  /* Wenn Auto-Backup deaktiviert: keinen Timer starten - return */
  if(!db.settings || !db.settings.autoBackup){
    clearTimeout(_autoBackupTimer);
    return;
  }
  if(currentHash === _lastBackupHash) return;

  /* Intervall aus Settings (Minuten), Default 3 */
  const minutes = Number(db.settings.autoBackupInterval) || 3;
  const intervalMs = minutes * 60 * 1000;

  clearTimeout(_autoBackupTimer);
  _autoBackupTimer = setTimeout(() => {
    /* Vor dem Schreiben nochmal pruefen, ob immer noch Aenderungen vorliegen
       UND ob Auto-Backup immer noch aktiviert ist (User koennte zwischenzeitlich deaktiviert haben) */
    if(_hasUnsavedChanges && db.settings.autoBackup){
      doAutoBackup();
    }
  }, intervalMs);
}

async function doAutoBackup(){
  try {
    const filename = 'weberbrain_backup_' + today() + '.json';
    const json = JSON.stringify(db, null, 2);
    /* Wenn ein Ordner-Handle (File System Access API) gewaehlt wurde,
       direkt dorthin schreiben - sonst Download-Fallback */
    const handle = await getStoredFolderHandle();
    if(handle){
      try {
        /* Permission re-pruefen */
        let perm = await handle.queryPermission({mode:'readwrite'});
        if(perm !== 'granted'){
          perm = await handle.requestPermission({mode:'readwrite'});
        }
        if(perm === 'granted'){
          const fileHandle = await handle.getFileHandle(filename, {create:true});
          const writable = await fileHandle.createWritable();
          await writable.write(json);
          await writable.close();
          _lastBackupHash = dataHash();
          _hasUnsavedChanges = false;
          showToast('💾 Backup in gewählten Ordner gespeichert');
          return;
        }
      } catch(e){
        console.warn('Auto-Backup in Ordner fehlgeschlagen, Fallback auf Download:', e);
      }
    }
    /* Standard-Fallback: Download */
    const blob = new Blob([json], {type:'application/json'});
    dl(blob, filename);
    _lastBackupHash = dataHash();
    _hasUnsavedChanges = false;
    showToast('💾 Auto-Backup erstellt');
  } catch(e){
    console.error('Auto-Backup fehlgeschlagen:', e);
  }
}

/* ===== File System Access API: Ordner-Handle in IndexedDB persistieren =====
   FSAA erlaubt keine Pfad-Strings, nur Handles. Diese muessen in IndexedDB
   gespeichert werden, damit die App auch nach Neustart auf den Ordner zugreifen kann.
   Auf Mobile/Android-Chrome ist die API NICHT verfuegbar - dann geben wir null zurueck. */
const FSA_DB_NAME = 'weberbrain_fsa';
const FSA_STORE = 'handles';
const FSA_KEY = 'autoBackupFolder';
function _openFsaDb(){
  return new Promise((resolve, reject) => {
    if(!('indexedDB' in window)){ reject(new Error('IndexedDB nicht verfügbar')); return; }
    const req = indexedDB.open(FSA_DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(FSA_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function storeFolderHandle(handle){
  if(!handle) return;
  const db_ = await _openFsaDb();
  await new Promise((resolve, reject) => {
    const tx = db_.transaction(FSA_STORE, 'readwrite');
    tx.objectStore(FSA_STORE).put(handle, FSA_KEY);
    tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
  });
}
async function getStoredFolderHandle(){
  if(!('indexedDB' in window)) return null;
  try {
    const db_ = await _openFsaDb();
    return await new Promise((resolve, reject) => {
      const tx = db_.transaction(FSA_STORE, 'readonly');
      const req = tx.objectStore(FSA_STORE).get(FSA_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch(e){ return null; }
}
async function clearStoredFolderHandle(){
  try {
    const db_ = await _openFsaDb();
    await new Promise((resolve, reject) => {
      const tx = db_.transaction(FSA_STORE, 'readwrite');
      tx.objectStore(FSA_STORE).delete(FSA_KEY);
      tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
    });
  } catch(e){}
}
/* Erkennt, ob die File System Access API verfuegbar ist (Desktop-Chrome/Edge) */
function isFolderPickerSupported(){
  return typeof window.showDirectoryPicker === 'function';
}

/* Manuell sofort backupen (z.B. ueber Button) */
function triggerImmediateBackup(){
  clearTimeout(_autoBackupTimer);
  doAutoBackup();
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
  /* Auto-Backup: Standard AUS - User muss bewusst aktivieren */
  if(db.settings.autoBackup === undefined) db.settings.autoBackup = false;
  /* Intervall in Minuten: 3, 6, 9, 12, 15, 20, 30 */
  if(db.settings.autoBackupInterval === undefined) db.settings.autoBackupInterval = 3;
  /* Zusaetzlich beim Sperren der App backupen (separater Switch) */
  if(db.settings.autoBackupOnLock === undefined) db.settings.autoBackupOnLock = false;
  /* Ordner-Pfad fuer Auto-Backup (informell - bei File System Access API
     wird das Handle in IndexedDB gespeichert, nicht hier; hier nur der Anzeige-Name) */
  if(db.settings.autoBackupFolderName === undefined) db.settings.autoBackupFolderName = '';
}
ensureSettings();
/* Migration: Alte Patienten ohne maintenance-Feld nachruesten */
db.patients.forEach(p => {
  if(!p.maintenance){
    p.maintenance = {enabled:false,start:'',frequencyPerWeek:1,durationWeeks:12,sessions:[],notes:''};
  }
});
persist();
/* Auto-Backup Baseline: aktueller Stand gilt als "schon gesichert", damit
   Migrations-Aenderungen nicht direkt ein Backup ausloesen */
_lastBackupHash = dataHash();
_hasUnsavedChanges = false;
clearTimeout(_autoBackupTimer);

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
    /* Erhaltungstherapie - nur wenn enabled=true wird das Sub-Panel gezeigt */
    maintenance:{enabled:false,start:'',frequencyPerWeek:1,durationWeeks:12,sessions:[],notes:''},
    ende:{values:{},sleepDuration:'',sleepQuality:'',mood:[],vegetative:[],count:'',result:'',overallComparison:'',satisfaction:'',notes:''}
  };
}
function makeSessions(n){
  return Array.from({length:Number(n)||0}, (_,i) => ({nr:i+1,date:'',hz:'',intensity:'',duration:'',note:'',done:false}));
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
  p.ende = p.ende || {values:{},sleepDuration:'',sleepQuality:'',mood:[],vegetative:[],count:'',result:'',overallComparison:'',satisfaction:'',notes:''};
  if(p.ende.overallComparison === undefined) p.ende.overallComparison = '';
  if(p.ende.satisfaction === undefined) p.ende.satisfaction = '';
  p.ende.values = p.ende.values || {};
  p.ende.mood = p.ende.mood || [];
  p.ende.vegetative = p.ende.vegetative || [];
  p.planung = p.planung || {};
  /* Default 20 nur, wenn Feld komplett fehlt - sonst Wert beibehalten (auch leer/0) */
  if(p.planung.total === undefined || p.planung.total === null) p.planung.total = 20;
  p.planung.sessions = p.planung.sessions || makeSessions(p.planung.total);
  /* Erhaltungstherapie nachruesten fuer alte Patienten */
  p.maintenance = p.maintenance || {enabled:false,start:'',frequencyPerWeek:1,durationWeeks:12,sessions:[],notes:''};
  if(p.maintenance.enabled === undefined) p.maintenance.enabled = false;
  if(p.maintenance.frequencyPerWeek === undefined || p.maintenance.frequencyPerWeek === null) p.maintenance.frequencyPerWeek = 1;
  if(p.maintenance.durationWeeks === undefined || p.maintenance.durationWeeks === null) p.maintenance.durationWeeks = 12;
  if(!Array.isArray(p.maintenance.sessions)) p.maintenance.sessions = [];
  adjustSessions();
}
function adjustSessions(){
  const p = cur();
  if(!p) return;
  const n = Math.max(0, Math.min(40, Number(p.planung.total)||0));
  while(p.planung.sessions.length < n) p.planung.sessions.push({nr:p.planung.sessions.length+1,date:'',hz:'',intensity:'',duration:'',note:'',done:false});
  if(p.planung.sessions.length > n) p.planung.sessions = p.planung.sessions.slice(0,n);
  p.planung.sessions.forEach((s,i) => { s.nr = i+1; if(s.done === undefined) s.done = false; });
}

/* === ERHALTUNGS-SITZUNGEN ===
   Berechnet die Anzahl Sitzungen aus Frequenz/Woche × Wochen und
   passt das Sessions-Array entsprechend an. Bestehende Eintraege bleiben erhalten. */
function maintenanceTargetCount(m){
  const f = Math.max(0, Math.min(7, Number(m.frequencyPerWeek) || 0));
  const w = Math.max(0, Math.min(104, Number(m.durationWeeks) || 0));
  return f * w;
}

function adjustMaintenanceSessions(){
  const p = cur();
  if(!p || !p.maintenance) return;
  const m = p.maintenance;
  const n = maintenanceTargetCount(m);
  while(m.sessions.length < n) m.sessions.push({nr:m.sessions.length+1,date:'',hz:'',intensity:'',duration:'',note:'',done:false});
  if(m.sessions.length > n) m.sessions = m.sessions.slice(0,n);
  m.sessions.forEach((s,i) => { s.nr = i+1; if(s.done === undefined) s.done = false; });
}

/* Verteilt Sitzungs-Daten gleichmaessig in den Wochen ab Startdatum.
   Bei freq=1: jeden Montag.
   Bei freq=2: Mo + Do.
   Bei freq=3: Mo + Mi + Fr.
   Bei freq>=4: aufeinanderfolgende Werktage. */
function generateMaintenanceDates(){
  const p = cur();
  if(!p || !p.maintenance) return;
  const m = p.maintenance;
  if(!m.start || !m.sessions.length) return;
  const start = new Date(m.start + 'T00:00:00');
  if(isNaN(start)) return;

  const f = Math.max(1, Math.min(7, Number(m.frequencyPerWeek) || 1));
  /* Tage-Offsets ab Wochenbeginn (Montag) */
  const dayPatterns = {
    1: [0],          /* Mo */
    2: [0, 3],       /* Mo, Do */
    3: [0, 2, 4],    /* Mo, Mi, Fr */
    4: [0, 1, 3, 4], /* Mo, Di, Do, Fr */
    5: [0, 1, 2, 3, 4],
    6: [0, 1, 2, 3, 4, 5],
    7: [0, 1, 2, 3, 4, 5, 6]
  };
  const pattern = dayPatterns[f] || [0];

  /* Startwoche so verschieben, dass der erste Termin auf den naechsten Montag faellt
     (oder den Starttag selbst, wenn Montag) */
  const startDay = start.getDay(); /* 0=So, 1=Mo, ..., 6=Sa */
  const offsetToMonday = startDay === 0 ? 1 : (startDay === 1 ? 0 : (8 - startDay));
  const baseMonday = new Date(start);
  baseMonday.setDate(baseMonday.getDate() + offsetToMonday);
  /* Wenn Start ein Montag ist, von dort aus starten. Sonst auch ok, wir nehmen den ersten Montag ab Start. */
  if(startDay === 1) baseMonday.setTime(start.getTime());

  m.sessions.forEach((s, i) => {
    const week = Math.floor(i / pattern.length);
    const dayIdx = i % pattern.length;
    const dt = new Date(baseMonday);
    dt.setDate(dt.getDate() + week * 7 + pattern[dayIdx]);
    /* Nur ueberschreiben wenn leer, damit individuelle Aenderungen erhalten bleiben */
    if(!s.date) s.date = dt.toISOString().slice(0,10);
  });
}

/* Default-Werte fuer Erhaltungs-Sitzungen aus der letzten Akut-Sitzung holen */
function maintenanceDefaultsFromAcute(){
  const p = cur();
  if(!p) return null;
  const lastFilled = [...(p.planung?.sessions || [])].reverse().find(s => s.hz !== '' && s.hz !== undefined);
  if(!lastFilled) return null;
  return {hz:lastFilled.hz, intensity:lastFilled.intensity, duration:lastFilled.duration};
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
  /* "Export", "Drucken" und Einstellungen fuer Patienten ausblenden */
  document.getElementById('exportBtn').style.display = userMode === 'patient' ? 'none' : '';
  document.getElementById('printBtn').style.display = userMode === 'patient' ? 'none' : '';
  const settingsTopBtn = document.getElementById('settingsTopBtn');
  if(settingsTopBtn) settingsTopBtn.style.display = userMode === 'patient' ? 'none' : '';

  /* Im Patientenmodus oben den aktuell ausgewaehlten Patienten anzeigen */
  const headerPatientName = document.getElementById('headerPatientName');
  if(headerPatientName){
    const name = cur()?.stamm?.name || 'Unbenannter Patient';
    headerPatientName.textContent = userMode === 'patient' && cur() ? 'Patient: ' + name : '';
    headerPatientName.style.display = userMode === 'patient' && cur() ? '' : 'none';
  }

  /* Neuer-Patient-Btn in Sidebar nur sichtbar im Stammdaten-Reiter */
  const newSb = document.getElementById('newPatientSidebarBtn');
  if(newSb) newSb.style.display = (activeTab === 'stamm') ? '' : 'none';

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
    ${sleepDurationField(prefix+'.sleepDuration','Durchschnittliche Schlafdauer')}
    ${scale(prefix+'.sleepQuality','Schlafqualität')}
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
  const done = !!s.done;
  const cls = done ? 'session session-done' : 'session session-open';
  return `<div class="${cls}">
    <div class="sessionHeader">
      <h4>Sitzung ${i+1}</h4>
      <label class="sessionDoneToggle">
        <input type="checkbox" data-session="${i}" data-key="done" ${done?'checked':''}>
        <span>${done?'✓ durchgeführt':'als durchgeführt markieren'}</span>
      </label>
    </div>
    <div class="miniGrid">
      <div class="field"><label>Datum</label><input type="date" data-session="${i}" data-key="date" value="${esc(s.date)}"></div>
      <div class="field"><label>Frequenz Hz</label><input data-session="${i}" data-key="hz" value="${esc(s.hz)}"></div>
      <div class="field"><label>Intensität %</label><input data-session="${i}" data-key="intensity" value="${esc(s.intensity)}"></div>
      <div class="field"><label>Dauer min</label><input data-session="${i}" data-key="duration" value="${esc(s.duration)}"></div>
    </div>
    <div class="field"><label>Anmerkung</label><textarea data-session="${i}" data-key="note">${esc(s.note)}</textarea></div>
  </div>`;
}

/* === ERHALTUNGS-SITZUNGEN UI === */
function maintenanceSessionHtml(i){
  const s = cur().maintenance.sessions[i];
  const done = !!s.done;
  const cls = done ? 'session maintenance-session session-done' : 'session maintenance-session session-open';
  return `<div class="${cls}">
    <div class="sessionHeader">
      <h4>Erhaltung #${i+1}</h4>
      <label class="sessionDoneToggle">
        <input type="checkbox" data-msession="${i}" data-key="done" ${done?'checked':''}>
        <span>${done?'✓ durchgeführt':'als durchgeführt markieren'}</span>
      </label>
    </div>
    <div class="miniGrid">
      <div class="field"><label>Datum</label><input type="date" data-msession="${i}" data-key="date" value="${esc(s.date)}"></div>
      <div class="field"><label>Frequenz Hz</label><input data-msession="${i}" data-key="hz" value="${esc(s.hz)}"></div>
      <div class="field"><label>Intensität %</label><input data-msession="${i}" data-key="intensity" value="${esc(s.intensity)}"></div>
      <div class="field"><label>Dauer min</label><input data-msession="${i}" data-key="duration" value="${esc(s.duration)}"></div>
    </div>
    <div class="field"><label>Anmerkung</label><textarea data-msession="${i}" data-key="note">${esc(s.note)}</textarea></div>
  </div>`;
}

function maintenanceBlockHtml(p){
  const m = p.maintenance || {};
  const enabled = !!m.enabled;
  const suggestion = maintenanceSuggestionFor(p.anamnese?.diagnoses || []);

  /* Header mit Switch */
  let html = `<div class="maintenanceBlock">
    <div class="maintenanceHeader">
      <div>
        <h3 style="margin:0">🔄 Erhaltungstherapie</h3>
        <p class="smallMuted" style="margin:4px 0 0">Nach Abschluss der Akutphase – wird typischerweise erst am Ende der Therapie aktiviert.</p>
      </div>
      <label class="toggleSwitch">
        <input type="checkbox" id="maintenanceToggle" ${enabled?'checked':''}>
        <span class="slider"></span>
        <span class="toggleLabel">${enabled?'aktiviert':'nicht aktiviert'}</span>
      </label>
    </div>`;

  if(!enabled){
    html += `<div class="notice" style="margin-top:12px">Schalte die Erhaltungstherapie ein, um einen Plan zu erstellen. Bei Aktivierung wird automatisch ein Vorschlag aus den Weber-Erhaltungsschemata generiert (sofern eine passende Diagnose ausgewählt wurde).</div>`;
    html += `</div>`;
    return html;
  }

  /* Empfehlung anzeigen */
  if(suggestion){
    html += `<div class="notice ok" style="margin-top:12px">
      <b>Empfehlung Weber Protocol Book 2025</b> für <i>${esc(suggestion.diagnosis)}</i>:
      ${suggestion.freq > 0 ? suggestion.freq+'×/Woche für '+suggestion.weeks+' Wochen' : 'Keine automatische Empfehlung'}.
      <br><span class="smallMuted">${esc(suggestion.note)}</span>
      ${suggestion.freq > 0 ? '<br><button class="muted" id="applyMaintenanceSuggestion" style="margin-top:8px">Empfehlung übernehmen</button>' : ''}
    </div>`;
  } else {
    html += `<div class="notice" style="margin-top:12px">Keine passende Diagnose für automatischen Vorschlag. Bitte Werte manuell eingeben.</div>`;
  }

  /* Eingaben */
  html += `<div class="grid" style="margin-top:12px">
    ${input('maintenance.start','Beginn Erhaltungsphase','date')}
    ${input('maintenance.frequencyPerWeek','Sitzungen pro Woche','number')}
    ${input('maintenance.durationWeeks','Gesamtdauer (Wochen)','number')}
  </div>
  <div class="topBtns">
    <button class="muted" id="refreshMaintenance">Sitzungsfenster aktualisieren</button>
    <button class="muted" id="generateMaintenanceDates">Datumsvorschläge erzeugen</button>
    <button class="muted" id="copyAcuteParams">Hz/%/min aus Akut übernehmen</button>
  </div>`;

  const target = maintenanceTargetCount(m);
  if(target > 0){
    html += `<p class="smallMuted" style="margin-top:10px">${target} Erhaltungs-Sitzungen geplant (${m.frequencyPerWeek}×/Woche × ${m.durationWeeks} Wochen).</p>`;
    html += `<div class="therapyGrid">${m.sessions.map((s,i) => maintenanceSessionHtml(i)).join('')}</div>`;
  } else {
    html += `<p class="smallMuted" style="margin-top:10px">Noch keine Sitzungen geplant – Frequenz und Dauer eingeben.</p>`;
  }
  html += textarea('maintenance.notes','Anmerkungen zur Erhaltungstherapie');
  html += `</div>`;
  return html;
}

/* ============================================================
   FORSCHUNGS-AUSWERTUNG
   Aggregiert alle Patienten der Kartei nach Diagnose
   ============================================================ */

/* Mappt die Patienten-Selbsteinschaetzung (5-Stufen) auf einen Score in % */
function comparisonScore(comparison){
  if(!comparison) return null;
  const map = {
    'Deutlich besser':       70,
    'Etwas besser':          30,
    'Unverändert':            0,
    'Etwas schlechter':     -30,
    'Deutlich schlechter':  -70
  };
  return map[comparison] ?? null;
}

/* Mappt das alte endResult-Auswahlfeld auf einen Score (fuer Rueckwaertskompatibilitaet) */
function endResultScore(result){
  if(!result) return null;
  const map = {
    'Deutliche Verbesserung': 70,
    'Leichte Verbesserung': 30,
    'Keine Veränderung': 0,
    'Leichte Verschlechterung': -30,
    'Deutliche Verschlechterung': -70
  };
  return map[result] ?? null;
}

/* Verbesserung eines Patienten in % berechnen - KOMBINIERT
   - 60% gewichtet: Symptom-Reduktion (vor/nach Mittelwerte der Skalen)
   - 40% gewichtet: Patienten-Selbsteinschaetzung (overallComparison) ODER altes endResult-Feld
   - Wenn nur eines vorhanden, wird das alleine genutzt
   - Negativer Wert = Verschlechterung, positiver = Verbesserung
   - Rueckgabewert: Score (oder null falls beide fehlen) */
function patientImprovement(p){
  /* Symptome paarweise vergleichen: nur wo BEIDE Werte (vor & nach) erfasst sind */
  const pairs = [];
  symptoms.forEach(s => {
    const preV = p.evaluierung?.values?.[s];
    const postV = p.ende?.values?.[s];
    const preNum = (preV !== '' && preV !== undefined && preV !== null) ? Number(preV) : null;
    const postNum = (postV !== '' && postV !== undefined && postV !== null) ? Number(postV) : null;
    if(preNum !== null && postNum !== null && !isNaN(preNum) && !isNaN(postNum)){
      pairs.push({pre: preNum, post: postNum});
    }
  });

  let symptomScore = null;
  if(pairs.length >= 1){
    const avgPre = pairs.reduce((a,b) => a + b.pre, 0) / pairs.length;
    const avgPost = pairs.reduce((a,b) => a + b.post, 0) / pairs.length;
    symptomScore = avgPre === 0 ? 0 : Math.round(((avgPre - avgPost) / avgPre) * 100);
  }

  /* Bevorzugt overallComparison (neu), Fallback auf altes ende.result */
  const compScore = comparisonScore(p.ende?.overallComparison);
  const oldResultScore = endResultScore(p.ende?.result);
  const subjectiveScore = compScore !== null ? compScore : oldResultScore;

  if(symptomScore === null && subjectiveScore === null) return null;
  if(symptomScore === null) return subjectiveScore;
  if(subjectiveScore === null) return symptomScore;
  /* Gewichteter Mittelwert: 60% Symptom-Reduktion + 40% Patienten-Einschätzung */
  return Math.round(symptomScore * 0.6 + subjectiveScore * 0.4);
}

/* Mittelwert der durchgefuehrten Sitzungs-Parameter eines Patienten */
function patientSessionStats(p){
  const sessions = (p.planung?.sessions || []).filter(s => s.hz !== '' && s.hz !== undefined);
  if(!sessions.length) return null;
  const num = arr => arr.map(Number).filter(x => !isNaN(x));
  const avg = arr => arr.length ? arr.reduce((a,b)=>a+b,0) / arr.length : null;
  /* Hz: bei Mehrfach-Eintraegen wie "10 / 40" oder "40 + 10" nehmen wir den ersten */
  const hzVals = num(sessions.map(s => String(s.hz).split(/[\/+,\s]/)[0]));
  const intVals = num(sessions.map(s => String(s.intensity).split(/[\/+,–-]/)[0]));
  const durVals = num(sessions.map(s => String(s.duration).split(/[\/+,–-]/)[0]));
  return {
    nSessions: sessions.length,
    avgHz: avg(hzVals),
    avgIntensity: avg(intVals),
    avgDuration: avg(durVals)
  };
}

/* Alters-Berechnung aus Geburtsdatum */
function patientAge(p){
  if(!p.stamm?.birth) return null;
  const b = new Date(p.stamm.birth);
  if(isNaN(b)) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  if(now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) age--;
  return age;
}
function ageGroup(age){
  if(age === null) return '?';
  if(age < 30) return '<30';
  if(age < 50) return '30-49';
  if(age < 70) return '50-69';
  return '70+';
}
function genderNorm(g){
  if(!g) return '?';
  const s = String(g).toLowerCase().trim();
  if(s.startsWith('w') || s.startsWith('f')) return 'weiblich';
  if(s.startsWith('m')) return 'männlich';
  if(s.startsWith('d') || s.startsWith('div') || s === 'x') return 'divers';
  return '?';
}

/* Alle Patienten mit ihren berechneten Werten, gefiltert auf "abgeschlossen" */
function buildAnalysisDataset(){
  return db.patients
    .map(p => {
      const imp = patientImprovement(p);
      const ses = patientSessionStats(p);
      if(imp === null || ses === null) return null;
      return {
        id: p.id,
        diagnoses: p.anamnese?.diagnoses || [],
        improvement: imp,
        sessions: ses.nSessions,
        avgHz: ses.avgHz,
        avgIntensity: ses.avgIntensity,
        avgDuration: ses.avgDuration,
        plannedTotal: Number(p.planung?.total) || 0,
        endResult: p.ende?.result || '',
        age: patientAge(p),
        ageGroup: ageGroup(patientAge(p)),
        gender: genderNorm(p.stamm?.gender),
        photos: p.planung?.photos || [],
        supplements: p.planung?.supplements || []
      };
    })
    .filter(Boolean);
}

/* Welche Diagnosen kommen wie oft vor (in Patienten mit auswertbaren Daten)? */
function diagnosisCounts(dataset){
  const counts = {};
  dataset.forEach(d => {
    d.diagnoses.forEach(diag => {
      counts[diag] = (counts[diag] || 0) + 1;
    });
  });
  return counts;
}

/* Filter Dataset auf eine bestimmte Diagnose */
function filterByDiagnosis(dataset, diag){
  return dataset.filter(d => d.diagnoses.includes(diag));
}

/* Wendet alle aktiven Filter additiv an (UND-Verknuepfung) */
function applyResearchFilters(dataset, filters){
  return dataset.filter(d => {
    /* Diagnose-Filter: wenn gesetzt, muss Patient diese Diagnose haben */
    if(filters.diagnosis && !d.diagnoses.includes(filters.diagnosis)) return false;
    /* Geschlecht-Filter: wenn nicht-leer, muss Patient in Liste sein */
    if(filters.genders?.length && !filters.genders.includes(d.gender)) return false;
    /* Alter-Filter */
    if(filters.ageGroups?.length && !filters.ageGroups.includes(d.ageGroup)) return false;
    /* Sitzungs-Range */
    if(filters.minSessions != null && d.sessions < filters.minSessions) return false;
    if(filters.maxSessions != null && d.sessions > filters.maxSessions) return false;
    return true;
  });
}

/* Median, Mittelwert, Stdabweichung */
function stats(values){
  values = values.filter(v => v !== null && !isNaN(v));
  if(!values.length) return null;
  const sorted = [...values].sort((a,b) => a-b);
  const mean = values.reduce((a,b) => a+b, 0) / values.length;
  const median = sorted.length % 2 ? sorted[(sorted.length-1)/2] : (sorted[sorted.length/2-1] + sorted[sorted.length/2]) / 2;
  const variance = values.reduce((a,b) => a + (b-mean)**2, 0) / values.length;
  const sd = Math.sqrt(variance);
  return {n: values.length, mean, median, sd, min: sorted[0], max: sorted[sorted.length-1]};
}

/* Pearson-Korrelation zwischen Parameter X und Verbesserung */
function pearsonCorrelation(xs, ys){
  const n = xs.length;
  if(n < 3) return null;
  const meanX = xs.reduce((a,b) => a+b, 0) / n;
  const meanY = ys.reduce((a,b) => a+b, 0) / n;
  let num = 0, denX = 0, denY = 0;
  for(let i = 0; i < n; i++){
    const dx = xs[i] - meanX, dy = ys[i] - meanY;
    num += dx*dy; denX += dx*dx; denY += dy*dy;
  }
  if(denX === 0 || denY === 0) return null;
  return num / Math.sqrt(denX * denY);
}

/* Optimaler Parameter-Wert: Bin-Analyse - bei welchem Bin ist die durchschnittliche Verbesserung am hoechsten? */
function findOptimum(dataset, key, bins){
  const grouped = {};
  bins.forEach(b => grouped[b.label] = []);
  dataset.forEach(d => {
    const v = d[key];
    if(v === null || isNaN(v)) return;
    const bin = bins.find(b => v >= b.min && v < b.max);
    if(bin) grouped[bin.label].push(d.improvement);
  });
  const result = Object.entries(grouped)
    .map(([label, imps]) => ({
      label,
      n: imps.length,
      meanImprovement: imps.length ? imps.reduce((a,b) => a+b, 0) / imps.length : null
    }))
    .filter(x => x.n > 0);
  return result;
}

/* === ZENTRALE BIN-DEFINITIONEN ===
   Hier kannst du die Auswertungs-Stufen aenderen, sie werden ueberall verwendet.
   - HZ_BINS: jeder 10er-Schritt von 0 bis 100 Hz
   - INT_BINS: 25% / 50% / 75% / 100% (Intensitaets-Stufen am WeberBrain-Geraet)
   - DUR_BINS: 10 / 20 / 30 min (Standard-Sitzungsdauern)
   - SES_BINS: <5 / 5-9 / 10-19 / >=20 Sitzungen (bleibt wie zuvor)
   max ist EXKLUSIV (avgHz < max), deshalb 10.001 etc. */
const HZ_BINS = [
  {label:'0 Hz (CW)', min:0,    max:0.5},
  {label:'1-10 Hz',   min:0.5,  max:10.5},
  {label:'11-20 Hz',  min:10.5, max:20.5},
  {label:'21-30 Hz',  min:20.5, max:30.5},
  {label:'31-40 Hz',  min:30.5, max:40.5},
  {label:'41-50 Hz',  min:40.5, max:50.5},
  {label:'51-60 Hz',  min:50.5, max:60.5},
  {label:'61-70 Hz',  min:60.5, max:70.5},
  {label:'71-80 Hz',  min:70.5, max:80.5},
  {label:'81-90 Hz',  min:80.5, max:90.5},
  {label:'91-100 Hz', min:90.5, max:1000}
];
const INT_BINS = [
  {label:'25%',  min:0,    max:37.5},
  {label:'50%',  min:37.5, max:62.5},
  {label:'75%',  min:62.5, max:87.5},
  {label:'100%', min:87.5, max:200}
];
const DUR_BINS = [
  {label:'10 min', min:0,  max:15},
  {label:'20 min', min:15, max:25},
  {label:'30 min', min:25, max:200}
];
const SES_BINS = [
  {label:'<5',    min:0,  max:5},
  {label:'5-9',   min:5,  max:10},
  {label:'10-19', min:10, max:20},
  {label:'≥20',   min:20, max:200}
];

/* Heatmap: Frequenz-Bins x Intensitaets-Bins, Wert = mittlere Verbesserung */
function buildHeatmap(dataset){
  const hzBins = HZ_BINS;
  const intBins = INT_BINS;
  const cells = [];
  hzBins.forEach((hz, hi) => {
    intBins.forEach((it, ii) => {
      const matching = dataset.filter(d =>
        d.avgHz !== null && d.avgIntensity !== null &&
        d.avgHz >= hz.min && d.avgHz < hz.max &&
        d.avgIntensity >= it.min && d.avgIntensity < it.max
      );
      const imps = matching.map(d => d.improvement);
      cells.push({
        row: hi, col: ii, hzLabel: hz.label, intLabel: it.label,
        n: matching.length,
        meanImprovement: imps.length ? Math.round(imps.reduce((a,b) => a+b, 0) / imps.length) : null
      });
    });
  });
  return {hzBins, intBins, cells};
}

/* Farbe fuer Heatmap-Zelle - kraeftiger Verlauf von Rot ueber Grau zu Gruen */
function heatColor(imp, n){
  if(imp === null || n === 0) return '#ececec';     /* leer = sehr hell-grau */
  if(n < 2) return '#dcdcdc';                        /* zu wenige Daten = hellgrau */
  /* Skala: -50% (dunkelrot) → 0 (grau) → +50% (dunkelgruen) */
  const clamped = Math.max(-50, Math.min(50, imp));
  if(clamped > 5){
    /* Gruen-Verlauf: 5 -> hellgrün, 50 -> kräftiges Dunkelgrün */
    const t = (clamped - 5) / 45;
    const r = Math.round(124 - 111*t);  // 124->13
    const g = Math.round(195 - 88*t);   // 195->107
    const b = Math.round(110 - 50*t);   // 110->60
    return `rgb(${r},${g},${b})`;
  } else if(clamped < -5){
    /* Rot-Verlauf: -5 -> hellrot, -50 -> dunkelrot */
    const t = (-clamped - 5) / 45;
    const r = Math.round(220 - 67*t);   // 220->153
    const g = Math.round(89 - 57*t);    // 89->32
    const b = Math.round(89 - 57*t);
    return `rgb(${r},${g},${b})`;
  } else {
    /* nahe 0 = neutraler Grauton */
    return '#b8b8b8';
  }
}
function heatTextColor(imp, n){
  if(imp === null || n === 0) return '#999';
  if(n < 2) return '#777';
  /* Bei kräftigen Farben weisser Text */
  return Math.abs(imp) > 5 ? '#fff' : '#222';
}

/* Subgruppen-Analyse: Verbesserung nach Geschlecht / Altersgruppe */
function subgroupAnalysis(dataset){
  const byGender = {};
  const byAge = {};
  dataset.forEach(d => {
    byGender[d.gender] = byGender[d.gender] || [];
    byGender[d.gender].push(d.improvement);
    byAge[d.ageGroup] = byAge[d.ageGroup] || [];
    byAge[d.ageGroup].push(d.improvement);
  });
  const summarize = obj => Object.entries(obj).map(([k, vals]) => ({
    label: k, n: vals.length,
    mean: vals.length ? Math.round(vals.reduce((a,b)=>a+b,0) / vals.length) : null
  })).sort((a,b) => b.n - a.n);
  return {gender: summarize(byGender), age: summarize(byAge)};
}

/* === RENDER === */
/* Forschungs-Filter: alle Filter werden additiv kombiniert (UND-Verknuepfung).
   Leere Auswahl = kein Filter aktiv (alle Patienten).
   diagnosis = null bedeutet "keine spezifische Diagnose ausgewaehlt" - dann werden ALLE
   auswertbaren Patienten betrachtet. Sobald eine Diagnose gewaehlt ist, werden nur
   Patienten mit dieser Diagnose betrachtet. */
let researchFilters = {
  diagnosis: null,        /* null = alle, sonst Diagnose-String */
  genders: [],            /* leer = alle, sonst ['männlich', 'weiblich', ...] */
  ageGroups: [],          /* leer = alle, sonst ['<30', '30-49', ...] */
  minSessions: null,      /* null = kein Min-Filter */
  maxSessions: null       /* null = kein Max-Filter */
};
/* Rueckwaertskompatibilitaet */
let researchSelectedDiag = null;

function renderResearchPanel(){
  const dataset = buildAnalysisDataset();
  const total = db.patients.length;
  const evaluable = dataset.length;
  const counts = diagnosisCounts(dataset);
  const sortedDiags = Object.entries(counts).sort((a,b) => b[1] - a[1]);

  /* Verfuegbare Filter-Werte:
     - Geschlecht: IMMER alle 3 Optionen anzeigen (mit Patienten-Anzahl als Hinweis)
     - Altersgruppe: nur die in dataset tatsaechlich vorkommenden */
  /* Geschlechter aus ALLEN Patienten ermitteln (nicht nur auswertbaren),
     damit man auch sieht/filtern kann, bevor Patienten "vollstaendig" sind */
  const allGendersInDb = db.patients.map(p => genderNorm(p.stamm?.gender));
  const genderCounts = {männlich:0, weiblich:0, divers:0};
  allGendersInDb.forEach(g => { if(genderCounts[g] !== undefined) genderCounts[g]++; });
  const datasetGenderCounts = {männlich:0, weiblich:0, divers:0};
  dataset.forEach(d => { if(datasetGenderCounts[d.gender] !== undefined) datasetGenderCounts[d.gender]++; });
  const availGenders = ['männlich','weiblich','divers'];
  const availAgeGroups = [...new Set(dataset.map(d => d.ageGroup))].filter(g => g && g !== '?').sort();

  let html = `<h2>📊 Forschungs-Auswertung</h2>
    <p class="smallMuted">Aggregierte Analyse über alle Patienten der Kartei. Ein Patient gilt als "auswertbar", wenn mindestens 1 Beschwerde-Wert vor und nach Therapie oder eine End-Einschätzung vorhanden ist – plus mindestens eine durchgeführte Sitzung.</p>
    <div class="researchGrid">
      <div class="statCard"><div class="lbl">Patienten gesamt</div><div class="num">${total}</div></div>
      <div class="statCard"><div class="lbl">Auswertbar</div><div class="num">${evaluable}</div><div class="sub">${total ? Math.round(evaluable/total*100) : 0}% der Kartei</div></div>
      <div class="statCard"><div class="lbl">Diagnosen erfasst</div><div class="num">${sortedDiags.length}</div></div>
    </div>`;

  if(evaluable < 1){
    html += `<div class="researchWarn">⚠️ Noch keine auswertbaren Patientendaten. Patienten benötigen entweder Vor-/Nach-Evaluierung mit mindestens 1 Beschwerde-Skala <i>oder</i> ein ausgefülltes End-Ergebnis-Feld – plus mindestens eine durchgeführte Sitzung mit Hz-Wert.</div>`;
    document.querySelector('[data-panel="forschung"]').innerHTML = html;
    return;
  }

  /* === FILTER-SEKTION === */
  html += `<h3 style="margin-top:24px">🔎 Filter</h3>
    <p class="smallMuted">Mehrere Filter werden kombiniert (UND-Verknüpfung). Nicht ausgewählt = kein Filter.</p>
    <div class="researchFilters">

      <div class="filterBlock">
        <div class="filterLabel">Diagnose</div>
        <div class="filterChips">
          <span class="filterChip ${researchFilters.diagnosis === null?'active':''}" data-filter="diagnosis" data-value="">alle Diagnosen</span>
          ${sortedDiags.map(([d,n]) => `<span class="filterChip ${d===researchFilters.diagnosis?'active':''}" data-filter="diagnosis" data-value="${esc(d)}">${esc(d)} <small>(${n})</small></span>`).join('')}
        </div>
      </div>

      <div class="filterBlock">
        <div class="filterLabel">Geschlecht</div>
        <div class="filterChips">
          ${availGenders.map(g => {
            const inDb = genderCounts[g] || 0;
            const inDataset = datasetGenderCounts[g] || 0;
            const isActive = researchFilters.genders.includes(g);
            const disabled = inDataset === 0;
            return `<span class="filterChip ${isActive?'active':''} ${disabled?'disabled':''}" data-filter="gender" data-value="${esc(g)}" ${disabled?'title="Keine auswertbaren Patienten mit diesem Geschlecht"':''}>${esc(g)} <small>(${inDataset}${inDb!==inDataset?'/'+inDb:''})</small></span>`;
          }).join('')}
        </div>
      </div>

      ${availAgeGroups.length ? `<div class="filterBlock">
        <div class="filterLabel">Altersgruppe</div>
        <div class="filterChips">
          ${availAgeGroups.map(g => `<span class="filterChip ${researchFilters.ageGroups.includes(g)?'active':''}" data-filter="ageGroup" data-value="${esc(g)}">${esc(g)}</span>`).join('')}
        </div>
      </div>`:''}

      <div class="filterBlock">
        <div class="filterLabel">Sitzungs-Anzahl (durchgeführt)</div>
        <div class="filterChips">
          <span class="filterChip ${researchFilters.minSessions===null && researchFilters.maxSessions===null?'active':''}" data-filter="sessions" data-value="all">alle</span>
          <span class="filterChip ${researchFilters.minSessions===1 && researchFilters.maxSessions===5?'active':''}" data-filter="sessions" data-value="1-5">1–5 Sitzungen</span>
          <span class="filterChip ${researchFilters.minSessions===6 && researchFilters.maxSessions===10?'active':''}" data-filter="sessions" data-value="6-10">6–10 Sitzungen</span>
          <span class="filterChip ${researchFilters.minSessions===11 && researchFilters.maxSessions===20?'active':''}" data-filter="sessions" data-value="11-20">11–20 Sitzungen</span>
          <span class="filterChip ${researchFilters.minSessions===21 && researchFilters.maxSessions===null?'active':''}" data-filter="sessions" data-value="21+">21+ Sitzungen</span>
        </div>
      </div>

      <div class="filterBlock">
        <button class="muted" id="resetFiltersBtn" style="margin-top:4px">↺ Alle Filter zurücksetzen</button>
      </div>
    </div>`;

  /* Gefilterte Auswertung */
  const filtered = applyResearchFilters(dataset, researchFilters);

  html += `<h3 style="margin-top:24px">📈 Auswertung der gefilterten Patienten</h3>
    <p class="smallMuted">${filtered.length} von ${evaluable} auswertbaren Patienten passen zu den aktuellen Filtern${researchFilters.diagnosis?` (Diagnose: <b>${esc(researchFilters.diagnosis)}</b>)`:''}.</p>`;

  if(filtered.length < 1){
    html += `<div class="researchWarn">⚠️ Keine Patienten entsprechen den gewählten Filterkriterien. Bitte Filter lockern.</div>`;
  } else {
    /* Bestehende Diagnosen-Analyse-Funktion wiederverwenden, aber Titel anpassen */
    const titel = researchFilters.diagnosis || 'gefilterte Auswahl';
    html += renderDiagnosisAnalysis(titel, filtered, dataset);
  }

  html += `<div style="margin-top:20px;display:flex;gap:8px;flex-wrap:wrap" class="no-print">
    <button class="primary" id="printResearchBtn">🖨️ Auswertung drucken</button>
    <button class="muted" id="exportResearchCSV">CSV-Export (anonymisiert)</button>
    <button class="muted" id="exportResearchJSON">JSON-Export (anonymisiert)</button>
  </div>`;

  document.querySelector('[data-panel="forschung"]').innerHTML = html;

  /* Filter-Klicks */
  document.querySelectorAll('.filterChip').forEach(c => {
    c.onclick = () => {
      if(c.classList.contains('disabled')) return;
      const f = c.dataset.filter;
      const v = c.dataset.value;
      if(f === 'diagnosis'){
        researchFilters.diagnosis = (v === '' ? null : v);
      } else if(f === 'gender'){
        const idx = researchFilters.genders.indexOf(v);
        if(idx >= 0) researchFilters.genders.splice(idx, 1);
        else researchFilters.genders.push(v);
      } else if(f === 'ageGroup'){
        const idx = researchFilters.ageGroups.indexOf(v);
        if(idx >= 0) researchFilters.ageGroups.splice(idx, 1);
        else researchFilters.ageGroups.push(v);
      } else if(f === 'sessions'){
        if(v === 'all'){ researchFilters.minSessions = null; researchFilters.maxSessions = null; }
        else if(v === '1-5'){ researchFilters.minSessions = 1; researchFilters.maxSessions = 5; }
        else if(v === '6-10'){ researchFilters.minSessions = 6; researchFilters.maxSessions = 10; }
        else if(v === '11-20'){ researchFilters.minSessions = 11; researchFilters.maxSessions = 20; }
        else if(v === '21+'){ researchFilters.minSessions = 21; researchFilters.maxSessions = null; }
      }
      renderResearchPanel();
    };
  });

  /* Reset-Button */
  const resetBtn = document.getElementById('resetFiltersBtn');
  if(resetBtn) resetBtn.onclick = () => {
    researchFilters = {diagnosis:null, genders:[], ageGroups:[], minSessions:null, maxSessions:null};
    renderResearchPanel();
  };

  /* Exporte */
  const csvBtn = document.getElementById('exportResearchCSV');
  if(csvBtn) csvBtn.onclick = () => exportResearchCSV(filtered);
  const jsonBtn = document.getElementById('exportResearchJSON');
  if(jsonBtn) jsonBtn.onclick = () => exportResearchJSON(filtered);
  const printResBtn = document.getElementById('printResearchBtn');
  if(printResBtn) printResBtn.onclick = () => doResearchPrint();
}

/* Forschungs-Auswertung drucken: setzt einen speziellen Body-Modus,
   damit nur das Forschungs-Panel gedruckt wird (mit Forschungs-Briefkopf) */
function doResearchPrint(){
  const dt = new Date();
  document.getElementById('printDate').textContent = 'Forschungs-Auswertung · '+dt.toLocaleDateString('de-DE')+' '+dt.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
  document.body.classList.add('printing-research');
  setTimeout(() => {
    window.print();
    setTimeout(() => document.body.classList.remove('printing-research'), 500);
  }, 50);
}

function renderDiagnosisAnalysis(diag, sub, allDataset){
  if(sub.length < 1){
    return `<div class="researchWarn">⚠️ Keine auswertbaren Patient(en) mit dieser Diagnose.</div>`;
  }

  const impStats = stats(sub.map(d => d.improvement));
  const sesStats = stats(sub.map(d => d.sessions));
  const hzStats = stats(sub.map(d => d.avgHz));
  const intStats = stats(sub.map(d => d.avgIntensity));
  const durStats = stats(sub.map(d => d.avgDuration));

  const successRate = Math.round(sub.filter(d => d.improvement > 10).length / sub.length * 100);
  const noChangeRate = Math.round(sub.filter(d => Math.abs(d.improvement) <= 10).length / sub.length * 100);
  const worseRate = Math.round(sub.filter(d => d.improvement < -10).length / sub.length * 100);

  let html = `<h3>Diagnose: ${esc(diag)} – ${sub.length} Patient${sub.length===1?'':'en'}</h3>`;

  /* Gestaffelte Warnungen je nach Patientenanzahl */
  if(sub.length < 3){
    html += `<div class="researchWarn">⚠️ <b>Nur ${sub.length} Patient${sub.length===1?'':'en'} mit dieser Diagnose.</b> Die folgenden Werte sind reine Einzelfall-Beobachtungen und nicht aussagekräftig. Erst ab 3 Patienten werden statistische Auswertungen sinnvoll.</div>`;
  } else if(sub.length < 10){
    html += `<div class="researchWarn">ℹ️ <b>Explorativ (${sub.length} Patienten):</b> Werte sind richtungweisend, aber statistisch nicht belastbar. Ab ca. 10 Patienten werden Trends robuster, ab 30 wissenschaftlich verwertbar.</div>`;
  }

  html += `<div class="researchGrid">
    <div class="statCard"><div class="lbl">Mittlere Verbesserung</div><div class="num" style="color:${impStats.mean>10?'#007a53':impStats.mean<-10?'#b42a2a':'#6b7280'}">${impStats.mean>0?'+':''}${Math.round(impStats.mean)}%</div><div class="sub">Median ${Math.round(impStats.median)}% · SD ${Math.round(impStats.sd)}%</div></div>
    <div class="statCard"><div class="lbl">Erfolgsquote (>10% Verbesserung)</div><div class="num" style="color:#007a53">${successRate}%</div><div class="sub">unverändert ${noChangeRate}% · schlechter ${worseRate}%</div></div>
    <div class="statCard"><div class="lbl">Ø Sitzungen</div><div class="num">${Math.round(sesStats.mean)}</div><div class="sub">${sesStats.min}–${sesStats.max} Sitzungen</div></div>
  </div>`;

  /* Optimale Parameter */
  html += `<h3>Optimale Therapie-Parameter</h3>
    <p class="smallMuted">Pro Parameter-Bereich wird die mittlere Verbesserung berechnet. Höhere Balken = besser. ⭐ markiert den Bereich mit dem besten Ergebnis.</p>`;

  /* Optimale Parameter - alle Bins aus zentralen Konstanten oben */
  const hzOpt  = findOptimum(sub, 'avgHz',         HZ_BINS);
  const intOpt = findOptimum(sub, 'avgIntensity',  INT_BINS);
  const durOpt = findOptimum(sub, 'avgDuration',   DUR_BINS);
  const sesOpt = findOptimum(sub, 'sessions',      SES_BINS);

  /* Visuelle Diagramme zuerst (auf einen Blick erkennbar) */
  html += `<div class="optChartGrid">
    ${renderOptimumChart('Frequenz (Hz)', hzOpt)}
    ${renderOptimumChart('Intensität (%)', intOpt)}
    ${renderOptimumChart('Sitzungsdauer (min)', durOpt)}
    ${renderOptimumChart('Anzahl Sitzungen', sesOpt)}
  </div>`;

  /* Detail-Tabellen darunter zum Nachschauen */
  html += `<details class="researchDetails">
    <summary>Detailwerte als Tabelle anzeigen</summary>
    <div class="researchDetailsBody">
      ${renderOptimumTable('Frequenz (Hz)', hzOpt)}
      ${renderOptimumTable('Intensität (%)', intOpt)}
      ${renderOptimumTable('Sitzungsdauer (min)', durOpt)}
      ${renderOptimumTable('Anzahl Sitzungen', sesOpt)}
    </div>
  </details>`;

  /* Heatmap */
  html += `<h3>Heatmap: Frequenz × Intensität</h3>
    <p class="smallMuted">Zellen-Farbe = mittlere Verbesserung. Grün = besser, Rot = schlechter, Grau = unverändert oder zu wenige Daten. Zahl in Klammern = Anzahl Patienten in dieser Zelle.</p>`;
  const hm = buildHeatmap(sub);
  html += renderHeatmap(hm);

  /* Korrelationen */
  const hzCorr = pearsonCorrelation(sub.map(d => d.avgHz), sub.map(d => d.improvement));
  const intCorr = pearsonCorrelation(sub.map(d => d.avgIntensity), sub.map(d => d.improvement));
  const durCorr = pearsonCorrelation(sub.map(d => d.avgDuration), sub.map(d => d.improvement));
  const sesCorr = pearsonCorrelation(sub.map(d => d.sessions), sub.map(d => d.improvement));

  html += `<h3>Korrelationen mit Verbesserung</h3>
    <p class="smallMuted">Pearson r: -1 = stark negativ, 0 = kein Zusammenhang, +1 = stark positiv. Interpretation: |r| > 0.3 deutet auf einen schwachen, > 0.5 auf einen mittleren, > 0.7 auf einen starken Zusammenhang.</p>
    <table class="researchTable">
      <thead><tr><th>Parameter</th><th class="num">r</th><th>Interpretation</th></tr></thead>
      <tbody>
        ${corrRow('Frequenz (Hz)', hzCorr)}
        ${corrRow('Intensität (%)', intCorr)}
        ${corrRow('Sitzungsdauer (min)', durCorr)}
        ${corrRow('Anzahl Sitzungen', sesCorr)}
      </tbody>
    </table>`;

  /* Subgruppen */
  const subg = subgroupAnalysis(sub);
  html += `<h3>Subgruppen-Analyse</h3>
    <div class="grid">
      <div>
        <h4 style="margin-bottom:6px">Nach Geschlecht</h4>
        <table class="researchTable">
          <thead><tr><th>Gruppe</th><th class="num">n</th><th class="num">Ø Verbesserung</th></tr></thead>
          <tbody>${subg.gender.map(g => `<tr><td>${esc(g.label)}</td><td class="num">${g.n}</td><td class="num" style="color:${g.mean>10?'#007a53':g.mean<-10?'#b42a2a':'#6b7280'}">${g.mean>0?'+':''}${g.mean}%</td></tr>`).join('')}</tbody>
        </table>
      </div>
      <div>
        <h4 style="margin-bottom:6px">Nach Altersgruppe</h4>
        <table class="researchTable">
          <thead><tr><th>Gruppe</th><th class="num">n</th><th class="num">Ø Verbesserung</th></tr></thead>
          <tbody>${subg.age.map(g => `<tr><td>${esc(g.label)}</td><td class="num">${g.n}</td><td class="num" style="color:${g.mean>10?'#007a53':g.mean<-10?'#b42a2a':'#6b7280'}">${g.mean>0?'+':''}${g.mean}%</td></tr>`).join('')}</tbody>
        </table>
      </div>
    </div>
    <div class="researchWarn">⚠️ <b>Wichtige Hinweise:</b><br>
      • Korrelation ist keine Kausalität. Beobachtete Zusammenhänge können auch durch andere Faktoren erklärt werden.<br>
      • Patientenanzahl pro Zelle/Gruppe muss mitberücksichtigt werden — bei n &lt; 5 sind Werte nicht aussagekräftig.<br>
      • Wenn alle Patienten dasselbe Protokoll bekommen, kann keine Optimierung gefunden werden — bewusst variieren.<br>
      • Diese Auswertung ersetzt keine kontrollierte Studie, sondern dient als Hypothesen-Generator für die eigene Praxis.</div>`;

  return html;
}

function renderOptimumTable(title, opt){
  if(!opt.length) return '';
  const best = opt.reduce((a,b) => (b.meanImprovement ?? -999) > (a.meanImprovement ?? -999) ? b : a);
  return `<table class="researchTable">
    <thead><tr><th>${esc(title)}</th><th class="num">n</th><th class="num">Ø Verbesserung</th></tr></thead>
    <tbody>
      ${opt.map(o => `<tr style="${o===best?'background:#e5f6ed;font-weight:700':''}"><td>${esc(o.label)}${o===best?' ⭐':''}</td><td class="num">${o.n}</td><td class="num" style="color:${o.meanImprovement>10?'#007a53':o.meanImprovement<-10?'#b42a2a':'#6b7280'}">${o.meanImprovement>0?'+':''}${Math.round(o.meanImprovement)}%</td></tr>`).join('')}
    </tbody>
  </table>`;
}

/* Visuelles Balken-Diagramm: pro Bin ein farbiger Balken mit % und n.
   Hilft schneller zu erkennen, welche Parameter-Stufe den besten Erfolg bringt. */
function renderOptimumChart(title, opt){
  if(!opt.length) return '';
  /* Best-Bin ermitteln */
  const best = opt.reduce((a,b) => (b.meanImprovement ?? -999) > (a.meanImprovement ?? -999) ? b : a, opt[0]);
  /* Skala fuer Balkenhoehe: max(|imp|, 50) als Achsenmax */
  const maxAbs = Math.max(50, ...opt.map(o => Math.abs(o.meanImprovement ?? 0)));

  return `<div class="optChart">
    <div class="optChartTitle">${esc(title)} <span class="smallMuted">– Balken je Bereich, ⭐ = bester Wert</span></div>
    <div class="optChartBars">
      ${opt.map(o => {
        const imp = o.meanImprovement;
        const hasData = imp !== null && o.n >= 1;
        const isBest = o === best && hasData && imp > 0;
        const heightPct = hasData ? Math.abs(imp) / maxAbs * 100 : 0;
        const color = hasData ? heatColor(imp, o.n) : '#ececec';
        const txtColor = hasData ? heatTextColor(imp, o.n) : '#999';
        const posClass = hasData ? (imp >= 0 ? 'bar-pos' : 'bar-neg') : 'bar-empty';
        return `<div class="optBar ${posClass} ${isBest?'optBarBest':''}">
          <div class="optBarValue">${hasData ? (imp>0?'+':'') + Math.round(imp) + '%' : '–'}</div>
          <div class="optBarTrack">
            <div class="optBarFill" style="height:${heightPct}%;background:${color};color:${txtColor}"></div>
          </div>
          <div class="optBarLabel">${esc(o.label)}${isBest?' ⭐':''}</div>
          <div class="optBarN">n=${o.n}</div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function renderHeatmap(hm){
  /* Grid: 1 Header-Spalte + intBins.length Spalten */
  let html = `<div class="heatmap" style="grid-template-columns:120px repeat(${hm.intBins.length},1fr)">`;
  /* Kopfzeile */
  html += `<div></div>`;
  hm.intBins.forEach(b => html += `<div class="heatHeader">${esc(b.label)}</div>`);
  /* Daten-Zeilen */
  hm.hzBins.forEach((hz, hi) => {
    html += `<div class="heatRowLabel">${esc(hz.label)}</div>`;
    hm.intBins.forEach((it, ii) => {
      const cell = hm.cells.find(c => c.row === hi && c.col === ii);
      const color = heatColor(cell.meanImprovement, cell.n);
      const txtColor = heatTextColor(cell.meanImprovement, cell.n);
      html += `<div class="heatCell" style="background:${color};color:${txtColor}">
        ${cell.meanImprovement !== null ? (cell.meanImprovement > 0 ? '+' : '') + cell.meanImprovement + '%' : '–'}
        <span class="n" style="color:${txtColor};opacity:.85">n=${cell.n}</span>
      </div>`;
    });
  });
  html += `</div>`;
  return html;
}

function corrRow(name, r){
  if(r === null) return `<tr><td>${esc(name)}</td><td class="num">–</td><td>zu wenige Daten</td></tr>`;
  const abs = Math.abs(r);
  let interp;
  if(abs < 0.1) interp = 'kein Zusammenhang';
  else if(abs < 0.3) interp = 'sehr schwach';
  else if(abs < 0.5) interp = 'schwach';
  else if(abs < 0.7) interp = 'mittel';
  else interp = 'stark';
  if(r > 0.1) interp += ' positiv (höher = bessere Verbesserung)';
  else if(r < -0.1) interp += ' negativ (höher = schlechtere Verbesserung)';
  return `<tr><td>${esc(name)}</td><td class="num">${r.toFixed(2)}</td><td>${interp}</td></tr>`;
}

function exportResearchCSV(dataset){
  const headers = ['id_anon','diagnoses','age','ageGroup','gender','sessions','avgHz','avgIntensity','avgDuration','plannedTotal','endResult','improvementPercent'];
  const rows = dataset.map((d, i) => [
    'P'+(i+1).toString().padStart(4,'0'),
    '"'+d.diagnoses.join('; ')+'"',
    d.age ?? '',
    d.ageGroup,
    d.gender,
    d.sessions,
    d.avgHz !== null ? d.avgHz.toFixed(1) : '',
    d.avgIntensity !== null ? d.avgIntensity.toFixed(1) : '',
    d.avgDuration !== null ? d.avgDuration.toFixed(1) : '',
    d.plannedTotal,
    '"'+d.endResult+'"',
    d.improvement
  ].join(','));
  const csv = headers.join(',') + '\n' + rows.join('\n');
  dl(new Blob([csv], {type:'text/csv;charset=utf-8'}), 'weberbrain_forschung_'+today()+'.csv');
}

function exportResearchJSON(dataset){
  const anon = dataset.map((d,i) => ({...d, id: 'P'+(i+1).toString().padStart(4,'0')}));
  dl(new Blob([JSON.stringify({exported: new Date().toISOString(), patients: anon}, null, 2)], {type:'application/json'}), 'weberbrain_forschung_'+today()+'.json');
}

/* ============================================================
   ENDE FORSCHUNGS-AUSWERTUNG
   ============================================================ */



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
        ${input('stamm.doctor','Behandelnde/r Arzt / Therapeut')}
        ${input('stamm.facility','Einrichtung / Praxis')}
      </div>
      <p class="smallMuted" style="margin-top:4px">Hinweis: Geschlecht wird im Reiter „Anamnese" erfasst.</p>`;
  }

  if(q('anamnese')){
    const currentGender = (cur().stamm?.gender || '').toLowerCase().trim();
    const isM = currentGender.startsWith('m');
    const isW = currentGender.startsWith('w') || currentGender.startsWith('f');
    const isD = currentGender.startsWith('d') || currentGender.startsWith('div') || currentGender === 'x';

    q('anamnese').innerHTML = `<h2>📝 Anamnese</h2>

      <h3>Geschlecht</h3>
      <div class="genderScale">
        <label class="genderOption ${isM?'active':''}">
          <input type="radio" name="stamm.gender" data-path="stamm.gender" value="männlich" ${isM?'checked':''}>
          <span>♂ Männlich</span>
        </label>
        <label class="genderOption ${isW?'active':''}">
          <input type="radio" name="stamm.gender" data-path="stamm.gender" value="weiblich" ${isW?'checked':''}>
          <span>♀ Weiblich</span>
        </label>
        <label class="genderOption ${isD?'active':''}">
          <input type="radio" name="stamm.gender" data-path="stamm.gender" value="divers" ${isD?'checked':''}>
          <span>⚥ Divers</span>
        </label>
      </div>

      <h3>Diagnostizierte Vorerkrankungen <span class="smallMuted" style="font-weight:400; font-size:14px">– vom Arzt einzuschätzen</span></h3>
      <p class="smallMuted" style="margin:-4px 0 8px">Nur durch behandelnde Ärztin/Arzt vergebene Diagnosen ankreuzen. Diese fließen optional in die statistische Forschungs-Auswertung ein (siehe Filter dort).</p>
      ${chips('anamnese.diagnoses',diagnoses)}
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
      <h3>Akut-Sitzungsprotokoll</h3>
      <p class="notice">Die Anzahl der Sitzungsfenster richtet sich nach „Geplante Sitzungen gesamt". Bei 10 Sitzungen werden 10 Fenster erzeugt.</p>
      <div class="therapyGrid">${p.planung.sessions.map((s,i) => sessionHtml(i)).join('')}</div>
      ${maintenanceBlockHtml(p)}`;
  }

  if(q('ende')){
    /* Farbverlauf: dunkelgruen -> hellgruen -> orange -> hellrot -> dunkelrot
       Mit fest berechneten hellen Hintergrund-Farben fuer alte Browser */
    const comparisonOptions = [
      {label:'Deutlich besser',     value:'Deutlich besser',     color:'#0d6b3c', soft:'#d3e4db'},
      {label:'Etwas besser',         value:'Etwas besser',         color:'#7cc36e', soft:'#e7f4e4'},
      {label:'Unverändert',          value:'Unverändert',          color:'#e89c3c', soft:'#faeddb'},
      {label:'Etwas schlechter',     value:'Etwas schlechter',     color:'#dc5959', soft:'#f8e1e1'},
      {label:'Deutlich schlechter',  value:'Deutlich schlechter',  color:'#992020', soft:'#ecd6d6'}
    ];
    const currentComp = get('ende.overallComparison') || '';
    const compButtons = comparisonOptions.map(o =>
      `<label class="compOption ${currentComp===o.value?'active':''}" style="--col:${o.color};--soft:${o.soft}">
         <input type="radio" name="ende.overallComparison" data-path="ende.overallComparison" value="${esc(o.value)}" ${currentComp===o.value?'checked':''}>
         <span>${esc(o.label)}</span>
       </label>`
    ).join('');

    /* Smiley-Skala fuer Zufriedenheit 1-10 */
    const smileys = ['😞','😟','😕','😐','🙂','😊','😀','😄','😁','🤩'];
    const currentSat = String(get('ende.satisfaction') || '');
    const satButtons = smileys.map((face, i) => {
      const v = String(i + 1);
      return `<label class="${currentSat===v?'active':''}">
        <input type="radio" name="ende.satisfaction" data-path="ende.satisfaction" value="${v}" ${currentSat===v?'checked':''}>
        <span class="smiley">${face}</span>
        <span class="num">${v}</span>
      </label>`;
    }).join('');

    /* Default fuer ende.count: Anzahl der geplanten Sitzungen aus Therapieplanung.
       Solange der User das Feld nicht selbst angefasst hat (_countTouched=false),
       folgt count automatisch der planung.total. Wird in saveForm() umgeschaltet,
       sobald der User das Feld editiert. */
    if(!p.ende._countTouched && p.planung?.total){
      p.ende.count = String(p.planung.total);
    }

    q('ende').innerHTML = `<h2>🏁 End-Evaluierung</h2>
      <div class="grid">
        ${input('ende.count','Anzahl tatsächlich durchgeführter Sitzungen','number')}
        <div></div>
      </div>
      <p class="smallMuted" style="margin:-8px 0 16px">Standard = geplante Sitzungen aus der Therapieplanung. Falls weniger durchgeführt wurden, hier anpassen.</p>

      <h3>🎯 Wie beurteilen Sie Ihren Gesamtzustand im Vergleich zu Therapiebeginn?</h3>
      <p class="smallMuted">Patienten-Selbsteinschätzung – bitte eine Stufe wählen.</p>
      <div class="compScale">${compButtons}</div>

      <h3>⭐ Wie zufrieden sind Sie mit der WeberBrain®-Therapie insgesamt?</h3>
      <p class="smallMuted">1 = gar nicht zufrieden &nbsp;·&nbsp; 10 = vollständig zufrieden</p>
      <div class="field"><div class="smileyScale">${satButtons}</div></div>
      ` + evalFull('ende','📋 Fragebogen nach Therapie','Exakt derselbe Fragebogen wie bei der Evaluierung vor Therapie.');
  }

  if(q('auswertung')){
    q('auswertung').innerHTML = `<h2>📈 Patienten-Auswertung</h2>

      <h3 style="margin-top:18px">Symptom-Veränderung im Detail</h3>
      <p class="chartNote">🔵 Vor Therapie · 🟢 Verbesserung · 🔴 Verschlechterung · ⚪ Unverändert<br>
        <span class="smallMuted">Bei Beschwerden bedeutet eine niedrigere Zahl Verbesserung. Bei Schlafqualität ist eine höhere Zahl besser. Die Farbe der „nach"-Balken zeigt die tatsächliche Richtung der Veränderung.</span></p>
      <canvas id="chart" width="1000" height="540"></canvas>

      <h3 style="margin-top:24px">Verteilung der Veränderungen</h3>
      <p class="chartNote">Anteil der Symptome, die sich verbessert, verschlechtert oder nicht verändert haben.</p>
      <canvas id="pieChart" width="600" height="320"></canvas>

      <h3 style="margin-top:24px">Vergleich Vor / Nach – alle Werte</h3>
      <p class="chartNote">Jeder Parameter mit den Punktwerten direkt nebeneinander zum visuellen Vergleich.</p>
      <canvas id="barChart" width="1000" height="380"></canvas>

      <div class="report" style="margin-top:24px">${makeReportHtml(false)}</div>
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
        <button class="muted" id="importBtn">📥 JSON importieren (Patient oder Kartei)</button>
        <button class="muted" id="exportBtn2">💾 Kartei-Sicherung jetzt erstellen</button>
      </div>
      <input id="importFile" type="file" accept="application/json" class="hidden">

      <h3>Auto-Backup</h3>
      <label class="toggleSwitch" style="margin:8px 0">
        <input type="checkbox" id="autoBackupToggle" ${db.settings.autoBackup?'checked':''}>
        <span class="slider"></span>
        <span class="toggleLabel">${db.settings.autoBackup?'aktiviert':'deaktiviert'}</span>
      </label>

      <div class="grid" style="margin-top:10px">
        <div class="field">
          <label for="autoBackupIntervalSelect">Intervall nach letzter Eingabe</label>
          <select id="autoBackupIntervalSelect">
            ${[3,6,9,12,15,20,30].map(m => `<option value="${m}" ${Number(db.settings.autoBackupInterval)===m?'selected':''}>nach ${m} Minuten Inaktivität</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>Backup beim Sperren der App</label>
          <label class="toggleSwitch">
            <input type="checkbox" id="autoBackupOnLockToggle" ${db.settings.autoBackupOnLock?'checked':''}>
            <span class="slider"></span>
            <span class="toggleLabel">${db.settings.autoBackupOnLock?'Ein':'Aus'}</span>
          </label>
        </div>
      </div>

      <h4 style="margin-top:14px;margin-bottom:6px">Speicherort</h4>
      <div class="folderRow">
        <div class="folderStatus">
          ${db.settings.autoBackupFolderName ? `<b>📂 Gewählter Ordner:</b> ${esc(db.settings.autoBackupFolderName)}` : '<span class="smallMuted">Standard: <i>Downloads</i>-Ordner des Browsers</span>'}
        </div>
        <div class="folderActions">
          <button class="muted" id="pickFolderBtn">📂 Ordner wählen…</button>
          ${db.settings.autoBackupFolderName ? '<button class="muted" id="clearFolderBtn">↺ zurücksetzen</button>' : ''}
        </div>
      </div>
      <p class="smallMuted folderHint" id="folderHint" style="margin-top:6px"></p>

      <div class="notice">
        <b>So funktioniert das Auto-Backup:</b><br>
        Wenn aktiviert, wird nach <b>${Number(db.settings.autoBackupInterval)||3} Minuten Inaktivität</b> automatisch eine Sicherungsdatei geschrieben. Pro Tag eine Datei (<code>weberbrain_backup_${today()}.json</code>) – ältere Backups bleiben erhalten, der heutige Tag wird ggf. überschrieben.
        <br><br>
        <b>Auf dem Tablet (Android-Chrome):</b> Eine direkte Ordner-Auswahl ist technisch nicht möglich. Die Datei landet immer im <i>Downloads</i>-Ordner. Beim ersten Mal fragt Chrome, ob mehrere Dateien heruntergeladen werden dürfen – das einmalig erlauben.
        <br><br>
        <b>Auf PC (Chrome/Edge):</b> Sie können einen festen Ordner wählen (z.B. einen OneDrive- oder Dropbox-Ordner). Die App schreibt die Backups dann direkt dorthin, ohne dass jedes Mal ein Dialog erscheint.
        <br><br>
        <b>Wichtig:</b> Das ersetzt kein wöchentliches Sichern in die Cloud / auf USB. Es ist eine zusätzliche Absicherung.
      </div>

      <h3>Über diese App</h3>
      <div class="appAbout">
        <p class="versionLine">
          <b>WeberBrain® Evaluation</b><br>
          Version ${APP_VERSION} &nbsp;·&nbsp; Release: ${APP_RELEASE_DATE}
        </p>
        <p class="smallMuted" style="margin-top:14px">
          <b>Impressum / Copyright</b><br>
          © ${new Date().getFullYear()} <b>Dr. Gernot Kommetter, MSc</b><br>
          Diese Anwendung wurde als individuelle Praxis-Lösung entwickelt und ist Eigentum
          des oben genannten Autors. Jede Weitergabe, Veröffentlichung oder kommerzielle
          Nutzung bedarf der ausdrücklichen schriftlichen Zustimmung.
          <br><br>
          „WeberBrain®" ist eine eingetragene Marke der Weber Medical GmbH. Diese App ist
          kein offizielles Produkt der Weber Medical GmbH und steht in keinem geschäftlichen
          Zusammenhang mit dem Hersteller des WeberBrain®-Systems.
          <br><br>
          <b>Haftungshinweis:</b> Diese App dient ausschließlich der internen Dokumentation und Verlaufs-Erfassung
          durch geschultes Fachpersonal. Sie ersetzt keine medizinische Diagnose oder Behandlung.
          Alle eingegebenen Daten verbleiben lokal im Browser des verwendeten Endgerätes – es findet
          keine Übertragung an externe Server statt. Für den Datenschutz nach DSGVO verantwortlich
          ist der Betreiber/die Betreiberin der jeweiligen Praxis.
        </p>
      </div>`;

    /* __settings-Werte aus db.settings hydrieren */
    document.querySelector('[data-path="__settings.praxisName"]').value = db.settings.praxisName || '';
    document.querySelector('[data-path="__settings.praxisSub"]').value = db.settings.praxisSub || '';
    document.querySelector('[data-path="__settings.praxisAddress"]').value = db.settings.praxisAddress || '';
    document.querySelector('[data-path="__settings.praxisContact"]').value = db.settings.praxisContact || '';
    document.querySelector('[data-path="__settings.pinTherapeut"]').value = db.settings.pinTherapeut || '';
    document.querySelector('[data-path="__settings.pinPatient"]').value = db.settings.pinPatient || '';
  }

  wireDynamic();
  if(activeTab === 'auswertung') drawAllCharts();
  if(activeTab === 'forschung') renderResearchPanel();
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
    const key = el.dataset.key;
    const idx = +el.dataset.session;
    if(key === 'done'){
      p.planung.sessions[idx][key] = el.checked;
    } else {
      p.planung.sessions[idx][key] = el.value;
    }
  });
  /* Erhaltungs-Sitzungen */
  document.querySelectorAll('[data-msession]').forEach(el => {
    const key = el.dataset.key;
    const idx = +el.dataset.msession;
    if(p.maintenance && p.maintenance.sessions[idx]){
      if(key === 'done'){
        p.maintenance.sessions[idx][key] = el.checked;
      } else {
        p.maintenance.sessions[idx][key] = el.value;
      }
    }
  });
  adjustSessions();
  if(p.maintenance && p.maintenance.enabled) adjustMaintenanceSessions();
  persist();
  renderList();
  applyGlobalSettings(); /* Praxisname etc. live updaten */
}

/* Aktualisiert die CSS-Klassen aller Sitzungen (planung + maintenance)
   live - ohne kompletten Re-Render. Genutzt wenn die done-Checkbox geklickt
   wird, damit Farbe und Label sofort wechseln. */
function updateSessionStatusClasses(){
  const p = cur();
  if(!p) return;
  /* Therapie-Sitzungen */
  document.querySelectorAll('.session:not(.maintenance-session)').forEach((el, i) => {
    const s = p.planung?.sessions?.[i];
    if(!s) return;
    const done = !!s.done;
    el.classList.toggle('session-done', done);
    el.classList.toggle('session-open', !done);
    const tagSpan = el.querySelector('.sessionDoneToggle > span');
    if(tagSpan) tagSpan.textContent = done ? '✓ durchgeführt' : 'als durchgeführt markieren';
  });
  /* Erhaltungs-Sitzungen */
  document.querySelectorAll('.session.maintenance-session').forEach((el, i) => {
    const s = p.maintenance?.sessions?.[i];
    if(!s) return;
    const done = !!s.done;
    el.classList.toggle('session-done', done);
    el.classList.toggle('session-open', !done);
    const tagSpan = el.querySelector('.sessionDoneToggle > span');
    if(tagSpan) tagSpan.textContent = done ? '✓ durchgeführt' : 'als durchgeführt markieren';
  });
}

function wireDynamic(){
  /* Re-Klick auf aktiven Skala-Radio = Abwahl (Wert leeren).
     Trick: Vor dem Click merken wir, ob der Radio bereits checked war.
     Da Browser das `checked` schon beim Click selbst setzen, fragen wir
     den Zustand BEIM pointerdown ab (vor dem Click). */
  document.querySelectorAll('.scale label').forEach(label => {
    const radio = label.querySelector('input[type="radio"]');
    if(!radio) return;
    let wasCheckedBeforeClick = false;
    /* pointerdown feuert vor click und tap, auf allen Geraeten */
    label.addEventListener('pointerdown', () => {
      wasCheckedBeforeClick = radio.checked;
    });
    label.addEventListener('click', e => {
      if(wasCheckedBeforeClick){
        /* War schon ausgewaehlt -> abwaehlen */
        e.preventDefault();
        radio.checked = false;
        if(radio.dataset.path) set(radio.dataset.path, '');
        persist();
        /* CSS :has(input:checked) Selector aktualisiert automatisch das Aussehen */
      }
      wasCheckedBeforeClick = false;
    });
  });

  document.querySelectorAll('input,textarea,select').forEach(el => {
    if(el.closest('#lockOverlay')) return; /* PIN-Pad nicht hier verkabeln */
    el.addEventListener('change', () => {
      /* Wenn der User direkt am ende.count-Feld geaendert hat: Marker setzen,
         damit count nicht mehr automatisch von planung.total ueberschrieben wird */
      if(el.dataset.path === 'ende.count'){
        const p = cur();
        if(p && p.ende) p.ende._countTouched = true;
      }
      saveForm();
      /* Felder, die strukturell etwas ändern (Sitzungs-Anzahl), brauchen ein render()
         NACH dem 'change'-Event - nie waehrend des Tippens (input-Event), sonst
         zerstoert das Re-Render das Eingabefeld und der Cursor springt weg. */
      if(el.dataset.path === 'planung.total'){
        adjustSessions();
        persist();
        render();
      }
      if(el.dataset.path === 'maintenance.frequencyPerWeek' || el.dataset.path === 'maintenance.durationWeeks'){
        const p = cur();
        if(p && p.maintenance){
          adjustMaintenanceSessions();
          /* Bei Frequenz-Aenderung muessen Wochentage neu berechnet werden */
          if(el.dataset.path === 'maintenance.frequencyPerWeek'){
            p.maintenance.sessions.forEach(s => s.date = '');
          }
          generateMaintenanceDates();
          persist();
          render();
        }
      }
      /* Sitzungs-Status nur aktualisieren, wenn die done-Checkbox geklickt wurde.
         (Datum/Hz/Intensitaet etc. aendern den Status NICHT mehr - nur der Haken.) */
      if((el.dataset.session !== undefined || el.dataset.msession !== undefined) && el.dataset.key === 'done'){
        updateSessionStatusClasses();
      }
    });
  });

  const ap = document.getElementById('applyProtocol');
  if(ap) ap.onclick = applyProtocolToSessions;
  const rs = document.getElementById('refreshSessions');
  if(rs) rs.onclick = updateSessionCountFromField;

  /* === MAINTENANCE-WIRING === */
  const mt = document.getElementById('maintenanceToggle');
  if(mt){
    mt.onchange = () => {
      const p = cur(); if(!p) return;
      p.maintenance.enabled = mt.checked;
      /* Beim ersten Aktivieren: Vorschlag aus Diagnose direkt anwenden */
      if(mt.checked){
        const sug = maintenanceSuggestionFor(p.anamnese?.diagnoses || []);
        if(sug && sug.freq > 0){
          if(!p.maintenance.frequencyPerWeek || p.maintenance.frequencyPerWeek === 1) p.maintenance.frequencyPerWeek = sug.freq;
          if(!p.maintenance.durationWeeks || p.maintenance.durationWeeks === 12) p.maintenance.durationWeeks = sug.weeks;
        }
        /* Default: Erhaltungs-Beginn = heute, falls leer */
        if(!p.maintenance.start) p.maintenance.start = today();
        adjustMaintenanceSessions();
        /* Defaults aus letzter Akut-Sitzung uebernehmen, wenn Sitzungen noch leer */
        const def = maintenanceDefaultsFromAcute();
        if(def){
          p.maintenance.sessions.forEach(s => {
            if(!s.hz) s.hz = def.hz;
            if(!s.intensity) s.intensity = def.intensity;
            if(!s.duration) s.duration = def.duration;
          });
        }
        generateMaintenanceDates();
      }
      persist(); render();
    };
  }
  const ams = document.getElementById('applyMaintenanceSuggestion');
  if(ams){
    ams.onclick = () => {
      const p = cur(); if(!p) return;
      const sug = maintenanceSuggestionFor(p.anamnese?.diagnoses || []);
      if(!sug || sug.freq === 0){ alert('Keine Empfehlung verfügbar.'); return; }
      p.maintenance.frequencyPerWeek = sug.freq;
      p.maintenance.durationWeeks = sug.weeks;
      adjustMaintenanceSessions();
      generateMaintenanceDates();
      const def = maintenanceDefaultsFromAcute();
      if(def){
        p.maintenance.sessions.forEach(s => {
          if(!s.hz) s.hz = def.hz;
          if(!s.intensity) s.intensity = def.intensity;
          if(!s.duration) s.duration = def.duration;
        });
      }
      persist(); render();
    };
  }
  const rm = document.getElementById('refreshMaintenance');
  if(rm){
    rm.onclick = () => {
      saveForm();
      adjustMaintenanceSessions();
      persist(); render();
    };
  }
  const gmd = document.getElementById('generateMaintenanceDates');
  if(gmd){
    gmd.onclick = () => {
      saveForm();
      const p = cur(); if(!p) return;
      /* Datumsfelder leeren, dann neu generieren */
      p.maintenance.sessions.forEach(s => s.date = '');
      generateMaintenanceDates();
      persist(); render();
    };
  }
  const cap = document.getElementById('copyAcuteParams');
  if(cap){
    cap.onclick = () => {
      saveForm();
      const def = maintenanceDefaultsFromAcute();
      if(!def){ alert('Keine Akut-Sitzungs-Werte vorhanden.'); return; }
      const p = cur();
      p.maintenance.sessions.forEach(s => {
        s.hz = def.hz;
        s.intensity = def.intensity;
        s.duration = def.duration;
      });
      persist(); render();
    };
  }

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

  /* Auto-Backup Toggle */
  const abt = document.getElementById('autoBackupToggle');
  if(abt){
    abt.onchange = () => {
      db.settings.autoBackup = abt.checked;
      persist();
      if(abt.checked){
        /* Beim Aktivieren: Baseline neu setzen, damit nicht sofort ein Backup
           ausgeloest wird wegen der Setting-Aenderung selbst */
        _lastBackupHash = dataHash();
        _hasUnsavedChanges = false;
        clearTimeout(_autoBackupTimer);
        showToast('Auto-Backup aktiviert');
      } else {
        clearTimeout(_autoBackupTimer);
        showToast('Auto-Backup deaktiviert');
      }
      render();
    };
  }

  /* Auto-Backup Intervall-Dropdown */
  const intSel = document.getElementById('autoBackupIntervalSelect');
  if(intSel){
    intSel.onchange = () => {
      const m = Number(intSel.value) || 3;
      db.settings.autoBackupInterval = m;
      persist();
      /* Falls bereits ein Timer laeuft, neu planen mit dem neuen Intervall */
      if(db.settings.autoBackup){
        clearTimeout(_autoBackupTimer);
        scheduleAutoBackup();
      }
      showToast('Intervall: nach ' + m + ' Min Inaktivität');
      render();
    };
  }

  /* Auto-Backup beim Sperren Toggle */
  const lockToggle = document.getElementById('autoBackupOnLockToggle');
  if(lockToggle){
    lockToggle.onchange = () => {
      db.settings.autoBackupOnLock = lockToggle.checked;
      persist();
      showToast(lockToggle.checked ? 'Backup beim Sperren aktiviert' : 'Backup beim Sperren deaktiviert');
      render();
    };
  }

  /* Ordner waehlen */
  const pickBtn = document.getElementById('pickFolderBtn');
  const folderHint = document.getElementById('folderHint');
  if(pickBtn){
    if(isFolderPickerSupported()){
      pickBtn.disabled = false;
      if(folderHint) folderHint.textContent = '';
      pickBtn.onclick = async () => {
        try {
          const handle = await window.showDirectoryPicker({mode:'readwrite'});
          await storeFolderHandle(handle);
          db.settings.autoBackupFolderName = handle.name || 'gewählter Ordner';
          persist();
          showToast('Ordner gespeichert: ' + db.settings.autoBackupFolderName);
          render();
        } catch(e){
          /* User hat den Picker abgebrochen - kein Alert noetig */
          if(e?.name !== 'AbortError') console.warn('Ordner-Auswahl:', e);
        }
      };
    } else {
      pickBtn.disabled = true;
      pickBtn.style.opacity = '0.5';
      pickBtn.style.cursor = 'not-allowed';
      if(folderHint){
        folderHint.innerHTML = '⚠️ <b>Auf diesem Gerät (Tablet/Mobile) ist die Ordner-Auswahl technisch nicht möglich.</b> Die Backup-Datei landet immer im <i>Downloads</i>-Ordner. Auf einem Desktop-PC mit Chrome oder Edge können Sie einen festen Ordner wählen.';
      }
    }
  }
  const clearFolderBtn = document.getElementById('clearFolderBtn');
  if(clearFolderBtn){
    clearFolderBtn.onclick = async () => {
      await clearStoredFolderHandle();
      db.settings.autoBackupFolderName = '';
      persist();
      showToast('Ordner-Auswahl zurückgesetzt – Backup geht wieder in Downloads');
      render();
    };
  }

  const ib = document.getElementById('importBtn');
  if(ib) ib.onclick = () => document.getElementById('importFile').click();
  const iff = document.getElementById('importFile');
  if(iff){
    iff.onchange = e => {
      const f = e.target.files[0];
      if(!f) return;
      handleImportFile(f);
      /* File-Input zuruecksetzen, damit dieselbe Datei erneut importiert werden kann */
      iff.value = '';
    };
  }

  const ab = document.getElementById('anonBtn');
  if(ab) ab.onclick = exportAnon;
}

/* ========================================================
   IMPORT-LOGIK (auf Modul-Ebene, damit auch Sidebar-Btn sie nutzen kann)
   ======================================================== */
function handleImportFile(f){
  const r = new FileReader();
  r.onload = () => {
    try{
      const data = JSON.parse(r.result);

      /* Format 1: Einzelner Patient mit _type-Marker (neue Variante) */
      if(data._type === 'single_patient' && data.patient){
        importSinglePatient(data.patient);
        return;
      }

      /* Format 2: Einzelner Patient ohne Marker (alte Form, hat .id und .stamm) */
      if(data.id && data.stamm){
        importSinglePatient(data);
        return;
      }

      /* Format 3: Volles Backup (mit patients-Array) */
      if(data.patients && Array.isArray(data.patients)){
        const existingIds = new Set(db.patients.map(x => x.id));
        let added = 0, skipped = 0;
        data.patients.forEach(np => {
          if(!existingIds.has(np.id)){
            /* Maintenance-Feld nachruesten falls fehlt */
            if(!np.maintenance) np.maintenance = {enabled:false,start:'',frequencyPerWeek:1,durationWeeks:12,sessions:[],notes:''};
            db.patients.push(np);
            added++;
          } else {
            skipped++;
          }
        });
        if(data.settings) db.settings = Object.assign({}, db.settings, data.settings);
        ensureSettings();
        persist(); applyGlobalSettings(); render();
        alert(`Kartei-Sicherung importiert: ${added} neue Patienten zur Kartei hinzugefügt, ${skipped} waren bereits vorhanden (unverändert). Gesamt: ${db.patients.length} Patienten.`);
        return;
      }

      alert('Import fehlgeschlagen: Datei hat ein unbekanntes Format.');
    }catch(err){
      alert('Import fehlgeschlagen: '+err.message);
    }
  };
  r.readAsText(f);
}

/* Einzelner Patient importieren mit Konflikt-Behandlung */
function importSinglePatient(np){
  /* Maintenance-Feld nachruesten falls fehlt (alte Exporte) */
  if(!np.maintenance) np.maintenance = {enabled:false,start:'',frequencyPerWeek:1,durationWeeks:12,sessions:[],notes:''};

  const existing = db.patients.find(x => x.id === np.id);
  if(existing){
    const name = np.stamm?.name || 'Unbenannt';
    const choice = prompt(
      `Patient "${name}" ist bereits in der Kartei vorhanden.\n\n` +
      `Was möchtest du tun?\n` +
      `  1 = Bestehenden Datensatz mit Import-Daten ÜBERSCHREIBEN\n` +
      `  2 = Als zusätzliche KOPIE zur Kartei hinzufügen (neue ID)\n` +
      `  3 = Abbrechen (Kartei bleibt unverändert)`,
      '2'
    );
    if(choice === '1'){
      const idx = db.patients.findIndex(x => x.id === np.id);
      db.patients[idx] = np;
      currentId = np.id;
      persist(); render();
      alert(`Patient "${name}" wurde überschrieben. Die übrige Kartei (${db.patients.length} Patienten) bleibt unverändert.`);
    } else if(choice === '2'){
      np.id = 'p_'+Date.now();
      np.stamm = np.stamm || {};
      np.stamm.name = (np.stamm.name || 'Unbenannt') + ' (Import)';
      db.patients.push(np);
      currentId = np.id;
      persist(); render();
      alert(`Patient "${name}" wurde als Kopie zur Kartei hinzugefügt. Die Kartei enthält jetzt ${db.patients.length} Patienten.`);
    }
    /* '3' oder Abbruch: nichts tun */
  } else {
    db.patients.push(np);
    currentId = np.id;
    persist(); render();
    alert(`Patient "${np.stamm?.name||'Unbenannt'}" zur Kartei hinzugefügt. Die Kartei enthält jetzt ${db.patients.length} Patienten.`);
  }
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
    <b>Akut-Sitzungen:</b> ${esc(p.planung.total||'?')} geplant · ${p.ende.count ? esc(p.ende.count)+' tatsächlich durchgeführt' : '<i>noch nicht erfasst</i>'}<br>
    ${p.maintenance && p.maintenance.enabled ? `<b>Erhaltungstherapie:</b> ${esc(p.maintenance.frequencyPerWeek||'-')}×/Woche × ${esc(p.maintenance.durationWeeks||'-')} Wochen ab ${esc(p.maintenance.start||'-')} (${maintenanceTargetCount(p.maintenance)} Sitzungen geplant)<br>` : ''}
    <b>Patienten-Einschätzung im Vergleich zu Therapiebeginn:</b> ${p.ende.overallComparison ? esc(p.ende.overallComparison) : '<i>nicht erfasst</i>'}<br>
    <b>Patienten-Zufriedenheit:</b> ${p.ende.satisfaction !== '' && p.ende.satisfaction !== undefined && p.ende.satisfaction !== null ? esc(p.ende.satisfaction)+'/10' : '<i>nicht erfasst</i>'}
    ${p.ende.result ? `<br><b>Frühere Therapeuten-Einschätzung:</b> ${esc(p.ende.result)}` : ''}
    </p>`;

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
    `Selbsteinschätzung Patient: ${p.ende.overallComparison||'-'}`,
    `Zufriedenheit: ${p.ende.satisfaction !== '' && p.ende.satisfaction != null ? p.ende.satisfaction+'/10' : '-'}`,
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

/* ============================================================
   GRAFIKEN FUER AUSWERTUNG
   ============================================================ */

/* Bewertet eine Veraenderung: -1 = schlechter, 0 = unveraendert, +1 = besser
   higherIsBetter: true fuer Schlafqualitaet, false fuer Beschwerden */
function changeDirection(pre, post, higherIsBetter){
  if(pre === post) return 0;
  const delta = post - pre;
  if(higherIsBetter) return delta > 0 ? 1 : -1;
  return delta < 0 ? 1 : -1;
}
function changeColor(dir){
  if(dir > 0) return '#1b8a4f'; /* gruen */
  if(dir < 0) return '#c84545'; /* rot */
  return '#9aa1a8';             /* grau */
}

/* Hauptgrafik: pro Zeile ein Symptom mit Vor- und Nach-Balken
   - Vor: dezenter blauer Balken (Referenz)
   - Nach: kraeftiger Balken in grün/rot/grau je nach Veraenderungsrichtung
   - Delta-Symbol rechts mit Punktzahl */
function drawChart(){
  const c = document.getElementById('chart');
  if(!c) return;
  const dpr = window.devicePixelRatio || 1;
  const cssW = c.clientWidth || 1000;
  const cssH = 540;
  c.width = cssW * dpr; c.height = cssH * dpr;
  const ctx = c.getContext('2d');
  if(!ctx) return;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,cssW,cssH);

  const p = cur();
  /* { name, pre, post, higherIsBetter } */
  const vals = symptoms.map(s => ({name:s, pre:Number(p.evaluierung.values?.[s]||0), post:Number(p.ende.values?.[s]||0), higherIsBetter:false}));
  vals.push({name:'Schlafqualität', pre:Number(p.evaluierung.sleepQuality||0), post:Number(p.ende.sleepQuality||0), higherIsBetter:true});

  const max = 10, left = 230, top = 30, row = 40;
  const barW = Math.min(560, cssW - left - 180);
  ctx.font = '14px system-ui, sans-serif';
  ctx.textBaseline = 'middle';

  const textCol = getComputedStyle(document.body).getPropertyValue('--text') || '#222';

  vals.forEach((v,i) => {
    const y = top + i*row;
    const dir = changeDirection(v.pre, v.post, v.higherIsBetter);
    const postCol = changeColor(dir);
    const bothEmpty = (v.pre === 0 && v.post === 0);

    /* Symptom-Label */
    ctx.fillStyle = textCol;
    ctx.textAlign = 'left';
    ctx.fillText(v.name.length > 32 ? v.name.slice(0,30)+'…' : v.name, 10, y + 12);

    /* Hintergrund-Skala */
    ctx.fillStyle = '#e8eaed';
    ctx.fillRect(left, y, barW, 24);

    if(bothEmpty){
      /* Beide Werte 0 → nicht erfasst, klares Signal statt leerer grauer Balken */
      ctx.fillStyle = '#bcbcbc';
      ctx.font = 'italic 12px system-ui';
      ctx.fillText('nicht erfasst (vor & nach = 0)', left + 8, y + 12);
      ctx.font = '14px system-ui';
    } else {
      /* Vor-Balken (dezent blau) */
      ctx.fillStyle = '#7ba6d9';
      ctx.fillRect(left, y, barW*(v.pre/max), 11);

      /* Nach-Balken (richtungsbasiert: grün/rot/grau) */
      ctx.fillStyle = postCol;
      ctx.fillRect(left, y+13, barW*(v.post/max), 11);
    }

    /* Werte und Delta rechts */
    ctx.fillStyle = textCol;
    ctx.font = '12px system-ui';
    ctx.fillText('vor: '+v.pre, left + barW + 10, y + 7);
    if(bothEmpty){
      ctx.fillStyle = '#9aa1a8';
      ctx.font = 'italic 12px system-ui';
      ctx.fillText('nach: '+v.post, left + barW + 10, y + 19);
    } else {
      ctx.fillStyle = postCol;
      ctx.font = 'bold 12px system-ui';
      const arrow = dir > 0 ? '↓ besser' : (dir < 0 ? '↑ schlechter' : '= gleich');
      const arrowDisp = (v.higherIsBetter && dir !== 0)
        ? (dir > 0 ? '↑ besser' : '↓ schlechter')
        : arrow;
      ctx.fillText('nach: '+v.post+'  '+arrowDisp, left + barW + 10, y + 19);
    }
    ctx.font = '14px system-ui';
  });

  /* Legende unten */
  const ly = top + vals.length*row + 12;
  ctx.font = 'bold 12px system-ui';
  ctx.fillStyle = '#7ba6d9'; ctx.fillRect(left, ly, 16, 10);
  ctx.fillStyle = textCol; ctx.fillText('Vor Therapie', left+22, ly+5);
  ctx.fillStyle = '#1b8a4f'; ctx.fillRect(left+130, ly, 16, 10);
  ctx.fillStyle = textCol; ctx.fillText('Verbesserung', left+152, ly+5);
  ctx.fillStyle = '#c84545'; ctx.fillRect(left+260, ly, 16, 10);
  ctx.fillStyle = textCol; ctx.fillText('Verschlechterung', left+282, ly+5);
  ctx.fillStyle = '#9aa1a8'; ctx.fillRect(left+410, ly, 16, 10);
  ctx.fillStyle = textCol; ctx.fillText('Unverändert', left+432, ly+5);
}

/* Tortendiagramm: Anteile der Symptome nach Verbesserung/unveraendert/Verschlechterung */
function drawPieChart(){
  const c = document.getElementById('pieChart');
  if(!c) return;
  const dpr = window.devicePixelRatio || 1;
  const cssW = c.clientWidth || 600;
  const cssH = 320;
  c.width = cssW * dpr; c.height = cssH * dpr;
  const ctx = c.getContext('2d');
  if(!ctx) return;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,cssW,cssH);

  const p = cur();
  let nBetter=0, nSame=0, nWorse=0;
  symptoms.forEach(s => {
    const pre = p.evaluierung.values?.[s];
    const post = p.ende.values?.[s];
    if(pre === '' || post === '' || pre === undefined || post === undefined) return;
    const dir = changeDirection(Number(pre), Number(post), false);
    if(dir > 0) nBetter++; else if(dir < 0) nWorse++; else nSame++;
  });
  /* Schlafqualitaet auch dazu */
  if(p.evaluierung.sleepQuality !== '' && p.ende.sleepQuality !== ''){
    const dir = changeDirection(Number(p.evaluierung.sleepQuality), Number(p.ende.sleepQuality), true);
    if(dir > 0) nBetter++; else if(dir < 0) nWorse++; else nSame++;
  }
  const total = nBetter + nSame + nWorse;
  const textCol = getComputedStyle(document.body).getPropertyValue('--text') || '#222';

  if(total === 0){
    ctx.font = '14px system-ui';
    ctx.fillStyle = textCol;
    ctx.textAlign = 'center';
    ctx.fillText('Noch keine vergleichbaren Daten – beide Evaluierungen müssen ausgefüllt sein.', cssW/2, cssH/2);
    return;
  }

  /* Tortendiagramm zeichnen */
  const cx = 150, cy = cssH/2, radius = 110;
  const slices = [
    {label:'Verbesserung',     count:nBetter, color:'#1b8a4f'},
    {label:'Unverändert',      count:nSame,   color:'#9aa1a8'},
    {label:'Verschlechterung', count:nWorse,  color:'#c84545'}
  ];
  let startAngle = -Math.PI/2;
  slices.forEach(slice => {
    if(slice.count === 0) return;
    const sliceAngle = (slice.count / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();
    /* Prozent-Label im Slice */
    if(slice.count / total > 0.05){
      const midAngle = startAngle + sliceAngle/2;
      const tx = cx + Math.cos(midAngle) * radius * 0.65;
      const ty = cy + Math.sin(midAngle) * radius * 0.65;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(slice.count/total*100)+'%', tx, ty);
    }
    startAngle += sliceAngle;
  });

  /* Legende rechts */
  const lx = 310, ly0 = cy - 50;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = '14px system-ui';
  slices.forEach((slice,i) => {
    const ly = ly0 + i*30;
    ctx.fillStyle = slice.color;
    ctx.fillRect(lx, ly-8, 18, 16);
    ctx.fillStyle = textCol;
    ctx.fillText(`${slice.label}: ${slice.count} (${Math.round(slice.count/total*100)}%)`, lx + 26, ly);
  });
  /* Gesamt-Anzahl darunter */
  ctx.fillStyle = textCol;
  ctx.font = '12px system-ui';
  ctx.fillText(`Gesamt ausgewertet: ${total} Parameter`, lx, ly0 + 3*30 + 10);
}

/* Gruppiertes Saeulendiagramm: Symptome vor vs. nach */
function drawBarChart(){
  const c = document.getElementById('barChart');
  if(!c) return;
  const dpr = window.devicePixelRatio || 1;
  const cssW = c.clientWidth || 1000;
  const cssH = 380;
  c.width = cssW * dpr; c.height = cssH * dpr;
  const ctx = c.getContext('2d');
  if(!ctx) return;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,cssW,cssH);

  const p = cur();
  const vals = symptoms.map(s => ({name:s, pre:Number(p.evaluierung.values?.[s]||0), post:Number(p.ende.values?.[s]||0), higherIsBetter:false}));
  vals.push({name:'Schlafqualität', pre:Number(p.evaluierung.sleepQuality||0), post:Number(p.ende.sleepQuality||0), higherIsBetter:true});

  const textCol = getComputedStyle(document.body).getPropertyValue('--text') || '#222';
  const padL = 30, padR = 20, padT = 20, padB = 130;
  const chartW = cssW - padL - padR;
  const chartH = cssH - padT - padB;
  const max = 10;
  const groupW = chartW / vals.length;
  const barW = Math.min((groupW - 4) / 2, 22);

  /* Y-Achsen-Linien */
  ctx.strokeStyle = '#e0e0e0';
  ctx.fillStyle = textCol;
  ctx.font = '11px system-ui';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for(let v = 0; v <= 10; v += 2){
    const y = padT + chartH - (v/max)*chartH;
    ctx.beginPath();
    ctx.moveTo(padL, y); ctx.lineTo(cssW - padR, y);
    ctx.stroke();
    ctx.fillText(String(v), padL - 4, y);
  }

  /* Saeulen */
  vals.forEach((v,i) => {
    const groupX = padL + i*groupW + groupW/2;
    const dir = changeDirection(v.pre, v.post, v.higherIsBetter);
    const postCol = changeColor(dir);

    /* Vor-Saeule */
    const preH = (v.pre/max)*chartH;
    ctx.fillStyle = '#7ba6d9';
    ctx.fillRect(groupX - barW - 1, padT + chartH - preH, barW, preH);

    /* Nach-Saeule */
    const postH = (v.post/max)*chartH;
    ctx.fillStyle = postCol;
    ctx.fillRect(groupX + 1, padT + chartH - postH, barW, postH);

    /* Werte ueber Saeulen */
    ctx.fillStyle = textCol;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    if(v.pre > 0) ctx.fillText(String(v.pre), groupX - barW/2 - 1, padT + chartH - preH - 1);
    if(v.post > 0) ctx.fillText(String(v.post), groupX + barW/2 + 1, padT + chartH - postH - 1);

    /* Label rotiert unter Saeulen */
    ctx.save();
    ctx.translate(groupX, padT + chartH + 8);
    ctx.rotate(-Math.PI/4);
    ctx.fillStyle = textCol;
    ctx.font = '11px system-ui';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(v.name.length > 22 ? v.name.slice(0,20)+'…' : v.name, 0, 0);
    ctx.restore();
  });

  /* Legende oben */
  ctx.font = 'bold 12px system-ui';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#7ba6d9'; ctx.fillRect(padL + 20, padT + 5, 14, 10);
  ctx.fillStyle = textCol; ctx.fillText('Vor Therapie', padL + 38, padT + 10);
  ctx.fillStyle = '#1b8a4f'; ctx.fillRect(padL + 150, padT + 5, 14, 10);
  ctx.fillStyle = textCol; ctx.fillText('Nach – Verbesserung', padL + 168, padT + 10);
  ctx.fillStyle = '#c84545'; ctx.fillRect(padL + 320, padT + 5, 14, 10);
  ctx.fillStyle = textCol; ctx.fillText('Nach – Verschlechterung', padL + 338, padT + 10);
}

/* Master-Funktion: zeichnet alle drei Grafiken */
function drawAllCharts(){
  drawChart();
  drawPieChart();
  drawBarChart();
}

/* ============================================================
   IMPORT / EXPORT / DRUCK
   ============================================================ */
function exportJson(){
  saveForm();
  const blob = new Blob([JSON.stringify(db,null,2)], {type:'application/json'});
  dl(blob, 'weberbrain_patienten_backup_'+today()+'.json');
}

/* Einzelner Patient-Export: enthaelt _type-Marker damit Import-Logik
   ihn von einem Voll-Backup unterscheiden kann. Filename enthaelt den Namen
   (sanitisiert), damit die Datei zuordbar ist. */
function exportSinglePatient(){
  saveForm();
  const p = cur();
  if(!p){ alert('Kein Patient ausgewählt.'); return; }
  const out = {
    _type: 'single_patient',
    _exportedAt: new Date().toISOString(),
    _appVersion: 'weberbrain-v1-7',
    patient: p
  };
  /* Sanitisiere den Namen fuer den Dateinamen (nur Buchstaben, Zahlen, _) */
  const safeName = (p.stamm.name || 'patient').replace(/[^a-zA-Z0-9äöüÄÖÜß]/g,'_').slice(0,40);
  const filename = 'weberbrain_patient_' + safeName + '_' + today() + '.json';
  dl(new Blob([JSON.stringify(out,null,2)], {type:'application/json'}), filename);
  showToast('Patient exportiert: ' + filename);
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

/* Patientenbericht drucken: wechselt temporaer auf Auswertung,
   schaltet Modus 'printing-patient' an (nur Bericht sichtbar),
   ruft window.print() und stellt danach den vorherigen Tab wieder her */
function doPrint(){
  const p = cur();
  if(!p){ alert('Kein Patient ausgewählt.'); return; }
  if(userMode === 'patient'){ return; } /* Patient soll nicht drucken */
  saveForm();

  /* Druckdatum setzen */
  const dt = new Date();
  document.getElementById('printDate').textContent = 'Patientenbericht · '+dt.toLocaleDateString('de-DE')+' '+dt.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});

  const previousTab = activeTab;
  /* Auf Auswertung wechseln, damit der Bericht sicher im DOM ist */
  if(activeTab !== 'auswertung'){
    activeTab = 'auswertung';
    render();
  }

  document.body.classList.add('printing-patient');
  setTimeout(() => {
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-patient');
      /* Zurueck zum vorherigen Tab */
      if(previousTab && previousTab !== 'auswertung'){
        activeTab = previousTab;
        render();
      }
    }, 500);
  }, 100);
}

/* ============================================================
   TOP-LEVEL EVENTS
   ============================================================ */
function createNewPatient(){
  saveForm();
  const p = blankPatient();
  db.patients.unshift(p);
  currentId = p.id;
  activeTab = 'stamm';
  persist(); render();
  setTimeout(() => document.querySelector('[data-path="stamm.name"]')?.focus(), 100);
}
const newPatientSidebar = document.getElementById('newPatientSidebarBtn');
if(newPatientSidebar) newPatientSidebar.onclick = createNewPatient;
document.getElementById('saveBtn').onclick = () => { saveForm(); alert('Gespeichert.'); };
document.getElementById('exportBtn').onclick = exportJson;
document.getElementById('printBtn').onclick = doPrint;
const settingsTopBtn = document.getElementById('settingsTopBtn');
if(settingsTopBtn){
  settingsTopBtn.onclick = () => {
    autosaveAndToast();
    activeTab = 'settings';
    render();
  };
}
document.getElementById('exportSinglePatientBtn').onclick = exportSinglePatient;
/* Sidebar-Import: oeffnet versteckten File-Input, der dann handleImportFile aufruft */
document.getElementById('importSidebarBtn').onclick = () => document.getElementById('importSidebarFile').click();
document.getElementById('importSidebarFile').onchange = e => {
  const f = e.target.files[0];
  if(!f) return;
  handleImportFile(f);
  e.target.value = ''; /* Input zuruecksetzen, damit dieselbe Datei erneut importiert werden kann */
};
document.getElementById('lockBtn').onclick = async () => {
  saveForm();
  /* Optional: Backup beim Sperren erstellen, wenn aktiviert UND ungespeicherte Aenderungen */
  if(db.settings.autoBackupOnLock && _hasUnsavedChanges){
    try { await doAutoBackup(); } catch(e){ console.warn('Backup-on-Lock fehlgeschlagen:', e); }
  }
  showLock();
};
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
