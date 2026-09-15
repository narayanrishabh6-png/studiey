const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const cheerio = require("cheerio");

const { detectPageState } = require("./ingestion/detectPageState");
const { cleanContent } = require("./ingestion/cleanContent");
const { extractMetadata } = require("./ingestion/extractMetadata");
const { extractDuration } = require("./ingestion/extractDuration");
const { extractStudyLoad } = require("./ingestion/extractStudyLoad");
const { extractMode } = require("./ingestion/extractMode");
const { extractDeadline } = require("./ingestion/extractDeadline");
const { extractInstitution } = require("./ingestion/extractInstitution");
const {
  loadCompactRorDomainIndex,
} = require("./ingestion/lookupInstitutionRor");

const path = require("path");

const rorDomainIndex = loadCompactRorDomainIndex(
  path.join(__dirname, "data", "ror-domain-index.json")
);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const app = express();
const PORT = 8000;
// Studiey normalization layer

const institutionDomainRegistry = {
  "cam.ac.uk": "University of Cambridge",
  "anu.edu.au": "Australian National University",
  "christuniversity.in": "CHRIST (Deemed to be University)",
  "isro.gov.in": "Indian Space Research Organisation (ISRO)",

  "uohyd.ac.in": "University of Hyderabad",
  "bhu.ac.in": "Banaras Hindu University",
  "harvard.edu": "Harvard University",
};

const opportunityTypeRegistry = {
  phd: ["phd", "dphil", "doctor of philosophy", "doctoral researcher", "doctoral studentship"],
  internship: ["internship"],
  postdoc: ["postdoc", "postdoctoral"],
  scholarship: ["scholarship", "studentship"],
  fellowship: ["fellowship"],
  grant: ["grant"],
  conference: ["conference"],
  workshop: ["workshop"],
  seminar: ["seminar"],
  call_for_papers: ["call for papers", "call for paper", "cfp"],
  research_job: [
    "research assistant",
    "research associate",
    "junior research fellow",
    "jrf"
  ],
  academic_job: [
    "assistant professor",
    "associate professor",
    "professor",
    "lecturer",
    "faculty position",
    "guest faculty",
    "ad-hoc faculty",
    "adhoc faculty",
    "ad hoc faculty"
  ],
  admission: ["admission", "admissions"],
  competition: ["competition", "contest"]
};

const academicLevelRegistry = {
  masters: [
    "master of ",
    "master's degree",
    "masters degree",
    "master's programme",
    "master's program",
    "master studies",
    "postgraduate taught",
    "m.sc",
    "msc",
    "m.a.",
    "ma ",
    "m.s.",
    "ms ",
    "m.tech",
    "mtech",
    "mba",
    "m.phil",
    "mphil"
  ],
  phd: [
    "phd",
    "dphil",
    "doctor of philosophy",
    "doctoral programme",
    "doctoral program"
  ]
};

function getInstitutionFromDomain(sourceDomain) {
  for (const [domain, institution] of Object.entries(institutionDomainRegistry)) {
    if (sourceDomain === domain || sourceDomain.endsWith(`.${domain}`)) {
      return institution;
    }
  }
return null;
}

  function getInstitutionFromPage($, pageText, title, siteName) {
  const candidates = [
    siteName,
    $('meta[property="og:site_name"]').attr("content"),
    $('meta[name="author"]').attr("content"),
    title,
    $("header").first().text(),
    pageText.slice(0, 1500),
  ]
    .filter(Boolean)
    .map((value) => String(value).replace(/\s+/g, " ").trim());

    const institutionPattern =
  /\b(?:University of (?:[A-Z][A-Za-z&.'’()-]*\s*){1,8}|(?:[A-Z][A-Za-z&.'’()-]*\s+){1,8}University|(?:[A-Z][A-Za-z&.'’()-]*\s+){1,8}Institute of Technology)\b/;

  for (const candidate of candidates) {
    const match = candidate.match(institutionPattern);

    if (match) {
      return match[0]
        .replace(/\s+/g, " ")
        .trim();
    }
  }

  return null;
}
  
function extractStructuredData($) {
  const structuredData = [];

  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      const data = JSON.parse($(element).html());
      structuredData.push(data);
    } catch {
      // Ignore invalid JSON-LD
    }
  });

  return structuredData;
}

