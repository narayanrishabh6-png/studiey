function detectPageState({ status, html = "", title = "" }) {
  const text = `${title} ${html}`
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  // Real HTTP errors
  if (status === 404 || status === 410) {
    return {
      state: "not_found",
      usable: false,
      reason: `HTTP ${status}`,
    };
  }

  if (status === 401 || status === 403) {
    return {
      state: "blocked",
      usable: false,
      reason: `HTTP ${status}`,
    };
  }

  if (status >= 500) {
    return {
      state: "server_error",
      usable: false,
      reason: `HTTP ${status}`,
    };
  }

  // Soft 404: server says 200, but page itself says it does not exist
  const soft404Patterns = [
    /\b404\s+(?:file\s+)?not\s+found\b/i,
    /\bpage\s+not\s+found\b/i,
    /\bpage\s+does\s+not\s+exist\b/i,
    /\bwe\s+could(?:n't| not)\s+find\s+(?:the|this)\s+page\b/i,
  ];

  if (soft404Patterns.some((pattern) => pattern.test(text))) {
    return {
      state: "soft_404",
      usable: false,
      reason: "Page content indicates that the requested page does not exist",
    };
  }

  // Very little usable content can indicate a JS-rendered/empty page
  if (text.length < 100) {
    return {
      state: "content_too_thin",
      usable: false,
      reason: "Insufficient page content",
    };
  }

  return {
    state: "ok",
    usable: true,
    reason: null,
  };
}

module.exports = { detectPageState };