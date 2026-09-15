const path = require("path");

const {
  loadRorDomainIndex,
} = require("../ingestion/lookupInstitutionRor");

const {
  resolveInstitutionFromUrl,
} = require("../ingestion/resolveInstitution");

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

const cambridge = resolveInstitutionFromUrl(
  "https://www.postgraduate.study.cam.ac.uk/courses/directory/blpypdpsy",
  index
);

assertEqual(
  cambridge.institution,
  "University of Cambridge",
  "resolves Cambridge from full URL"
);

assertEqual(
  cambridge.domain,
  "cam.ac.uk",
  "returns Cambridge root domain"
);

assertEqual(
  cambridge.source,
  "ror_domain",
  "marks ROR domain as source"
);

assertEqual(
  cambridge.countryCode,
  "GB",
  "returns Cambridge country code"
);

const anu = resolveInstitutionFromUrl(
  "https://programsandcourses.anu.edu.au/program/9600XPHD",
  index
);

assertEqual(
  anu.institution,
  "Australian National University",
  "resolves ANU from nested URL"
);

const unknown = resolveInstitutionFromUrl(
  "https://research.unknown-university.example/phd",
  index
);

assertEqual(
  unknown.institution,
  null,
  "unknown institution remains unresolved"
);

assertEqual(
  unknown.source,
  "domain_unresolved",
  "unknown domain is routed as unresolved"
);