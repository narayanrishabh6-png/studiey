"use client";

import { FormEvent, useMemo, useState } from "react";

type Opportunity = {
  id: string;
  title: string;
  institution: string;
  department?: string | null;
  discipline: string;
  category: string;
country: string;
  funding: string;
  deadline?: string | null;
  official_source_url: string;
  application_url?: string | null;
  source_label: string;
  last_checked_at: string;
  summary: string;
  demo_only: boolean;
};

type FeedItem = { opportunity: Opportunity; match_score: number; match_reasons: string[] };

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function Home() {
  const [discipline, setDiscipline] = useState("Psychology");
  const [level, setLevel] = useState("pg");
  const [types, setTypes] = useState<string[]>(["phd", "research_job", "conference"]);
  const [country, setCountry] = useState("India");
  const [interest, setInterest] = useState("Cognitive Psychology");
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const typeOptions = useMemo(() => [
    ["admission", "Admissions"], ["phd", "PhD"], ["internship", "Internships"],
    ["research_job", "Research Jobs"], ["scholarship", "Scholarships"], ["fellowship", "Fellowships"],
    ["conference", "Conferences"], ["workshop", "Workshops"], ["call_for_papers", "Calls for Papers"],
    ["postdoc", "Postdocs"], ["academic_job", "Academic Jobs"]
  ], []);

  function toggleType(value: string) {
    setTypes(current => current.includes(value) ? current.filter(x => x !== value) : [...current, value]);
  }

  async function loadFeed(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          discipline,
          subdisciplines: interest ? [interest] : [],
          qualifications: [],
          opportunity_types: types,
          countries: country ? [country] : []
        })
      });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      setFeed(await res.json());
    } catch (err) {
      setError("Could not reach the F API. Start the backend on port 8000, then try again.");
    } finally { setLoading(false); }
  }

  return (
    <main>
      <nav className="nav"><div className="brand">Studiey</div><div className="navtag">Academic opportunities. From the source.</div></nav>

      <section className="hero">
        <div>
          <div className="eyebrow">UG → POSTDOC</div>
          <h1>Stop searching everywhere.<br/>See what actually fits you.</h1>
          <p>Create your academic profile once. Studiey filters admissions, internships, research jobs, conferences, funding and academic opportunities to your field and stage.</p>
          <div className="trust">✓ Official/primary sources only &nbsp; ✓ Personalized matching &nbsp; ✓ Provenance on every listing</div>
        </div>
      </section>

      <section className="workspace">
        <form className="profile" onSubmit={loadFeed}>
          <div className="sectionHead"><span>1</span><div><h2>Your academic profile</h2><p>Used only to personalize your feed.</p></div></div>
          <label>Current stage<select value={level} onChange={e=>setLevel(e.target.value)}><option value="ug">Undergraduate</option><option value="pg">Postgraduate / Master's</option><option value="phd">PhD scholar</option><option value="postdoc">Postdoc</option></select></label>
          <label>Discipline<input value={discipline} onChange={e=>setDiscipline(e.target.value)} placeholder="e.g. Psychology" /></label>
          <label>Research interest<input value={interest} onChange={e=>setInterest(e.target.value)} placeholder="e.g. Cognitive Psychology" /></label>
          <label>Preferred country<input value={country} onChange={e=>setCountry(e.target.value)} placeholder="India" /></label>
          <div className="labelText">What are you looking for?</div>
          <div className="chips">{typeOptions.map(([value,label]) => <button key={value} type="button" className={types.includes(value)?"chip active":"chip"} onClick={()=>toggleType(value)}>{label}</button>)}</div>
          <button className="primary" disabled={loading}>{loading ? "Building your feed…" : "Show my opportunities"}</button>
        </form>

        <section className="feedPanel">
          <div className="sectionHead"><span>2</span><div><h2>For you</h2><p>Only verified-official records are eligible for this feed.</p></div></div>
          {error && <div className="error">{error}</div>}
          {!feed.length && !error && <div className="empty"><div className="emptyIcon">SF</div><h3>Your personalized feed will appear here.</h3><p>The included data is synthetic demo data. Real opportunities will be added only after official-source ingestion is connected.</p></div>}
          <div className="cards">{feed.map(({opportunity:o, match_score, match_reasons}) => <article key={o.id} className="card">
            <div className="cardTop"><div><div className="type">{(o.category || "opportunity").replaceAll("_", " ")}</div><h3>{o.title}</h3><div className="institution">{o.institution}{o.department ? ` · ${o.department}` : ""}</div></div><div className="score">{match_score}%<small>match</small></div></div>
            <div className="meta"><span>📍 {o.country || "Location not specified"}</span><span>⏳ {o.deadline ?? "Deadline not specified"}</span><span>💰 {o.funding}</span></div>
            <p>{o.summary}</p>
            <div className="reasons">{match_reasons.map(r=><span key={r}>✓ {r}</span>)}</div>
            <div className="source"><strong>Verified official source ✓</strong><span>{o.source_label}</span><span>Last checked: {new Date(o.last_checked_at).toLocaleString()}</span></div>
            <div className="actions"><a href={o.official_source_url} target="_blank">Official notice</a>{o.application_url && <a href={o.application_url} target="_blank">Apply</a>}<button>Save</button></div>
            {o.demo_only && <div className="demo">DEMO RECORD — NOT A REAL OPPORTUNITY</div>}
          </article>)}</div>
        </section>
      </section>

      <section className="principles"><h2>What Studiey will never do</h2><div className="principleGrid"><div><b>Never invent eligibility</b><p>If an official notice does not state it, we show “Not specified”.</p></div><div><b>Never hide the source</b><p>Every listing keeps the original official notice and application link.</p></div><div><b>Never flood your feed</b><p>Field, stage and preference matching happen before ranking.</p></div></div></section>
    </main>
  );
}
