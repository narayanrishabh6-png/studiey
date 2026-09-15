function normalizeDeadlineText(text = "") {
  return String(text)
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function extractDeadline(text = "") {
  const normalizedText = normalizeDeadlineText(text);

  if (!normalizedText) {
    return {
      raw: null,
      normalizedDeadline: null,
      sourcePhrase: null,
    };
  }

  const month =
    "(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)";

  const datePatterns = [
    // 15 January 2027 / 15 Jan 2027
    `\\b\\d{1,2}(?:st|nd|rd|th)?\\s+${month}\\s+\\d{4}\\b`,

    // January 15, 2027
    `\\b${month}\\s+\\d{1,2}(?:st|nd|rd|th)?(?:,)?\\s+\\d{4}\\b`,

    // 15/01/2027 or 15-01-2027
    "\\b\\d{1,2}[/-]\\d{1,2}[/-]\\d{4}\\b",

    // ISO date: 2027-01-15
    "\\b\\d{4}-\\d{2}-\\d{2}\\b",
  ];

  const deadlineContexts = [
    "application deadline",
    "applications deadline",
    "application closing date",
    "applications closing date",
    "closing date",
    "deadline for applications",
    "deadline to apply",
    "applications close",
    "applications closes",
    "applications must be submitted by",
    "apply by",
  ];

  for (const context of deadlineContexts) {
    for (const datePattern of datePatterns) {
      const pattern = new RegExp(
        `\\b${context.replace(/\s+/g, "\\s+")}\\b.{0,60}?(${datePattern})`,
        "i"
      );

      const match = normalizedText.match(pattern);

      if (match) {
        return {
          raw: match[1],
          normalizedDeadline: match[1],
          sourcePhrase: match[0],
        };
      }
    }
  }

  return {
    raw: null,
    normalizedDeadline: null,
    sourcePhrase: null,
  };
}

module.exports = {
  normalizeDeadlineText,
  extractDeadline,
};