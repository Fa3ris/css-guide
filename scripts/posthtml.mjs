import postHTML from "posthtml";
import postHtmlModules from "posthtml-modules";
import postHtmlcssModules from "posthtml-css-modules";
import postHtmlBeautify from "posthtml-beautify";

import path from "path";
import {
  readFile,
  writeFile,
  mkdir,
  copyFile,
  unlink,
  readdir,
  stat,
  rm,
} from "fs/promises";

import { globSync } from "glob";

async function processHTML() {
  const htmlPaths = globSync("src/**/*.html", {
    ignore: "src/index.html",
  });

  console.log("html files", htmlPaths);

  const promises = htmlPaths.map(async (htmlPath) => {
    const filePath = path.resolve(htmlPath);

    const dir = path.dirname(filePath);
    const baseName = path.basename(filePath, ".html");

    const entries = await readdir(dir);
    const entry = entries.find((e) => e.endsWith(".css.json"));

    let phtml;
    if (!entry) {
      console.error("no .css.json found in dir", dir);
      phtml = postHTML();
    } else {
      const cssJson = path.resolve(dir, entry);
      console.log("filename", baseName);
      console.log("css module", cssJson);

      phtml = postHTML(postHtmlcssModules(cssJson));
    }

    const result = await phtml.process((await readFile(htmlPath)).toString());
    console.log(result.html);
    const relativePath = path.relative(path.resolve("src"), filePath);
    console.log("rel to src", relativePath);
    const target = path.resolve("public", relativePath);
    const targetDir = path.dirname(target);
    console.log("target dir", targetDir);
    const createdDir = await mkdir(targetDir, { recursive: true });
    createdDir && console.log("created dir", createdDir);
    await writeFile(target, result.html);
    console.log("finish writing to ", target);
  });

  await Promise.all(promises);

  console.log("all promises resolved");

  const inFile = path.resolve("src/index.html");
  const outDir = path.resolve("public");
  const outFile = path.resolve(outDir, "index.html");
  const tmpFile = path.resolve(outDir, "index.tmp.html");

  await copyFile(inFile, tmpFile);

  console.log("tmp file created", tmpFile);

  const processor = postHTML([
    postHtmlModules({ from: tmpFile.toString() }),
    postHtmlBeautify(),
  ]);

  const value = await readFile(tmpFile);
  const result = await processor.process(value.toString());

  await writeFile(outFile, result.html);

  console.log("finish writing HTML");

  await unlink(tmpFile);
  console.log("tmp file deleted", tmpFile);
  const entries = await readdir(outDir);
  console.log("dir", entries);

  entries.forEach(async (name) => {
    const entry = path.resolve(outDir, name);
    if ((await stat(entry)).isDirectory()) {
      console.log("will delete folder", entry);
      await rm(entry, { recursive: true });
      console.log("deleted folder", entry);
    }
  });
}

processHTML();