const cheerio = require("cheerio");

function cleanContent(html = "") {
  const $ = cheerio.load(html);

  // Remove elements that normally create extraction noise
  $(
    [
      "script",
      "style",
      "noscript",
      "template",
      "svg",
      "nav",
      "footer",
      "header",
      "form",
      "iframe",
      "[aria-hidden='true']",
    ].join(",")
  ).remove();

  // Prefer the semantic main-content area when available
  const contentSelectors = [
    "main",
    "article",
    "[role='main']",
    ".main-content",
    "#main-content",
    ".content",
    "#content",
  ];

  let contentRoot = null;

  for (const selector of contentSelectors) {
    const candidate = $(selector).first();

    if (candidate.length && candidate.text().trim().length >= 100) {
      contentRoot = candidate;
      break;
    }
  }

  // If no reliable main-content container exists,
  // safely fall back to the body.
  if (!contentRoot) {
    contentRoot = $("body");
  }

  const text = contentRoot
    .text()
    .replace(/\s+/g, " ")
    .trim();

  return {
    text,
    html: contentRoot.html() || "",
  };
}

module.exports = { cleanContent };