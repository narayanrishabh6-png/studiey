const fs = require("fs");
const path = require("path");

const { cleanContent } = require("../ingestion/cleanContent");
const { extractDuration } = require("../ingestion/extractDuration");

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

// Simple range
let result = extractDuration(
  "The programme usually takes three to four years of full-time study."
);

assertEqual(result.raw, "three to four years", "extracts word-based range");
assertEqual(result.minMonths, 36, "word-based range min -> 36 months");
assertEqual(result.maxMonths, 48, "word-based range max -> 48 months");

// Simple single duration
result = extractDuration(
  "This master's programme is completed in 18 months."
);

assertEqual(result.raw, "18 months", "extracts 18 months");
assertEqual(result.minMonths, 18, "18 months min -> 18");

// Real Cambridge fixture
const cambridgeHtml = fs.readFileSync(
  path.join(__dirname, "fixtures", "cambridge.html"),
  "utf8"
);

const cambridgeClean = cleanContent(cambridgeHtml);

result = extractDuration(cambridgeClean.text);

assertEqual(
  result.durationYearsMin,
  3,
  "real Cambridge fixture duration min -> 3 years"
);

assertEqual(
  result.durationYearsMax,
  4,
  "real Cambridge fixture duration max -> 4 years"
);