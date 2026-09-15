function normalizeModeText(text = "") {
  return String(text)
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMode(text = "") {
  const normalizedText = normalizeModeText(text);

  if (!normalizedText) {
    return {
      raw: null,
      normalizedMode: null,
    };
  }

  /*
   * Mode words must occur in genuine programme/study context.
   * This prevents false positives such as:
   * "online events", "online webinars", "apply online", etc.
   */

  const contextPatterns = [
    // Example: Mode of study: Online
    /\b(?:mode\s+of\s+(?:study|delivery)|delivery\s+mode|study\s+mode)\s*[:\-]?\s*(online|remote|hybrid|blended|on[\s-]*campus|in[\s-]*person|face[\s-]*to[\s-]*face|distance[\s-]*(?:learning|education)?)\b/i,

    // Example: programme is delivered online
    /\b(?:programme|program|course|degree|study|teaching)\b.{0,50}\b(?:delivered|offered|available|taught|provided|undertaken)\b.{0,30}\b(online|remote|hybrid|blended|on[\s-]*campus|in[\s-]*person|face[\s-]*to[\s-]*face|distance[\s-]*(?:learning|education)?)\b/i,

    // Example: online programme / on-campus course
    /\b(online|remote|hybrid|blended|on[\s-]*campus|in[\s-]*person|face[\s-]*to[\s-]*face|distance[\s-]*(?:learning|education)?)\b.{0,30}\b(?:programme|program|course|degree|study|teaching)\b/i,
  ];

  let rawMode = null;

  for (const pattern of contextPatterns) {
    const match = normalizedText.match(pattern);

    if (match) {
      rawMode = match[1];
      break;
    }
  }

  if (!rawMode) {
    return {
      raw: null,
      normalizedMode: null,
    };
  }

  const mode = rawMode.toLowerCase();

  if (
    /\b(?:hybrid|blended)\b/i.test(mode)
  ) {
    return {
      raw: rawMode,
      normalizedMode: "hybrid",
    };
  }

  if (
    /\b(?:online|remote|distance[\s-]*(?:learning|education)?)\b/i.test(mode)
  ) {
    return {
      raw: rawMode,
      normalizedMode: "online",
    };
  }

  if (
    /\b(?:on[\s-]*campus|in[\s-]*person|face[\s-]*to[\s-]*face)\b/i.test(mode)
  ) {
    return {
      raw: rawMode,
      normalizedMode: "in_person",
    };
  }

  return {
    raw: null,
    normalizedMode: null,
  };
}

module.exports = {
  normalizeModeText,
  extractMode,
};