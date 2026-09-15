const fs = require("fs");
const path = require("path");

const {
  normalizeStudyLoadText,
  extractStudyLoad,
} = require("../ingestion/extractStudyLoad");

function check(name, condition) {
  if (!condition) {
    console.error(`FAIL: ${name}`);
    process.exitCode = 1;
    return;
  }

  console.log(`PASS: ${name}`);
}

// 1. Standard full-time
const fullTime = extractStudyLoad("This programme is full-time.");

check(
  "extracts standard full-time",
  fullTime.normalizedStudyLoad === "full_time"
);

// 2. Full time without hyphen
const fullTimeSpace = extractStudyLoad(
  "Students undertake full time study."
);

check(
  "extracts full time without hyphen",
  fullTimeSpace.normalizedStudyLoad === "full_time"
);

// 3. Unicode non-breaking hyphen
const unicodeFullTime = extractStudyLoad(
  "The programme requires full-time study."
);

check(
  "extracts Unicode full-time",
  unicodeFullTime.normalizedStudyLoad === "full_time"
);

// 4. Part-time
const partTime = extractStudyLoad(
  "The programme is available part-time."
);

check(
  "extracts part-time",
  partTime.normalizedStudyLoad === "part_time"
);

// 5. Both options
const both = extractStudyLoad(
  "Students may study full-time or part-time."
);

check(
  "extracts full-time or part-time",
  both.normalizedStudyLoad === "full_time_or_part_time"
);

// 6. No study load
const none = extractStudyLoad(
  "Applications are now open for this programme."
);

check(
  "returns null when study load is absent",
  none.normalizedStudyLoad === null
);

// 7. Unicode normalization itself
const normalized = normalizeStudyLoadText("full-time");

check(
  "normalizes Unicode hyphen",
  normalized === "full-time"
);

// 8. Real Cambridge fixture
const cambridgePath = path.join(
  __dirname,
  "fixtures",
  "cambridge.html"
);

const cambridgeHtml = fs.readFileSync(cambridgePath, "utf8");

const cambridgeResult = extractStudyLoad(cambridgeHtml);

check(
  "real Cambridge fixture detects full-time",
  cambridgeResult.normalizedStudyLoad === "full_time"
);

console.log("\nCambridge result:");
console.log(cambridgeResult);