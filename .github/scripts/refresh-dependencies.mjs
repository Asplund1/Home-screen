import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const manifests = process.argv.slice(2);
if (manifests.length === 0) {
  throw new Error("At least one package.json path is required.");
}

function getLatestInMajor(name, versionRange) {
  const major = versionRange.match(/\d+/)?.[0];
  if (!major) throw new Error(`Cannot determine major version: ${name}@${versionRange}`);

  const output = execFileSync("npm", ["view", `${name}@${major}`, "version", "--json"], {
    encoding: "utf8",
    timeout: 60_000,
  });
  const versions = JSON.parse(output);
  const available = (Array.isArray(versions) ? versions : [versions])
    .filter((version) => /^\d+\.\d+\.\d+$/.test(version))
    .sort((a, b) => {
      const left = a.split(".").map(Number);
      const right = b.split(".").map(Number);
      return left[0] - right[0] || left[1] - right[1] || left[2] - right[2];
    });
  if (available.length === 0) throw new Error(`No stable version: ${name}@${major}`);
  return available.at(-1);
}

for (const file of manifests) {
  const pkg = JSON.parse(readFileSync(file, "utf8"));
  for (const section of ["dependencies", "devDependencies"]) {
    for (const [name, current] of Object.entries(pkg[section] ?? {})) {
      const latest = getLatestInMajor(name, current);
      const prefix = current.startsWith("^") ? "^" : current.startsWith("~") ? "~" : "";
      const updated = prefix + latest;
      if (updated !== current) {
        console.log(`${file}: ${name} ${current} -> ${updated}`);
        pkg[section][name] = updated;
      }
    }
  }
  writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n");
}
