import { toCssModules } from "./postcss.mjs";
import { processHTML } from "./posthtml.mjs";

export default async function build() {
  await toCssModules();
  await processHTML();
}

build();
