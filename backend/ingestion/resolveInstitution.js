const {
  resolveInstitutionDomain,
} = require("./resolveInstitutionDomain");

const {
  lookupInstitutionByDomain,
} = require("./lookupInstitutionRor");

function resolveInstitutionFromUrl(url, domainIndex) {
  const domainResult = resolveInstitutionDomain(url);

  if (!domainResult?.rootDomain) {
    return {
      institution: null,
      rorId: null,
      country: null,
      countryCode: null,
      domain: null,
      source: null,
      confidence: 0,
    };
  }

  const rorMatch = lookupInstitutionByDomain(
    domainResult.rootDomain,
    domainIndex
  );

  if (!rorMatch) {
    return {
      institution: null,
      rorId: null,
      country: null,
      countryCode: null,
      domain: domainResult.rootDomain,
      source: "domain_unresolved",
      confidence: 0,
    };
  }

  return {
    institution: rorMatch.institution,
    rorId: rorMatch.rorId,
    country: rorMatch.country,
    countryCode: rorMatch.countryCode,
    domain: rorMatch.domain,
    source: "ror_domain",
    confidence: 0.98,
  };
}

module.exports = {
  resolveInstitutionFromUrl,
};