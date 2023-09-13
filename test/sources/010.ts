import { thisLineNumber } from "../common/line-nr.js";

function testFunc(a, b, c?) {
  return 0;
}

const test = async () => {
  const lineNr = await thisLineNumber();
  const expectedLineNr = 8;
  if (lineNr !== expectedLineNr) {
    throw Error(`line number is not ${expectedLineNr} but ${lineNr}`);
  }
};

export {
  test,
};
