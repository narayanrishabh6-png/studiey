"use client";

import { FormEvent, useState } from "react";

export default function NewOpportunityPage() {
  const [form, setForm] = useState({
    title: "",
    institution: "",
    department: "",
    category: "phd",
    discipline: "",
    country: "",
    deadline: "",
    source_url: "",
    application_url: "",
    summary: "",
    eligibility_text: "",
funding_details: "",
published_date: "",
  });
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetch("http://localhost:8000/admin/opportunities", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(form),
});

const data = await response.json();
if (response.ok) {
  alert("Opportunity added successfully — Pending verification");
  window.location.href = "/admin";
} else {
  alert(data.error || "Failed to add opportunity");
}
  }

  return (
    <main style={{ padding: "40px", maxWidth: "700px" }}>
      <h1>Add New Opportunity</h1>

      <p>
        Add an academic opportunity to the Studiey verification queue.
      </p>

      <form onSubmit={handleSubmit}>
        <p>
          <label>Title</label><br />
          <input
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />
        </p>

        <p>
          <label>Institution</label><br />
          <input
            value={form.institution}
            onChange={(e) =>
              setForm({ ...form, institution: e.target.value })
            }
          />
        </p>
        <p>
  <label>Department</label><br />
  <input
    value={form.department}
    onChange={(e) =>
      setForm({ ...form, department: e.target.value })
    }
  />
</p>
<p>
  <label>Category</label><br />
  <select
    value={form.category}
    onChange={(e) =>
      setForm({ ...form, category: e.target.value })
    }
  >
    <option value="admission">Admission</option>
    <option value="phd">PhD</option>
    <option value="scholarship">Scholarship</option>
    <option value="fellowship">Fellowship</option>
    <option value="internship">Internship</option>
    <option value="research_job">Research Job</option>
    <option value="research_assistantship">Research Assistantship</option>
    <option value="project_assistantship">Project Assistantship</option>
    <option value="project">Project</option>
    <option value="postdoc">Postdoc</option>
    <option value="academic_faculty_position">Academic / Faculty Position</option>
    <option value="conference">Conference</option>
    <option value="workshop">Workshop</option>
    <option value="seminar">Seminar</option>
    <option value="call_for_papers">Call for Papers</option>
    <option value="grant">Grant</option>
    <option value="competition">Competition</option>
    <option value="training">Training</option>
  </select>
</p>
<p>
  <label>Discipline (Course)</label><br />
  <input
    value={form.discipline}
    onChange={(e) =>
      setForm({ ...form, discipline: e.target.value })
    }
  />
</p>
<p>
  <label>Country</label><br />
  <input
    value={form.country}
    onChange={(e) =>
      setForm({ ...form, country: e.target.value })
    }
  />
</p>
<p>
  <label>Deadline</label><br />
  <input
    type="date"
    value={form.deadline}
    onChange={(e) =>
      setForm({ ...form, deadline: e.target.value })
    }
  />
</p>
<p>
  <label>Official Source URL</label><br />
  <input
    type="url"
    value={form.source_url}
    onChange={(e) =>
      setForm({ ...form, source_url: e.target.value })
    }
  />
</p>
<p>
  <label>Application URL</label><br />
  <input
    type="url"
    value={form.application_url}
    onChange={(e) =>
      setForm({ ...form, application_url: e.target.value })
    }
  />
</p>
<p>
  <label>Summary</label><br />
  <textarea
    value={form.summary}
    onChange={(e) =>
      setForm({ ...form, summary: e.target.value })
    }
    rows={5}
  />
</p>
<p>
  <label>Eligibility</label><br />
  <textarea
    value={form.eligibility_text}
    onChange={(e) =>
      setForm({ ...form, eligibility_text: e.target.value })
    }
    rows={4}
  />
</p>

<p>
  <label>Funding Details</label><br />
  <textarea
    value={form.funding_details}
    onChange={(e) =>
      setForm({ ...form, funding_details: e.target.value })
    }
    rows={4}
  />
</p>

<p>
  <label>Published Date</label><br />
  <input
    type="date"
    value={form.published_date}
    onChange={(e) =>
      setForm({ ...form, published_date: e.target.value })
    }
  />
</p>
<p>
  <button type="submit">
    Add Opportunity
  </button>
</p>
      </form>
    </main>
  );
}