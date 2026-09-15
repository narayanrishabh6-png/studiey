const fs = require("fs");
const path = require("path");

const {
  buildDomainIndex,
} = require("../ingestion/lookupInstitutionRor");

const inputPath = path.join(
  __dirname,
  "..",
  "data",
  "ror-data.json"
);

const outputPath = path.join(
  __dirname,
  "..",
  "data",
  "ror-domain-index.json"
);

console.log("Loading full ROR dataset...");

const raw = fs.readFileSync(inputPath, "utf8");
const records = JSON.parse(raw);

console.log("Building compact domain index...");

const domainIndex = buildDomainIndex(records);

const compactObject = Object.fromEntries(domainIndex);

fs.writeFileSync(
  outputPath,
  JSON.stringify(compactObject, null, 2),
  "utf8"
);

console.log("Done.");
console.log("Domains indexed:", domainIndex.size);
console.log("Saved to:", outputPath);