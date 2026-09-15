const { detectPageState } = require("../ingestion/detectPageState");

function runTest(name, input, expectedState) {
  const result = detectPageState(input);

  if (result.state !== expectedState) {
    console.error(
      `FAIL: ${name} | expected=${expectedState} actual=${result.state}`
    );
    process.exitCode = 1;
    return;
  }

  console.log(`PASS: ${name}`);
}

runTest(
  "normal opportunity page",
  {
    status: 200,
    title: "PhD in Psychology",
    html: "<html><body><main>PhD in Psychology at the University of Cambridge. This programme usually takes three to four years of full-time study.</main></body></html>",
  },
  "ok"
);

runTest(
  "real 404",
  {
    status: 404,
    title: "Not Found",
    html: "<html><body>Not Found</body></html>",
  },
  "not_found"
);

runTest(
  "soft 404",
  {
    status: 200,
    title: "404 File Not Found",
    html: "<html><body>404 File Not Found</body></html>",
  },
  "soft_404"
);

runTest(
  "blocked page",
  {
    status: 403,
    title: "Access Denied",
    html: "<html><body>Access Denied</body></html>",
  },
  "blocked"
);

const fs = require("fs");
const path = require("path");

const cambridgeHtml = fs.readFileSync(
  path.join(__dirname, "fixtures", "cambridge.html"),
  "utf8"
);

runTest(
  "real Cambridge fixture",
  {
    status: 200,
    title: "PhD in Psychology",
    html: cambridgeHtml,
  },
  "ok"
);