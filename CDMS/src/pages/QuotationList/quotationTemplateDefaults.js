// Default wording for the quotation, taken straight from
// quotation_template_master.docx. Everything here is the *starting* text:
// each piece is editable in QuotationPreviewModal and the edited version is
// what gets saved (as `quotationContent`) and later turned into the PDF.
//
// Strings may contain <b>, <i>, <u>, <br> only (see sanitizeHtml.js).

export const DOC_META = {
  companyName: "SCIENTIFIC STANDARD SERVICES INC.",
  addressLines: [
    "9 M. SANTOS ST. TUKTUKTAN TAGUIG CITY, 1637, PH",
    "inquiry@scientificstandards.com.ph / stdcalib@yahoo.com",
    "02-8642-3695 | 02-86423373 | 02-8628-2410",
  ],
  docId: "SSS-FRM-060",
  issueNo: "02",
  revision: "01",
  dateRev: "2021 JAN 28",
  title: "QUOTATION",
  website: "www.scientificstandards.com.ph",
};

export const DEFAULT_CONDITIONS = [
  "That the calibration will be done <b>In – House</b> (<b>SSSI LAB</b>).",
  "That the customer will ensure that the instruments are in good working condition prior to its calibration.",
  "That the customer will provide instrument manual and dummy loads, if necessary.",
  "The Calibration of Scientific Standard Services Inc. does not include adjustment or repair of the instruments.",
  "The customer will provide the necessary information, manpower and other means if adjustment is necessary.",
  "That the pick-up and delivery of instruments for In – House calibration will be shouldered by the customer.",
  "That the customer agrees to the calibration procedure and traceability of Scientific Standard Services Inc.",
  "We at Scientific Standard Services Inc. are giving our best to be diligent enough in performing the test and or calibration services but no warranties are given and none may be implied directly or indirectly relating to SSSI’ test and calibration results and facilities. And no event shall SSSI be liable for collateral, special, consequential damage, or damages caused by fortuitous events, any error of judgment, fault or negligence of its officers or employees.",
  "Scientific Standard Services Inc. shall have the right to sell instrument / equipment which were not claimed within a period of one hundred twenty (120) days to cover cost of storage, calibration fees and related costs.",
  "When an equipment for calibration has no Serial Number, Scientific Standard Services Inc. will inform the customer that a unique Serial Number or Identification will be engraved to their equipment.",
  "That the calibration of pressure gauge will be using hydraulic oil as a medium, and we do not calibrate “use no oil ” type.",
  "That the calibration certificate will only be given upon full payment of calibration services.",
  "This offer is <b>valid for 30 days from date of quotation</b> and thereafter will be subject to a written confirmation.",
  "The full evaluation of the instrument (UUT) will be done during the scheduled calibration.",
  "That as agreed the calibration frequency for these instruments is (&nbsp;&nbsp;&nbsp;) months/year/s.",
  "Scientific Standard Services Inc. will charge 50% of the actual amount of calibration if the instrument was already calibrated and the customer decided to cancel the transaction and pull-out/return without calibration (RWOC) the instrument due to error or discrepancies found during calibration. In this case, SSSI can issue a Service Report if applicable.",
  "The customer shall not allow financial, commercial or other pressure to compromise impartiality and conflict of interest on its activities.",
  "The customer will not disclose any Scientific Standard Services Inc. and/or SSSI Customer’s information to any third party and that no information will be used by this company or permitted by SSSI to be used for other purposes.",
  "That these conditions of calibration shall constitute the agreement in full of services to be rendered by Scientific Standard Services Inc. (SSSI) and warranties thereof to client and SSSI shall not be made to undertake nor perform any additional act or services or give other warranty not included herein, and that client shall accordingly compensate SSSI after compliance herewith.",
];

// How many conditions sit on page 1 by default (matches the Word template).
// QuotationDocument pushes more onto page 2 automatically if page 1 fills up.
export const DEFAULT_PAGE1_CONDITIONS = 7;

export const newItem = () => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  instrument: "",
  unitPrice: "",
});

export const buildDefaultContent = (fields = {}) => ({
  // Editable header-block values. These mirror the form on
  // AddQuotationModal and are synced back to it when the preview is applied.
  fields: {
    companyName: fields.companyName || "",
    companyAddress: fields.companyAddress || "",
    contactName: fields.contactName || "",
    reference: fields.reference || "",
  },
  re: "",
  intro:
    "With regards to your inquiry, we would like to give you our quotation as follows:",
  calibrationOf: "CALIBRATION OF:",
  items: [newItem()],
  notes: [
    "Normal Turn-around time: <b>10 - 15 working days.</b>",
    "Rush calibration <b>(additional 40% rush charge) 2 – 3 working days</b> (subject for schedule, availability of technician and standard instrument).",
    "<b>(Optional). We also offer pick-up and delivery services. For details, you may contact us.</b>",
  ],
  conditionsTitle: "CONDITIONS OF CALIBRATION",
  conditionsSub: "*The customer agrees wherever applicable*",
  conditions: [...DEFAULT_CONDITIONS],
  thankYou: "Thank you",
});

// Makes sure an older / partial saved object still has every key the
// document expects, and that the header-block fields always come from the
// current record rather than a stale copy.
export const normalizeContent = (saved, fields) => {
  const base = buildDefaultContent(fields);
  const merged = { ...base, ...(saved || {}) };
  merged.fields = { ...base.fields, ...fields };
  if (!Array.isArray(merged.items) || merged.items.length === 0) {
    merged.items = [newItem()];
  }
  if (!Array.isArray(merged.notes) || merged.notes.length === 0) {
    merged.notes = base.notes;
  }
  if (!Array.isArray(merged.conditions) || merged.conditions.length === 0) {
    merged.conditions = base.conditions;
  }
  return merged;
};
