import { readFile, writeFile } from "fs/promises";
import path from "path";
import postcss from "postcss";
import postcssModules from "postcss-modules";
import cssnano from "cssnano";

import { globSync } from "glob";

async function toCssModules() {
  const processor = postcss([postcssModules]);

  const paths = globSync("src/**/*.css");

  const outFile = path.resolve("public/style.css");

  const allCss = await Promise.all(
    paths.map(async (p) => {
      const from = path.resolve(p);
      const content = await readFile(from);
      const result = await processor.process(content, { from });
      return result.css;
    })
  );

  const result = await postcss([cssnano()]).process(allCss.join("\n"), {
    from: outFile,
  });

  await writeFile(outFile, result.css);
  console.log("finish process CSS");
}

toCssModules();
