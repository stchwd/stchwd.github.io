/**
 * Δημιουργεί αυτόματα το Google Form για το RSVP του site,
 * ένα Google Sheet με τις απαντήσεις και (προαιρετικά) email στη Στέλλα
 * για κάθε νέα απάντηση.
 *
 * Οδηγίες:
 *  1. https://script.google.com → Νέο έργο, επικολλήστε αυτό το αρχείο.
 *  2. Βάλτε το email της Στέλλας παρακάτω (ή αφήστε το κενό "").
 *  3. Επιλέξτε τη συνάρτηση createRsvpForm και πατήστε ▶ Run (εγκρίνετε τα δικαιώματα).
 *  4. Ανοίξτε το Execution log και αντιγράψτε το μπλοκ "rsvp: {...}" στο assets/js/config.js.
 *
 * ΣΗΜΑΝΤΙΚΟ: οι επιλογές (π.χ. "Ναι, με χαρά!") πρέπει να είναι ΙΔΙΕΣ με αυτές
 * του index.html. Αν αλλάξετε κάποια εδώ, αλλάξτε την και εκεί.
 */

const STELLA_EMAIL = ""; // π.χ. "stella@example.com"

function createRsvpForm() {
  const form = FormApp.create("RSVP — Γάμος Χρήστου & Στέλλας");
  form.setDescription("Οι απαντήσεις έρχονται από το site του γάμου.");

  const nums = function (max) { const a = []; for (let i = 0; i <= max; i++) a.push(String(i)); return a; };

  const items = {
    name: form.addTextItem().setTitle("Ονοματεπώνυμο").setRequired(true),
    phone: form.addTextItem().setTitle("Τηλέφωνο"),
    attending: form
      .addMultipleChoiceItem()
      .setTitle("Θα είστε μαζί μας;")
      .setChoiceValues(["Ναι, με χαρά!", "Δυστυχώς δεν θα μπορέσω"])
      .setRequired(true),
    extraAdults: form.addListItem().setTitle("Επιπλέον ενήλικες").setChoiceValues(nums(5)),
    guestNames: form.addParagraphTextItem().setTitle("Ονόματα επιπλέον ενηλίκων"),
    children: form.addListItem().setTitle("Παιδιά").setChoiceValues(nums(5)),
    childrenAges: form.addTextItem().setTitle("Ηλικίες παιδιών"),
    menuVeg: form.addListItem().setTitle("Χορτοφαγικά πιάτα").setChoiceValues(nums(11)),
    menuVegan: form.addListItem().setTitle("Vegan πιάτα").setChoiceValues(nums(11)),
    allergies: form.addTextItem().setTitle("Αλλεργίες / σημειώσεις για το φαγητό"),
  };

  // Οι απαντήσεις πάνε και σε Google Sheet
  const ss = SpreadsheetApp.create("RSVP — Απαντήσεις γάμου");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // Η φόρμα πρέπει να δέχεται απαντήσεις από οποιονδήποτε (όχι μόνο συνδεδεμένους)
  try { form.setRequireLogin(false); } catch (e) {}
  try { form.setPublished(true); } catch (e) {}

  // Βρίσκουμε τα entry IDs μέσω pre-filled URL, ένα πεδίο τη φορά
  const fields = {};
  Object.keys(items).forEach(function (key) {
    const item = items[key];
    const url = form.createResponse().withItemResponse(item.createResponse(sampleValue_(item))).toPrefilledUrl();
    const m = url.match(/entry\.(\d+)=/);
    fields[key] = m ? "entry." + m[1] : "ΔΕΝ ΒΡΕΘΗΚΕ";
  });

  if (STELLA_EMAIL) {
    ScriptApp.newTrigger("emailOnRsvp").forForm(form).onFormSubmit().create();
  }

  const formAction = form.getPublishedUrl().replace(/\/viewform.*$/, "/formResponse");
  const snippet =
    "  rsvp: {\n" +
    '    formAction: "' + formAction + '",\n' +
    "    fields: {\n" +
    Object.keys(fields).map(function (k) { return "      " + k + ': "' + fields[k] + '",'; }).join("\n") +
    "\n    },\n  },";

  Logger.log("Φόρμα (επεξεργασία): " + form.getEditUrl());
  Logger.log("Sheet απαντήσεων: " + ss.getUrl());
  Logger.log("Αντιγράψτε στο assets/js/config.js:\n\n" + snippet);
}

function sampleValue_(item) {
  const t = item.getType();
  if (t === FormApp.ItemType.CHECKBOX) return [item.getChoices()[0].getValue()];
  if (t === FormApp.ItemType.MULTIPLE_CHOICE || t === FormApp.ItemType.LIST) return item.getChoices()[0].getValue();
  return "x";
}

/** Στέλνει email στη Στέλλα σε κάθε νέα απάντηση. */
function emailOnRsvp(e) {
  if (!STELLA_EMAIL) return;
  const responses = e.response.getItemResponses();
  const byTitle = {};
  const lines = responses.map(function (r) {
    const val = [].concat(r.getResponse()).join(", ");
    byTitle[r.getItem().getTitle()] = val;
    return r.getItem().getTitle() + ": " + val;
  });
  const name = byTitle["Ονοματεπώνυμο"] || "Κάποιος";
  const att = byTitle["Θα είστε μαζί μας;"] || "";
  MailApp.sendEmail(STELLA_EMAIL, "💌 RSVP: " + name + " — " + att, lines.join("\n"));
}
