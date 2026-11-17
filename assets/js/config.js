/* =========================================================================
   ΡΥΘΜΙΣΕΙΣ ΓΑΜΟΥ — εδώ αλλάζουν όλα τα στοιχεία του site.
   ========================================================================= */
window.WEDDING = {
  // groomAcc / brideAcc = αιτιατική ("για τον Χρήστο")
  couple: { groom: "Χρήστος", bride: "Στέλλα", groomAcc: "Χρήστο", brideAcc: "Στέλλα" },

  date: "2027-07-30T19:30:00+03:00",
  dateLabel: "Παρασκευή, 30 Ιουλίου 2027",
  dateShort: "30 · 07 · 2027",
  rsvpDeadline: "30 Ιουνίου 2027",
  phones: ["6945231917", "6958897497"],

  families: [
    "Κυριάκου Σηφάκη & Κυριακής Κοσμαδάκη",
    "Ευριδίκης Βερυκάκη & Μανώλη Κουσκουμβεκάκη",
    "Γιάννη Τσιχλάκη",
  ],
  koumbaroi: ["Ολυμπία Νίκα", "Γιάννης Φιλιππάκης"],

  ceremony: {
    title: "Το Μυστήριο",
    time: "19:30",
    name: "Ιερός Ναός Κοιμήσεως της Θεοτόκου",
    address: "Λιμνούπολη, Βαρύπετρο · Χανιά",
    lat: 35.4657628,
    lng: 23.9704153,
  },

  reception: {
    title: "Η Δεξίωση",
    time: "Αμέσως μετά",
    name: "Limnoupolis Events",
    address: "Λιμνούπολη, Βαρύπετρο · Χανιά",
    lat: 35.4678467,
    lng: 23.9705337,
  },

  // Σημεία εκκίνησης για τις οδηγίες στον χάρτη
  origins: [
    { id: "airport", label: "Αεροδρόμιο Χανίων", icon: "plane", lat: 35.5317, lng: 24.1497 },
    { id: "port", label: "Λιμάνι Σούδας", icon: "ship", lat: 35.4886, lng: 24.0738 },
    { id: "town", label: "Κέντρο Χανίων", icon: "town", lat: 35.5138, lng: 24.018 },
  ],

  /* -----------------------------------------------------------------------
     GOOGLE FORM (RSVP)
     1. Τρέξτε το google-apps-script/create-rsvp-form.gs (δείτε README.md).
     2. Αντιγράψτε εδώ το formAction και τα entry IDs που θα εμφανίσει.
     Όσο το formAction περιέχει "ΒΑΛΤΕ_ΤΟ_ID", η φόρμα λειτουργεί σε δοκιμαστική
     λειτουργία και δεν στέλνει τίποτα.
     ----------------------------------------------------------------------- */
  rsvp: {
    formAction: "https://docs.google.com/forms/d/e/1FAIpQLSdX12bRq-3MNoB5__Y6cZspbbNnLKxs6cXgkncfoK9pXha2cA/formResponse",
    fields: {
      name: "entry.1814478439",
      phone: "entry.492545011",
      attending: "entry.1079708846",
      extraAdults: "entry.1688805192",
      guestNames: "entry.1943821997",
      children: "entry.497904636",
      childrenAges: "entry.1542568277",
      menuVeg: "entry.757721941",
      menuVegan: "entry.1283365912",
      allergies: "entry.1652498360",
    },
  },
};
