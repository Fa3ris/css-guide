import chokidar from "chokidar";

import { toCssModules } from "./postcss.mjs";
import { processHTML } from "./posthtml.mjs";

const watcher = chokidar.watch(["src/**/*.(html|css)"]);

watcher.on("add", (path) => console.log("watch", path));

watcher.on("change", async (path) => {
  console.log("change", path);
  await toCssModules();
  await processHTML();
});
