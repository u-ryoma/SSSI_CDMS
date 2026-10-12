// Generates simulated calibration histories (flagged simulated:true) so the AI has something
// to learn from before enough real calibrations have accumulated.
const { norm } = require("./driftExtract");

function mulberry32(seed) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// rate = typical drift in "% of uncertainty per month" (errors accumulate between calibrations)
const TYPES = [
  {
    description: "Digital Multimeter",
    rate: 0.4,
    brands: ["Fluke", "Keysight", "Hioki"],
  },
  {
    description: "Vernier Caliper",
    rate: 0.6,
    brands: ["Mitutoyo", "Insize", "Starrett"],
  },
  { description: "Micrometer", rate: 0.7, brands: ["Mitutoyo", "Insize"] },
  {
    description: "Weighing Balance",
    rate: 1.0,
    brands: ["Mettler Toledo", "Ohaus", "Sartorius"],
  },
  { description: "Clamp Meter", rate: 1.0, brands: ["Fluke", "Hioki"] },
  { description: "Dial Gauge", rate: 1.4, brands: ["Mitutoyo", "Teclock"] },
  {
    description: "Thermometer",
    rate: 1.8,
    brands: ["Fluke", "Testo", "Extech"],
  },
  {
    description: "Pressure Gauge",
    rate: 2.8,
    brands: ["Wika", "Ashcroft", "Dwyer"],
  },
  { description: "Flow Meter", rate: 3.0, brands: ["Endress+Hauser", "Omega"] },
  {
    description: "Torque Wrench",
    rate: 3.6,
    brands: ["Tohnichi", "Snap-on", "Norbar"],
  },
];
const COMPANIES = [
  "Jolibee",
  "San Miguel Corp",
  "Nestle PH",
  "Toyota Motor PH",
  "Intel PH",
  "Coca-Cola PH",
  "Ayala Land",
  "Shell PH",
];
const DAY = 86400000;

function generateInstruments(count = 40, now = new Date(), seed = 2026) {
  const rand = mulberry32(seed);
  const gauss = () =>
    Math.sqrt(-2 * Math.log(rand() + 1e-9)) * Math.cos(2 * Math.PI * rand());
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const docs = [];

  for (let i = 0; i < count; i++) {
    const type = pick(TYPES);
    const company = pick(COMPANIES);
    const brand = pick(type.brands);
    const model = `${brand.slice(0, 2).toUpperCase()}-${100 + Math.floor(rand() * 900)}`;
    const serialNo = `SIM-${String(i + 1).padStart(4, "0")}`;
    const rate = type.rate * Math.exp(0.45 * gauss());
    const freqDays = rand() < 0.7 ? 365 : 180;
    const n = 3 + Math.floor(rand() * 4); // 3..6 calibrations
    const sign = rand() < 0.5 ? -1 : 1;
    const U = 0.05 + rand() * 4.95; // expanded uncertainty of this instrument
    const d0 = 5 + rand() * 15; // starting drift %

    const lastDate = now.getTime() - (20 + rand() * 280) * DAY;
    const dates = [lastDate];
    for (let k = 1; k < n; k++)
      dates.unshift(dates[0] - (freqDays + (rand() - 0.5) * 40) * DAY);

    dates.forEach((t, k) => {
      const months = (t - dates[0]) / (30 * DAY);
      const drift = Math.max(0, d0 + rate * months + gauss() * 2.5);
      const fracs = [1, 0.65, 0.35].map((f) => f * (1 + gauss() * 0.04));
      docs.push({
        instrumentKey: [company, brand, model, serialNo, ""]
          .map(norm)
          .join("|"),
        description: type.description,
        companyName: company,
        brand,
        model,
        serialNo,
        heading: "",
        jobNumber: `SIM/${String(i + 1).padStart(4, "0")}/${k + 1}`,
        calibratedAt: new Date(t),
        frequencyDays: freqDays,
        points: fracs.map((f, p) => ({
          label: ["100%", "50%", "10%"][p],
          asFoundError: sign * (drift / 100) * U * f,
          tolerance: U,
        })),
        simulated: true,
      });
    });
  }
  return docs;
}

module.exports = { generateInstruments, TYPES };
