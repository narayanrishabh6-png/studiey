const path = require("path");

const {
  loadCompactRorDomainIndex,
  lookupInstitutionByDomain,
} = require("../ingestion/lookupInstitutionRor");

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    console.error(
      `FAIL: ${message} | expected=${expected} actual=${actual}`
    );
    process.exitCode = 1;
    return;
  }

  console.log(`PASS: ${message}`);
}

const indexPath = path.join(
  __dirname,
  "..",
  "data",
  "ror-domain-index.json"
);

console.log("Loading real compact ROR index...");

const index = loadCompactRorDomainIndex(indexPath);

console.log("Domains indexed:", index.size);

const cambridge = lookupInstitutionByDomain("cam.ac.uk", index);

assertEqual(
  cambridge?.institution,
  "University of Cambridge",
  "real ROR resolves Cambridge"
);

const anu = lookupInstitutionByDomain("anu.edu.au", index);

assertEqual(
  anu?.institution,
  "Australian National University",
  "real ROR resolves ANU"
);

const harvard = lookupInstitutionByDomain("harvard.edu", index);

assertEqual(
  harvard?.institution,
  "Harvard University",
  "real ROR resolves Harvard"
);

const unknown = lookupInstitutionByDomain(
  "definitely-not-a-real-university.example",
  index
);

assertEqual(
  unknown,
  null,
  "real ROR leaves unknown domain unresolved"
);