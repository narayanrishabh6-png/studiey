const fs = require("fs");
const path = require("path");
const { cleanContent } = require("../ingestion/cleanContent");

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
    return false;
  }

  console.log(`PASS: ${message}`);
  return true;
}

const testHtml = `
<html>
  <head>
    <style>.hidden { display:none; }</style>
    <script>console.log("noise")</script>
  </head>

  <body>
    <header>University Navigation</header>

    <main>
      <h1>PhD in Psychology</h1>
      <p>
        This programme usually takes three to four years of full-time study.
        Applications are open for postgraduate research candidates.
      </p>
    </main>

    <footer>Privacy | Contact | Cookies</footer>
  </body>
</html>
`;

const result = cleanContent(testHtml);

assert(
  result.text.includes("PhD in Psychology"),
  "keeps main opportunity content"
);

assert(
  !result.text.includes("University Navigation"),
  "removes header/navigation noise"
);

assert(
  !result.text.includes("Privacy"),
  "removes footer noise"
);

assert(
  !result.text.includes('console.log("noise")'),
  "removes script content"
);

const cambridgeHtml = fs.readFileSync(
  path.join(__dirname, "fixtures", "cambridge.html"),
  "utf8"
);

const cambridgeResult = cleanContent(cambridgeHtml);

assert(
  cambridgeResult.text.length > 500,
  "real Cambridge fixture contains substantial cleaned content"
);

assert(
  /three to four years/i.test(cambridgeResult.text) &&
    /study/i.test(cambridgeResult.text),
  "real Cambridge fixture keeps core programme content"
);