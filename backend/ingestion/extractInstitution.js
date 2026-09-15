const cheerio = require("cheerio");

const {
  resolveInstitutionFromUrl,
} = require("./resolveInstitution");

function normalize(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanInstitutionName(value) {
  const cleaned = normalize(value)
    .replace(/\s*[|–—-]\s*(home|admissions?|courses?|programmes?|programs?).*$/i, "")
    .trim();

  return cleaned || null;
}

function looksLikeInstitution(value) {
  const text = normalize(value);

  if (!text) return false;

  if (
    /^(please|visit|apply|learn|discover|explore|welcome|open days?|find out|read more)\b/i.test(
      text
    )
  ) {
    return false;
  }

  if (
    !/\b(university|college|institute|institution|school|academy|conservatoire|polytechnic)\b/i.test(
      text
    )
  ) {
    return false;
  }

  const wordCount = text.split(/\s+/).length;

  if (wordCount > 12) {
    return false;
  }

  return true;
}
function extractInstitution(
  html = "",
  metadata = {},
  domainIndex = null
) {
  const $ = cheerio.load(html);

  // 1. Structured organization/university data
  const jsonLdScripts = $('script[type="application/ld+json"]');

  for (const element of jsonLdScripts.toArray()) {
    try {
      const parsed = JSON.parse($(element).html());

      const nodes = Array.isArray(parsed)
        ? parsed
        : parsed && Array.isArray(parsed["@graph"])
        ? parsed["@graph"]
        : [parsed];

      for (const node of nodes) {
        if (!node || typeof node !== "object") continue;

        const type = Array.isArray(node["@type"])
          ? node["@type"].join(" ")
          : node["@type"];

        if (
          /Organization|CollegeOrUniversity|EducationalOrganization/i.test(
            String(type || "")
          )
        ) {
          const candidate = cleanInstitutionName(node.name);

          if (candidate && looksLikeInstitution(candidate)) {
            return {
              institution: candidate,
              source: "json_ld",
              confidence: 0.95,
            };
          }
        }
      }
    } catch {
      // Ignore invalid JSON-LD and continue to the next layer.
    }
  }

  // 2. Metadata site name
  const siteName = cleanInstitutionName(
    metadata.siteName ||
      $('meta[property="og:site_name"]').attr("content") ||
      $('meta[name="application-name"]').attr("content")
  );

  if (siteName && looksLikeInstitution(siteName)) {
    return {
      institution: siteName,
      source: "site_name",
      confidence: 0.9,
    };
  }

  // 3. ROR domain resolution
  const canonicalUrl =
    metadata.canonicalUrl ||
    $('link[rel="canonical"]').attr("href") ||
    null;

  if (canonicalUrl && domainIndex) {
    const rorResult = resolveInstitutionFromUrl(
      canonicalUrl,
      domainIndex
    );

    if (rorResult?.institution) {
      return {
        institution: rorResult.institution,
        source: "ror_domain",
        confidence: rorResult.confidence,
        rorId: rorResult.rorId,
        country: rorResult.country,
        countryCode: rorResult.countryCode,
        domain: rorResult.domain,
      };
    }
  }

  // 4. HTML title
  const htmlTitle = cleanInstitutionName(
    metadata.htmlTitle || $("title").first().text()
  );

  if (htmlTitle && looksLikeInstitution(htmlTitle)) {
    return {
      institution: htmlTitle,
      source: "html_title",
      confidence: 0.7,
    };
  }

  // 5. Header branding
  const brandingCandidates = [
    $("header").first().text(),
    $(".site-name").first().text(),
    $(".site-title").first().text(),
    $(".brand").first().text(),
    $(".logo").first().attr("alt"),
  ];

  for (const value of brandingCandidates) {
    const candidate = cleanInstitutionName(value);

    if (candidate && looksLikeInstitution(candidate)) {
      return {
        institution: candidate,
        source: "branding",
        confidence: 0.65,
      };
    }
  }

  return {
    institution: null,
    source: null,
    confidence: 0,
  };
}

module.exports = {
  extractInstitution,
};