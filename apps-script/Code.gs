/**
 * PaSEClaban 2026 Tabulation — Google Apps Script backend
 *
 * Setup:
 * 1. Create a Google Sheet. Extensions > Apps Script. Paste this file.
 * 2. Project Settings > Script Properties > add:
 *      EDITOR_USERNAME = admin
 *      EDITOR_PASSWORD = <admin password>   (never put the password in this file)
 * 3. Deploy > New deployment > Web app — Execute as: Me · Who has access: Anyone
 * 4. Copy the Web app URL into CONFIG.API_URL in index.html.
 *
 * Storage: sheet "Data" column A = full JSON state in 40,000-char chunks (source of truth).
 *          sheets "Standings" and "Results" = readable mirror, rewritten on every save.
 * All point computation is done by the site (Guidelines Art. II–VI); the server stores it.
 */

const DATA_SHEET = 'Data';

function doGet() {
  return json_({ ok: true, state: loadState_() });
}

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); }
  catch (err) { return json_({ ok: false, error: 'Bad request' }); }

  const props = PropertiesService.getScriptProperties();
  const user = props.getProperty('EDITOR_USERNAME') || 'admin';
  const pw = props.getProperty('EDITOR_PASSWORD');
  if (!pw || req.username !== user || req.password !== pw) {
    Utilities.sleep(800); // slow down guessing
    return json_({ ok: false, error: 'Invalid username or password' });
  }
  if (req.action === 'login') return json_({ ok: true, state: loadState_() });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    let state = loadState_();
    const p = req.payload || {};
    if (req.action !== 'replaceAll' && !state) return json_({ ok: false, error: 'No data yet' });

    switch (req.action) {
      case 'replaceAll':
        state = p.state;
        break;
      case 'saveEvent': {
        const i = state.events.findIndex(ev => ev.id === p.event.id);
        if (i >= 0) state.events[i] = p.event; else state.events.push(p.event);
        break;
      }
      case 'deleteEvent':
        state.events = state.events.filter(ev => ev.id !== p.id);
        break;
      case 'saveSettings':
        state.teams = p.teams;
        state.points = p.points;
        state.announcement = p.announcement || '';
        break;
      default:
        return json_({ ok: false, error: 'Unknown action' });
    }

    state.updatedAt = new Date().toISOString();
    state.updatedBy = req.username || 'admin';
    saveState_(state);
    if (req.mirror) {
      writeTable_('Standings', req.mirror.standings);
      writeTable_('Results', req.mirror.results);
    }
    return json_({ ok: true, state: state });
  } finally {
    lock.releaseLock();
  }
}

/** Run once from the editor (Run > setup) to create the sheets. */
function setup() {
  [DATA_SHEET, 'Standings', 'Results'].forEach(sheet_);
  const def = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  if (def && SpreadsheetApp.getActiveSpreadsheet().getSheets().length > 1) SpreadsheetApp.getActiveSpreadsheet().deleteSheet(def);
}

const CHUNK = 40000; // a cell holds max 50,000 characters

function loadState_() {
  const sh = sheet_(DATA_SHEET);
  const n = sh.getLastRow();
  if (!n) return null;
  const v = sh.getRange(1, 1, n, 1).getValues().map(r => String(r[0]).replace(/^~/, '')).join('');
  if (!v) return null;
  try { return JSON.parse(v); } catch (e) { return null; }
}

function saveState_(state) {
  const sh = sheet_(DATA_SHEET);
  const str = JSON.stringify(state);
  const rows = [];
  // '~' prefix keeps a chunk from being read as a formula or number
  for (let i = 0; i < str.length; i += CHUNK) rows.push(['~' + str.slice(i, i + CHUNK)]);
  sh.clearContents();
  sh.getRange(1, 1, rows.length, 1).setNumberFormat('@').setValues(rows);
}

function writeTable_(name, rows) {
  if (!rows || !rows.length) return;
  const sh = sheet_(name);
  sh.clear();
  sh.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  sh.getRange(1, 1, 1, rows[0].length).setFontWeight('bold');
  sh.setFrozenRows(1);
}

function sheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
