const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

// Synthetic records for MVP testing only.
// These are deliberately marked demo_only so they cannot be mistaken
// for real academic opportunities.
const opportunities = [
  {
    id: "demo-001",
    title: "PhD in Cognitive Psychology — Demo",
    institution: "ScholarFlow Demo University",
    department: "Department of Psychology",
    discipline: "Psychology",
    opportunity_type: "phd",
    countries: ["India"],
    funding: "Funding information not specified",
    deadline: null,
    official_source_url: "https://example.com",
    application_url: null,
    source_label: "Synthetic ScholarFlow test record",
    last_checked_at: new Date().toISOString(),
    summary:
      "Synthetic opportunity used to test ScholarFlow's profile matching and feed interface.",
    demo_only: true,
    keywords: ["cognitive psychology", "psychology", "cognition"],
  },
  {
    id: "demo-002",
    title: "Research Assistant — Behavioural Science — Demo",
    institution: "ScholarFlow Demo Research Institute",
    department: "Behavioural Science Lab",
    discipline: "Psychology",
    opportunity_type: "research_job",
    countries: ["India"],
    funding: "Paid position — demo record",
    deadline: null,
    official_source_url: "https://example.com",
    application_url: null,
    source_label: "Synthetic ScholarFlow test record",
    last_checked_at: new Date().toISOString(),
    summary:
      "Synthetic research-assistant listing for testing personalized opportunity matching.",
    demo_only: true,
    keywords: ["psychology", "behavioural science", "research"],
  },
  {
    id: "demo-003",
    title: "Conference on Cognition and Human Behaviour — Demo",
    institution: "ScholarFlow Demo Academic Society",
    department: null,
    discipline: "Psychology",
    opportunity_type: "conference",
    countries: ["India"],
    funding: "Not specified",
    deadline: null,
    official_source_url: "https://example.com",
    application_url: null,
    source_label: "Synthetic ScholarFlow test record",
    last_checked_at: new Date().toISOString(),
    summary:
      "Synthetic conference record for testing ScholarFlow's academic opportunity feed.",
    demo_only: true,
    keywords: ["cognitive psychology", "cognition", "behaviour"],
  },
];

app.get("/", (req, res) => {
  res.json({
    name: "ScholarFlow API",
    status: "running",
    mode: "MVP demo",
  });
});

app.post("/feed", (req, res) => {
  const profile = req.body || {};

  const discipline = String(profile.discipline || "").toLowerCase();
  const interests = (profile.subdisciplines || []).map((x) =>
    String(x).toLowerCase()
  );
  const requestedTypes = profile.opportunity_types || [];
  const countries = (profile.countries || []).map((x) =>
    String(x).toLowerCase()
  );

  const feed = opportunities
    .filter((opportunity) => {
      if (
        requestedTypes.length &&
        !requestedTypes.includes(opportunity.opportunity_type)
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

      const countryMatch = opportunity.countries.some((country) =>
        countries.includes(country.toLowerCase())
      );

      if (countryMatch) {
        score += 15;
        reasons.push("Matches your preferred country");
      }

      const interestMatch = opportunity.keywords.some((keyword) =>
        interests.some(
          (interest) =>
            keyword.includes(interest) || interest.includes(keyword)
        )
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
  console.log(`ScholarFlow API running at http://localhost:${PORT}`);
});