"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
const [needsReview, setNeedsReview] = useState<any[]>([]);

useEffect(() => {
  fetch("http://localhost:8000/admin/opportunities/needs-review")
  .then((res) => res.json())
  .then((data) => setNeedsReview(Array.isArray(data) ? data : []))
  .catch((error) => console.error("Failed to load needs review:", error));

  fetch("http://localhost:8000/admin/opportunities/pending")
    .then((res) => res.json())
    .then((data) => setOpportunities(Array.isArray(data) ? data : []))
    .catch((error) => console.error("Failed to load opportunities:", error));
}, []);
  return (
    <main style={{ padding: "40px" }}>
      <h1>Studiey Admin</h1>
      <p>Review and verify academic opportunities.</p>
      <p>Needs Review: {needsReview.length}</p>
      <p>Pending opportunities: {opportunities.length}</p>

{opportunities.map((opportunity) => (
  <div key={opportunity.id}>
    <h2>{opportunity.title}</h2>
    <p>{opportunity.institution}</p>
    <p>Department: {opportunity.department || "Not specified"}</p>
    <p>Status: {opportunity.verification_status}</p>
    <p>Category: {opportunity.category || "Not specified"}</p>
<p>Discipline: {opportunity.discipline || "Not specified"}</p>
<p>Country: {opportunity.country || "Not specified"}</p>
<p>Deadline: {opportunity.deadline || "Not specified"}</p>
<p>Published Date: {opportunity.published_date || "Not specified"}</p>

<p>
  <strong>Eligibility:</strong><br />
  {opportunity.eligibility || "Not specified"}
</p>

<p>
  <strong>Funding:</strong><br />
  {opportunity.funding_details || "Not specified"}
</p>

<p>
  <strong>Documents Required:</strong><br />
  {opportunity.documents_required || "Not specified"}
</p>

<p>
  <strong>Summary:</strong><br />
  {opportunity.summary || "Not specified"}
</p>
    <p>
  Source:{" "}
  <a
    href={opportunity.source_url}
    target="_blank"
    rel="noopener noreferrer"
  >
    Open Official Source
  </a>
</p>
{opportunity.application_url && (
  <p>
    Application:{" "}
    <a
      href={opportunity.application_url}
      target="_blank"
      rel="noopener noreferrer"
    >
      Open Application Page
    </a>
  </p>
)}
    <button
  onClick={() => {
    fetch(`http://localhost:8000/admin/opportunities/${opportunity.id}/verify`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then(() => {
        setOpportunities((current) =>
          current.filter((item) => item.id !== opportunity.id)
        );
      })
      .catch((error) => console.error("Failed to verify opportunity:", error));
  }}
>
  Verify
</button>
<button
  onClick={() => {
    fetch(`http://localhost:8000/admin/opportunities/${opportunity.id}/reject`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then(() => {
        setOpportunities((current) =>
          current.filter((item) => item.id !== opportunity.id)
        );
      })
      .catch((error) => console.error("Failed to reject opportunity:", error));
  }}
>
  Reject
</button>

<button
  onClick={() => {
    fetch(`http://localhost:8000/admin/opportunities/${opportunity.id}/needs-review`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then(() => {
        setOpportunities((current) =>
          current.filter((item) => item.id !== opportunity.id)
        );
      })
      .catch((error) =>
        console.error("Failed to mark opportunity for review:", error)
      );
  }}
>
  Needs Review
</button>
  </div>
))}
<h2>Needs Review Queue</h2>

{needsReview.map((opportunity) => (
  <div key={opportunity.id}>
    <h3>{opportunity.title}</h3>
    <p>{opportunity.institution}</p>
    <p>Status: {opportunity.verification_status}</p>

    <button
      onClick={() => {
        fetch(`http://localhost:8000/admin/opportunities/${opportunity.id}/verify`, {
          method: "POST",
        })
          .then((res) => res.json())
          .then(() => {
            setNeedsReview((current) =>
              current.filter((item) => item.id !== opportunity.id)
            );
          })
          .catch((error) =>
            console.error("Failed to verify reviewed opportunity:", error)
          );
      }}
    >
      Verify
    </button>

    <button
      onClick={() => {
        fetch(`http://localhost:8000/admin/opportunities/${opportunity.id}/reject`, {
          method: "POST",
        })
          .then((res) => res.json())
          .then(() => {
            setNeedsReview((current) =>
              current.filter((item) => item.id !== opportunity.id)
            );
          })
          .catch((error) =>
            console.error("Failed to reject reviewed opportunity:", error)
          );
      }}
    >
      Reject
    </button>
  </div>
))}
    </main>
  );
}