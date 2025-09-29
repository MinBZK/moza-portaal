/* eslint-disable @typescript-eslint/no-require-imports */
const pa11y = require("pa11y");
const path = require("path");
const fs = require("fs");
const htmlReporter = require("pa11y-reporter-html");

const urls = [
  "/",
  "/instellingen",
  "/berichtenbox",
  "/bedrijfsprofiel",
  "/contactmomenten",
];
const baseUrl = "http://localhost:3000"; //"https://moza.mijnoverheidzakelijk.nl"; // Pas aan naar localhost als je dat wilt

const outputDir = path.join(__dirname, "output");

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

(async () => {
  for (const pagepath of urls) {
    const url = baseUrl + pagepath;
    console.log(`\nRunning accessibility test for: ${url}`);

    try {
      const results = await pa11y(url, {
        actions: [
          "wait for element body to be visible",
          "wait for element .button to be visible",
          "click element .button",
          "wait for element body to be visible",
          "wait for element #username to be visible",
          "set field #username to bedrijf",
          "set field #password to password",
          "click element #kc-login",
          "screen capture output/login-screen.png",
          "wait for element body to be visible",
        ],

        screenCapture: path.join(
          outputDir,
          `screenshot-${pagepath.replace(/\//g, "")}.png`,
        ),

        standard: "WCAG2AA",
        timeout: 3000,
        viewport: {
          height: 1080,
          width: 1920,
        },
        reporter: "html", // Use the built-in html reporter
      });
      const htmlReport = await htmlReporter.results(results);

      const reportFilename = path.join(
        outputDir,
        `report-${pagepath.replace(/\//g, "")}.html`,
      );
      fs.writeFileSync(reportFilename, htmlReport);

      console.log("Accessibility issues found:\n");
      results.issues.forEach((issue) => {
        console.log(`[${issue.type}] ${issue.message} (on ${issue.selector})`);
      });
    } catch (error) {
      console.error(`Pa11y failed to run for ${url}:\n`, error);
    }
  }
})();
