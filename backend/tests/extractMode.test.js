const fs = require("fs");
const path = require("path");

const {
  normalizeModeText,
  extractMode,
} = require("../ingestion/extractMode");

function check(name, condition) {
  if (!condition) {
    console.error(`FAIL: ${name}`);
    process.exitCode = 1;
    return;
  }

  console.log(`PASS: ${name}`);
}

// 1. On-campus
const onCampus = extractMode(
  "This programme is delivered on-campus."
);

check(
  "extracts on-campus",
  onCampus.normalizedMode === "in_person"
);

// 2. In person
const inPerson = extractMode(
  "This programme is provided in person."
);

check(
  "extracts in person",
  inPerson.normalizedMode === "in_person"
);

// 3. Online
const online = extractMode(
  "The programme is delivered online."
);

check(
  "extracts online",
  online.normalizedMode === "online"
);

// 4. Remote
const remote = extractMode(
  "The programme is offered remote."
);

check(
  "extracts remote",
  remote.normalizedMode === "online"
);

// 5. Distance learning
const distance = extractMode(
  "This degree is available through distance learning."
);

check(
  "extracts distance learning",
  distance.normalizedMode === "online"
);

// 6. Hybrid
const hybrid = extractMode(
  "The programme is delivered hybrid."
);

check(
  "extracts hybrid",
  hybrid.normalizedMode === "hybrid"
);

// 7. Blended
const blended = extractMode(
  "The course is offered blended."
);

check(
  "extracts blended",
  blended.normalizedMode === "hybrid"
);

// 8. No mode
const none = extractMode(
  "Applications are invited for the Psychology programme."
);

check(
  "returns null when mode is absent",
  none.normalizedMode === null
);

// 9. Unicode hyphen normalization
const normalized = normalizeModeText("on-campus");

check(
  "normalizes Unicode hyphen",
  normalized === "on-campus"
);

// 10. Ignore online events
const onlineEvents = extractMode(
  "We offer online events throughout the year."
);

check(
  "ignores online events",
  onlineEvents.normalizedMode === null
);

// 11. Ignore online webinars
const onlineWebinars = extractMode(
  "Join our online webinars for prospective students."
);

check(
  "ignores online webinars",
  onlineWebinars.normalizedMode === null
);

// 12. Ignore apply online
const applyOnline = extractMode(
  "Applicants should apply online before the deadline."
);

check(
  "ignores apply online",
  applyOnline.normalizedMode === null
);

// 13. Real Cambridge fixture
const cambridgePath = path.join(
  __dirname,
  "fixtures",
  "cambridge.html"
);

const cambridgeHtml = fs.readFileSync(cambridgePath, "utf8");

const cambridgeResult = extractMode(cambridgeHtml);

check(
  "Cambridge does not mistake online events for programme mode",
  cambridgeResult.normalizedMode === null
);

console.log("\nCambridge result:");
console.log(cambridgeResult);