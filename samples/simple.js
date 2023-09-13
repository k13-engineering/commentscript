import { transpile } from "../lib/index.js";
import fs from "node:fs";
import { resolve } from "esm-resource";

const code = await fs.promises.readFile("/home/simon/projects/ntsdb-workbench/prosecutor/lib/index.ts", "utf8");

const transpiled = await transpile({ code, fileName: "index.ts" });

console.log(transpiled);