function getInstitutionFromStructuredData(structuredData) {
  const items = structuredData.flatMap((data) =>
    Array.isArray(data?.["@graph"]) ? data["@graph"] : [data]
  );

  for (const item of items) {
    const organization =
      item?.provider ||
      item?.publisher ||
item?.sourceOrganization ||
item?.hiringOrganization;
    if (typeof organization?.name === "string") {
      return organization.name.trim();
    }

    if (
      ["CollegeOrUniversity", "EducationalOrganization", "Organization"].includes(
        item?.["@type"]
      ) &&
      typeof item?.name === "string"
    ) {
      return item.name.trim();
    }
  }

  return null;
}

function normalizeDuration(sourceDuration) {
  if (!sourceDuration) return null;

const match = sourceDuration.match(/(\d+(?:\.\d+)?)\s*(years?|yrs?|months?)/i);

  if (!match) return null;

return match[2].toLowerCase().startsWith("month")
  ? Number(match[1]) / 12
  : Number(match[1]);
}
function normalizeDeadline(sourceDeadline) {
  if (!sourceDeadline) return null;

  const parsedDate = new Date(sourceDeadline);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toISOString().split("T")[0];
}
  function normalizeOpportunityType(sourceText) {
  if (!sourceText) return null;

  const value = sourceText.toLowerCase();

  for (const [type, keywords] of Object.entries(opportunityTypeRegistry)) {
  if (keywords.some((keyword) => value.includes(keyword))) {
    return type;
  }
}

return "other";
 
}

