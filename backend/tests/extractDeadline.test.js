const fs = require("fs");
const path = require("path");

const {
  normalizeDeadlineText,
  extractDeadline,
} = require("../ingestion/extractDeadline");

function check(name, condition) {
  if (!condition) {
    console.error(`FAIL: ${name}`);
    process.exitCode = 1;
    return;
  }

  console.log(`PASS: ${name}`);
}

// 1. Standard application deadline
const standard = extractDeadline(
  "Application deadline: 15 January 2027."
);

check(
  "extracts standard application deadline",
  standard.raw === "15 January 2027"
);

// 2. Applications close
const closes = extractDeadline(
  "Applications close 30 November 2026."
);

check(
  "extracts applications close date",
  closes.raw === "30 November 2026"
);

// 3. Closing date
const closing = extractDeadline(
  "Closing date: March 1, 2027."
);

check(
  "extracts closing date",
  closing.raw === "March 1, 2027"
);

// 4. Apply by
const applyBy = extractDeadline(
  "Candidates should apply by 15/01/2027."
);

check(
  "extracts apply-by numeric date",
  applyBy.raw === "15/01/2027"
);

// 5. ISO date
const iso = extractDeadline(
  "Application deadline: 2027-01-15."
);

check(
  "extracts ISO deadline",
  iso.raw === "2027-01-15"
);

// 6. Ignore Open Day date
const openDay = extractDeadline(
  "Open Day: 12 November 2026."
);

check(
  "ignores Open Day date",
  openDay.raw === null
);

// 7. Ignore webinar date
const webinar = extractDeadline(
  "Online webinar: 20 October 2026."
);

check(
  "ignores webinar date",
  webinar.raw === null
);

// 8. Ignore publication date
const published = extractDeadline(
  "Published: 5 September 2026."
);

check(
  "ignores publication date",
  published.raw === null
);

// 9. Ignore course start date
const courseStart = extractDeadline(
  "Course starts: 21 September 2027."
);

check(
  "ignores course start date",
  courseStart.raw === null
);

// 10. No deadline
const none = extractDeadline(
  "Applications are currently being accepted."
);

check(
  "returns null when no deadline is present",
  none.raw === null
);

// 11. Real Cambridge fixture
const cambridgePath = path.join(
  __dirname,
  "fixtures",
  "cambridge.html"
);

const cambridgeHtml = fs.readFileSync(cambridgePath, "utf8");

const cambridgeResult = extractDeadline(cambridgeHtml);

console.log("\nCambridge result:");
console.log(cambridgeResult);