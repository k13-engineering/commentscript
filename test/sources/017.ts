import { thisLineNumber } from "../common/line-nr.js";

export type * from "./017-types.ts";

const test = async () => {
  const lineNr = await thisLineNumber();
  const expectedLineNr = 6;
  if (lineNr !== expectedLineNr) {
    throw Error(`line number is not ${expectedLineNr} but ${lineNr}`);
  }
};

export {
  test,
};