function normalizeAcademicLevel(sourceText) {
  if (!sourceText) return null;

  const value = sourceText.toLowerCase();
  for (const [level, keywords] of Object.entries(academicLevelRegistry)) {
  if (keywords.some((keyword) => {
  if (["ma ", "ms "].includes(keyword)) {
    return new RegExp(`\\b${keyword.trim()}\\b`, "i").test(sourceText);
  }

  return value.includes(keyword);
})) {
    return level;
  }
}
  return null;
}
function normalizeStudyLoad(sourceLoad) {
  if (!sourceLoad) return null;

  const value = sourceLoad.toLowerCase().trim();

  if (["full-time", "full time", "day scholar", "regular"].includes(value)) {
    return "full_time";
  }

  if (["part-time", "part time"].includes(value)) {
    return "part_time";
  }

  return "other";
}
function normalizeMode(sourceMode) {
  if (!sourceMode) return null;

  const value = sourceMode.toLowerCase().trim();

  if (["day scholar", "regular", "full-time", "full time"].includes(value)) {
    return "full_time";
  }

  if (["in person", "on campus", "on-campus", "onsite", "on site"].includes(value)) {
  return "in_person";
}

  if (["part-time", "part time"].includes(value)) {
    return "part_time";
  }

  if (["online", "distance", "remote"].includes(value)) {
    return "online";
  }

  if (["hybrid", "blended"].includes(value)) {
    return "hybrid";
  }

  return "other";
}
async function fetchLayer2Source(sourceUrl) {
  if (sourceUrl.includes("ox.ac.uk")) {
    const fallbackUrl =
  "https://www.psy.ox.ac.uk/study/Graduate-training/DPhil-EP-full-time";
const fallbackResponse = await fetch(fallbackUrl);
const fallbackHtml = await fallbackResponse.text();
const fallback$ = cheerio.load(fallbackHtml);
const fallbackTitle = fallback$("h1").first().text().trim();
const fallbackBlocked =
  fallbackResponse.status === 403 ||
  fallbackTitle.includes("403");
  if (fallbackBlocked) {
  return {
    success: false,
    sourceUrl,
    ingestionLayer: 2,
    needsFallback: true,
    fallbackStatus: "browser_or_manual_required",
    fallbackUrl,
  };
}
    return {
      success: false,
      sourceUrl,
       fallbackTitle,
      ingestionLayer: 2,
      needsFallback: true,
      fallbackStatus: "official_alternative_source_available",
      fallbackUrl:
        "https://www.psy.ox.ac.uk/study/Graduate-training/DPhil-EP-full-time",
    };
  }

  if (sourceUrl.includes("ucl.ac.uk")) {
  return {
    success: false,
    sourceUrl,
    ingestionLayer: 2,
    needsFallback: true,
    fallbackStatus: "browser_or_manual_required",
  };
}

  return {
    success: false,
    sourceUrl,
    ingestionLayer: 2,
    needsFallback: true,
    fallbackStatus: "not_implemented",
  };
}
app.use(cors());
app.use(express.json());
app.get("/scrape-test", async (req, res) => {
  try {
    const sourceUrl = req.query.url || "https://christuniversity.in/courses/MTYz";
    if (!sourceUrl.startsWith("https://")) {
  return res.status(400).json({
    success: false,
    error: "Only HTTPS source URLs are allowed",
  });
}
let response;
try {
  response = await fetch(sourceUrl);
} catch (fetchError) {
  const fallbackResult = await fetchLayer2Source(sourceUrl);
  return res.status(503).json(fallbackResult);
}
const html = await response.text();
   
const pageState = detectPageState({
  status: response.status,
  html,
});

if (!pageState.usable) {
  return res.status(pageState.httpStatus || 422).json({
    success: false,
    sourceUrl,
    pageState: pageState.state,
    reason: pageState.reason,
  });
}
    const $ = cheerio.load(html);
    const structuredData = extractStructuredData($);
    
    const metadata = extractMetadata(html);

const title = metadata.title || $("title").text().trim();
const siteName = metadata.siteName || null;
const sourceDomain = new URL(sourceUrl).hostname.replace(/^www\./, "");
const heading = metadata.h1 || $("h1").first().text().trim();
const ogTitle = metadata.ogTitle || null;

  const h2Heading = $("h2").first().text().trim();
   const cleanedContent = cleanContent(html);
const pageText = cleanedContent.text;
const clean$ = cheerio.load(cleanedContent.html);
const contentRoot = clean$("body");

const contentCandidates = contentRoot
  .find("h1, h2, h3, h4, p, li, td")
  .map((_, element) =>
    clean$(element).text().replace(/\s+/g, " ").trim()
  )
  .get()
  .filter(
    (text) =>
      text &&
      text.length <= 600
  );

  const pageAcademicProgramCandidate =
  pageText.match(
    /\b(?:M\.?\s*Sc\.?|MSc|M\.?\s*A\.?|M\.?\s*Tech\.?|MTech|M\.?\s*Des\.?|MDes|MBA|MRes|MEng|MPH|LLM)(?=\s|\(|$|[,:;-])(?:\s*\([^)]{1,40}\))?(?:\s+and\s+(?:M\.?\s*Sc\.?|MSc|M\.?\s*A\.?|M\.?\s*Tech\.?|MTech|M\.?\s*Des\.?|MDes|MBA|MRes|MEng|MPH|LLM))?(?:\s+(?:in\s+)?[A-Za-z][A-Za-z&/-]*(?:\s+[A-Za-z][A-Za-z&/-]*){0,2})?/i
  )?.[0]?.trim() || null;
const academicProgramCandidate =
  pageAcademicProgramCandidate ||
  contentCandidates
    .map((candidate) => {
      const match = candidate.match(
        /\b(?:M\.?\s*Sc\.?|MSc|M\.?\s*A\.?|M\.?\s*Tech\.?|MTech|M\.?\s*Des\.?|MDes|MBA|MRes|MEng|MPH|LLM)(?=\s|\(|$|[,:;-])(?:\s*\([^)]{1,40}\))?(?:\s+and\s+(?:M\.?\s*Sc\.?|MSc|M\.?\s*A\.?|M\.?\s*Tech\.?|MTech|M\.?\s*Des\.?|MDes|MBA|MRes|MEng|MPH|LLM))?(?:\s+(?:in\s+)?[A-Za-z][A-Za-z&/-]*(?:\s+[A-Za-z][A-Za-z&/-]*){0,2})?/i
      );

      return match?.[0]?.trim() || null;
    })
    .find(Boolean) ||
  contentCandidates.find(
    (candidate) =>
      normalizeAcademicLevel(candidate) !== null
  ) ||
  null;
  const cleanedAcademicProgramCandidate =
  academicProgramCandidate
    ?.replace(
      /\s+(?:M\.?\s*Sc\.?|MSc|M\.?\s*A\.?|M\.?\s*Tech\.?|MTech|M\.?\s*Des\.?|MDes|MBA|MRes|MEng|MPH|LLM)\s*$/i,
      ""
    )
    .trim() || null;

    const phdPosition = pageText.toLowerCase().indexOf("psychology");
    const headingOpportunityType =
  normalizeOpportunityType(heading);
  const h2OpportunityType =
  normalizeOpportunityType(h2Heading);
  const titleOpportunityType =
  normalizeOpportunityType(title);
  const headingAcademicLevel =
  normalizeAcademicLevel(heading);

const h2AcademicLevel =
  normalizeAcademicLevel(h2Heading);

const titleAcademicLevel =
  normalizeAcademicLevel(title);
  const structuredOpportunityTitle = structuredData
  .flatMap((data) =>
    Array.isArray(data?.["@graph"]) ? data["@graph"] : [data]
  )
  .map((item) => item?.title || item?.name)
  .find(
  (candidate) =>
    candidate &&
  candidate.trim().length >= 5 &&
    (
      normalizeOpportunityType(candidate) !== "other" ||
      normalizeAcademicLevel(candidate) !== null
    )
) || null;
    const opportunityTitle =
  structuredOpportunityTitle ||
  (
  h2OpportunityType !== "other" ||
  h2AcademicLevel !== null
  ? h2Heading
  : null
) ||
(
  headingOpportunityType !== "other" ||
  headingAcademicLevel !== null
    ? heading
    : null
) ||
cleanedAcademicProgramCandidate ||
(
  titleOpportunityType !== "other" ||
  titleAcademicLevel !== null
  ? title
  : null
);
  const normalizedOpportunityType =
  normalizeOpportunityType(opportunityTitle);

  const normalizedAcademicLevel =
  normalizeAcademicLevel(opportunityTitle);

  const institutionResult = extractInstitution(
  html,
  {
    ...extractMetadata(html),
    sourceUrl,
  },
  rorDomainIndex
);

const institution = institutionResult.institution;
    
  const deadlineResult = extractDeadline(pageText);

const deadline = deadlineResult?.raw || null;

const normalizedDeadline =
  deadlineResult?.normalizedDeadline || null;
    
const durationResult = extractDuration(pageText);

const duration = durationResult?.raw || null;

const durationYears =
  durationResult?.durationYearsMin === durationResult?.durationYearsMax
    ? durationResult?.durationYearsMin ?? null
    : durationResult?.durationYearsMin != null &&
      durationResult?.durationYearsMax != null
      ? `${durationResult.durationYearsMin}-${durationResult.durationYearsMax}`
      : null;

    const studyLoadResult = extractStudyLoad(pageText);

const studyLoad = studyLoadResult?.raw || null;

const normalizedStudyLoad =
  studyLoadResult?.normalizedStudyLoad || null;
const modeResult = extractMode(pageText);

const mode = modeResult?.raw || null;
  const campus =
  pageText.match(/Campus\s*(Bangalore Central Campus|Bangalore Bannerghatta Road Campus)/i)?.[1] ||
  null;
    const normalizedMode =
  modeResult?.normalizedMode || null;

  res.json({
  success: true,
  sourceUrl,
  structuredData,
  siteName,
  sourceDomain,
  title,
  titleOpportunityType,
  ogTitle,
h2Heading,
  heading,
  opportunityTitle,
  pageAcademicProgramCandidate,
academicProgramCandidate,
debugAcademicLevel: normalizeAcademicLevel(pageAcademicProgramCandidate),
  normalizedOpportunityType,
  normalizedAcademicLevel,
  institution,
  deadline,
  normalizedDeadline,
  duration,
  durationYears,
  studyLoad,
normalizedStudyLoad,
  mode,
  campus,
  normalizedMode,
  phdPosition,
  pageText: pageText.slice(Math.max(0, phdPosition - 500), phdPosition + 1500),
});

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/db-test", async (req, res) => {
  const { data, error } = await supabase
    .from("opportunities")
    .select("id")
    .limit(1);

  if (error) {
    return res.status(500).json({
      connected: false,
      error: error.message
    });
  }

  res.json({
    connected: true,
    message: "Studiey successfully connected to Supabase"
  });
});

app.get("/opportunities-db", async (req, res) => {
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({
      error: error.message
    });
  }

  res.json(data);
});



