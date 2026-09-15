const fs = require("fs");
const path = require("path");
const { extractMetadata } = require("../ingestion/extractMetadata");

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
    return;
  }

  console.log(`PASS: ${message}`);
}

const testHtml = `
<html>
  <head>
    <title>Fallback HTML Title</title>

    <meta
      property="og:title"
      content="PhD in Psychology"
    />

    <meta
      property="og:site_name"
      content="Example University"
    />

    <meta
      name="description"
      content="Doctoral research programme in psychology."
    />

    <link
      rel="canonical"
      href="https://example.edu/phd-psychology"
    />
  </head>

  <body>
    <h1>Psychology PhD Programme</h1>
  </body>
</html>
`;

const result = extractMetadata(testHtml);

assert(
  result.pageTitleCandidate === "PhD in Psychology",
  "prefers og:title as page title candidate"
);

assert(
  result.siteName === "Example University",
  "extracts site name"
);

assert(
  result.h1 === "Psychology PhD Programme",
  "extracts first h1"
);

assert(
  result.canonicalUrl === "https://example.edu/phd-psychology",
  "extracts canonical URL"
);

const cambridgeHtml = fs.readFileSync(
  path.join(__dirname, "fixtures", "cambridge.html"),
  "utf8"
);

const cambridgeMetadata = extractMetadata(cambridgeHtml);

assert(
  Boolean(cambridgeMetadata.pageTitleCandidate),
  "real Cambridge fixture has a title candidate"
);

assert(
  /phd|psychology/i.test(
    `${cambridgeMetadata.pageTitleCandidate || ""} ${cambridgeMetadata.h1 || ""}`
  ),
  "real Cambridge fixture contains programme-related title metadata"
);