const { normalizeDuration } = require("../ingestion/normalizeDuration");

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

// 3 years
let result = normalizeDuration("3 years");

assertEqual(result.minMonths, 36, "3 years -> 36 months");
assertEqual(result.maxMonths, 36, "3 years max -> 36 months");
assertEqual(result.durationYearsMin, 3, "3 years min -> 3 years");
assertEqual(result.durationYearsMax, 3, "3 years max -> 3 years");

// three to four years
result = normalizeDuration("three to four years");

assertEqual(result.minMonths, 36, "three to four years min -> 36 months");
assertEqual(result.maxMonths, 48, "three to four years max -> 48 months");
assertEqual(result.durationYearsMin, 3, "three to four years min -> 3 years");
assertEqual(result.durationYearsMax, 4, "three to four years max -> 4 years");

// 18 months
result = normalizeDuration("18 months");

assertEqual(result.minMonths, 18, "18 months -> 18 months");
assertEqual(result.maxMonths, 18, "18 months max -> 18 months");
assertEqual(result.durationYearsMin, 1.5, "18 months -> 1.5 years");

// numeric range
result = normalizeDuration("3-4 years");

assertEqual(result.minMonths, 36, "3-4 years min -> 36 months");
assertEqual(result.maxMonths, 48, "3-4 years max -> 48 months");

// no duration
result = normalizeDuration("Applications are now open");

assertEqual(result.raw, null, "no duration text -> null");