app.get("/", (req, res) => {
  res.json({
    name: "Studiey API",
    status: "running",
    mode: "database-backed",
  });
});

app.get("/admin/opportunities/pending", async (req, res) => {
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("verification_status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data || []);
});

app.get("/admin/opportunities/needs-review", async (req, res) => {
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("verification_status", "needs_review")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data || []);
});

app.post("/admin/opportunities/:id/verify", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("opportunities")
    .update({
      verification_status: "verified",
      last_checked_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.post("/admin/opportunities/:id/reject", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("opportunities")
    .update({
      verification_status: "rejected",
      last_checked_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.post("/admin/opportunities/:id/needs-review", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("opportunities")
    .update({
      verification_status: "needs_review",
      last_checked_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

  app.post("/admin/opportunities", async (req, res) => {
  const {
    title,
    institution,
    department,
    category,
    discipline,
    country,
    deadline,
    source_url,
    application_url,
    summary,
    eligibility,
    documents_required,
funding_details,
published_date,
  } = req.body;

  if (!title || !institution || !category || !source_url) {
    return res.status(400).json({
      error: "Title, institution, category, and official source URL are required.",
    });
  }

  const { data, error } = await supabase
    .from("opportunities")
    .insert({
      title,
      institution,
      department: department || null,
      category,
      discipline: discipline || null,
      country: country || null,
      deadline: deadline || null,
      source_url,
      application_url: application_url || null,
      summary: summary || null,
      eligibility: eligibility || null,
      documents_required: documents_required || null,
funding_details: funding_details || null,
published_date: published_date || null,
      verification_status: "pending",
      status: "active",
      extraction_method: "manual",
      last_checked_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

app.post("/feed", async (req, res) => {
  const profile = req.body || {};

const { data: dbOpportunities, error: dbError } = await supabase
  .from("opportunities")
  .select("*")
  .eq("verification_status", "verified")
  .eq("status", "active")
  .order("created_at", { ascending: false });

if (dbError) {
  return res.status(500).json({ error: dbError.message });
}

  const discipline = String(profile.discipline || "").toLowerCase();
  const interests = (profile.subdisciplines || []).map((x) =>
    String(x).toLowerCase()
  );
  const requestedTypes = profile.opportunity_types || [];
  const countries = (profile.countries || []).map((x) =>
    String(x).toLowerCase()
  );

  const feed = dbOpportunities
    .filter((opportunity) => {
      if (
        requestedTypes.length &&
        !requestedTypes.includes(opportunity.category)
      ) {
        return false;
      }

      return true;
    })
    .map((opportunity) => {
      let score = 40;
      const reasons = [];

      if (opportunity.discipline.toLowerCase() === discipline) {
        score += 25;
        reasons.push("Matches your discipline");
      }

      const countryMatch = [opportunity.country].some((country) =>
        countries.includes(country.toLowerCase())
      );

      if (countryMatch) {
        score += 15;
        reasons.push("Matches your preferred country");
      }

      const opportunityInterestText = [
  opportunity.subdiscipline,
  opportunity.title,
  opportunity.summary,
]
  .filter(Boolean)
  .join(" ")
  .toLowerCase();

const interestMatch = interests.some((interest) =>
  opportunityInterestText.includes(interest)
);
      if (interestMatch) {
        score += 20;
        reasons.push("Matches your research interest");
      }

      if (requestedTypes.includes(opportunity.opportunity_type)) {
        reasons.push("Matches the opportunity type you selected");
      }

      const { keywords, ...publicOpportunity } = opportunity;

      return {
        opportunity: publicOpportunity,
        match_score: Math.min(score, 100),
        match_reasons: reasons,
      };
    })
    .sort((a, b) => b.match_score - a.match_score);

  res.json(feed);
});

app.listen(PORT, () => {
  console.log(`Studiey API running at http://localhost:${PORT}`);
});