function getHostname(url = "") {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function getRootAcademicDomain(hostname = "") {
  const host = String(hostname)
    .toLowerCase()
    .replace(/^www\./, "");

  if (!host) return null;

  const parts = host.split(".").filter(Boolean);

  if (parts.length < 2) {
    return host;
  }

  // Handle common academic country-code domains:
  // cam.ac.uk
  // anu.edu.au
  // uohyd.ac.in
  const academicSecondLevel = new Set([
    "ac.uk",
    "edu.au",
    "ac.in",
    "edu.in",
    "ac.nz",
    "edu.sg",
    "ac.za",
  ]);

  const lastTwo = parts.slice(-2).join(".");

  if (academicSecondLevel.has(lastTwo) && parts.length >= 3) {
    return parts.slice(-3).join(".");
  }

  return lastTwo;
}

function resolveInstitutionDomain(url = "") {
  const hostname = getHostname(url);
  const rootDomain = getRootAcademicDomain(hostname);

  return {
    hostname,
    rootDomain,
    institution: null,
    source: rootDomain ? "domain_unresolved" : null,
    confidence: 0,
  };
}

module.exports = {
  resolveInstitutionDomain,
  getHostname,
  getRootAcademicDomain,
};