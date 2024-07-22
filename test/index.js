import path from "node:path";
import fs from "node:fs";
import { resolve } from "esm-resource";
import { transpileCode } from "../lib/index.js";
import assert from "node:assert/strict";

const testFilesDir = resolve({ importMeta: import.meta, filepath: "./sources" });
const testFileBasenames = [
  // "001.ts",
  // "002.ts",
  // "003.ts",
  // "004.ts",
  // "005.ts",
  // "006.ts",
  // "007.ts",
  // "008.ts",
  // "009.ts",
  // "010.ts",
  // "011.ts",
  // "012.ts",
  // "013.ts",
  // "014.ts",
  // "015.ts",
  // "016.ts",
  "017.ts",
];

const testFiles = testFileBasenames.filter((basename) => {
  return basename.endsWith(".ts");
}).map((basename) => {
  const filepath = path.join(testFilesDir, basename);
  return filepath;
});

let importCounter = 0;

const importNoCache = async ({ filepath }) => {
  const module = await import(filepath + `?cachebuster=${importCounter}`);
  importCounter += 1;
  return module;
};

const testCode = async ({ testFile }) => {
  const testFileBasename = path.basename(testFile);

  console.log(`testing ${testFileBasename}`);

  const code = await fs.promises.readFile(testFile, "utf8");
  const { transpiledCode } = await transpileCode({ code, fileName: testFileBasename });

  const expectedTranspiled = await fs.promises.readFile(`${testFile}.expected`, "utf8");
  try {
    assert.deepEqual(transpiledCode, expectedTranspiled);
  } catch (ex) {

    console.log("transpiled code:");
    console.log(transpiledCode);

    throw ex;
  }
  // if (transpiled !== expectedTranspiled) {
  //   throw Error(`transpiled code does not match expected code`);
  // }

  const tempFilename = path.join(testFilesDir, ".transpiled.js");
  await fs.promises.writeFile(tempFilename, transpiledCode);

  let module;

  try {
    module = await importNoCache({ filepath: tempFilename });
  } catch (ex) {
    throw Error("importing failed", { cause: ex });
  } finally {
    await fs.promises.rm(tempFilename);
  }

  const { test } = module;

  if (!test) {
    throw Error("test not exported");
  }

  try {
    await test();
  } catch (ex) {
    throw Error(`module test ${testFileBasename} failed`, { cause: ex });
  }
};

for (const testFile of testFiles) {
  await testCode({ testFile });
}

console.log("all tests passed");
