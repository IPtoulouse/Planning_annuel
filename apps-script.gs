// ─────────────────────────────────────────────────────────────
//  Planning Annuel — Google Apps Script
//  À coller dans : Extensions > Apps Script > Code.gs
//  Puis : Déployer > Nouveau déploiement > Application Web
//         Accès : Tout le monde
// ─────────────────────────────────────────────────────────────

const SHEET_TASKS  = "Tâches";      // Onglet des tâches
const SHEET_EVENTS = "Événements";  // Onglet jours fériés & événements

// ── COLONNES onglet Tâches ────────────────────────────────────
// A:id  B:titre  C:date  D:catégorie  E:commentaire
// F:url  G:label_url  H:couleur  I:terminée

// ── COLONNES onglet Événements ────────────────────────────────
// A:date (AAAA-MM-JJ)  B:nom  C:type  D:icône (emoji)
// Types : "férié" | "religieux" | "école" | "autre"

// ── POINT D'ENTRÉE ────────────────────────────────────────────
// Apps Script ne supporte pas les en-têtes CORS sur doPost.
// Toutes les opérations passent donc par doGet avec des
// paramètres URL, y compris l'écriture (données encodées en JSON
// dans le paramètre "data"). Cela fonctionne depuis n'importe
// quelle origine (GitHub Pages inclus).

function doGet(e) {
  const action = (e.parameter && e.parameter.action) || "read";
  try {
    let result;
    if      (action === "read")       result = readAll();
    else if (action === "readEvents") result = { events: readEventsRaw() };
    else if (action === "write")      result = writeTask(JSON.parse(decodeURIComponent(e.parameter.data || "{}")));
    else if (action === "delete")     result = deleteTaskById(e.parameter.id || "");
    else if (action === "sync")       result = syncAll(JSON.parse(decodeURIComponent(e.parameter.data || "[]")));
    else result = { error: "Action inconnue : " + action };
    return output(result);
  } catch (err) {
    return output({ error: err.toString() });
  }
}

// doPost redirige vers doGet pour compatibilité
function doPost(e) { return doGet(e); }

// ── LIRE tâches + événements ──────────────────────────────────
function readAll() {
  return {
    tasks:  readTasksRaw(),
    events: readEventsRaw(),
  };
}

function readTasksRaw() {
  const sheet = getTaskSheet();
  const rows  = sheet.getDataRange().getValues();
  const tasks = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] && !r[1]) continue;
    tasks.push(rowToTask(r));
  }
  return tasks;
}

function readEventsRaw() {
  const sheet  = getEventSheet();
  const rows   = sheet.getDataRange().getValues();
  const events = [];
  for (let i = 1; i < rows.length; i++) {
    const r    = rows[i];
    const date = formatDate(r[0]);
    if (!date) continue;
    events.push({
      date: date,
      name: String(r[1] || "").trim(),
      type: String(r[2] || "autre").trim().toLowerCase(),
      icon: String(r[3] || "").trim(),
    });
  }
  return events;
}

// ── ÉCRIRE / MAJ une tâche ────────────────────────────────────
function writeTask(task) {
  const sheet = getTaskSheet();
  const rows  = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === task.id) {
      sheet.getRange(i + 1, 1, 1, 9).setValues([taskToRow(task)]);
      return { ok: true, action: "updated", id: task.id };
    }
  }
  sheet.appendRow(taskToRow(task));
  return { ok: true, action: "created", id: task.id };
}

// ── SUPPRIMER une tâche ───────────────────────────────────────
function deleteTaskById(id) {
  const sheet = getTaskSheet();
  const rows  = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { ok: true, action: "deleted", id: id };
    }
  }
  return { ok: false, error: "ID non trouvé : " + id };
}

// ── SYNC COMPLÈTE ─────────────────────────────────────────────
function syncAll(tasks) {
  const sheet   = getTaskSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, 9).clearContent();
  if (tasks.length > 0) {
    sheet.getRange(2, 1, tasks.length, 9).setValues(tasks.map(taskToRow));
  }
  return { ok: true, count: tasks.length };
}

// ── HELPERS ───────────────────────────────────────────────────
function getTaskSheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(SHEET_TASKS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_TASKS);
    sheet.appendRow(["id","titre","date","catégorie","commentaire","url","label_url","couleur","terminée"]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getEventSheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(SHEET_EVENTS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_EVENTS);
    sheet.appendRow(["date","nom","type","icône"]);
    // Exemples pré-remplis pour 2025 et 2026
    const exemples = [
      ["2025-01-01","Jour de l'An","férié","🎉"],
      ["2025-04-20","Pâques","religieux","✝️"],
      ["2025-04-21","Lundi de Pâques","férié","✝️"],
      ["2025-05-01","Fête du Travail","férié","🌹"],
      ["2025-05-08","Victoire 1945","férié","🕊️"],
      ["2025-05-29","Ascension","religieux","✝️"],
      ["2025-06-08","Pentecôte","religieux","✝️"],
      ["2025-06-09","Lundi de Pentecôte","férié","✝️"],
      ["2025-07-14","Fête Nationale","férié","🇫🇷"],
      ["2025-08-15","Assomption","religieux","✝️"],
      ["2025-11-01","Toussaint","férié","🕯️"],
      ["2025-11-11","Armistice","férié","🕊️"],
      ["2025-12-25","Noël","religieux","🎄"],
      ["2026-01-01","Jour de l'An","férié","🎉"],
      ["2026-04-05","Pâques","religieux","✝️"],
      ["2026-04-06","Lundi de Pâques","férié","✝️"],
      ["2026-05-01","Fête du Travail","férié","🌹"],
      ["2026-05-08","Victoire 1945","férié","🕊️"],
      ["2026-05-14","Ascension","religieux","✝️"],
      ["2026-05-24","Pentecôte","religieux","✝️"],
      ["2026-05-25","Lundi de Pentecôte","férié","✝️"],
      ["2026-07-14","Fête Nationale","férié","🇫🇷"],
      ["2026-08-15","Assomption","religieux","✝️"],
      ["2026-11-01","Toussaint","férié","🕯️"],
      ["2026-11-11","Armistice","férié","🕊️"],
      ["2026-12-25","Noël","religieux","🎄"],
    ];
    sheet.getRange(2, 1, exemples.length, 4).setValues(exemples);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function formatDate(val) {
  if (!val) return "";
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, "0");
    const d = String(val.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(val).trim();
}

function rowToTask(r) {
  return {
    id:       String(r[0] || ""),
    title:    String(r[1] || ""),
    date:     formatDate(r[2]),
    cat:      String(r[3] || ""),
    comment:  String(r[4] || ""),
    url:      String(r[5] || ""),
    urlLabel: String(r[6] || ""),
    color:    String(r[7] || "c-blue"),
    done:     String(r[8] || "").toLowerCase() === "oui",
  };
}

function taskToRow(t) {
  return [
    t.id       || "",
    t.title    || "",
    t.date     || "",
    t.cat      || "",
    t.comment  || "",
    t.url      || "",
    t.urlLabel || "",
    (t.color   || "c-blue").replace("c-", ""),
    t.done ? "oui" : "non",
  ];
}

function output(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
