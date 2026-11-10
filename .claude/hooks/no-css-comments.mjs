// PostToolUse hook: reports CSS comments that an edit added (see CLAUDE.md).
import { execFileSync } from "node:child_process";

let input = "";
for await (const chunk of process.stdin) input += chunk;
const file = JSON.parse(input).tool_input?.file_path ?? "";
if (!file.endsWith(".css")) process.exit(0);

let diff = "";
try {
  diff = execFileSync("git", ["diff", "-U0", "--no-color", "--", file], {
    encoding: "utf8",
  });
} catch {
  process.exit(0);
}

const added = diff
  .split("\n")
  .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
  .filter((line) => line.includes("/*") && !line.includes("/*!"));

if (added.length) {
  console.error(
    `Nieuw CSS-commentaar in ${file}:\n${added.join("\n")}\n` +
      "CLAUDE.md: geen commentaar in CSS, behalve bij een reden die niet uit de code blijkt (dan /*! … */). Haal het weg.",
  );
  process.exit(2);
}
