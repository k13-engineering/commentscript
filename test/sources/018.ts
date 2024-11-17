import { thisLineNumber } from "../common/line-nr.js";

const x: number = 2;
const y: number | undefined = undefined;

const z1 = (x || y) as number;
const z2 = (((x || y))) as (number);

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
