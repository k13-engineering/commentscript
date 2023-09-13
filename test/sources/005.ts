import { thisLineNumber } from "../common/line-nr.js";

const xy : number | undefined = 3;

const abc = xy!;

const test = async () => {
  const lineNr = await thisLineNumber();
  const expectedLineNr = 8;
  if (lineNr !== expectedLineNr) {
    throw Error(`line number is not ${expectedLineNr} but ${lineNr}`);
  }
};

export {
  test
};
