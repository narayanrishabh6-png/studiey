const fs = require("fs");

function getDisplayName(record = {}) {
  if (!Array.isArray(record.names)) return null;

  const display = record.names.find(
    (item) =>
      Array.isArray(item.types) &&
      item.types.includes("ror_display")
  );

  return display?.value || record.names[0]?.value || null;
}

function buildDomainIndex(records = []) {
  const index = new Map();

  for (const record of records) {
    const institution = getDisplayName(record);

    if (!institution || !Array.isArray(record.domains)) {
      continue;
    }

    for (const domain of record.domains) {
      const normalizedDomain = String(domain)
        .toLowerCase()
        .replace(/^www\./, "")
        .trim();

      if (!normalizedDomain) continue;

      index.set(normalizedDomain, {
        institution,
        rorId: record.id || null,
        country:
          record.locations?.[0]?.geonames_details?.country_name || null,
        countryCode:
          record.locations?.[0]?.geonames_details?.country_code || null,
        domain: normalizedDomain,
      });
    }
  }

  return index;
}

function loadRorDomainIndex(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const records = JSON.parse(raw);

  return buildDomainIndex(records);
}

function loadCompactRorDomainIndex(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const objectIndex = JSON.parse(raw);

  return new Map(Object.entries(objectIndex));
}

function lookupInstitutionByDomain(domain, domainIndex) {
  if (!domain || !domainIndex) return null;

  const normalizedDomain = String(domain)
    .toLowerCase()
    .replace(/^www\./, "")
    .trim();

  return domainIndex.get(normalizedDomain) || null;
}

module.exports = {
  getDisplayName,
  buildDomainIndex,
  loadRorDomainIndex,
  loadCompactRorDomainIndex,
  lookupInstitutionByDomain,
};