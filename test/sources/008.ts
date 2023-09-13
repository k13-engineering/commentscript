import { thisLineNumber } from "../common/line-nr.js";

interface IMyType {};

export type {
  IMyType
};

export interface IMyType2 {};

type MyType = {
  [key: string]: string;
}

const test = async () => {
  const lineNr = await thisLineNumber();
  const expectedLineNr = 16;
  if (lineNr !== expectedLineNr) {
    throw Error(`line number is not ${expectedLineNr} but ${lineNr}`);
  }
};

export {
  test,
};
