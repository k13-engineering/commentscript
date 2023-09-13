import { thisLineNumber } from "../common/line-nr.js";

function abc() {
  return new Promise<{ code: number, signal: string }>((resolve, reject) => {
    resolve({ code: 0, signal: "" });
  });
}

const test = async () => {
  const lineNr = await thisLineNumber();
  const expectedLineNr = 10;
  if (lineNr !== expectedLineNr) {
    throw Error(`line number is not ${expectedLineNr} but ${lineNr}`);
  }
};

export {
  test,
};
