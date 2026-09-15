const { normalizeDuration } = require("./normalizeDuration");

function extractDuration(text = "") {
  const source = String(text)
    .replace(/\s+/g, " ")
    .trim();

  if (!source) {
    return {
      raw: null,
      minMonths: null,
      maxMonths: null,
      durationYearsMin: null,
      durationYearsMax: null,
    };
  }

  const durationPatterns = [
    /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+(?:\.\d+)?)\s*(?:-|–|—|to)\s*(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+(?:\.\d+)?)\s*(?:year|years|month|months)\b/i,

    /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+(?:\.\d+)?)\s*(?:year|years|month|months)\b/i,
  ];

  for (const pattern of durationPatterns) {
    const match = source.match(pattern);

    if (match) {
      return normalizeDuration(match[0]);
    }
  }

  return {
    raw: null,
    minMonths: null,
    maxMonths: null,
    durationYearsMin: null,
    durationYearsMax: null,
  };
}

module.exports = { extractDuration };