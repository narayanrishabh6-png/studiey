function normalizeStudyLoadText(text = "") {
  return String(text)
    // Normalize Unicode dash/hyphen variants
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function extractStudyLoad(text = "") {
  const normalizedText = normalizeStudyLoadText(text);

  if (!normalizedText) {
    return {
      raw: null,
      normalizedStudyLoad: null,
    };
  }

  // Both full-time and part-time are explicitly offered
  const bothPattern =
    /\bfull[\s-]*time\b.{0,40}\b(?:or|and|\/)\b.{0,40}\bpart[\s-]*time\b|\bpart[\s-]*time\b.{0,40}\b(?:or|and|\/)\b.{0,40}\bfull[\s-]*time\b/i;

  const bothMatch = normalizedText.match(bothPattern);

  if (bothMatch) {
    return {
      raw: bothMatch[0],
      normalizedStudyLoad: "full_time_or_part_time",
    };
  }

  const fullTimeMatch = normalizedText.match(/\bfull[\s-]*time\b/i);

  if (fullTimeMatch) {
    return {
      raw: fullTimeMatch[0],
      normalizedStudyLoad: "full_time",
    };
  }

  const partTimeMatch = normalizedText.match(/\bpart[\s-]*time\b/i);

  if (partTimeMatch) {
    return {
      raw: partTimeMatch[0],
      normalizedStudyLoad: "part_time",
    };
  }

  return {
    raw: null,
    normalizedStudyLoad: null,
  };
}

module.exports = {
  normalizeStudyLoadText,
  extractStudyLoad,
};