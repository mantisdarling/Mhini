import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, "..");

const functionOptions = {
  bundle: true,
  entryPoints: [path.join(projectDirectory, "server", "vercelFunction.ts")],
  format: "esm",
  packages: "external",
  platform: "node",
  sourcemap: false,
  target: "node22",
};

await build({
  ...functionOptions,
  outfile: path.join(projectDirectory, "api", "[...route].js"),
});

await build({
  ...functionOptions,
  outfile: path.join(projectDirectory, "api", "trpc", "[procedure].js"),
});
