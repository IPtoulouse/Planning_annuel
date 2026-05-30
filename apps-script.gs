// ─────────────────────────────────────────────────────────────
//  Planning Annuel — Google Apps Script
//  À coller dans : Extensions > Apps Script > Code.gs
// ─────────────────────────────────────────────────────────────

const SHEET_NAME = "Tâches"; // Nom de l'onglet — modifier si besoin

// ── COLONNES (ne pas modifier l'ordre) ───────────────────────
// A: id | B: titre | C: date | D: catégorie | E: commentaire
// F: url | G: label_url | H: couleur | I: terminée

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const action = (e.parameter && e.parameter.action) || "read";

  try {
    let result;
    if (action === "read")         result = readTasks();
    else if (action === "write")   result = writeTask(e);
    else if (action === "delete")  result = deleteTask(e);
    else if (action === "sync")    result = syncAll(e);
    else result = { error: "Action inconnue : " + action };

    return output(result);
  } catch (err) {
    return output({ error: err.toString() });
  }
}

// ── LIRE toutes les tâches ────────────────────────────────────
function readTasks() {
  const sheet = getSheet();
  const rows  = sheet.getDataRange().getValues();
  const tasks = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] && !r[1]) continue; // ligne vide
    tasks.push(rowToTask(r));
  }
  return { tasks };
}

// ── ÉCRIRE / METTRE À JOUR une tâche ─────────────────────────
function writeTask(e) {
  const task = JSON.parse(e.postData ? e.postData.contents : e.parameter.data);
  const sheet = getSheet();
  const rows  = sheet.getDataRange().getValues();

  // Chercher la ligne existante par id
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === task.id) {
      sheet.getRange(i + 1, 1, 1, 9).setValues([taskToRow(task)]);
      return { ok: true, action: "updated", id: task.id };
    }
  }

  // Pas trouvé → ajouter en bas
  sheet.appendRow(taskToRow(task));
  return { ok: true, action: "created", id: task.id };
}

// ── SUPPRIMER une tâche par id ────────────────────────────────
function deleteTask(e) {
  const id    = e.parameter.id;
  const sheet = getSheet();
  const rows  = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { ok: true, action: "deleted", id };
    }
  }
  return { ok: false, error: "ID non trouvé : " + id };
}

// ── SYNC COMPLÈTE (remplace tout le contenu) ──────────────────
function syncAll(e) {
  const tasks = JSON.parse(e.postData ? e.postData.contents : e.parameter.data);
  const sheet = getSheet();

  // Conserver l'en-tête, effacer le reste
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, 9).clearContent();

  // Réécrire toutes les tâches
  if (tasks.length > 0) {
    const data = tasks.map(taskToRow);
    sheet.getRange(2, 1, data.length, 9).setValues(data);
  }
  return { ok: true, count: tasks.length };
}

// ── HELPERS ───────────────────────────────────────────────────
function getSheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    // Créer l'onglet avec en-têtes si inexistant
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["id","titre","date","catégorie","commentaire","url","label_url","couleur","terminée"]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function rowToTask(r) {
  return {
    id:       String(r[0] || ""),
    title:    String(r[1] || ""),
    date:     String(r[2] || ""),
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
    (t.color   || "c-blue").replace("c-",""),
    t.done ? "oui" : "non",
  ];
}

function output(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
