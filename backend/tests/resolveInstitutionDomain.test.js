const {
  getHostname,
  getRootAcademicDomain,
  resolveInstitutionDomain,
} = require("../ingestion/resolveInstitutionDomain");

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

assertEqual(
  getHostname("https://www.postgraduate.study.cam.ac.uk/courses/directory/blpypdpsy"),
  "www.postgraduate.study.cam.ac.uk",
  "extracts Cambridge hostname"
);

assertEqual(
  getRootAcademicDomain("www.postgraduate.study.cam.ac.uk"),
  "cam.ac.uk",
  "reduces Cambridge subdomain to cam.ac.uk"
);

assertEqual(
  getRootAcademicDomain("medicalsciences.uohyd.ac.in"),
  "uohyd.ac.in",
  "reduces UoH subdomain to uohyd.ac.in"
);

assertEqual(
  getRootAcademicDomain("programsandcourses.anu.edu.au"),
  "anu.edu.au",
  "reduces ANU subdomain to anu.edu.au"
);

const result = resolveInstitutionDomain(
  "https://www.postgraduate.study.cam.ac.uk/courses/directory/blpypdpsy"
);

assertEqual(
  result.rootDomain,
  "cam.ac.uk",
  "resolver returns Cambridge root domain"
);

assertEqual(
  result.institution,
  null,
  "institution remains unresolved before ROR lookup"
);