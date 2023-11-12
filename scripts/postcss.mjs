import postcss from "postcss";
import postcssFocus from "postcss-focus";
import autoprefixer from "autoprefixer";
import cssnanoPlugin from "cssnano";
import postcssModules from "postcss-modules";
import path from "path";
import { readFile, writeFile } from "fs/promises";

import { globSync } from "glob";

const inFile = path.resolve("src/styles/style.css");

const outFile = path.resolve("public/style.css");

const OLD_FOCUS = false;

const paths = globSync("src/**/*.css");

const plugins = [
  //   postcssFocus({ oldFocus: OLD_FOCUS }),
  //   autoprefixer({ flexbox: true }),
  postcssModules,
  //   cssnanoPlugin,
];

const processor = postcss(plugins);

const allP = Promise.all(
  paths.map((p) => {
    const from = path.resolve(p);
    return readFile(from).then((c) => processor.process(c, { from, outFile }));
  })
);

allP.then((p) => {
  const css = p.map((e) => e.css).join("\n");
  writeFile(path.resolve("public/style.css"), css).then(() => {
    console.log("finish process CSS");
  });
});

// readFile(inFile).then((c) => {
//   processor.process(c, { from: inFile, to: outFile }).then((out) => {
//     console.log(out);
//     writeFile(out.opts.to, out.css);
//   });
// });

// console.log(paths);
