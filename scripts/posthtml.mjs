import postHTML from "posthtml";
import postHtmlModules from "posthtml-modules";
import postHtmlcssModules from "posthtml-css-modules";

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

const paths = globSync("src/**/*.html", {
  ignore: "src/index.html",
});

console.log(paths);

const dirs = paths.map((p) => path.dirname(path.resolve(p)));

const promises = paths.map((p) => {
  const filePath = path.resolve(p);

  const dir = path.dirname(filePath);
  const fileName = path.basename(filePath, ".html");

  const cssModule = path.resolve(dir, fileName + ".css.json");
  console.log("css module", cssModule);

  console.log("filename", fileName);
  path.resolve(dir, "style.css");

  const rel = path.relative(path.resolve("src"), filePath);
  console.log("rel", rel);
  const phtml = postHTML(postHtmlcssModules(cssModule));

  return readFile(p).then((value) => {
    const s = value.toString();

    return phtml.process(s).then((r) => {
      console.log(r);
      console.log(r.html);

      const target = path.resolve("public", rel);

      const dir = path.dirname(target);

      console.log("target dir", dir);
      return mkdir(dir, { recursive: true }).then((createdDir) => {
        console.log("created dir", createdDir);
        return writeFile(target, r.html).then(() => {
          console.log("finish writing to ", target);
        });
      });
    });
  });
});

console.log(dirs);

Promise.all(promises).then(() => {
  console.log("all promises resolved");

  const inFile = path.resolve("src/index.html");

  const outFile = path.resolve("public/index.html");

  const tmpFile = path.resolve("public/index.tmp.html");

  const outDir = path.resolve("public");
  copyFile(inFile, tmpFile).then(() => {
    const processor = postHTML([postHtmlModules({ from: tmpFile.toString() })]);

    readFile(tmpFile).then((value) => {
      const s = value.toString();
      console.log(s);

      processor.process(s).then((r) => {
        console.log(r);

        console.log(r.html);

        writeFile(outFile, r.html).then(() => {
          unlink(tmpFile)
            .then(() => console.log("tmp file deleted", tmpFile))
            .then(() => {
              readdir(outDir).then((dir) => {
                console.log("dir", dir);

                dir.forEach((d) =>
                  stat(path.resolve(outDir, d)).then((stat) => {
                    if (stat.isDirectory()) {
                      console.log("stat", stat);
                      console.log(
                        "will delete folder",
                        path.resolve(outDir, d)
                      );
                      rm(path.resolve(outDir, d), { recursive: true }).then(
                        () => {
                          console.log(
                            "deleted folder",
                            path.resolve(outDir, d)
                          );
                        }
                      );
                    }
                  })
                );
              });
            })
            .catch((err) => {
              console.log("could not delete file", tmpFile);
            });
        });
      });
    });
  });
});

// const inFile = path.resolve("src/index.html");

// const outFile = path.resolve("build/index.html");

// const processor = postHTML([postHtmlModules({ from: inFile.toString() })]);

// readFile(inFile).then((value) => {
//   const s = value.toString();
//   console.log(s);

//   processor.process(s).then((r) => {
//     console.log(r);

//     console.log(r.html);
//   });
// });
