
const fs = require("node:fs");

const mapping = JSON.parse(
  fs.readFileSync("src/lib/portfolio-assets.generated.json", "utf8")
);

async function verify() {
  const entries = Object.entries(mapping);
  const results = [];

  console.log(`Checking ${entries.length} ImageKit URLs...\n`);

  for (const [localPath, remoteUrl] of entries) {
    try {
      const response = await fetch(remoteUrl, {
        method: "HEAD",
        signal: AbortSignal.timeout(15000),
      });

      results.push({
        localPath,
        remoteUrl,
        status: response.status,
        success: response.ok,
      });

      console.log(`${response.ok ? "PASS" : "FAIL"} ${response.status} ${localPath}`);
    } catch (error) {
      results.push({
        localPath,
        remoteUrl,
        status: "ERROR",
        success: false,
        error: error.message,
      });

      console.log(`ERROR ${localPath}: ${error.message}`);
    }
  }

  const failed = results.filter((item) => !item.success);

  fs.writeFileSync(
    "imagekit-verification-report.json",
    JSON.stringify(results, null, 2)
  );

  console.log("\n========== SUMMARY ==========");
  console.log(`Total: ${results.length}`);
  console.log(`Successful: ${results.length - failed.length}`);
  console.log(`Failed: ${failed.length}`);
  console.log("Report: imagekit-verification-report.json");
}

verify();
