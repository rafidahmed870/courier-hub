import { build } from "esbuild";
import { rmSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";
import { execSync } from "node:child_process";

function collectEntries(dir) {
  const entries = [];

  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, item.name);

    if (item.isDirectory()) {
      entries.push(...collectEntries(full));
    } else if (
      item.isFile() &&
      extname(item.name) === ".ts" &&
      !item.name.endsWith(".d.ts") &&
      !item.name.endsWith(".types.ts")
    ) {
      entries.push(full);
    }
  }

  return entries;
}

async function main() {
  rmSync("dist", { recursive: true, force: true });

  const entryPoints = collectEntries("src");

  const shared = {
    entryPoints,
    bundle: true,
    platform: "node",
    target: "es2020",
    sourcemap: true,
    outdir: "dist",
    outbase: "src",
  };

  await build({
    ...shared,
    format: "esm",
    outExtension: { ".js": ".js" },
  });

  await build({
    ...shared,
    format: "cjs",
    outExtension: { ".js": ".cjs" },
  });

  execSync("npx tsc -p tsconfig.build.json", { stdio: "inherit" });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
