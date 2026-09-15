const numberWords = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
};

function toNumber(value) {
  if (!value) return null;

  const cleaned = String(value).trim().toLowerCase();

  if (/^\d+(?:\.\d+)?$/.test(cleaned)) {
    return Number(cleaned);
  }

  return numberWords[cleaned] ?? null;
}

function normalizeDuration(text = "") {
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

  const normalized = source.toLowerCase();

  // Example:
  // "three to four years"
  // "3-4 years"
  // "3 to 4 years"
  const rangeMatch = normalized.match(
    /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+(?:\.\d+)?)\s*(?:-|–|—|to)\s*(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+(?:\.\d+)?)\s*(year|years|month|months)\b/i
  );

  if (rangeMatch) {
    const minValue = toNumber(rangeMatch[1]);
    const maxValue = toNumber(rangeMatch[2]);
    const unit = rangeMatch[3].toLowerCase();

    const multiplier = unit.startsWith("year") ? 12 : 1;

    const minMonths = minValue * multiplier;
    const maxMonths = maxValue * multiplier;

    return {
      raw: rangeMatch[0],
      minMonths,
      maxMonths,
      durationYearsMin: minMonths / 12,
      durationYearsMax: maxMonths / 12,
    };
  }

  // Example:
  // "3 years"
  // "three years"
  // "18 months"
  const singleMatch = normalized.match(
    /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+(?:\.\d+)?)\s*(year|years|month|months)\b/i
  );

  if (singleMatch) {
    const value = toNumber(singleMatch[1]);
    const unit = singleMatch[2].toLowerCase();

    const months = value * (unit.startsWith("year") ? 12 : 1);

    return {
      raw: singleMatch[0],
      minMonths: months,
      maxMonths: months,
      durationYearsMin: months / 12,
      durationYearsMax: months / 12,
    };
  }

  return {
    raw: null,
    minMonths: null,
    maxMonths: null,
    durationYearsMin: null,
    durationYearsMax: null,
  };
}

module.exports = { normalizeDuration };