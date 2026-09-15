const cheerio = require("cheerio");

function normalize(value) {
  return typeof value === "string"
    ? value.replace(/\s+/g, " ").trim()
    : null;
}

function firstNonEmpty(...values) {
  for (const value of values) {
    const cleaned = normalize(value);

    if (cleaned) {
      return cleaned;
    }
  }

  return null;
}

function extractMetadata(html = "") {
  const $ = cheerio.load(html);

  const htmlTitle = normalize($("title").first().text());

  const ogTitle = normalize(
    $('meta[property="og:title"]').attr("content")
  );

  const twitterTitle = normalize(
    $('meta[name="twitter:title"]').attr("content")
  );

  const siteName = firstNonEmpty(
    $('meta[property="og:site_name"]').attr("content"),
    $('meta[name="application-name"]').attr("content")
  );

  const description = firstNonEmpty(
    $('meta[name="description"]').attr("content"),
    $('meta[property="og:description"]').attr("content")
  );

  const h1 = normalize($("h1").first().text());

  const canonicalUrl = normalize(
    $('link[rel="canonical"]').attr("href")
  );

  const pageTitleCandidate = firstNonEmpty(
    ogTitle,
    twitterTitle,
    h1,
    htmlTitle
  );

  return {
    htmlTitle,
    ogTitle,
    twitterTitle,
    h1,
    siteName,
    description,
    canonicalUrl,
    pageTitleCandidate,
  };
}

module.exports = { extractMetadata };