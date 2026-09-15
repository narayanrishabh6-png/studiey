const fs = require("fs");
const path = require("path");

const {
  extractMetadata,
} = require("../ingestion/extractMetadata");

const {
  extractInstitution,
} = require("../ingestion/extractInstitution");

const {
  loadCompactRorDomainIndex,
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

// --------------------------------------------------
// 1. JSON-LD should win
// --------------------------------------------------

const jsonLdHtml = `
<html>
  <head>
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "CollegeOrUniversity",
        "name": "Example University"
      }
    </script>

    <meta
      property="og:site_name"
      content="Wrong Site Name"
    />
  </head>

  <body>
    Example page
  </body>
</html>
`;

const jsonLdResult = extractInstitution(
  jsonLdHtml,
  {}
);

assertEqual(
  jsonLdResult.institution,
  "Example University",
  "extracts institution from JSON-LD"
);

assertEqual(
  jsonLdResult.source,
  "json_ld",
  "JSON-LD is preferred source"
);

// --------------------------------------------------
// 2. Site-name metadata fallback
// --------------------------------------------------

const siteNameHtml = `
<html>
  <head>
    <meta
      property="og:site_name"
      content="Global Research University"
    />
  </head>

  <body>
    Programme information
  </body>
</html>
`;

const siteNameResult = extractInstitution(
  siteNameHtml,
  {}
);

assertEqual(
  siteNameResult.institution,
  "Global Research University",
  "extracts institution from og:site_name"
);

assertEqual(
  siteNameResult.source,
  "site_name",
  "site_name fallback works"
);

// --------------------------------------------------
// 3. Load real compact ROR index
// --------------------------------------------------

const rorIndexPath = path.join(
  __dirname,
  "..",
  "data",
  "ror-domain-index.json"
);

const rorIndex =
  loadCompactRorDomainIndex(rorIndexPath);

// --------------------------------------------------
// 4. Real Cambridge fixture
// --------------------------------------------------

const cambridgePath = path.join(
  __dirname,
  "fixtures",
  "cambridge.html"
);

const cambridgeHtml = fs.readFileSync(
  cambridgePath,
  "utf8"
);

const cambridgeMetadata =
  extractMetadata(cambridgeHtml);

const cambridgeResult = extractInstitution(
  cambridgeHtml,
  cambridgeMetadata,
  rorIndex
);

console.log(
  "Cambridge institution result:",
  cambridgeResult
);

assertEqual(
  cambridgeResult.institution,
  "University of Cambridge",
  "real Cambridge fixture resolves institution"
);

assertEqual(
  cambridgeResult.source,
  "ror_domain",
  "Cambridge uses ROR domain resolution"
);

assertEqual(
  cambridgeResult.countryCode,
  "GB",
  "Cambridge resolves country code"
);

// --------------------------------------------------
// 5. False institution phrases must not be accepted
// --------------------------------------------------

const falsePhraseHtml = `
<html>
  <head>
    <title>Please visit the University</title>
  </head>

  <body>
    <header>
      Open Days The University
    </header>
  </body>
</html>
`;

const falsePhraseResult = extractInstitution(
  falsePhraseHtml,
  {}
);

assertEqual(
  falsePhraseResult.institution,
  null,
  "rejects false institution phrase"
);