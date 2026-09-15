const path = require("path");

const {
  getDisplayName,
  loadRorDomainIndex,
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

const fixturePath = path.join(
  __dirname,
  "fixtures",
  "ror.sample.json"
);

const index = loadRorDomainIndex(fixturePath);

const cambridge = lookupInstitutionByDomain(
  "cam.ac.uk",
  index
);

assertEqual(
  cambridge?.institution,
  "University of Cambridge",
  "resolves Cambridge institution"
);

assertEqual(
  cambridge?.country,
  "United Kingdom",
  "resolves Cambridge country"
);

assertEqual(
  cambridge?.countryCode,
  "GB",
  "resolves Cambridge country code"
);

assertEqual(
  cambridge?.rorId,
  "https://ror.org/013meh722",
  "resolves Cambridge ROR ID"
);

const anu = lookupInstitutionByDomain(
  "www.anu.edu.au",
  index
);

assertEqual(
  anu?.institution,
  "Australian National University",
  "normalizes www and resolves ANU"
);

const unknown = lookupInstitutionByDomain(
  "unknown-university.example",
  index
);

assertEqual(
  unknown,
  null,
  "unknown domain returns null"
);