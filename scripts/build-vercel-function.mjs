import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, "..");

await build({
  bundle: true,
  entryPoints: [path.join(projectDirectory, "server", "vercelFunction.ts")],
  format: "esm",
  outfile: path.join(projectDirectory, "api", "[...route].js"),
  packages: "external",
  platform: "node",
  sourcemap: false,
  target: "node22",
});
