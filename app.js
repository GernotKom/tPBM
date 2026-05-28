/* ============================================================
   WeberBrain Evaluation – App-Logik
   ============================================================ */
(function(){
'use strict';

const KEY = 'weberbrain_clean_v4';
/* Sicherheits-Snapshot: rotierender zweiter Speicher-Slot. Sollte der
   Haupt-Key durch einen abgebrochenen Schreibvorgang, einen Browser-Crash
   oder ein QuotaExceededError korrupt sein, kann beim Start aus dem
   Snapshot wiederhergestellt werden. Der Snapshot wird jeweils einen
   Persist-Vorgang VOR dem aktuellen Stand geschrieben (also der vor-
   letzte gute Stand). */
const KEY_SNAPSHOT = 'weberbrain_clean_v4_snapshot';
const APP_VERSION = '1.25';
const APP_RELEASE_DATE = '2026-05-28';

/* ---------- Tabs (Therapeut sieht alle, Patient nur evaluierung+ende) ---------- */
const TABS_ALL = [
  ['stamm','Stammdaten'],
  ['anamnese','Anamnese'],
  ['planung','Therapieplanung'],
  ['evaluierung','Evaluierung vor Therapie'],
  ['ende','End-Evaluierung'],
  ['auswertung','Auswertung'],
  ['forschung','Forschungs-Auswertung']
];
const TABS_PATIENT = [
  ['evaluierung','Evaluierung vor Therapie'],
  ['ende','End-Evaluierung']
];

/* ---------- Datenlisten ---------- */
const diagnoses = ['Alzheimer / Demenz','Parkinson','Schlaganfall','Depression','Angststörung','ADHS','Migräne / Kopfschmerz','Long COVID','SHT (Schädel-Hirn-Trauma)','PTBS','Schlafstörung','Multiple Sklerose','Epilepsie','Tinnitus','Burnout','Borreliose','Neuroinflammation'];
const symptoms = ['Erschöpfung / Fatigue','Kopfschmerzen / Migräne','Konzentrationsprobleme','Gedächtnisprobleme','Stimmungstiefs / Depression','Angst / innere Unruhe','Brain Fog / Benommenheit','Schwindel','Zittern / Tremor'];
/* "Soziale Isolation" entfernt, "Schlafstörungen" entfernt (durch Schlafqualitäts-Skala abgedeckt) */
const mood = ['Antriebslosigkeit','Reizbarkeit'];
const vegetative = ['Tinnitus','Sehstörungen','Lichtempfindlichkeit','Geräuschempfindlichkeit','Übelkeit','Herzrasen','Kribbeln / Taubheitsgefühl','Sprachprobleme'];
const photos = ['Methylenblau','Curcumin liposomal','Riboflavin / Vitamin B2','Coenzym Q10 / Ubiquinol'];
const supplements = ['Sonnenmoor / Trinkmoor','Shilajit / Mumijo','Omega 3','Magnesium','Vitamin D','B-Komplex','Probiotikum','Elektrolyte','Sonstiges'];

/* Schlafdauer als feste Optionen (Patient kann nur ankreuzen) */
const SLEEP_OPTIONS = ['<5h','5-7h','7-9h','>9h'];

/* ----------------------------------------------------------------------------
   Therapieprotokolle (eingebaute Defaults)
   ----------------------------------------------------------------------------
   Diese Werte werden beim App-Start ggf. überschrieben durch:
     1. Eine manuell unter Einstellungen importierte JSON (localStorage)
     2. Eine im App-Verzeichnis abgelegte protocols.json (fetch beim Start)
   Falls keine externe Datei vorhanden ist, gelten weiterhin diese Defaults.
   Reihenfolge der Präzedenz: localStorage > protocols.json > Defaults.
---------------------------------------------------------------------------- */
let PROTOCOLS_SOURCE = 'Defaults (App V'+/*placeholder*/'?'+')'; /* wird vom Loader gesetzt */
let PROTOCOLS_VERSION = '1.4-builtin';
let PROTOCOLS_DATE = '';

const PROTOCOLS_LS_KEY = 'weberbrain_protocols_override';

/* ---------- Therapieprotokolle ---------- */
let protocols = {
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
  'Epilepsie':{name:'Epilepsie',stages:[['1–3','','','','Nur nach ärztlicher Rücksprache; Photosensitivität beachten'],['4–10','','','','Keine automatische Empfehlung'],['11+','','','','Individuelle ärztliche Verordnung erforderlich']]},
  'Neuroinflammation':{name:'Neuroinflammation',stages:[['1–3','0','25','10–15','CW-Modus: Entzündungsreduktion, NF-κB-Hemmung; sehr behutsam starten'],['4–10','10','50','20','Alpha 10 Hz: glymphatische Clearance, Mikroglia-Modulation, autonome Balance'],['11+','10 + 40','50–75','25–30','10 Hz morgens (Regulation) + 40 Hz mittags (Gamma, Neuroprotektion); nie 40 Hz abends']]}
};

/* === ERHALTUNGS-PROTOKOLLE (Stufenschema V1.4 / Weber Protocol Book 2025) ===
   Pro Diagnose indikationsspezifische Erhaltungs-Empfehlung mit:
     freq        = Sitzungen pro Woche (0 = keine automatische Empfehlung)
     weeks       = Dauer in Wochen (52 = dauerhaft empfohlen)
     hz          = Frequenz-Empfehlung für Erhaltung (Text, kann Wechsel enthalten)
     intensity   = Intensität in % (Text, kann Spanne enthalten)
     duration    = Sitzungsdauer in Minuten (Text, kann Spanne enthalten)
     timing      = Tageszeit-Hinweis ('' = flexibel)
     warning     = Sicherheitshinweis / Kontraindikation (leer wenn keine)
     note        = Begründung der Empfehlung
   Quelle: WeberBrain Stufenschema V1.4 (Stufe 3 = Erhaltung / Intensiv)
*/
let maintenanceProtocols = {
  'Alzheimer / Demenz':         {freq:7, weeks:52, hz:'40', intensity:'75–100', duration:'30', timing:'täglich (Heimanwendung)', warning:'Absetzen führt zu Rückfall – Dauertherapie empfohlen.', note:'Neurodegenerativ – tägliche Heimanwendung entscheidend. 40 Hz Gamma-Entrainment für glymphatische Amyloid-Clearance.'},
  'Parkinson':                  {freq:7, weeks:52, hz:'40 (morgens) + 10 (abends)', intensity:'75–100', duration:'30', timing:'täglich – Wechsel je Tageszeit', warning:'', note:'Neurodegenerativ – dauerhafte Stimulation. Morgens 40 Hz (Motorik/Kognition), abends 10 Hz (Schlaf/Angst).'},
  'Schlaganfall':               {freq:6, weeks:36, hz:'40', intensity:'75', duration:'25–30', timing:'5–7×/Woche', warning:'', note:'Chronische Phase: Neuroplastizität, Verbesserung funktioneller Konnektivität. Bei chronischen Defiziten ggf. dauerhaft fortsetzen.'},
  'Depression':                 {freq:7, weeks:16, hz:'0 → 10 (sequenziell)', intensity:'75', duration:'30', timing:'täglich, morgens', warning:'NIEMALS 40 Hz bei reiner Depression – kann Anspannung und Grübeln verstärken. NIEMALS abends – 10 Hz abends kann Einschlafstörungen verursachen.', note:'Optimales Erhaltungsprotokoll: 15 min 0 Hz (Aufwärmung) + 15 min 10 Hz (Alpha frontal). Nach 3–6 Monaten individuell auf alle 2 Wochen reduzieren.'},
  'Angststörung':               {freq:7, weeks:16, hz:'10', intensity:'50–75', duration:'25–30', timing:'täglich, morgens', warning:'Hyperarousal möglich – nicht zu schnell steigern.', note:'Dauerprotokoll Alpha 10 Hz; nach Stabilisierung individuell ausschleichen. Morgens bevorzugen (Cortisol-Rhythmus).'},
  'PTBS':                       {freq:7, weeks:16, hz:'10', intensity:'50–75', duration:'25–30', timing:'täglich, morgens', warning:'Reaktivierung möglich – Sitzungszeit nur schrittweise steigern. Immer in Kombination mit Traumatherapie (EMDR, TF-KVT).', note:'PTBS-Erhaltung: Alpha 10 Hz langfristig in Abstimmung mit Traumatherapie.'},
  'Long COVID':                 {freq:7, weeks:16, hz:'10 (morgens) + 40 (mittags)', intensity:'50–75', duration:'30', timing:'täglich – nie 40 Hz abends', warning:'PEM (Post-Exertional Malaise) beachten: keine Überstimulation. Bei Verschlechterung sofort auf 0 Hz zurück und Intensität halbieren.', note:'10 Hz morgens (Regulation), 40 Hz mittags (Kognition). Neuroinflammatorische Komponente – HRV-Monitoring empfohlen.'},
  'Burnout':                    {freq:7, weeks:16, hz:'10 (morgens) + 40 (mittags)', intensity:'50–75', duration:'30', timing:'täglich – nie 40 Hz abends', warning:'Aktivierung nur morgens/mittags – abends 40 Hz verschlechtert Schlaf.', note:'10 Hz morgens (autonome Regulation), 40 Hz mittags (Kognition). Nach 3–6 Monaten nach Bedarf.'},
  'SHT (Schädel-Hirn-Trauma)':  {freq:7, weeks:24, hz:'40', intensity:'75', duration:'25–30', timing:'täglich (Heimanwendung)', warning:'Rückfall nach Therapieende dokumentiert → Heimtherapie empfehlen. Bei Post-Concussion niedriger starten.', note:'Chronisches TBI: Default-Mode-Network gezielt stimulieren. Kognitive Testbatterie alle 4 Wochen.'},
  'Schlafstörung':              {freq:7, weeks:12, hz:'10 → 0 (sequenziell)', intensity:'50', duration:'25–30', timing:'täglich abends (1–2 h vor Schlaf)', warning:'NIEMALS 40 Hz abends – aktivierend, verschlechtert Schlaf.', note:'15 min 10 Hz, dann 15 min CW als Übergang in Schlafvorbereitung. Im Liegen, abgedunkelt.'},
  'Migräne / Kopfschmerz':      {freq:7, weeks:24, hz:'0 (CW, kein Puls)', intensity:'50', duration:'20–25', timing:'täglich (Prophylaxe), tageszeit-flexibel', warning:'NIEMALS 10 Hz oder 40 Hz – gepulstes Licht kann kortikale Spreading Depression auslösen und Attacken triggern. Nicht während aktiver Attacke. < 48 h nach Attacke: max. 25 %, max. 15 min.', note:'Langzeitprophylaxe: Reduktion Attackenfrequenz und -intensität. Triggertagebuch parallel führen.'},
  'ADHS':                       {freq:7, weeks:24, hz:'40 (morgens) + 10 (abends)', intensity:'50–75', duration:'25–30', timing:'täglich – Wechsel je Tageszeit', warning:'Kinder: max. 50 % Intensität unter 12 Jahren.', note:'Morgens 40 Hz (Fokus, Exekutivfunktionen), abends 10 Hz (Entspannung/Schlaf). Begleitend Neurofeedback sinnvoll.'},
  'Multiple Sklerose':          {freq:5, weeks:52, hz:'10 / 40 (individuell)', intensity:'50', duration:'20–25', timing:'5×/Woche', warning:'Fatigue beobachten – bei Verschlechterung Intensität reduzieren.', note:'Symptomdominanz-abhängig: 10 Hz bei autonomer Dysregulation, 40 Hz bei kognitiven Defiziten. Dauerhaft.'},
  'Tinnitus':                   {freq:5, weeks:16, hz:'10', intensity:'50', duration:'20–25', timing:'5×/Woche', warning:'Verträglichkeit maßgeblich – bei Tinnitus-Zunahme sofort pausieren.', note:'1×/Woche solange Verträglichkeit gut bleibt. Reizarme Anwendung.'},
  'Epilepsie':                  {freq:0, weeks:0,  hz:'—', intensity:'—', duration:'—', timing:'—', warning:'NUR nach ärztlicher Rücksprache und individueller Verordnung. Photosensitivität strikt beachten.', note:'Keine automatische Empfehlung – ärztliche Verordnung erforderlich.'},
  'Neuroinflammation':          {freq:7, weeks:52, hz:'10 (morgens) + 40 (mittags)', intensity:'50–75', duration:'25–30', timing:'täglich – nie 40 Hz abends', warning:'Bei Verschlechterung (Kopfschmerz, Fatigue-Zunahme) sofort auf 0 Hz zurück, Intensität halbieren.', note:'10 Hz morgens (Neuroprotektion/glymph. Clearance) + 40 Hz mittags (Gamma, Neurogenese). Curcumin liposomal + Omega-3 als Basistherapie. CRP/IL-6/Ferritin alle 6–8 Wochen.'}
};

/* Sucht in der Anamnese die erste passende Erhaltungs-Empfehlung */
function maintenanceSuggestionFor(diagnoses){
  for(const d of (diagnoses || [])){
    if(maintenanceProtocols[d]) return {diagnosis:d, ...maintenanceProtocols[d]};
  }
  return null;
}

/* ============================================================
   PROTOCOLS LOADER (Referenzdatei-Override)
   ============================================================
   Lädt protocols.json mit folgender Präzedenz:
     1. localStorage (manuell importierte JSON)  -> höchste Prio
     2. ./protocols.json (Datei neben index.html)
     3. eingebaute Defaults (oben im Code)
   Beim erfolgreichen Laden werden `protocols` und `maintenanceProtocols`
   überschrieben, der Quellen-Hinweis (PROTOCOLS_SOURCE) wird gesetzt
   und die UI re-rendert.
============================================================ */

/* Builtin-Snapshot bewahren für Reset-Funktion */
const BUILTIN_PROTOCOLS = JSON.parse(JSON.stringify(protocols));
const BUILTIN_MAINTENANCE = JSON.parse(JSON.stringify(maintenanceProtocols));
PROTOCOLS_SOURCE = 'Eingebaute Defaults (App-Version)';

/* Validiert grob, dass ein geladenes Objekt das richtige Format hat. */
function validateProtocolsData(data){
  if(!data || typeof data !== 'object') return 'Datei ist kein gültiges JSON-Objekt.';
  if(!data.protocols || typeof data.protocols !== 'object') return 'Schlüssel "protocols" fehlt oder ist kein Objekt.';
  if(!data.maintenanceProtocols || typeof data.maintenanceProtocols !== 'object') return 'Schlüssel "maintenanceProtocols" fehlt oder ist kein Objekt.';
  /* Mindestens ein Eintrag in beiden */
  if(!Object.keys(data.protocols).length) return 'Keine Protokolle in der Datei gefunden.';
  /* Stufenformat prüfen: stages muss Array mit 3 Einträgen sein, jeder ein Array */
  for(const key of Object.keys(data.protocols)){
    const p = data.protocols[key];
    if(!p || !Array.isArray(p.stages) || p.stages.length !== 3){
      return 'Protokoll "'+key+'" hat kein gültiges stages-Array (3 Einträge erwartet).';
    }
  }
  return null; /* alles gut */
}

/* Wendet ein validiertes Datenobjekt auf die App an. */
function applyProtocolsData(data, sourceLabel){
  protocols = data.protocols;
  maintenanceProtocols = data.maintenanceProtocols;
  PROTOCOLS_VERSION = (data._meta && data._meta.protocolVersion) ? data._meta.protocolVersion : 'unbekannt';
  PROTOCOLS_DATE = (data._meta && data._meta.releaseDate) ? data._meta.releaseDate : '';
  PROTOCOLS_SOURCE = sourceLabel;
}

/* Setzt zurück auf die eingebauten Defaults und löscht ggf. die localStorage-Override. */
function resetProtocolsToBuiltin(){
  protocols = JSON.parse(JSON.stringify(BUILTIN_PROTOCOLS));
  maintenanceProtocols = JSON.parse(JSON.stringify(BUILTIN_MAINTENANCE));
  PROTOCOLS_VERSION = '1.4-builtin';
  PROTOCOLS_DATE = '';
  PROTOCOLS_SOURCE = 'Eingebaute Defaults (App-Version)';
  try { localStorage.removeItem(PROTOCOLS_LS_KEY); } catch(e){}
}

/* ============================================================
   BUILT-IN STUFENSCHEMA-EDITOR
   ------------------------------------------------------------
   Modaler Dialog, mit dem die aktuell aktiven Protokolle direkt
   editiert werden können. Speichert in localStorage (gleiche
   Persistenz wie der JSON-Import), reagiert sofort auf die App.
   ============================================================ */
function openProtocolsEditor(){
  /* Arbeits-Kopie, damit Abbrechen wirklich abbricht */
  let draftAcute = JSON.parse(JSON.stringify(protocols));
  let draftMaint = JSON.parse(JSON.stringify(maintenanceProtocols));
  let activeTab = 'acute'; /* 'acute' | 'maintenance' */
  let activeDiag = Object.keys(draftAcute)[0] || '';

  /* Backdrop + Modal aufbauen */
  const backdrop = document.createElement('div');
  backdrop.className = 'protEditorBackdrop';
  backdrop.innerHTML = '<div class="protEditorModal" role="dialog" aria-modal="true" aria-label="Stufenschema bearbeiten"><div class="protEditorBody"></div></div>';
  document.body.appendChild(backdrop);
  const body = backdrop.querySelector('.protEditorBody');

  function close(){
    backdrop.remove();
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e){ if(e.key === 'Escape') close(); }
  document.addEventListener('keydown', onKey);
  backdrop.addEventListener('click', e => { if(e.target === backdrop) close(); });

  function renderEditor(){
    const diagList = activeTab === 'acute' ? Object.keys(draftAcute) : Object.keys(draftMaint);
    if(!diagList.includes(activeDiag)) activeDiag = diagList[0] || '';

    body.innerHTML = `
      <header class="protEditorHeader">
        <h2>✏️ Stufenschema bearbeiten</h2>
        <button class="protEditorClose" type="button" aria-label="Schließen">✕</button>
      </header>

      <div class="protEditorTabs">
        <button type="button" class="protEditorTab ${activeTab==='acute'?'active':''}" data-tab="acute">Akut-Therapie (Sitzungen 1–3 / 4–10 / 11+)</button>
        <button type="button" class="protEditorTab ${activeTab==='maintenance'?'active':''}" data-tab="maintenance">Erhaltungs-Therapie</button>
      </div>

      <div class="protEditorMain">
        <aside class="protEditorList">
          ${diagList.map(d => `<button type="button" class="protDiagBtn ${d===activeDiag?'active':''}" data-diag="${esc(d)}">${esc(d)}</button>`).join('')}
        </aside>
        <section class="protEditorForm">
          ${activeTab === 'acute' ? renderAcuteForm() : renderMaintForm()}
        </section>
      </div>

      <footer class="protEditorFooter">
        <button type="button" class="muted protEditorResetDiag" title="Diese Diagnose auf den App-Default zurücksetzen">↺ Diese Diagnose zurücksetzen</button>
        <span style="flex:1"></span>
        <button type="button" class="muted protEditorCancel">Abbrechen</button>
        <button type="button" class="protEditorSave">Speichern</button>
      </footer>
    `;

    /* Tab-Wechsel */
    body.querySelectorAll('.protEditorTab').forEach(btn => {
      btn.onclick = () => {
        activeTab = btn.dataset.tab;
        const list = activeTab === 'acute' ? Object.keys(draftAcute) : Object.keys(draftMaint);
        if(!list.includes(activeDiag)) activeDiag = list[0] || '';
        renderEditor();
      };
    });

    /* Diagnose-Wechsel */
    body.querySelectorAll('.protDiagBtn').forEach(btn => {
      btn.onclick = () => { commitForm(); activeDiag = btn.dataset.diag; renderEditor(); };
    });

    /* Buttons */
    body.querySelector('.protEditorClose').onclick = close;
    body.querySelector('.protEditorCancel').onclick = close;
    body.querySelector('.protEditorSave').onclick = save;
    body.querySelector('.protEditorResetDiag').onclick = resetDiag;

    /* Live-Commit bei Änderungen, damit Tab-/Diag-Wechsel nichts verliert */
    body.querySelectorAll('[data-editfield]').forEach(el => {
      el.addEventListener('input', commitForm);
    });
  }

  function renderAcuteForm(){
    const p = draftAcute[activeDiag];
    if(!p) return '<div class="notice">Keine Daten für diese Diagnose.</div>';
    const stageLabels = ['Stufe 1 — Sitzungen 1–3 (Einstieg)','Stufe 2 — Sitzungen 4–10 (Aufbau)','Stufe 3 — Sitzungen 11+ (Erhaltung/Intensiv)'];
    return `
      <div class="protFormHead">
        <h3>${esc(activeDiag)}</h3>
        <label class="protFormName">Anzeigename
          <input type="text" data-editfield data-key="name" value="${esc(p.name||activeDiag)}">
        </label>
      </div>
      ${p.stages.map((st, idx) => `
        <fieldset class="protStageBox">
          <legend>${stageLabels[idx]||('Stufe '+(idx+1))}</legend>
          <div class="protStageGrid">
            <label>Sitzungen<input type="text" data-editfield data-stage="${idx}" data-col="0" value="${esc(st[0]||'')}" placeholder="z.B. 1–3"></label>
            <label>Frequenz (Hz)<input type="text" data-editfield data-stage="${idx}" data-col="1" value="${esc(st[1]||'')}" placeholder="z.B. 40 oder 0"></label>
            <label>Intensität (%)<input type="text" data-editfield data-stage="${idx}" data-col="2" value="${esc(st[2]||'')}" placeholder="z.B. 25 oder 50–75"></label>
            <label>Dauer (min)<input type="text" data-editfield data-stage="${idx}" data-col="3" value="${esc(st[3]||'')}" placeholder="z.B. 20 oder 20–25"></label>
          </div>
          <label class="protNoteLbl">Anmerkung
            <textarea data-editfield data-stage="${idx}" data-col="4" rows="2" placeholder="Hinweis / Begründung">${esc(st[4]||'')}</textarea>
          </label>
        </fieldset>
      `).join('')}
    `;
  }

  function renderMaintForm(){
    const m = draftMaint[activeDiag];
    if(!m) return '<div class="notice">Keine Daten für diese Diagnose.</div>';
    return `
      <div class="protFormHead">
        <h3>${esc(activeDiag)} — Erhaltungs-Therapie</h3>
      </div>
      <div class="protStageGrid" style="margin-top:8px">
        <label>Frequenz/Woche (Zahl, 0 = keine Empfehlung)<input type="number" min="0" max="14" data-editfield data-mkey="freq" value="${esc(m.freq ?? 0)}"></label>
        <label>Dauer (Wochen, 52 = dauerhaft)<input type="number" min="0" max="520" data-editfield data-mkey="weeks" value="${esc(m.weeks ?? 0)}"></label>
        <label>Frequenz Hz<input type="text" data-editfield data-mkey="hz" value="${esc(m.hz||'')}" placeholder="z.B. 40 oder 10 + 40"></label>
        <label>Intensität %<input type="text" data-editfield data-mkey="intensity" value="${esc(m.intensity||'')}" placeholder="z.B. 75 oder 50–75"></label>
        <label>Dauer/Sitzung (min)<input type="text" data-editfield data-mkey="duration" value="${esc(m.duration||'')}" placeholder="z.B. 30 oder 25–30"></label>
        <label>Tageszeit<input type="text" data-editfield data-mkey="timing" value="${esc(m.timing||'')}" placeholder="z.B. täglich morgens"></label>
      </div>
      <label class="protNoteLbl">Sicherheitshinweis (optional)
        <textarea data-editfield data-mkey="warning" rows="2" placeholder="Warnung / Kontraindikation">${esc(m.warning||'')}</textarea>
      </label>
      <label class="protNoteLbl">Begründung / Anmerkung
        <textarea data-editfield data-mkey="note" rows="3" placeholder="Rationale">${esc(m.note||'')}</textarea>
      </label>
    `;
  }

  /* Schreibt aktuelle Formularwerte ins draft-Objekt */
  function commitForm(){
    if(!activeDiag) return;
    if(activeTab === 'acute'){
      const p = draftAcute[activeDiag];
      if(!p) return;
      const nameEl = body.querySelector('[data-key="name"]');
      if(nameEl) p.name = nameEl.value;
      body.querySelectorAll('[data-stage]').forEach(el => {
        const s = parseInt(el.dataset.stage, 10);
        const c = parseInt(el.dataset.col, 10);
        if(!isNaN(s) && !isNaN(c) && p.stages[s]) p.stages[s][c] = el.value;
      });
    } else {
      const m = draftMaint[activeDiag];
      if(!m) return;
      body.querySelectorAll('[data-mkey]').forEach(el => {
        const k = el.dataset.mkey;
        if(k === 'freq' || k === 'weeks'){
          const n = parseInt(el.value, 10);
          m[k] = isNaN(n) ? 0 : n;
        } else {
          m[k] = el.value;
        }
      });
    }
  }

  function resetDiag(){
    if(!activeDiag) return;
    if(!confirm(`„${activeDiag}" auf den App-Default zurücksetzen?\n\nDie anderen Diagnosen bleiben unverändert. Erst beim Klick auf „Speichern" wird die Änderung übernommen.`)) return;
    if(activeTab === 'acute'){
      if(BUILTIN_PROTOCOLS[activeDiag]) draftAcute[activeDiag] = JSON.parse(JSON.stringify(BUILTIN_PROTOCOLS[activeDiag]));
    } else {
      if(BUILTIN_MAINTENANCE[activeDiag]) draftMaint[activeDiag] = JSON.parse(JSON.stringify(BUILTIN_MAINTENANCE[activeDiag]));
    }
    renderEditor();
  }

  function save(){
    commitForm();
    const data = {
      _meta: {
        schemaVersion: '1.0',
        protocolVersion: 'custom-'+new Date().toISOString().slice(0,10),
        releaseDate: new Date().toISOString().slice(0,10),
        source: 'In-App-Editor',
      },
      protocols: draftAcute,
      maintenanceProtocols: draftMaint
    };
    const err = validateProtocolsData(data);
    if(err){ alert('Speichern fehlgeschlagen: '+err); return; }
    try {
      localStorage.setItem(PROTOCOLS_LS_KEY, JSON.stringify(data));
    } catch(e){
      alert('Speichern fehlgeschlagen (lokaler Speicher voll?).');
      return;
    }
    applyProtocolsData(data, 'In-App-Editor');
    close();
    if(typeof showToast === 'function') showToast('Stufenschema gespeichert');
    if(typeof render === 'function') render();
  }

  renderEditor();
}

/* Lädt im Hintergrund:
   - zuerst localStorage (sofort)
   - dann fetch von ./protocols.json (asynchron)
   localStorage hat höhere Prio: wenn beide vorhanden, gewinnt localStorage. */
async function loadExternalProtocols(){
  /* 1) localStorage zuerst */
  try {
    const raw = localStorage.getItem(PROTOCOLS_LS_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      const err = validateProtocolsData(parsed);
      if(!err){
        applyProtocolsData(parsed, 'Manuell importiert (localStorage)');
        console.log('[protocols] Override aus localStorage angewendet, Version:', PROTOCOLS_VERSION);
        return; /* localStorage gewinnt – fetch wird übersprungen */
      } else {
        console.warn('[protocols] Ungültige localStorage-Daten:', err);
      }
    }
  } catch(e){
    console.warn('[protocols] localStorage konnte nicht gelesen werden:', e);
  }
  /* 2) fetch protocols.json (nicht-blockierend, optional) */
  try {
    const res = await fetch('./protocols.json', { cache: 'no-cache' });
    if(!res.ok){
      console.log('[protocols] Keine protocols.json gefunden – verwende Defaults.');
      return;
    }
    const data = await res.json();
    const err = validateProtocolsData(data);
    if(err){
      console.warn('[protocols] Fehler in protocols.json:', err);
      return;
    }
    applyProtocolsData(data, 'Datei protocols.json');
    console.log('[protocols] Datei geladen, Version:', PROTOCOLS_VERSION);
    /* Wenn die App schon gerendert wurde, neu rendern, damit die neuen Protokolle aktiv sind */
    if(typeof render === 'function') {
      try { render(); } catch(e){ /* render evtl. noch nicht initialisiert – egal */ }
    }
  } catch(e){
    console.log('[protocols] protocols.json konnte nicht geladen werden – verwende Defaults.', e);
  }
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
  /* 1) Haupt-Key versuchen */
  try{
    const raw = localStorage.getItem(KEY);
    if(raw){
      const data = JSON.parse(raw);
      if(data && data.patients){
        return data;
      }
    }
  }catch(e){
    console.warn('[load] Haupt-Speicher beschädigt, versuche Snapshot:', e);
  }
  /* 2) Snapshot versuchen (Recovery nach Crash / korruptem Haupt-Key) */
  try{
    const rawSnap = localStorage.getItem(KEY_SNAPSHOT);
    if(rawSnap){
      const snap = JSON.parse(rawSnap);
      if(snap && snap.patients){
        console.warn('[load] Wiederherstellung aus Snapshot (Haupt-Speicher fehlte/korrupt)');
        /* Snapshot sofort als neuen Haupt-Stand zurückschreiben */
        try { localStorage.setItem(KEY, JSON.stringify(snap)); } catch(e){}
        /* Toast erst zeigen, wenn DOM bereit ist */
        setTimeout(() => {
          try { showToast('🛟 Daten aus Sicherheits-Snapshot wiederhergestellt'); } catch(e){}
        }, 1500);
        return snap;
      }
    }
  }catch(e){
    console.warn('[load] Auch Snapshot beschädigt:', e);
  }
  /* 3) Fallback: leere DB */
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
  let json;
  try {
    json = JSON.stringify(db);
  } catch(e){
    console.error('[persist] JSON-Serialisierung fehlgeschlagen:', e);
    try { showToast('⚠️ Speicher-Fehler – bitte Backup exportieren'); } catch(_){}
    return;
  }
  /* Snapshot-Rotation: aktueller Haupt-Stand wird VOR dem Überschreiben in
     den Snapshot-Slot kopiert. Bei einem abgebrochenen oder fehlgeschlagenen
     setItem(KEY,...) ist mindestens der vorletzte Stand sicher rekonstru-
     ierbar. */
  try {
    const prev = localStorage.getItem(KEY);
    if(prev) localStorage.setItem(KEY_SNAPSHOT, prev);
  } catch(e){ /* Snapshot ist Best-Effort */ }
  try {
    localStorage.setItem(KEY, json);
  } catch(e){
    console.error('[persist] setItem fehlgeschlagen (evtl. Quota):', e);
    try { showToast('⚠️ Speicher voll – bitte Backup exportieren & Kartei prüfen'); } catch(_){}
    return;
  }
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

/* Anzahl der maximal aufzubewahrenden Backup-Speichersätze im gewählten Ordner. */
const MAX_BACKUPS = 10;

/* Zeitstempel für Backup-Dateinamen: YYYY-MM-DD_HH-MM-SS.
   Dadurch erzeugt jeder Speichervorgang einen eigenen Speichersatz, der sich
   sauber sortieren und auf die letzten MAX_BACKUPS begrenzen lässt. */
function backupTimestamp(){
  const d = new Date();
  const p = n => String(n).padStart(2,'0');
  return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())
    +'_'+p(d.getHours())+'-'+p(d.getMinutes())+'-'+p(d.getSeconds());
}

/* Hält im Backup-Ordner nur die letzten MAX_BACKUPS Speichersätze.
   Erkennt Backup-Dateien am Präfix 'weberbrain_backup_' und sortiert sie
   alphabetisch (= chronologisch dank Zeitstempel im Namen); ältere werden
   gelöscht. Best-Effort: schlägt das Löschen fehl, wird es ignoriert. */
async function pruneBackups(handle){
  if(!handle || typeof handle.entries !== 'function') return;
  try {
    const names = [];
    for await (const [name, entry] of handle.entries()){
      if(entry.kind === 'file' && /^weberbrain_backup_.*\.json$/i.test(name)){
        names.push(name);
      }
    }
    if(names.length <= MAX_BACKUPS) return;
    names.sort(); /* alt -> neu */
    const toDelete = names.slice(0, names.length - MAX_BACKUPS);
    for(const name of toDelete){
      try { await handle.removeEntry(name); } catch(_){ /* einzelnes Löschen best-effort */ }
    }
  } catch(e){
    console.warn('[pruneBackups] Bereinigung fehlgeschlagen:', e);
  }
}

async function doAutoBackup(){
  try {
    const filename = 'weberbrain_backup_' + backupTimestamp() + '.json';
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
          /* Nach erfolgreichem Schreiben: alte Speichersätze aufräumen
             (immer nur die letzten MAX_BACKUPS behalten) */
          await pruneBackups(handle);
          _lastBackupHash = dataHash();
          _hasUnsavedChanges = false;
          showToast('💾 Backup gespeichert (max. '+MAX_BACKUPS+' Sätze)');
          return;
        }
      } catch(e){
        console.warn('Auto-Backup in Ordner fehlgeschlagen, Fallback auf Download:', e);
      }
    }
    /* Standard-Fallback: Download (Browser-Downloads können nicht bereinigt
       werden – dort entscheidet der Nutzer/Dateisystem über die Aufbewahrung) */
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
  if(db.settings.refPdfUrl === undefined) db.settings.refPdfUrl = '';
  if(db.settings.refPdfData === undefined) db.settings.refPdfData = '';
  if(db.settings.refPdfName === undefined) db.settings.refPdfName = '';
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

/* Eindeutige Patient-ID. Date.now() allein reicht nicht — wenn zwei Patienten
   in derselben Millisekunde erstellt werden (z.B. durch versehentlichen Doppel-
   klick oder beim Import mehrerer Patienten), bekäme der zweite dieselbe ID
   wie der erste und würde den ersten überschreiben. Zusatz-Zufallsanteil
   verhindert das zuverlässig. */
function newPatientId(){
  return 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
}

function blankPatient(){
  return {
    id:newPatientId(),
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
  return Array.from({length:Number(n)||0}, (_,i) => ({nr:i+1,date:'',hz:'',intensity:'',duration:'',note:'',done:false,rating:''}));
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
  while(p.planung.sessions.length < n) p.planung.sessions.push({nr:p.planung.sessions.length+1,date:'',hz:'',intensity:'',duration:'',note:'',done:false,rating:''});
  if(p.planung.sessions.length > n) p.planung.sessions = p.planung.sessions.slice(0,n);
  p.planung.sessions.forEach((s,i) => { s.nr = i+1; if(s.done === undefined) s.done = false; if(s.rating === undefined) s.rating = ''; });
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
  while(m.sessions.length < n) m.sessions.push({nr:m.sessions.length+1,date:'',hz:'',intensity:'',duration:'',note:'',done:false,rating:''});
  if(m.sessions.length > n) m.sessions = m.sessions.slice(0,n);
  m.sessions.forEach((s,i) => { s.nr = i+1; if(s.done === undefined) s.done = false; if(s.rating === undefined) s.rating = ''; });
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
  /* Versionsanzeige im Lock-Screen */
  const lockVer = document.getElementById('lockVersion');
  if(lockVer){
    lockVer.innerHTML = '<b>App v'+esc(APP_VERSION)+'</b> &nbsp;·&nbsp; Protokolle v'+esc(PROTOCOLS_VERSION);
    lockVer.title = 'App-Version: '+APP_VERSION+' ('+APP_RELEASE_DATE+')\nProtokoll-Quelle: '+PROTOCOLS_SOURCE+(PROTOCOLS_DATE ? '\nProtokoll-Stand: '+PROTOCOLS_DATE : '');
  }
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
/* Wenn kein Patient: nur Forschung-Tab anzeigen */
function getTabsForCurrentState(){
  if(!cur() && userMode === 'therapeut') return [['forschung','Forschungs-Auswertung']];
  return getActiveTabs();
}

function render(){
  if(userMode === null){ showLock(); return; }
  /* Sidebar im Patientenmodus ausblenden */
  document.getElementById('sidebar').style.display = userMode === 'patient' ? 'none' : '';
  document.getElementById('mainWrap').style.gridTemplateColumns = userMode === 'patient' ? '1fr' : '320px 1fr';
  /* "Export", "Drucken" für Patienten ausblenden */
  document.getElementById('exportBtn').style.display = userMode === 'patient' ? 'none' : '';
  document.getElementById('printBtn').style.display = userMode === 'patient' ? 'none' : '';
  const settingsBtn2 = document.getElementById('settingsBtn');
  if(settingsBtn2) settingsBtn2.style.display = userMode === 'patient' ? 'none' : '';
  /* Patientenname im Header anzeigen (nur Patientenmodus) */
  const patNameEl = document.getElementById('patientNameDisplay');
  if(patNameEl){
    if(userMode === 'patient' && cur() && cur().stamm?.name){
      patNameEl.textContent = '👤 ' + cur().stamm.name;
      patNameEl.style.display = '';
    } else {
      patNameEl.style.display = 'none';
    }
  }

  /* Neuer-Patient-Btn in Sidebar IMMER sichtbar (im Therapeut-Modus).
     Vorher war er nur auf dem Stammdaten-Reiter sichtbar – schlechte UX,
     wenn man in einem anderen Reiter einen neuen Patienten anlegen möchte. */
  const newSb = document.getElementById('newPatientSidebarBtn');
  if(newSb) newSb.style.display = '';

  /* Versionsanzeige unten in der Sidebar aktualisieren */
  const sbVer = document.getElementById('sidebarVersion');
  if(sbVer){
    sbVer.innerHTML = '<b>App v'+esc(APP_VERSION)+'</b> &nbsp;·&nbsp; Protokolle v'+esc(PROTOCOLS_VERSION);
    sbVer.title = 'App-Version: '+APP_VERSION+' ('+APP_RELEASE_DATE+')\nProtokoll-Quelle: '+PROTOCOLS_SOURCE+(PROTOCOLS_DATE ? '\nProtokoll-Stand: '+PROTOCOLS_DATE : '');
  }

  renderList();
  const hasPatient = !!cur();
  const isSettings = activeTab === 'settings';
  const isForschung = activeTab === 'forschung';
  /* Forschung + Settings sind auch ohne Patienten zugänglich */
  const showApp = hasPatient || isSettings || isForschung;
  document.getElementById('empty').classList.toggle('hidden', showApp);
  document.getElementById('app').classList.toggle('hidden', !showApp);
  if(cur()){
    ensureShape();
    /* Settings ist ein Sonder-Tab außerhalb TABS_ALL – nicht zurücksetzen */
    if(activeTab !== 'settings'){
      const allowed = getActiveTabs().map(t => t[0]);
      if(!allowed.includes(activeTab)) activeTab = allowed[0];
    }
    renderTabs();
    renderPanels();
  } else if(isSettings){
    /* Settings auch ohne Patienten öffnen – Tabs nicht anzeigen */
    document.getElementById('tabs').innerHTML = '';
    renderPanels();
  } else if(isForschung){
    /* Forschung auch ohne Patienten öffnen – Tabs anzeigen (nur Forschung sichtbar) */
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
  const tabList = cur() ? getActiveTabs() : getTabsForCurrentState();
  tabList.forEach(([id,label]) => {
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
function chips(path,arr,opts){
  const vals = get(path) || [];
  opts = opts || {};
  /* preValues: Liste der in der Anfangs-Evaluierung angekreuzten Werte.
     Wird nur in der End-Evaluierung gesetzt - betroffene Chips bekommen
     ein kleines "vorher"-Label, damit der Patient sieht, was er anfangs
     angegeben hat. */
  const preList = Array.isArray(opts.preValues) ? opts.preValues : null;
  return `<div class="chips">${arr.map(x => {
    const isPre = preList && preList.includes(x);
    const cls = 'chip' + (isPre ? ' preMark' : '');
    return `<label class="${cls}"><input type="checkbox" data-array="${path}" value="${esc(x)}" ${vals.includes(x)?'checked':''}>${esc(x)}</label>`;
  }).join('')}</div>`;
}
function scale(path,label,opts){
  const val = get(path) || '';
  opts = opts || {};
  /* direction: 'up' (default) = 0 ist gut/wenig, 10 ist schlecht/viel (Symptome).
     'down' = 0 ist schlecht, 10 ist gut (z.B. Schlafqualitaet). */
  const dir = opts.direction === 'down' ? 'down' : 'up';
  /* preValue: Wert aus der Vor-Therapie-Evaluierung. Wird nur in der End-
     Evaluierung gesetzt und markiert den entsprechenden Button hellgrau,
     damit der Patient sieht, welche Punktzahl er vorher angegeben hat. */
  const preRaw = (opts.preValue === undefined || opts.preValue === null || opts.preValue === '')
                    ? null : String(opts.preValue);
  /* Legende oberhalb der Skala fuer aeltere Patienten gut verstaendlich */
  const legendText = dir === 'down'
    ? '<span>0 = schlecht</span><span style="margin-left:auto">10 = gut</span>'
    : '<span>0 = keine Beschwerden</span><span style="margin-left:auto">10 = sehr stark</span>';
  const legend = `<div class="scaleLegend ${dir==='down'?'rev':''}">${legendText}<div class="lgBar" aria-hidden="true"></div></div>`;
  const buttons = Array.from({length:11},(_,i)=>{
    const isPre = preRaw !== null && preRaw === String(i);
    return `<label data-val="${i}" data-dir="${dir}"${isPre?' class="preMark"':''}><input name="${path}" data-path="${path}" type="radio" value="${i}" ${String(val)===String(i)?'checked':''}>${i}</label>`;
  }).join('');
  return `<div class="field"><label>${label}</label>${legend}<div class="scale">${buttons}</div></div>`;
}
/* Schlafdauer als Auswahl-Buttons */
function sleepDurationField(path,label){
  const val = get(path) || '';
  return `<div class="field"><label>${label}</label><div class="sleepDuration">${SLEEP_OPTIONS.map(opt=>`<label><input type="radio" name="${path}" data-path="${path}" value="${esc(opt)}" ${val===opt?'checked':''}>${esc(opt)}</label>`).join('')}</div></div>`;
}

/* ---------- Evaluierungs-Block (vor + nach Therapie identisch) ---------- */
function evalFull(prefix,title,intro){
  /* Wenn dies die End-Evaluierung ist, holen wir die Vor-Therapie-Werte als
     "preValue" fuer jede Skala. So sieht der Patient direkt, welche Punkt-
     zahl er anfangs angegeben hat (hellgrau markiert). Bei den Chip-Listen
     (Stimmung/Begleitbeschwerden, Vegetative Symptome) bekommen die in der
     Anfangs-Evaluierung bereits angekreuzten Punkte ein kleines "vorher"-
     Label, damit der Patient sieht, was er anfangs angegeben hatte. */
  const isEnd = prefix === 'ende';
  const preData = isEnd ? (cur().evaluierung || {values:{}}) : null;
  const preVal = sym => isEnd ? preData.values?.[sym] : undefined;
  const preSleepQuality = isEnd ? preData.sleepQuality : undefined;
  const preMood = isEnd ? (preData.mood || []) : null;
  const preVegetative = isEnd ? (preData.vegetative || []) : null;
  return `
    <h2>${title}</h2>
    <p>${intro}</p>
    <h3>Aktuelle Beschwerden (0 = keine Beschwerden, 10 = maximal)</h3>
    ${symptoms.map(s => scale(prefix+'.values.'+s, s, {direction:'up', preValue:preVal(s)})).join('')}
    <h3>Schlaf &amp; Stimmung</h3>
    <div class="grid">
      ${sleepDurationField(prefix+'.sleepDuration','Durchschnittliche Schlafdauer')}
    </div>
    ${scale(prefix+'.sleepQuality','Schlafqualität (0 = sehr schlecht, 10 = ausgezeichnet)', {direction:'down', preValue:preSleepQuality})}
    <h3>Stimmung / Begleitbeschwerden</h3>
    ${chips(prefix+'.mood', mood, {preValues: preMood})}
    <h3>Vegetative Symptome</h3>
    ${chips(prefix+'.vegetative', vegetative, {preValues: preVegetative})}
    ${textarea(prefix+'.notes','Besonderheiten / Nebenwirkungen / Anmerkungen')}
  `;
}

/* ---------- Therapieplanung-Helpers ---------- */
function therapySuggestion(){
  const p = cur();
  const d = (p.anamnese.diagnoses||[]).find(x => protocols[x]);
  if(!d) return '<div class="notice">Keine passende Diagnose für automatischen Vorschlag gewählt. Bitte zuerst in der Anamnese eine Diagnose ankreuzen.</div>';
  const pr = protocols[d];

  /* Eigene Erfahrungswerte aus den Patientendaten für diese Diagnose */
  const expBox = experienceHint(d);

  return `<div class="notice ok">
    <b>Therapievorschlag (Referenz-Protokoll):</b> ${esc(pr.name)}
    <div style="margin-top:6px;line-height:1.7">
      ${pr.stages.map(st => `<span style="display:block"><b>Sitzung ${esc(st[0])}:</b> ${st[1]||'—'} Hz &nbsp;·&nbsp; ${st[2]||'—'} % &nbsp;·&nbsp; ${st[3]||'—'} min &nbsp;–&nbsp; <em>${esc(st[4])}</em></span>`).join('')}
    </div>
  </div>
  ${expBox}`;
}

/* Erfahrungshinterglas: eigene akkumulierte Werte aus der Kartei für diese Diagnose.
   - Empfehlungen für Hz/Intensität werden NUR aus Patienten mit positiver Verbesserung abgeleitet.
   - Sind zu wenige (oder keine) positiven Daten vorhanden, wird "Noch keine Werte" angezeigt.
   - Die durchschnittliche Verbesserung wird über ALLE Patienten dieser Diagnose ausgewiesen
     (auch negative), weil das eine realistische Bilanz und keine Empfehlung ist. */
function experienceHint(diagName){
  const dataset = buildAnalysisDataset();
  const sub = dataset.filter(d => d.diagnoses.includes(diagName));
  if(sub.length < 1) return ''; /* keine eigenen Daten vorhanden – Block ganz ausblenden */

  const PLACEHOLDER = 'Noch keine Werte';
  const MIN_POS_N = 2; /* mind. 2 positive Patienten, sonst keine Empfehlung */

  /* Nur Patienten mit positiver Verbesserung für Empfehlungen heranziehen */
  const positive = sub.filter(d => typeof d.improvement === 'number' && !isNaN(d.improvement) && d.improvement > 0);
  const hasEnoughPositive = positive.length >= MIN_POS_N;

  /* Hz und Int: Bin mit höchster mittlerer Verbesserung – nur aus positiven Fällen */
  function modeLabel(vals, bins){
    if(!hasEnoughPositive) return PLACEHOLDER;
    const opt = findOptimum(positive, vals, bins);
    if(!opt.length) return PLACEHOLDER;
    /* Nur Bins mit mind. 1 positiven Patienten und einer auswertbaren mittleren Verbesserung */
    const candidates = opt.filter(o => o.n >= 1 && typeof o.meanImprovement === 'number' && !isNaN(o.meanImprovement) && o.meanImprovement > 0);
    if(!candidates.length) return PLACEHOLDER;
    candidates.sort((a,b) => b.meanImprovement - a.meanImprovement);
    const best = candidates[0];
    return best.label + ' (n=' + best.n + ')';
  }
  function avgLabel(field){
    /* Mittelwert nur über positive Verläufe – ohne mind. zwei keine Aussage */
    if(!hasEnoughPositive) return PLACEHOLDER;
    const v = positive.map(d => d[field]).filter(x => x !== null && !isNaN(x));
    if(!v.length) return PLACEHOLDER;
    return Math.round(v.reduce((a,b)=>a+b,0)/v.length) + (field==='avgDuration' ? ' min' : '');
  }

  const impStats = sub.map(d => d.improvement).filter(x => typeof x === 'number' && !isNaN(x));
  const avgImp = impStats.length ? Math.round(impStats.reduce((a,b)=>a+b,0)/impStats.length) : null;
  const impColor = avgImp !== null ? (avgImp > 10 ? '#007a53' : avgImp < -10 ? '#b42a2a' : '#6b7280') : '#6b7280';

  const headerCount = `${sub.length} Patient${sub.length!==1?'en':''}`
    + (positive.length !== sub.length ? `, davon ${positive.length} mit Verbesserung` : '');

  const noteText = hasEnoughPositive
    ? 'Basierend auf eigenen Patientendaten mit positivem Verlauf &mdash; zur Orientierung, kein Ersatz für das Referenzprotokoll.'
    : `Empfehlungen werden erst angezeigt, sobald mindestens ${MIN_POS_N} abgeschlossene Therapien mit positivem Verlauf (Verbesserung > 0&nbsp;%) vorliegen.`;

  /* === Zusatz-Block: Optimum aus den Sitzungs-Erfolgs-Bewertungen (1–5) ===
     Unabhängig von der End-Evaluierung: nutzt jede einzelne bewertete Sitzung
     dieser Diagnose und zeigt, bei welcher Frequenz/Intensität/Dauer die
     Sitzungserfolge am höchsten bewertet wurden. */
  const ratingRows = buildSessionRatingDataset().filter(r => r.diagnoses.includes(diagName));
  let ratingBlock = '';
  if(ratingRows.length >= 1){
    const fmt = b => b ? `${b.label} <span class="expHintN">(Ø ${b.meanRating.toFixed(1)} · n=${b.n})</span>` : 'Noch keine Werte';
    const bestHz  = bestBinByRating(ratingRows, 'hz',  HZ_BINS);
    const bestInt = bestBinByRating(ratingRows, 'intensity', INT_BINS);
    const bestDur = bestBinByRating(ratingRows, 'duration',  DUR_BINS);
    const meanAll = ratingRows.reduce((a,b)=>a+b.rating,0) / ratingRows.length;
    ratingBlock = `<div class="expHintRatingHead">
        ⭐ Beste Werte nach <b>Sitzungs-Erfolgsbewertung</b>
        <span class="expHintImp" style="color:#0d6b3c">Ø ${meanAll.toFixed(1)} / 5 · ${ratingRows.length} Sitzung${ratingRows.length!==1?'en':''}</span>
      </div>
      <div class="expHintGrid">
        <div class="expHintItem"><div class="expHintLbl">Beste Frequenz</div><div class="expHintVal">${fmt(bestHz)}</div></div>
        <div class="expHintItem"><div class="expHintLbl">Beste Intensität</div><div class="expHintVal">${fmt(bestInt)}</div></div>
        <div class="expHintItem"><div class="expHintLbl">Beste Dauer</div><div class="expHintVal">${fmt(bestDur)}</div></div>
      </div>`;
  }

  return `<div class="expHint">
    <div class="expHintHead">
      <span class="expHintIcon">📊</span>
      <span>Eigene Erfahrungswerte &mdash; <b>${esc(diagName)}</b> &nbsp;(${headerCount})</span>
      ${avgImp !== null ? `<span class="expHintImp" style="color:${impColor}">Ø ${avgImp>0?'+':''}${avgImp}% Verbesserung</span>` : ''}
    </div>
    <div class="expHintGrid">
      <div class="expHintItem"><div class="expHintLbl">Beste Frequenz</div><div class="expHintVal">${modeLabel('avgHz', HZ_BINS)}</div></div>
      <div class="expHintItem"><div class="expHintLbl">Beste Intensität</div><div class="expHintVal">${modeLabel('avgIntensity', INT_BINS)}</div></div>
      <div class="expHintItem"><div class="expHintLbl">Ø Dauer</div><div class="expHintVal">${avgLabel('avgDuration')}</div></div>
      <div class="expHintItem"><div class="expHintLbl">Ø Sitzungen</div><div class="expHintVal">${avgLabel('sessions')}</div></div>
    </div>
    ${ratingBlock}
    <div class="expHintNote">${noteText}</div>
  </div>`;
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
    ${sessionRatingHtml('session', i, s.rating)}
    <div class="field"><label>Anmerkung</label><textarea data-session="${i}" data-key="note" enterkeyhint="done">${esc(s.note)}</textarea></div>
  </div>`;
}

/* === Erfolgs-Bewertung pro Sitzung (1–5, bezogen auf das Hauptsymptom) ===
   1 = unverändert / kein Effekt … 5 = sehr starke Besserung.
   Diese Bewertung fließt in die Auswertung (Indikation → optimale
   Frequenz/Intensität/Dauer) ein – siehe sessionRatingStats(). */
const RATING_OPTIONS = [
  {value:'1', label:'Keine Besserung', color:'#992020', soft:'#ecd6d6'},
  {value:'2', label:'Wenig',           color:'#dc5959', soft:'#f8e1e1'},
  {value:'3', label:'Mäßig',           color:'#e89c3c', soft:'#faeddb'},
  {value:'4', label:'Deutlich',        color:'#7cc36e', soft:'#e7f4e4'},
  {value:'5', label:'Sehr stark',      color:'#0d6b3c', soft:'#d3e4db'}
];
/* role: 'session' (data-session) oder 'msession' (data-msession) */
function sessionRatingHtml(role, i, val){
  const ms = mainSymptomOf(cur());
  const cur_ = String(val || '');
  const dataAttr = role === 'msession' ? `data-msession="${i}"` : `data-session="${i}"`;
  const buttons = RATING_OPTIONS.map(o =>
    `<label class="ratingOption" style="--col:${o.color};--soft:${o.soft}">
       <input type="radio" name="${role}_${i}_rating" ${dataAttr} data-key="rating" value="${o.value}" ${cur_===o.value?'checked':''}>
       <span class="rNum">${o.value}</span>
       <span class="rLbl">${esc(o.label)}</span>
     </label>`
  ).join('');
  const symLine = ms
    ? `Erfolg bezogen auf das Hauptsymptom <b>„${esc(ms)}"</b>`
    : `Erfolg dieser Sitzung`;
  return `<div class="field ratingField">
    <label>Bewertung des Sitzungserfolgs (1–5)</label>
    <div class="ratingHint">${symLine} &nbsp;·&nbsp; 1 = keine Besserung … 5 = sehr starke Besserung</div>
    <div class="ratingScale">${buttons}</div>
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
    ${sessionRatingHtml('msession', i, s.rating)}
    <div class="field"><label>Anmerkung</label><textarea data-msession="${i}" data-key="note" enterkeyhint="done">${esc(s.note)}</textarea></div>
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
    const totalSessions = suggestion.freq * suggestion.weeks;
    const freqLabel = suggestion.freq >= 7
      ? 'täglich'
      : (suggestion.freq > 0 ? suggestion.freq+'×/Woche' : 'Keine automatische Empfehlung');
    const weeksLabel = suggestion.weeks >= 52
      ? 'dauerhaft empfohlen (≥ 12 Monate)'
      : suggestion.weeks + ' Wochen';
    html += `<div class="notice ok" style="margin-top:12px">
      <b>Empfehlung Stufenschema V1.4 – Stufe 3 (Erhaltung / Intensiv)</b> für <i>${esc(suggestion.diagnosis)}</i>:
      <div class="maintenanceParams">
        <div class="mpItem"><span class="mpLbl">Frequenz/Woche</span><span class="mpVal">${esc(freqLabel)}</span></div>
        <div class="mpItem"><span class="mpLbl">Dauer</span><span class="mpVal">${esc(weeksLabel)}</span></div>
        ${suggestion.hz && suggestion.hz !== '—' ? `<div class="mpItem"><span class="mpLbl">Frequenz (Hz)</span><span class="mpVal">${esc(suggestion.hz)}</span></div>` : ''}
        ${suggestion.intensity && suggestion.intensity !== '—' ? `<div class="mpItem"><span class="mpLbl">Intensität</span><span class="mpVal">${esc(suggestion.intensity)} %</span></div>` : ''}
        ${suggestion.duration && suggestion.duration !== '—' ? `<div class="mpItem"><span class="mpLbl">Dauer/Sitzung</span><span class="mpVal">${esc(suggestion.duration)} min</span></div>` : ''}
        ${suggestion.timing ? `<div class="mpItem"><span class="mpLbl">Tageszeit</span><span class="mpVal">${esc(suggestion.timing)}</span></div>` : ''}
      </div>
      <div class="smallMuted" style="margin-top:8px"><b>Begründung:</b> ${esc(suggestion.note)}</div>
      ${suggestion.warning ? `<div class="maintenanceWarn"><b>⚠️ Sicherheitshinweis:</b> ${esc(suggestion.warning)}</div>` : ''}
      ${totalSessions > 100 ? `<div class="smallMuted" style="margin-top:8px;font-style:italic">Hinweis: Die Empfehlung umfasst ${totalSessions} Erhaltungs-Sitzungen (Heimanwendung). Beim Übernehmen werden die Datumsfelder automatisch verteilt – Frequenz/Dauer können vor dem Übernehmen unten angepasst werden.</div>` : ''}
      ${suggestion.freq > 0 ? '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap"><button class="muted" id="applyMaintenanceSuggestion">Empfehlung übernehmen (Frequenz/Wochen)</button><button class="muted" id="applyMaintenanceFullSuggestion">Empfehlung komplett übernehmen (inkl. Hz/%/min)</button></div>' : ''}
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
   FORSCHUNGS-AUSWERTUNG (v2 – Übersichtliches Dashboard)
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

/* Ermittelt das initiale Hauptsymptom eines Patienten.
   Definition: die Beschwerde mit dem HÖCHSTEN Vor-Therapie-Wert (Evaluierung).
   Fällt zurück auf die erste angekreuzte Beschwerde bzw. die erste in der Liste,
   falls keine Vor-Werte vorhanden sind. Gibt null zurück, wenn gar nichts erfasst ist. */
function mainSymptomOf(p){
  const vals = p?.evaluierung?.values || {};
  let best = null, bestV = -1;
  symptoms.forEach(s => {
    const raw = vals[s];
    const num = (raw !== '' && raw !== undefined && raw !== null) ? Number(raw) : null;
    if(num !== null && !isNaN(num) && num > bestV){ bestV = num; best = s; }
  });
  if(best) return best;
  /* Kein numerischer Vor-Wert: erste erfasste Beschwerde (>0) oder erste der Liste */
  const anyMarked = symptoms.find(s => {
    const raw = vals[s];
    return raw !== '' && raw !== undefined && raw !== null;
  });
  return anyMarked || symptoms[0] || null;
}

function patientImprovement(p){
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
  const compScore = comparisonScore(p.ende?.overallComparison);
  const oldResultScore = endResultScore(p.ende?.result);
  const subjectiveScore = compScore !== null ? compScore : oldResultScore;
  if(symptomScore === null && subjectiveScore === null) return null;
  if(symptomScore === null) return subjectiveScore;
  if(subjectiveScore === null) return symptomScore;
  return Math.round(symptomScore * 0.6 + subjectiveScore * 0.4);
}

/* Häufigster Wert (Modus) in einem Array von Zahlen */
function modeOf(arr){
  if(!arr.length) return null;
  const freq = {};
  arr.forEach(v => { freq[v] = (freq[v]||0)+1; });
  return Number(Object.entries(freq).sort((a,b) => b[1]-a[1])[0][0]);
}

function patientSessionStats(p){
  const sessions = (p.planung?.sessions || []).filter(s => s.hz !== '' && s.hz !== undefined);
  if(!sessions.length) return null;
  const num = arr => arr.map(Number).filter(x => !isNaN(x));
  const avg = arr => arr.length ? arr.reduce((a,b)=>a+b,0) / arr.length : null;
  const hzVals  = num(sessions.map(s => String(s.hz).split(/[\/+,\s]/)[0]));
  const intVals = num(sessions.map(s => String(s.intensity).split(/[\/+,\u2013-]/)[0]));
  const durVals = num(sessions.map(s => String(s.duration).split(/[\/+,\u2013-]/)[0]));
  return {
    nSessions: sessions.length,
    /* avgHz / avgIntensity = Modus (häufigster Wert), damit Bin-Zuweisung zu etablierten
       Werten (0/10/20/30/40 Hz, 25/50/75/100 %) korrekt ist, kein Durchschnitt */
    avgHz:        modeOf(hzVals),
    avgIntensity: modeOf(intVals),
    /* Dauer und Sitzungsanzahl: Durchschnitt ist sinnvoll */
    avgDuration:  avg(durVals)
  };
}

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

function buildAnalysisDataset(){
  return db.patients
    .map(p => {
      const imp = patientImprovement(p);
      const ses = patientSessionStats(p);
      if(imp === null || ses === null) return null;
      const rstats = sessionRatingStats(p);
      return {
        id: p.id,
        diagnoses: p.anamnese?.diagnoses || [],
        improvement: imp,
        sessions: ses.nSessions,
        avgHz: ses.avgHz,
        avgIntensity: ses.avgIntensity,
        avgDuration: ses.avgDuration,
        avgRating: rstats ? Math.round(rstats.mean * 10) / 10 : null,
        ratedSessions: rstats ? rstats.n : 0,
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

/* === SITZUNGS-BEWERTUNGEN (1–5) → SESSION-LEVEL-DATENSATZ ===
   Jede durchgeführte/erfasste Sitzung MIT einer Erfolgs-Bewertung (rating 1–5)
   wird zu einem eigenen Datenpunkt: {diagnoses, hz, intensity, duration, rating}.
   Damit lässt sich – auch schon vor der End-Evaluierung – die Frage
   „welche Frequenz/Intensität/Dauer brachte den besten Sitzungserfolg?"
   datenbasiert beantworten. */
function buildSessionRatingDataset(){
  const rows = [];
  const firstNum = v => {
    const str = String(v ?? '').trim();
    if(str === '') return null;
    const n = Number(str.split(/[\/+,\u2013-]/)[0]);
    return isNaN(n) ? null : n;
  };
  db.patients.forEach(p => {
    const diags = p.anamnese?.diagnoses || [];
    const all = [...(p.planung?.sessions || []), ...((p.maintenance?.sessions) || [])];
    all.forEach(s => {
      const r = (s.rating !== '' && s.rating !== undefined && s.rating !== null) ? Number(s.rating) : null;
      if(r === null || isNaN(r)) return;
      rows.push({
        diagnoses: diags,
        hz:        firstNum(s.hz),
        intensity: firstNum(s.intensity),
        duration:  firstNum(s.duration),
        rating:    r
      });
    });
  });
  return rows;
}

/* Mittlere Sitzungs-Bewertung eines Patienten (für Patienten-Statistik / Übersicht) */
function sessionRatingStats(p){
  const all = [...(p.planung?.sessions || []), ...((p.maintenance?.sessions) || [])];
  const vals = all
    .map(s => (s.rating !== '' && s.rating !== undefined && s.rating !== null) ? Number(s.rating) : null)
    .filter(v => v !== null && !isNaN(v));
  if(!vals.length) return null;
  return {
    n: vals.length,
    mean: vals.reduce((a,b)=>a+b,0) / vals.length
  };
}

/* Findet den Bin (Hz/Int/Dauer) mit der höchsten mittleren Sitzungs-Bewertung.
   rows = Ausgabe von buildSessionRatingDataset (ggf. nach Diagnose gefiltert). */
function bestBinByRating(rows, key, bins){
  const grouped = {};
  bins.forEach(b => grouped[b.label] = []);
  rows.forEach(d => {
    const v = d[key];
    if(v === null || isNaN(v)) return;
    const bin = bins.find(b => v >= b.min && v < b.max);
    if(bin) grouped[bin.label].push(d.rating);
  });
  const cands = Object.entries(grouped)
    .map(([label, rs]) => ({label, n: rs.length, meanRating: rs.length ? rs.reduce((a,b)=>a+b,0)/rs.length : null}))
    .filter(x => x.n > 0);
  if(!cands.length) return null;
  cands.sort((a,b) => b.meanRating - a.meanRating);
  return cands[0];
}

function diagnosisCounts(dataset){
  const counts = {};
  dataset.forEach(d => {
    d.diagnoses.forEach(diag => {
      counts[diag] = (counts[diag] || 0) + 1;
    });
  });
  return counts;
}

function applyResearchFilters(dataset, filters){
  return dataset.filter(d => {
    if(filters.diagnosis && !d.diagnoses.includes(filters.diagnosis)) return false;
    if(filters.genders?.length && !filters.genders.includes(d.gender)) return false;
    if(filters.ageGroups?.length && !filters.ageGroups.includes(d.ageGroup)) return false;
    if(filters.minSessions != null && d.sessions < filters.minSessions) return false;
    if(filters.maxSessions != null && d.sessions > filters.maxSessions) return false;
    return true;
  });
}

function stats(values){
  values = values.filter(v => v !== null && !isNaN(v));
  if(!values.length) return {n:0,mean:0,median:0,sd:0,min:0,max:0};
  const sorted = [...values].sort((a,b) => a-b);
  const mean = values.reduce((a,b) => a+b, 0) / values.length;
  const median = sorted.length % 2 ? sorted[(sorted.length-1)/2] : (sorted[sorted.length/2-1] + sorted[sorted.length/2]) / 2;
  const variance = values.reduce((a,b) => a + (b-mean)**2, 0) / values.length;
  const sd = Math.sqrt(variance);
  return {n: values.length, mean, median, sd, min: sorted[0], max: sorted[sorted.length-1]};
}

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

const HZ_BINS = [
  {label:'0 Hz (CW)', min:0,   max:5},
  {label:'10 Hz',     min:5,   max:15},
  {label:'20 Hz',     min:15,  max:25},
  {label:'30 Hz',     min:25,  max:35},
  {label:'40 Hz',     min:35,  max:45},
  {label:'50 Hz',     min:45,  max:55},
  {label:'60 Hz',     min:55,  max:65},
  {label:'70 Hz',     min:65,  max:75},
  {label:'80 Hz',     min:75,  max:85},
  {label:'90 Hz',     min:85,  max:95},
  {label:'100 Hz',    min:95,  max:1000}
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
  {label:'5–9',   min:5,  max:10},
  {label:'10–19', min:10, max:20},
  {label:'≥20',   min:20, max:200}
];

function findOptimum(dataset, key, bins){
  const grouped = {};
  bins.forEach(b => grouped[b.label] = []);
  dataset.forEach(d => {
    const v = d[key];
    if(v === null || isNaN(v)) return;
    const bin = bins.find(b => v >= b.min && v < b.max);
    if(bin) grouped[bin.label].push(d.improvement);
  });
  return Object.entries(grouped)
    .map(([label, imps]) => ({
      label,
      n: imps.length,
      meanImprovement: imps.length ? imps.reduce((a,b) => a+b, 0) / imps.length : null
    }))
    .filter(x => x.n > 0);
}

function buildHeatmap(dataset){
  const cells = [];
  HZ_BINS.forEach((hz, hi) => {
    INT_BINS.forEach((it, ii) => {
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
  return {hzBins: HZ_BINS, intBins: INT_BINS, cells};
}

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

function exportResearchCSV(dataset){
  const headers = ['id_anon','diagnoses','age','ageGroup','gender','sessions','avgHz','avgIntensity','avgDuration','avgSessionRating','ratedSessions','plannedTotal','endResult','improvementPercent'];
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
    d.avgRating !== null && d.avgRating !== undefined ? d.avgRating.toFixed(1) : '',
    d.ratedSessions ?? 0,
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

/* ── Farb-Hilfsfunktionen für Charts ── */
function impColor(val, alpha){
  alpha = alpha || 1;
  if(val === null) return `rgba(180,180,180,${alpha})`;
  if(val > 10)  return `rgba(0,122,83,${alpha})`;
  if(val < -10) return `rgba(180,42,42,${alpha})`;
  return `rgba(107,114,128,${alpha})`;
}
function heatColorRgb(imp, n){
  if(imp === null || n === 0) return 'rgba(236,236,236,1)';
  if(n < 2) return 'rgba(220,220,220,1)';
  const clamped = Math.max(-50, Math.min(50, imp));
  if(clamped > 5){
    const t = (clamped - 5) / 45;
    return `rgb(${Math.round(124-111*t)},${Math.round(195-88*t)},${Math.round(110-50*t)})`;
  } else if(clamped < -5){
    const t = (-clamped - 5) / 45;
    return `rgb(${Math.round(220-67*t)},${Math.round(89-57*t)},${Math.round(89-57*t)})`;
  }
  return 'rgb(184,184,184)';
}

/* ── Alle Chart.js-Instanzen beim Re-Render zerstören ── */
const _researchCharts = {};
function destroyChart(id){
  if(_researchCharts[id]){ _researchCharts[id].destroy(); delete _researchCharts[id]; }
}

let researchFilters = {
  diagnosis: null,
  genders: [],
  ageGroups: [],
  minSessions: null,
  maxSessions: null
};
let researchSelectedDiag = null;

/* ─── HAUPT-RENDER ─── */
function renderResearchPanel(){
  const panel = document.querySelector('[data-panel="forschung"]');
  if(!panel) return;

  const dataset = buildAnalysisDataset();
  const total = db.patients.length;
  const evaluable = dataset.length;
  const counts = diagnosisCounts(dataset);
  const sortedDiags = Object.entries(counts).sort((a,b) => b[1]-a[1]);
  const filtered = applyResearchFilters(dataset, researchFilters);

  const genderCounts = {männlich:0, weiblich:0};
  db.patients.forEach(p => {
    const g = genderNorm(p.stamm?.gender);
    if(genderCounts[g] !== undefined) genderCounts[g]++;
  });
  const datasetGenderCounts = {männlich:0, weiblich:0};
  dataset.forEach(d => {
    if(datasetGenderCounts[d.gender] !== undefined) datasetGenderCounts[d.gender]++;
  });
  const allAgeGroups = db.patients.map(p => ageGroup(patientAge(p))).filter(g => g && g !== '?');
  const availAgeGroups = [...new Set(allAgeGroups)].sort();

  /* ── Alle bestehenden Charts zerstören ── */
  ['chartImprovementDist','chartByDiagnosis','chartHz','chartIntensity','chartDuration','chartSessions','chartGender','chartAge'].forEach(destroyChart);

  /* ── LEER-ZUSTAND ── */
  if(evaluable < 1){
    panel.innerHTML = `
      <div class="r2-header">
        <h2>📊 Forschungs-Auswertung</h2>
        <p class="r2-sub">Noch keine auswertbaren Patienten. Ein Patient gilt als auswertbar, wenn er mindestens 1 Beschwerde-Skala vor <em>und</em> nach der Therapie ausgefüllt hat und mindestens eine Sitzung mit Hz-Wert dokumentiert wurde.</p>
      </div>
      <div class="r2-empty">
        <div class="r2-emptyIcon">📂</div>
        <p>Sobald Patienten abgeschlossen sind, erscheinen hier automatisch Grafiken und Tabellen.</p>
      </div>`;
    return;
  }

  /* ── KPI-LEISTE ── */
  const impAll = stats(filtered.map(d => d.improvement));
  const successRate = filtered.length ? Math.round(filtered.filter(d => d.improvement > 10).length / filtered.length * 100) : 0;
  const noChangeRate = filtered.length ? Math.round(filtered.filter(d => Math.abs(d.improvement) <= 10).length / filtered.length * 100) : 0;
  const worseRate = filtered.length ? Math.round(filtered.filter(d => d.improvement < -10).length / filtered.length * 100) : 0;

  const filterLabel = researchFilters.diagnosis
    ? `<span class="r2-filterActive">Diagnose: <b>${esc(researchFilters.diagnosis)}</b></span>`
    : '<span class="r2-filterNone">Alle Diagnosen</span>';

  panel.innerHTML = `
  <!-- ╔══ KOPF ══╗ -->
  <div class="r2-header">
    <div>
      <h2>📊 Forschungs-Auswertung</h2>
      <p class="r2-sub">Aggregierte Live-Analyse · ${total} Patient${total!==1?'en':''} in der Kartei · ${evaluable} auswertbar</p>
    </div>
    <div class="r2-headerBtns no-print">
      <button class="muted r2-smallBtn" id="printResearchBtn">🖨️ Drucken</button>
      <button class="muted r2-smallBtn" id="exportResearchCSV">CSV</button>
      <button class="muted r2-smallBtn" id="exportResearchJSON">JSON</button>
    </div>
  </div>

  <!-- ╔══ FILTER ══╗ -->
  <div class="r2-section no-print">
    <div class="r2-sectionHead">
      <span class="r2-sectionIcon">🔎</span>
      <h3>Filter ${filterLabel}</h3>
      <button class="muted r2-smallBtn" id="resetFiltersBtn">↺ Zurücksetzen</button>
    </div>
    <div class="r2-filterGrid">
      <div class="r2-filterCol r2-filterColFull">
        <div class="r2-filterLabel">Diagnose <span class="r2-filterHint">— alle bekannten Diagnosen · grau = noch keine auswertbaren Daten</span></div>
        <div class="r2-chips r2-chipsWrap">
          <span class="r2-chip ${!researchFilters.diagnosis?'r2-chipActive':''}" data-filter="diagnosis" data-value="">Alle <em>${evaluable}</em></span>
          ${diagnoses.map(d => {
            const n = counts[d] || 0;
            const hasData = n > 0;
            const active = d === researchFilters.diagnosis;
            if(hasData){
              return `<span class="r2-chip ${active?'r2-chipActive':''}" data-filter="diagnosis" data-value="${esc(d)}" title="${n} auswertbare Patient${n!==1?'en':''} mit dieser Diagnose">${esc(d)} <em>(${n})</em></span>`;
            } else {
              return `<span class="r2-chip r2-chipEmpty" data-filter="diagnosis" data-value="" data-nodata="1" title="Zu wenig Daten – noch keine abgeschlossenen Patienten mit dieser Diagnose">${esc(d)} <em>(0)</em></span>`;
            }
          }).join('')}
        </div>
      </div>
      <div class="r2-filterCol r2-filterColFull r2-filterColSecondary">
        <div class="r2-filterRow">
          <div>
            <div class="r2-filterLabel">Geschlecht</div>
            <div class="r2-chips">
              ${['männlich','weiblich'].map(g => {
                const active = researchFilters.genders.includes(g);
                return `<span class="r2-chip ${active?'r2-chipActive':''}" data-filter="gender" data-value="${g}">${g} <em>${genderCounts[g]||0}</em></span>`;
              }).join('')}
            </div>
          </div>
          ${availAgeGroups.length ? `
          <div>
            <div class="r2-filterLabel">Altersgruppe</div>
            <div class="r2-chips">
              ${availAgeGroups.map(g => {
                const active = researchFilters.ageGroups.includes(g);
                const n = allAgeGroups.filter(x=>x===g).length;
                return `<span class="r2-chip ${active?'r2-chipActive':''}" data-filter="ageGroup" data-value="${g}">${g} <em>${n}</em></span>`;
              }).join('')}
            </div>
          </div>` : ''}
          <div>
            <div class="r2-filterLabel">Sitzungsanzahl</div>
            <div class="r2-chips">
              ${[['all','Alle',null,null],['1-5','1–5 Sitz.',1,5],['6-10','6–10 Sitz.',6,10],['11-20','11–20 Sitz.',11,20],['21+','21+ Sitz.',21,null]].map(([v,lbl,mn,mx]) => {
                const active = (mn===researchFilters.minSessions && mx===researchFilters.maxSessions) || (v==='all' && researchFilters.minSessions===null && researchFilters.maxSessions===null);
                return `<span class="r2-chip ${active?'r2-chipActive':''}" data-filter="sessions" data-value="${v}">${lbl}</span>`;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ╔══ KPI-KARTEN ══╗ -->
  <div class="r2-kpiRow">
    <div class="r2-kpi">
      <div class="r2-kpiVal" style="color:${impAll.mean>10?'#007a53':impAll.mean<-10?'#b42a2a':'#6b7280'}">${filtered.length?((impAll.mean>0?'+':'')+Math.round(impAll.mean)+'%'):'–'}</div>
      <div class="r2-kpiLbl">Ø Verbesserung</div>
      <div class="r2-kpiSub">Median ${filtered.length?Math.round(impAll.median)+'%':'–'}</div>
    </div>
    <div class="r2-kpi">
      <div class="r2-kpiVal" style="color:#007a53">${successRate}%</div>
      <div class="r2-kpiLbl">Erfolgsquote</div>
      <div class="r2-kpiSub">&gt;10% Verbesserung</div>
    </div>
    <div class="r2-kpi">
      <div class="r2-kpiVal" style="color:#6b7280">${noChangeRate}%</div>
      <div class="r2-kpiLbl">Unverändert</div>
      <div class="r2-kpiSub">±10%</div>
    </div>
    <div class="r2-kpi">
      <div class="r2-kpiVal" style="color:#b42a2a">${worseRate}%</div>
      <div class="r2-kpiLbl">Verschlechtert</div>
      <div class="r2-kpiSub">&lt;−10%</div>
    </div>
    <div class="r2-kpi">
      <div class="r2-kpiVal">${filtered.length}</div>
      <div class="r2-kpiLbl">Patienten</div>
      <div class="r2-kpiSub">in dieser Auswahl</div>
    </div>
  </div>

  ${filtered.length < 1 ? `<div class="r2-warn">⚠️ Keine Patienten entsprechen den Filterkriterien.</div>` : `

  <!-- ╔══ BEST-THERAPIE-FINDER ══╗ -->
  <div class="r2-section r2-finder" id="r2FinderSection">
    <div class="r2-sectionHead"><span class="r2-sectionIcon">🎯</span><h3>Optimale Therapie — Schnell-Übersicht</h3></div>
    <p class="r2-sub" style="margin-bottom:12px">Die datenbasierte Empfehlung aus der gefilterten Patientengruppe. Aktualisiert sich automatisch mit jeder neuen Sitzung in der Kartei.</p>
    <div id="r2FinderCards" class="r2-finderGrid"></div>
  </div>

  <!-- ╔══ ZEILE 1: Verbesserungs-Verteilung + Diagnose-Vergleich ══╗ -->
  <div class="r2-row2">
    <div class="r2-card">
      <div class="r2-cardHead">📈 Verbesserungs-Verteilung</div>
      <div class="r2-cardSub">Wie viele Patienten haben wie stark profitiert?</div>
      <div class="r2-chartWrap"><canvas id="chartImprovementDist"></canvas></div>
    </div>
    <div class="r2-card">
      <div class="r2-cardHead">🏥 Verbesserung nach Diagnose</div>
      <div class="r2-cardSub">Ø Verbesserung je Diagnose (alle auswertbaren Patienten)</div>
      <div class="r2-chartWrap"><canvas id="chartByDiagnosis"></canvas></div>
    </div>
  </div>

  <!-- ╔══ ZEILE 2: Optimale Parameter ══╗ -->
  <div class="r2-section">
    <div class="r2-sectionHead"><span class="r2-sectionIcon">⚙️</span><h3>Optimale Therapie-Parameter</h3></div>
    <p class="r2-sub" style="margin-bottom:12px">Für die gefilterte Auswahl: welcher Parameter-Bereich liefert die höchste mittlere Verbesserung? ⭐ = bestes Ergebnis.</p>
    <div class="r2-paramGrid">
      <div class="r2-card">
        <div class="r2-cardHead">🔊 Frequenz (Hz)</div>
        <div class="r2-chartWrap r2-chartMedium"><canvas id="chartHz"></canvas></div>
      </div>
      <div class="r2-card">
        <div class="r2-cardHead">💡 Intensität (%)</div>
        <div class="r2-chartWrap r2-chartMedium"><canvas id="chartIntensity"></canvas></div>
      </div>
      <div class="r2-card">
        <div class="r2-cardHead">⏱️ Sitzungsdauer</div>
        <div class="r2-chartWrap r2-chartMedium"><canvas id="chartDuration"></canvas></div>
      </div>
      <div class="r2-card">
        <div class="r2-cardHead">🔁 Anzahl Sitzungen</div>
        <div class="r2-chartWrap r2-chartMedium"><canvas id="chartSessions"></canvas></div>
      </div>
    </div>
  </div>

  <!-- ╔══ ZEILE 3: Heatmap ══╗ -->
  <div class="r2-section">
    <div class="r2-sectionHead"><span class="r2-sectionIcon">🌡️</span><h3>Heatmap: Frequenz × Intensität</h3></div>
    <p class="r2-sub" style="margin-bottom:10px">Grün = Verbesserung · Rot = Verschlechterung · Grau = keine Daten. Zahl in Klammern = Patientenanzahl in dieser Kombination.</p>
    <div class="r2-hmWrap" id="r2Heatmap"></div>
  </div>

  <!-- ╔══ ZEILE 4: Subgruppen ══╗ -->
  <div class="r2-row2">
    <div class="r2-card">
      <div class="r2-cardHead">⚧️ Verbesserung nach Geschlecht</div>
      <div class="r2-chartWrap r2-chartMedium"><canvas id="chartGender"></canvas></div>
    </div>
    <div class="r2-card">
      <div class="r2-cardHead">📅 Verbesserung nach Altersgruppe</div>
      <div class="r2-chartWrap r2-chartMedium"><canvas id="chartAge"></canvas></div>
    </div>
  </div>

  <!-- ╔══ ZEILE 5: Korrelationen + Tabelle ══╗ -->
  <div class="r2-section">
    <div class="r2-sectionHead"><span class="r2-sectionIcon">📐</span><h3>Korrelationen mit Therapieerfolg</h3></div>
    <p class="r2-sub" style="margin-bottom:10px">Pearson r: Werte nahe ±1 zeigen starke Zusammenhänge. Nur richtungsweisend – kein Kausalitätsnachweis.</p>
    <div class="r2-corrGrid" id="r2CorrCards"></div>
  </div>

  <!-- ╔══ DATEN-TABELLE ══╗ -->
  <div class="r2-section">
    <div class="r2-sectionHead"><span class="r2-sectionIcon">📋</span><h3>Diagnose-Übersicht (Tabelle)</h3></div>
    <div class="r2-tableWrap" id="r2DiagTable"></div>
  </div>

  <!-- ╔══ HINWEISE ══╗ -->
  <div class="r2-warn r2-warnInfo" style="margin-top:16px">
    ℹ️ <b>Hinweise zur Interpretation:</b>
    Korrelation ≠ Kausalität · Bei n &lt; 5 pro Zelle/Gruppe sind Werte nicht aussagekräftig ·
    Erst ab ca. 30 Patienten je Diagnose werden Trends wissenschaftlich verwertbar ·
    Diese Auswertung ist ein Hypothesen-Generator für die eigene Praxis, kein Ersatz für kontrollierte Studien.
  </div>

  `}

  <!-- Export-Leiste unten -->
  <div class="r2-exportBar no-print">
    <button class="primary" id="printResearchBtn2">🖨️ Auswertung drucken</button>
    <button class="muted" id="exportResearchCSV2">📥 CSV-Export (anon.)</button>
    <button class="muted" id="exportResearchJSON2">📥 JSON-Export (anon.)</button>
  </div>
  `;

  /* ── Filter-Events ── */
  panel.querySelectorAll('.r2-chip').forEach(c => {
    c.onclick = () => {
      /* Chips ohne Daten: kurze Rückmeldung, kein Filter-Wechsel */
      if(c.dataset.nodata === '1'){
        showToast('Noch keine auswertbaren Patienten mit dieser Diagnose');
        return;
      }
      const f = c.dataset.filter, v = c.dataset.value;
      if(f === 'diagnosis'){
        researchFilters.diagnosis = (v === '' ? null : v);
      } else if(f === 'gender'){
        const idx = researchFilters.genders.indexOf(v);
        if(idx >= 0) researchFilters.genders.splice(idx,1); else researchFilters.genders.push(v);
      } else if(f === 'ageGroup'){
        const idx = researchFilters.ageGroups.indexOf(v);
        if(idx >= 0) researchFilters.ageGroups.splice(idx,1); else researchFilters.ageGroups.push(v);
      } else if(f === 'sessions'){
        if(v==='all'){researchFilters.minSessions=null;researchFilters.maxSessions=null;}
        else if(v==='1-5'){researchFilters.minSessions=1;researchFilters.maxSessions=5;}
        else if(v==='6-10'){researchFilters.minSessions=6;researchFilters.maxSessions=10;}
        else if(v==='11-20'){researchFilters.minSessions=11;researchFilters.maxSessions=20;}
        else if(v==='21+'){researchFilters.minSessions=21;researchFilters.maxSessions=null;}
      }
      renderResearchPanel();
    };
  });
  const resetBtn = panel.querySelector('#resetFiltersBtn');
  if(resetBtn) resetBtn.onclick = () => { researchFilters={diagnosis:null,genders:[],ageGroups:[],minSessions:null,maxSessions:null}; renderResearchPanel(); };

  /* Export-Buttons (oben + unten) */
  ['exportResearchCSV','exportResearchCSV2'].forEach(id => {
    const b = panel.querySelector('#'+id); if(b) b.onclick = () => exportResearchCSV(filtered);
  });
  ['exportResearchJSON','exportResearchJSON2'].forEach(id => {
    const b = panel.querySelector('#'+id); if(b) b.onclick = () => exportResearchJSON(filtered);
  });
  ['printResearchBtn','printResearchBtn2'].forEach(id => {
    const b = panel.querySelector('#'+id); if(b) b.onclick = () => doResearchPrint();
  });

  if(filtered.length < 1) return;

  /* ═══════════════════════════════════════════════
     CHART 1: Verbesserungs-Verteilung (Histogramm)
     ═══════════════════════════════════════════════ */
  const impBins = [
    {label:'< −30%', min:-200, max:-30},
    {label:'−30 bis −10%', min:-30, max:-10},
    {label:'−10 bis +10%', min:-10, max:10},
    {label:'+10 bis +30%', min:10, max:30},
    {label:'+30 bis +50%', min:30, max:50},
    {label:'> +50%', min:50, max:200}
  ];
  const impBinCounts = impBins.map(b => filtered.filter(d => d.improvement >= b.min && d.improvement < b.max).length);
  const impBinColors = impBins.map(b => {
    if(b.max <= -10) return 'rgba(180,42,42,0.85)';
    if(b.min >= 10) return 'rgba(0,122,83,0.85)';
    return 'rgba(107,114,128,0.75)';
  });
  const ctx1 = document.getElementById('chartImprovementDist');
  if(ctx1){
    _researchCharts['chartImprovementDist'] = new Chart(ctx1, {
      type:'bar',
      data:{
        labels: impBins.map(b=>b.label),
        datasets:[{label:'Patienten', data: impBinCounts, backgroundColor: impBinColors, borderRadius:6, borderSkipped:false}]
      },
      options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.raw} Patient${c.raw!==1?'en':''}`}}},scales:{y:{beginAtZero:true,ticks:{stepSize:1},title:{display:true,text:'Anzahl Patienten'}},x:{ticks:{font:{size:11}}}}}
    });
  }

  /* ═══════════════════════════════════════════════
     CHART 2: Verbesserung nach Diagnose
     ═══════════════════════════════════════════════ */
  const diagData = sortedDiags.map(([d]) => {
    const sub = dataset.filter(x => x.diagnoses.includes(d));
    const s = stats(sub.map(x => x.improvement));
    return {diag: d, mean: s ? Math.round(s.mean) : null, n: sub.length};
  }).filter(x => x.mean !== null).sort((a,b) => b.mean - a.mean);
  const ctx2 = document.getElementById('chartByDiagnosis');
  if(ctx2 && diagData.length){
    _researchCharts['chartByDiagnosis'] = new Chart(ctx2, {
      type:'bar',
      data:{
        labels: diagData.map(d => d.diag),
        datasets:[{
          label:'Ø Verbesserung (%)',
          data: diagData.map(d => d.mean),
          backgroundColor: diagData.map(d => impColor(d.mean, 0.8)),
          borderRadius:6, borderSkipped:false
        }]
      },
      options:{
        indexAxis:'y', responsive:true, maintainAspectRatio:true,
        plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.raw>0?'+':''}${c.raw}% (n=${diagData[c.dataIndex].n})`}}},
        scales:{x:{title:{display:true,text:'Ø Verbesserung (%)'}},y:{ticks:{font:{size:11}}}}
      }
    });
  }

  /* ═══════════════════════════════════════════════
     CHARTS 3–6: Optimum-Parameter (Bar Charts)
     ═══════════════════════════════════════════════ */
  function drawParamChart(canvasId, title, opt){
    const ctx = document.getElementById(canvasId);
    if(!ctx || !opt.length) return;
    const best = opt.reduce((a,b) => (b.meanImprovement??-999) > (a.meanImprovement??-999) ? b : a, opt[0]);
    _researchCharts[canvasId] = new Chart(ctx, {
      type:'bar',
      data:{
        labels: opt.map(o => o.label + (o===best?' ⭐':'')),
        datasets:[{
          label:'Ø Verbesserung (%)',
          data: opt.map(o => o.meanImprovement !== null ? Math.round(o.meanImprovement) : null),
          backgroundColor: opt.map(o => o===best ? 'rgba(0,122,83,0.9)' : impColor(o.meanImprovement, 0.7)),
          borderRadius:6, borderSkipped:false
        }]
      },
      options:{
        responsive:true, maintainAspectRatio:true,
        plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.raw>0?'+':''}${c.raw}% (n=${opt[c.dataIndex].n})`}}},
        scales:{y:{title:{display:true,text:'Ø Verbess. (%)'}},x:{ticks:{font:{size:10},maxRotation:45}}}
      }
    });
  }
  drawParamChart('chartHz',        'Frequenz (Hz)',        findOptimum(filtered,'avgHz',HZ_BINS));
  drawParamChart('chartIntensity', 'Intensität (%)',       findOptimum(filtered,'avgIntensity',INT_BINS));
  drawParamChart('chartDuration',  'Sitzungsdauer (min)', findOptimum(filtered,'avgDuration',DUR_BINS));
  drawParamChart('chartSessions',  'Anzahl Sitzungen',    findOptimum(filtered,'sessions',SES_BINS));

  /* ═══════════════════════════════════════════════
     HEATMAP (HTML-basiert, wie vorher, aber klarer)
     ═══════════════════════════════════════════════ */
  const hm = buildHeatmap(filtered);
  const hmEl = document.getElementById('r2Heatmap');
  if(hmEl){
    let hmHtml = `<div class="r2-hm" style="grid-template-columns:100px repeat(${hm.intBins.length},1fr)">`;
    hmHtml += `<div class="r2-hmCorner">Hz \\ Int.</div>`;
    hm.intBins.forEach(b => hmHtml += `<div class="r2-hmHead">${esc(b.label)}</div>`);
    hm.hzBins.forEach((hz, hi) => {
      hmHtml += `<div class="r2-hmRowLabel">${esc(hz.label)}</div>`;
      hm.intBins.forEach((it, ii) => {
        const cell = hm.cells.find(c => c.row===hi && c.col===ii);
        const bg = heatColorRgb(cell.meanImprovement, cell.n);
        const txtCol = (cell.meanImprovement !== null && Math.abs(cell.meanImprovement)>5 && cell.n>=2) ? '#fff' : '#333';
        hmHtml += `<div class="r2-hmCell" style="background:${bg};color:${txtCol}">
          ${cell.meanImprovement !== null ? (cell.meanImprovement>0?'+':'')+cell.meanImprovement+'%' : ''}
          <span class="r2-hmN" style="color:${txtCol}">${cell.n>0?'n='+cell.n:''}</span>
        </div>`;
      });
    });
    hmHtml += `</div>`;
    hmEl.innerHTML = hmHtml;
  }

  /* ═══════════════════════════════════════════════
     CHARTS 7–8: Subgruppen (Geschlecht, Alter)
     ═══════════════════════════════════════════════ */
  const subg = subgroupAnalysis(filtered);
  function drawSubChart(canvasId, data){
    const ctx = document.getElementById(canvasId);
    if(!ctx || !data.length) return;
    _researchCharts[canvasId] = new Chart(ctx, {
      type:'bar',
      data:{
        labels: data.map(d=>d.label+' (n='+d.n+')'),
        datasets:[{
          label:'Ø Verbesserung (%)',
          data: data.map(d=>d.mean),
          backgroundColor: data.map(d=>impColor(d.mean,0.8)),
          borderRadius:6, borderSkipped:false
        }]
      },
      options:{
        responsive:true, maintainAspectRatio:true,
        plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.raw>0?'+':''}${c.raw}%`}}},
        scales:{y:{title:{display:true,text:'Ø Verbess. (%)'},beginAtZero:false},x:{ticks:{font:{size:12}}}}
      }
    });
  }
  drawSubChart('chartGender', subg.gender);
  drawSubChart('chartAge',    subg.age);

  /* ═══════════════════════════════════════════════
     KORRELATIONS-KARTEN
     ═══════════════════════════════════════════════ */
  const validHzData   = filtered.filter(d => d.avgHz !== null);
  const validIntData  = filtered.filter(d => d.avgIntensity !== null);
  const validDurData  = filtered.filter(d => d.avgDuration !== null);
  const corrItems = [
    {label:'Frequenz (Hz)',         r: pearsonCorrelation(validHzData.map(d=>d.avgHz),  validHzData.map(d=>d.improvement))},
    {label:'Intensität (%)',         r: pearsonCorrelation(validIntData.map(d=>d.avgIntensity), validIntData.map(d=>d.improvement))},
    {label:'Sitzungsdauer (min)',    r: pearsonCorrelation(validDurData.map(d=>d.avgDuration),  validDurData.map(d=>d.improvement))},
    {label:'Anzahl Sitzungen',       r: pearsonCorrelation(filtered.map(d=>d.sessions), filtered.map(d=>d.improvement))}
  ];
  const corrEl = document.getElementById('r2CorrCards');
  if(corrEl){
    corrEl.innerHTML = corrItems.map(item => {
      const r = item.r;
      if(r === null) return `<div class="r2-corrCard r2-corrNeutral"><div class="r2-corrVal">–</div><div class="r2-corrLbl">${esc(item.label)}</div><div class="r2-corrInterp">Zu wenige Daten</div></div>`;
      const abs = Math.abs(r);
      let interp, cls;
      if(abs < 0.1){ interp='kein Zusammenhang'; cls='r2-corrNeutral'; }
      else if(abs < 0.3){ interp='sehr schwach'; cls=r>0?'r2-corrPos':'r2-corrNeg'; }
      else if(abs < 0.5){ interp='schwach'; cls=r>0?'r2-corrPos':'r2-corrNeg'; }
      else if(abs < 0.7){ interp='mittel'; cls=r>0?'r2-corrPos':'r2-corrNeg'; }
      else { interp='stark'; cls=r>0?'r2-corrPos':'r2-corrNeg'; }
      if(r > 0.1) interp += ' · mehr = besser';
      else if(r < -0.1) interp += ' · mehr = schlechter';
      return `<div class="r2-corrCard ${cls}"><div class="r2-corrVal">${r.toFixed(2)}</div><div class="r2-corrLbl">${esc(item.label)}</div><div class="r2-corrInterp">${interp}</div></div>`;
    }).join('');
  }

  /* ═══════════════════════════════════════════════
     BEST-THERAPIE-FINDER
     ═══════════════════════════════════════════════ */
  const finderEl = document.getElementById('r2FinderCards');
  if(finderEl && filtered.length >= 1){
    /* Bestes Hz-Bin */
    const hzOpt = findOptimum(filtered, 'avgHz', HZ_BINS);
    const intOpt = findOptimum(filtered, 'avgIntensity', INT_BINS);
    const durOpt = findOptimum(filtered, 'avgDuration', DUR_BINS);
    const sesOpt = findOptimum(filtered, 'sessions', SES_BINS);

    function bestBin(opt){
      if(!opt.length) return null;
      return opt.filter(o => o.n >= 1).reduce((a,b) => (b.meanImprovement??-999) > (a.meanImprovement??-999) ? b : a, opt[0]);
    }
    const bHz  = bestBin(hzOpt);
    const bInt = bestBin(intOpt);
    const bDur = bestBin(durOpt);
    const bSes = bestBin(sesOpt);

    /* Gesamterfolg der besten Kombination schätzen */
    const topImp = impAll.mean;
    const topColor = topImp > 20 ? '#007a53' : topImp > 5 ? '#2a7fc0' : '#6b7280';

    const diagLabel = researchFilters.diagnosis ? `<b>${esc(researchFilters.diagnosis)}</b>` : 'alle Diagnosen';

    function finderCard(icon, label, value, n, imp){
      const hasData = value && n >= 1;
      const impStr = imp !== null && imp !== undefined ? `Ø ${imp>0?'+':''}${Math.round(imp)}% Verbesserung` : '';
      return `<div class="r2-finderCard">
        <div class="r2-finderIcon">${icon}</div>
        <div class="r2-finderLabel">${label}</div>
        <div class="r2-finderVal">${hasData ? esc(value) : '–'}</div>
        ${hasData && n ? `<div class="r2-finderN">n=${n} Patienten</div>` : ''}
        ${hasData && impStr ? `<div class="r2-finderImp" style="color:${imp>10?'#007a53':imp<-5?'#b42a2a':'#6b7280'}">${impStr}</div>` : ''}
      </div>`;
    }

    finderEl.innerHTML = `
      <div class="r2-finderBanner">
        Datengrundlage: <b>${filtered.length} Patient${filtered.length!==1?'en':''}</b> · ${diagLabel}
        · Ø Gesamtverbesserung: <b style="color:${topColor}">${topImp>0?'+':''}${Math.round(topImp)}%</b>
      </div>
      ${finderCard('🔊', 'Beste Frequenz', bHz?.label, bHz?.n, bHz?.meanImprovement)}
      ${finderCard('💡', 'Beste Intensität', bInt?.label, bInt?.n, bInt?.meanImprovement)}
      ${finderCard('⏱️', 'Beste Dauer', bDur?.label, bDur?.n, bDur?.meanImprovement)}
      ${finderCard('🔁', 'Optimale Sitzungsanzahl', bSes?.label, bSes?.n, bSes?.meanImprovement)}
    `;
  }

  /* ═══════════════════════════════════════════════
     DIAGNOSE-ÜBERSICHTSTABELLE
     ═══════════════════════════════════════════════ */
  const diagTableEl = document.getElementById('r2DiagTable');
  if(diagTableEl){
    const rows = sortedDiags.map(([d, n]) => {
      const sub = dataset.filter(x => x.diagnoses.includes(d));
      const s = stats(sub.map(x => x.improvement));
      if(!s || !s.n) return '';
      const mean = Math.round(s.mean);
      const sr = Math.round(sub.filter(x=>x.improvement>10).length/sub.length*100);
      const avgHz = stats(sub.filter(x=>x.avgHz!==null).map(x=>x.avgHz));
      const avgInt = stats(sub.filter(x=>x.avgIntensity!==null).map(x=>x.avgIntensity));
      const avgDur = stats(sub.filter(x=>x.avgDuration!==null).map(x=>x.avgDuration));
      const col = mean>10?'#007a53':mean<-10?'#b42a2a':'#6b7280';
      return `<tr>
        <td><b>${esc(d)}</b></td>
        <td class="r2-tNum">${n}</td>
        <td class="r2-tNum" style="color:${col};font-weight:700">${mean>0?'+':''}${mean}%</td>
        <td class="r2-tNum">${sr}%</td>
        <td class="r2-tNum">${avgHz ? Math.round(avgHz.mean)+' Hz' : '–'}</td>
        <td class="r2-tNum">${avgInt ? Math.round(avgInt.mean)+'%' : '–'}</td>
        <td class="r2-tNum">${avgDur ? Math.round(avgDur.mean)+' min' : '–'}</td>
      </tr>`;
    }).join('');
    diagTableEl.innerHTML = `<table class="r2-table">
      <colgroup>
        <col style="width:30%">
        <col style="width:8%">
        <col style="width:12%">
        <col style="width:13%">
        <col style="width:12%">
        <col style="width:13%">
        <col style="width:12%">
      </colgroup>
      <thead><tr>
        <th>Diagnose</th>
        <th class="r2-tNum">n</th>
        <th class="r2-tNum">Ø Verbess.</th>
        <th class="r2-tNum">Erfolgsquote</th>
        <th class="r2-tNum">Ø Hz</th>
        <th class="r2-tNum">Ø Intensität</th>
        <th class="r2-tNum">Ø Dauer</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }
}

function doResearchPrint(){
  const dt = new Date();
  document.getElementById('printDate').textContent = 'Forschungs-Auswertung · '+dt.toLocaleDateString('de-DE')+' '+dt.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
  showPrintConfirm('research');
}

/* ============================================================
   ENDE FORSCHUNGS-AUSWERTUNG
   ============================================================ */





/* ---------- PANELS ---------- */
function q(panel){ return document.querySelector('[data-panel="'+panel+'"]'); }

function renderPanels(){
  document.querySelectorAll('[data-panel]').forEach(s => s.classList.toggle('hidden', s.dataset.panel !== activeTab));
  const p = cur();

  if(q('stamm') && p){
    const currentGender = (p.stamm?.gender || '').toLowerCase().trim();
    const isM = currentGender.startsWith('m');
    const isW = currentGender.startsWith('w') || currentGender.startsWith('f');
    /* Sitzungs-Nr. entfernt */
    q('stamm').innerHTML = `<h2>📋 Stammdaten</h2>
      <div class="grid">
        ${input('stamm.date','Datum','date')}
        ${input('stamm.name','Name, Vorname')}
        ${input('stamm.birth','Geburtsdatum','date')}
        ${input('stamm.doctor','Behandelnde/r Arzt / Therapeut')}
        ${input('stamm.facility','Einrichtung / Praxis')}
      </div>
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
      </div>`;
  }

  if(q('anamnese') && p){
    q('anamnese').innerHTML = `<h2>📝 Anamnese</h2>

      <h3>Diagnostizierte Vorerkrankungen <span class="smallMuted" style="font-weight:400; font-size:14px">– vom Arzt einzuschätzen</span></h3>
      <p class="smallMuted" style="margin:-4px 0 8px">Nur durch behandelnde Ärztin/Arzt vergebene Diagnosen ankreuzen. Diese fließen optional in die statistische Forschungs-Auswertung ein (siehe Filter dort).</p>
      ${chips('anamnese.diagnoses',diagnoses)}
      ${textarea('anamnese.otherDiag','Sonstige Diagnosen')}
      ${textarea('anamnese.meds','Aktuelle Medikation')}
      ${textarea('anamnese.notes','Anamnese-Anmerkungen')}`;
  }

  if(q('evaluierung') && p){
    q('evaluierung').innerHTML = evalFull('evaluierung','📊 Evaluierung vor Therapie','Vollständiger Ausgangsfragebogen: Beschwerden, Schlaf/Stimmung und vegetative Symptome. Die End-Evaluierung enthält exakt dieselben Felder für den Vergleich.');
  }

  if(q('planung') && p){
    q('planung').innerHTML = `<h2>📅 Therapieplanung</h2>
      <div class="grid">
        ${input('planung.start','Therapiebeginn','date')}
        ${input('planung.total','Geplante Sitzungen gesamt','number')}
      </div>
      <div class="topBtns">
        <button class="muted" id="refreshSessions">Sitzungsfenster aktualisieren</button>
        <button class="primary" id="applyProtocol">Vorschlag aus Diagnose übernehmen</button>
        ${(db.settings.refPdfData || db.settings.refPdfUrl) ? `<button class="muted" id="openRefPdfPlan">📄 Weber Referenz-PDF öffnen</button>` : ''}
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

  if(q('ende') && p){
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
      <button class="backToStartBtn" id="backToStartEval" type="button">← Zurück zur Anfangsevaluierung (korrigieren)</button>
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

  if(q('auswertung') && p){
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
      <h3>Referenz-Datei (Weber Therapy Book / Stufenschema)</h3>
      <p class="smallMuted">Hinterlege die URL oder den lokalen Pfad zur Weber-Referenz-PDF. Der Link erscheint zusätzlich beim Button „Therapievorschlag erstellen" in der Therapieplanung.</p>
      <div class="field">
        <label>PDF-URL oder Datei-Link</label>
        <input id="refPdfInput" type="text" placeholder="z.B. https://… oder file:///…" value="${esc(db.settings.refPdfUrl||'')}">
      </div>
      <div class="field">
        <label>PDF hochladen (wird lokal gespeichert)</label>
        <input id="refPdfFile" type="file" accept="application/pdf">
        <small class="smallMuted">${db.settings.refPdfName ? '✓ Aktuell gespeichert: <b>'+esc(db.settings.refPdfName)+'</b>' : 'Noch keine PDF gespeichert.'}</small>
      </div>
      ${db.settings.refPdfData || db.settings.refPdfUrl ? `<button class="muted" id="openRefPdfBtn">📄 Referenz-PDF öffnen</button>  <button class="muted" id="clearRefPdfBtn">✕ Referenz entfernen</button>` : ''}

      <h3>Therapieprotokolle (Stufenschema – automatisierte Empfehlungen)</h3>
      <p class="smallMuted">Die App nutzt das Stufenschema (Akut: Sitzung 1–3, 4–10, 11+) und die Erhaltungs-Protokolle für die automatischen Therapievorschläge. Werte können hier direkt editiert werden – Änderungen werden lokal gespeichert und bleiben bei jedem App-Start aktiv.</p>
      <div class="protocolStatusBox">
        <div><b>Aktive Quelle:</b> ${esc(PROTOCOLS_SOURCE)}</div>
        <div><b>Protokoll-Version:</b> ${esc(PROTOCOLS_VERSION)}${PROTOCOLS_DATE ? ' &nbsp;·&nbsp; <b>Stand:</b> '+esc(PROTOCOLS_DATE) : ''}</div>
        <div class="smallMuted" style="margin-top:6px">Anzahl Diagnosen: ${Object.keys(protocols).length} · Erhaltungsschemata: ${Object.keys(maintenanceProtocols).length}</div>
      </div>

      <div class="topBtns" style="margin-top:10px">
        <button class="muted" id="openProtocolsEditorBtn">✏️ Stufenschema bearbeiten</button>
        ${(localStorage.getItem(PROTOCOLS_LS_KEY) || PROTOCOLS_SOURCE.indexOf('Default') === -1) ? `<button class="muted" id="resetProtocolsBtn">↺ Auf App-Defaults zurücksetzen</button>` : ''}
      </div>

      <details style="margin-top:10px">
        <summary class="smallMuted" style="cursor:pointer">Erweitert: Protokolle als JSON-Datei importieren / exportieren</summary>
        <div style="margin-top:8px;padding:10px;border:1px solid #ddd;border-radius:8px;background:#fafafa">
          <p class="smallMuted" style="margin-top:0">Für Profis: Werte können auch als <code>protocols.json</code> ausgetauscht werden – z.&nbsp;B. um ein einheitliches Schema in mehreren Geräten zu synchronisieren.</p>
          <div class="field">
            <label>Eigene <code>protocols.json</code> importieren (überschreibt die aktuellen Werte)</label>
            <input id="protocolsJsonFile" type="file" accept="application/json,.json">
            <small class="smallMuted">Format: <code>{ _meta, protocols, maintenanceProtocols }</code></small>
          </div>
          <div class="topBtns" style="margin-top:6px">
            <button class="muted" id="downloadCurrentProtocolsBtn">💾 Aktuelle Protokolle als JSON sichern</button>
          </div>
        </div>
      </details>

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
        Wenn aktiviert, wird nach <b>${Number(db.settings.autoBackupInterval)||3} Minuten Inaktivität</b> automatisch eine Sicherungsdatei mit Zeitstempel geschrieben (<code>weberbrain_backup_JJJJ-MM-TT_HH-MM-SS.json</code>). Im gewählten Ordner bleiben automatisch nur die <b>letzten ${MAX_BACKUPS} Speichersätze</b> erhalten – ältere werden gelöscht.
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
    if(!p.planung.sessions[idx]) return;
    if(key === 'done'){
      p.planung.sessions[idx][key] = el.checked;
    } else if(el.type === 'radio'){
      /* Bewertungs-Radios: nur der angekreuzte schreibt seinen Wert */
      if(el.checked) p.planung.sessions[idx][key] = el.value;
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
      } else if(el.type === 'radio'){
        if(el.checked) p.maintenance.sessions[idx][key] = el.value;
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

  /* Re-Klick auf aktiven Bewertungs-Radio (Sitzungserfolg 1–5) = Abwahl */
  document.querySelectorAll('.ratingScale .ratingOption').forEach(label => {
    const radio = label.querySelector('input[type="radio"]');
    if(!radio) return;
    let wasChecked = false;
    label.addEventListener('pointerdown', () => { wasChecked = radio.checked; });
    label.addEventListener('click', e => {
      if(wasChecked){
        e.preventDefault();
        radio.checked = false;
        /* zugehörige Sitzung leeren */
        const p = cur();
        if(p){
          if(radio.dataset.session !== undefined && p.planung?.sessions?.[+radio.dataset.session]){
            p.planung.sessions[+radio.dataset.session].rating = '';
          } else if(radio.dataset.msession !== undefined && p.maintenance?.sessions?.[+radio.dataset.msession]){
            p.maintenance.sessions[+radio.dataset.msession].rating = '';
          }
          persist();
        }
        label.classList.remove('active');
      }
      wasChecked = false;
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

  /* "Zurueck zur Anfangsevaluierung" Button in der End-Evaluierung:
     speichert die aktuellen Eingaben und wechselt zum Tab 'evaluierung',
     damit der Patient seine Anfangs-Punkte ggf. korrigieren kann. */
  const back2start = document.getElementById('backToStartEval');
  if(back2start){
    back2start.onclick = () => {
      saveForm();
      activeTab = 'evaluierung';
      render();
      window.scrollTo({top:0, behavior:'smooth'});
    };
  }

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
        /* Defaults: zuerst aus dem indikationsspezifischen Erhaltungs-Schema, dann fallback Akut-Sitzung */
        const def = maintenanceDefaultsFromAcute();
        p.maintenance.sessions.forEach(s => {
          if(!s.hz) s.hz = (sug && sug.hz && sug.hz !== '—') ? sug.hz : (def ? def.hz : '');
          if(!s.intensity) s.intensity = (sug && sug.intensity && sug.intensity !== '—') ? sug.intensity : (def ? def.intensity : '');
          if(!s.duration) s.duration = (sug && sug.duration && sug.duration !== '—') ? sug.duration : (def ? def.duration : '');
        });
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
      /* Hz/Int/Dauer NUR setzen, wenn Sitzungen noch leer (nicht überschreiben) */
      const def = maintenanceDefaultsFromAcute();
      p.maintenance.sessions.forEach(s => {
        if(!s.hz) s.hz = (sug.hz && sug.hz !== '—') ? sug.hz : (def ? def.hz : '');
        if(!s.intensity) s.intensity = (sug.intensity && sug.intensity !== '—') ? sug.intensity : (def ? def.intensity : '');
        if(!s.duration) s.duration = (sug.duration && sug.duration !== '—') ? sug.duration : (def ? def.duration : '');
      });
      persist(); render();
    };
  }
  /* "Empfehlung komplett übernehmen" – überschreibt auch bestehende Hz/Int/Dauer in allen Erhaltungs-Sitzungen */
  const amsFull = document.getElementById('applyMaintenanceFullSuggestion');
  if(amsFull){
    amsFull.onclick = () => {
      const p = cur(); if(!p) return;
      const sug = maintenanceSuggestionFor(p.anamnese?.diagnoses || []);
      if(!sug || sug.freq === 0){ alert('Keine Empfehlung verfügbar.'); return; }
      if(!confirm('Bestehende Hz/Intensität/Dauer in allen Erhaltungs-Sitzungen werden mit der Stufenschema-Empfehlung überschrieben. Fortfahren?')) return;
      p.maintenance.frequencyPerWeek = sug.freq;
      p.maintenance.durationWeeks = sug.weeks;
      adjustMaintenanceSessions();
      generateMaintenanceDates();
      p.maintenance.sessions.forEach(s => {
        if(sug.hz && sug.hz !== '—') s.hz = sug.hz;
        if(sug.intensity && sug.intensity !== '—') s.intensity = sug.intensity;
        if(sug.duration && sug.duration !== '—') s.duration = sug.duration;
      });
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

  /* === Referenz-PDF === */
  function openRefPdf(){
    const url = db.settings.refPdfData || db.settings.refPdfUrl;
    if(!url){ alert('Keine Referenz-PDF gespeichert. Bitte unter Einstellungen (⚙️) hinterlegen.'); return; }
    window.open(url, '_blank');
  }
  const orp = document.getElementById('openRefPdfBtn');
  if(orp) orp.onclick = openRefPdf;
  const crp = document.getElementById('clearRefPdfBtn');
  if(crp) crp.onclick = () => {
    if(confirm('Referenz-PDF entfernen?')){
      db.settings.refPdfData = ''; db.settings.refPdfUrl = ''; db.settings.refPdfName = '';
      persist(); render();
    }
  };
  const rpInput = document.getElementById('refPdfInput');
  if(rpInput){
    rpInput.onchange = () => {
      db.settings.refPdfUrl = rpInput.value.trim();
      persist();
      showToast('PDF-Link gespeichert');
    };
  }
  const rpFile = document.getElementById('refPdfFile');
  if(rpFile){
    rpFile.onchange = e => {
      const f = e.target.files[0];
      if(!f) return;
      if(f.size > 10 * 1024 * 1024){ alert('PDF zu groß (max 10 MB). Bitte URL-Link verwenden.'); return; }
      const r = new FileReader();
      r.onload = () => {
        db.settings.refPdfData = r.result;
        db.settings.refPdfName = f.name;
        db.settings.refPdfUrl = '';
        persist(); render();
        showToast('PDF gespeichert: ' + f.name);
      };
      r.readAsDataURL(f);
    };
  }
  /* Referenz-PDF Button in Therapieplanung */
  const orpp = document.getElementById('openRefPdfPlan');
  if(orpp) orpp.onclick = openRefPdf;

  /* === Stufenschema-Editor (Built-in) === */
  const openEditorBtn = document.getElementById('openProtocolsEditorBtn');
  if(openEditorBtn) openEditorBtn.onclick = openProtocolsEditor;

  /* === Protokoll-JSON Import / Export / Reset === */
  const protocolsFile = document.getElementById('protocolsJsonFile');
  if(protocolsFile){
    protocolsFile.onchange = e => {
      const f = e.target.files[0];
      if(!f) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          const data = JSON.parse(r.result);
          const err = validateProtocolsData(data);
          if(err){ alert('Datei nicht akzeptiert:\n\n'+err+'\n\nBitte Format prüfen.'); return; }
          /* In localStorage speichern + sofort anwenden */
          try {
            localStorage.setItem(PROTOCOLS_LS_KEY, JSON.stringify(data));
          } catch(storageErr){
            alert('Speichern fehlgeschlagen (lokaler Speicher voll?). Datei ist nicht persistent gespeichert.');
            return;
          }
          applyProtocolsData(data, 'Manuell importiert: '+f.name);
          showToast('Protokolle importiert: Version '+PROTOCOLS_VERSION);
          render();
        } catch(parseErr){
          alert('Datei konnte nicht gelesen werden:\n'+parseErr.message);
        }
      };
      r.readAsText(f, 'utf-8');
    };
  }

  const dlProtocolsBtn = document.getElementById('downloadCurrentProtocolsBtn');
  if(dlProtocolsBtn){
    dlProtocolsBtn.onclick = () => {
      const out = {
        _meta: {
          schemaVersion: '1.0',
          protocolVersion: PROTOCOLS_VERSION,
          releaseDate: PROTOCOLS_DATE || new Date().toISOString().slice(0,10),
          source: PROTOCOLS_SOURCE,
          exportedFromApp: APP_VERSION,
          exportedAt: new Date().toISOString()
        },
        protocols: protocols,
        maintenanceProtocols: maintenanceProtocols
      };
      const blob = new Blob([JSON.stringify(out, null, 2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'protocols-'+PROTOCOLS_VERSION+'-'+new Date().toISOString().slice(0,10)+'.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Aktuelle Protokolle exportiert');
    };
  }

  const resetProtocolsBtn = document.getElementById('resetProtocolsBtn');
  if(resetProtocolsBtn){
    resetProtocolsBtn.onclick = () => {
      if(!confirm('Die importierten Protokolle werden gelöscht und die App-Defaults wieder aktiviert. Fortfahren?')) return;
      resetProtocolsToBuiltin();
      /* Falls eine protocols.json vorhanden ist, würde die beim nächsten Reload wieder gewinnen.
         Direkt jetzt neu laden, damit der Nutzer den aktuellen Stand sieht. */
      loadExternalProtocols().then(() => {
        showToast('Auf App-Defaults zurückgesetzt');
        render();
      });
    };
  }
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
        const incomingCount = data.patients.length;
        const currentCount  = db.patients.length;

        /* Wenn die Kartei leer ist, gibt es nichts zu fragen – einfach übernehmen */
        let mode;
        if(currentCount === 0){
          mode = 'append';
        } else {
          /* Drei klare Optionen: komplett ersetzen, nur neue ergänzen, abbrechen */
          const choice = prompt(
            `Kartei-Sicherung erkannt: ${incomingCount} Patient${incomingCount!==1?'en':''} in der Datei.\n` +
            `Aktuell in der Kartei: ${currentCount} Patient${currentCount!==1?'en':''}.\n\n` +
            `Wie soll der Import erfolgen?\n` +
            `  1 = Kartei komplett ÜBERSCHREIBEN (alle aktuellen Patienten werden ersetzt)\n` +
            `  2 = Nur neue Patienten ERGÄNZEN (bereits vorhandene IDs bleiben unverändert)\n` +
            `  3 = Abbrechen`,
            '2'
          );
          if(choice === '1')      mode = 'replace';
          else if(choice === '2') mode = 'append';
          else                    return; /* Abbruch oder Eingabe abgebrochen */

          if(mode === 'replace'){
            const confirmReplace = confirm(
              `Wirklich komplett überschreiben?\n\n` +
              `Alle ${currentCount} aktuell gespeicherten Patient${currentCount!==1?'en':''} werden durch ` +
              `die ${incomingCount} Patient${incomingCount!==1?'en':''} aus der Sicherung ersetzt.\n\n` +
              `Diese Aktion kann nicht rückgängig gemacht werden.`
            );
            if(!confirmReplace) return;
          }
        }

        if(mode === 'replace'){
          /* Komplette Ersetzung: incoming-Liste wird zur neuen Kartei */
          const newPatients = data.patients.map(np => {
            if(!np.maintenance) np.maintenance = {enabled:false,start:'',frequencyPerWeek:1,durationWeeks:12,sessions:[],notes:''};
            return np;
          });
          db.patients = newPatients;
          currentId = db.patients[0]?.id || null;
          if(data.settings) db.settings = Object.assign({}, db.settings, data.settings);
          ensureSettings();
          persist(); applyGlobalSettings(); render();
          alert(`Kartei komplett ersetzt: ${newPatients.length} Patient${newPatients.length!==1?'en':''} aus der Sicherung übernommen.`);
          return;
        }

        /* mode === 'append': nur neue Patienten ergänzen (alte Standardlogik) */
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
        alert(`Kartei-Sicherung importiert: ${added} neue Patient${added!==1?'en':''} hinzugefügt, ${skipped} waren bereits vorhanden (unverändert). Gesamt: ${db.patients.length} Patient${db.patients.length!==1?'en':''}.`);
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
      np.id = newPatientId();
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

  /* Sitzungs-Erfolgsbewertungen (1–5) zusammenfassen */
  const rstats = sessionRatingStats(p);
  if(rstats){
    const ms = mainSymptomOf(p);
    html += `<p style="margin-top:-6px"><b>Ø Sitzungs-Erfolg:</b> ${rstats.mean.toFixed(1)} / 5 `
      + `(${rstats.n} bewertete Sitzung${rstats.n!==1?'en':''}${ms?`, Hauptsymptom „${esc(ms)}"`:''})</p>`;
  }

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
/* Globale Variable für den vorherigen Tab beim Drucken */
let _printPreviousTab = null;

/* Zeigt das Druck-Bestaetigungs-Overlay (loest direkt window.print() aus) */
function showPrintConfirm(mode){
  /* mode: 'patient' | 'research' */
  const overlay = document.getElementById('printConfirmOverlay');
  if(!overlay) return;
  overlay._printMode = mode;
  overlay.classList.add('visible');
}

function doPrint(){
  const p = cur();
  if(!p){ alert('Kein Patient ausgewählt.'); return; }
  if(userMode === 'patient'){ return; } /* Patient soll nicht drucken */
  saveForm();

  /* Druckdatum setzen */
  const dt = new Date();
  document.getElementById('printDate').textContent = 'Patientenbericht · '+dt.toLocaleDateString('de-DE')+' '+dt.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});

  _printPreviousTab = activeTab;
  /* Auf Auswertung wechseln, damit der Bericht sicher im DOM ist */
  if(activeTab !== 'auswertung'){
    activeTab = 'auswertung';
    render();
  }

  /* Overlay anzeigen statt direkt zu drucken */
  showPrintConfirm('patient');
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
document.getElementById('exportSinglePatientBtn').onclick = exportSinglePatient;
/* Sidebar-Import: oeffnet versteckten File-Input, der dann handleImportFile aufruft */
document.getElementById('importSidebarBtn').onclick = () => document.getElementById('importSidebarFile').click();
document.getElementById('importSidebarFile').onchange = e => {
  const f = e.target.files[0];
  if(!f) return;
  handleImportFile(f);
  e.target.value = ''; /* Input zuruecksetzen, damit dieselbe Datei erneut importiert werden kann */
};
/* Zahnrad-Button: öffnet Einstellungen-Panel direkt */
const settingsBtnEl = document.getElementById('settingsBtn');
if(settingsBtnEl){
  settingsBtnEl.onclick = () => {
    if(userMode !== 'therapeut') return;
    autosaveAndToast();
    activeTab = 'settings';
    render();
  };
}
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

/* ============================================================
   ROBUSTE SPEICHERUNG: mehrere Save-Trigger
   ============================================================
   `beforeunload` allein ist auf Mobile (insbesondere iOS-Safari, Android-
   Chrome) NICHT zuverlässig - es feuert oft nicht, wenn der User die App
   wegswipet, das Tab wechselt oder das Display ausgeht. Daher zusätzlich:
   - `pagehide`     : feuert auch auf iOS, wenn die Seite in den BFCache geht
   - `visibilitychange` -> hidden: feuert beim Tab-Wechsel & App-Minimieren
   - periodischer Auto-Save alle 20s, falls der User auf einem Formular tippt
*/
/* Erkennt, ob gerade aktiv in ein Text-Eingabefeld getippt wird.
   Solange das der Fall ist, darf der periodische Auto-Save NICHT blurren –
   sonst schließt sich auf Mobilgeräten die virtuelle Tastatur mitten im Tippen. */
function isTypingInTextField(){
  const el = document.activeElement;
  if(!el) return false;
  const tag = el.tagName;
  if(tag === 'TEXTAREA') return true;
  if(tag === 'INPUT'){
    const t = (el.type || 'text').toLowerCase();
    /* Freitext-/Zahleneingaben: Tastatur ist offen. date/checkbox/radio nicht. */
    return ['text','number','search','tel','email','url','password'].includes(t);
  }
  return false;
}

/* allowBlur=false → das aktive Feld wird NICHT geblurrt (Tastatur bleibt offen).
   Wird vom periodischen Hintergrund-Save genutzt. */
function safeSave(reason, allowBlur){
  try {
    /* Aktives Eingabefeld nur dann zum Commit zwingen, wenn Blur erlaubt ist
       (z.B. beim App-Wechsel / Schließen). Beim Hintergrund-Save nicht blurren. */
    if(allowBlur !== false && document.activeElement && typeof document.activeElement.blur === 'function'){
      document.activeElement.blur();
    }
    saveForm();
  } catch(e){
    console.warn('[safeSave/'+(reason||'?')+'] Fehler:', e);
  }
}
window.addEventListener('beforeunload', () => safeSave('beforeunload', true));
window.addEventListener('pagehide',     () => safeSave('pagehide', true));
document.addEventListener('visibilitychange', () => {
  if(document.visibilityState === 'hidden') safeSave('visibilitychange', true);
});
/* Periodischer Save als Sicherheitsnetz (alle 20s, nur wenn entsperrt).
   WICHTIG: Wenn der User gerade in einem Textfeld tippt, wird der Save
   übersprungen – die Eingabe wird ohnehin beim nächsten 'change' oder beim
   App-Wechsel gespeichert. So springt die Tastatur nicht mehr weg. */
setInterval(() => {
  if(userMode === null) return;        /* gesperrt -> nichts zu speichern */
  if(!document.querySelector('[data-path],[data-array]')) return; /* kein Formular sichtbar */
  if(isTypingInTextField()) return;    /* aktiv am Tippen -> Tastatur nicht stören */
  safeSave('interval', false);         /* ohne Blur speichern */
}, 20000);

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

/* === DRUCK-OVERLAY Events === */
(function(){
  const overlay = document.getElementById('printConfirmOverlay');
  const cancelBtn = document.getElementById('printCancelBtn');
  const confirmBtn = document.getElementById('printConfirmBtn');
  if(!overlay) return;

  function closeOverlay(){
    overlay.classList.remove('visible');
    /* Bei Patient: Body-Klasse entfernen und zurueck zum vorherigen Tab */
    if(overlay._printMode === 'patient'){
      document.body.classList.remove('printing-patient');
      if(_printPreviousTab && _printPreviousTab !== 'auswertung'){
        activeTab = _printPreviousTab;
        render();
      }
    } else if(overlay._printMode === 'research'){
      /* nichts rueckgaengig machen – research bleibt */
    }
    overlay._printMode = null;
  }

  if(cancelBtn) cancelBtn.onclick = closeOverlay;
  /* Klick ausserhalb der Box = Abbrechen */
  overlay.onclick = e => { if(e.target === overlay) closeOverlay(); };

  if(confirmBtn) confirmBtn.onclick = () => {
    overlay.classList.remove('visible');
    const mode = overlay._printMode;
    overlay._printMode = null;
    if(mode === 'patient'){
      document.body.classList.add('printing-patient');
      setTimeout(() => {
        window.print();
        setTimeout(() => {
          document.body.classList.remove('printing-patient');
          if(_printPreviousTab && _printPreviousTab !== 'auswertung'){
            activeTab = _printPreviousTab;
            render();
          }
        }, 500);
      }, 80);
    } else if(mode === 'research'){
      document.body.classList.add('printing-research');
      setTimeout(() => {
        window.print();
        setTimeout(() => document.body.classList.remove('printing-research'), 500);
      }, 50);
    }
  };
})();

/* === TASTATUR-STEUERUNG: schwebender „Fertig"-Button =========================
   Auf Mobilgeräten gibt es keine zuverlässige Möglichkeit, die virtuelle
   Tastatur zu schließen, ohne irgendwo daneben zu tippen. Dieser Button
   erscheint nur, solange ein Text-/Zahlenfeld aktiv ist, und schließt die
   Tastatur kontrolliert (blur + Speichern). So bleibt die Tastatur beim
   Tippen offen, lässt sich aber jederzeit bewusst ausblenden. */
(function(){
  let kbBtn = null;
  function ensureBtn(){
    if(kbBtn) return kbBtn;
    kbBtn = document.createElement('button');
    kbBtn.type = 'button';
    kbBtn.id = 'kbDoneBtn';
    kbBtn.textContent = '⌨️ Tastatur schließen';
    kbBtn.setAttribute('aria-label', 'Tastatur schließen und speichern');
    /* pointerdown statt click: feuert bevor das Feld den Fokus verliert,
       sonst würde der Button beim Antippen schon wieder verschwinden */
    kbBtn.addEventListener('pointerdown', e => {
      e.preventDefault();
      const el = document.activeElement;
      if(el && typeof el.blur === 'function') el.blur();
      try { saveForm(); } catch(_){}
      hideBtn();
    });
    document.body.appendChild(kbBtn);
    return kbBtn;
  }
  function showBtn(){ ensureBtn().classList.add('visible'); }
  function hideBtn(){ if(kbBtn) kbBtn.classList.remove('visible'); }

  document.addEventListener('focusin', e => {
    const t = e.target;
    if(!t) return;
    const tag = t.tagName;
    const isText = tag === 'TEXTAREA' ||
      (tag === 'INPUT' && ['text','number','search','tel','email','url','password'].includes((t.type||'text').toLowerCase()));
    /* PIN-Pad / Lock-Overlay ausnehmen */
    if(isText && !t.closest('#lockOverlay')) showBtn(); else hideBtn();
  });
  document.addEventListener('focusout', () => {
    /* kurz verzögert prüfen, ob noch ein Textfeld aktiv ist (Feldwechsel) */
    setTimeout(() => {
      const el = document.activeElement;
      const stillText = el && (el.tagName === 'TEXTAREA' ||
        (el.tagName === 'INPUT' && ['text','number','search','tel','email','url','password'].includes((el.type||'text').toLowerCase())));
      if(!stillText) hideBtn();
    }, 50);
  });
})();

/* === START: Protokolle laden, dann Lock anzeigen === */
/* Loader läuft asynchron im Hintergrund. Falls schnell genug fertig,
   sind die externen Protokolle direkt aktiv. Falls noch unterwegs,
   ruft der Loader render() nach Abschluss neu auf. */
loadExternalProtocols();
applyGlobalSettings();
showLock();

})();
