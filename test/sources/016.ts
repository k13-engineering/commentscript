import { thisLineNumber } from "../common/line-nr.js";

const myFunc = <T> (arg: T): T => {
  return arg;
};

const result = myFunc<number>(1);

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
