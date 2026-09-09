const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

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

// Synthetic records for MVP testing only.
// These are deliberately marked demo_only so they cannot be mistaken
// for real academic opportunities.
const opportunities = [
  {
    id: "demo-001",
    title: "PhD in Cognitive Psychology — Demo",
    institution: "Studiey Demo University",
    department: "Department of Psychology",
    discipline: "Psychology",
    opportunity_type: "phd",
    countries: ["India"],
    funding: "Funding information not specified",
    deadline: null,
    official_source_url: "https://example.com",
    application_url: null,
    source_label: "Synthetic Studiey test record",
    last_checked_at: new Date().toISOString(),
    summary:
      "Synthetic opportunity used to test Studiey's profile matching and feed interface.",
    demo_only: true,
    keywords: ["cognitive psychology", "psychology", "cognition"],
  },
  {
    id: "demo-002",
    title: "Research Assistant — Behavioural Science — Demo",
    institution: "Studiey Demo Research Institute",
    department: "Behavioural Science Lab",
    discipline: "Psychology",
    opportunity_type: "research_job",
    countries: ["India"],
    funding: "Paid position — demo record",
    deadline: null,
    official_source_url: "https://example.com",
    application_url: null,
    source_label: "Synthetic Studiey test record",
    last_checked_at: new Date().toISOString(),
    summary:
      "Synthetic research-assistant listing for testing personalized opportunity matching.",
    demo_only: true,
    keywords: ["psychology", "behavioural science", "research"],
  },
  {
    id: "demo-003",
    title: "Conference on Cognition and Human Behaviour — Demo",
    institution: "Studiey Demo Academic Society",
    department: null,
    discipline: "Psychology",
    opportunity_type: "conference",
    countries: ["India"],
    funding: "Not specified",
    deadline: null,
    official_source_url: "https://example.com",
    application_url: null,
    source_label: "Synthetic Studiey test record",
    last_checked_at: new Date().toISOString(),
    summary:
      "Synthetic conference record for testing Studiey's academic opportunity feed.",
    demo_only: true,
    keywords: ["cognitive psychology", "cognition", "behaviour"],
  },
];

app.get("/", (req, res) => {
  res.json({
    name: "Studiey API",
    status: "running",
    mode: "MVP demo",
  });
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

      const interestMatch = (opportunity.keywords || []).some((keyword) =>
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
  console.log(`Studiey API running at http://localhost:${PORT}`);
});