import { thisLineNumber } from "../common/line-nr.js";

enum EFirstLevel {
  CONST_A = 1,
  CONST_B = 2,
};

enum ESecondLevel {
  CONST_A = EFirstLevel.CONST_A,
  CONST_B = EFirstLevel.CONST_B,
};

enum ESecondLevelWithIncrement {
  CONST_A = EFirstLevel.CONST_A,
  CONST_B
};

enum EThirdLevel {
  CONST_A = ESecondLevel.CONST_A,
  CONST_B = ESecondLevel.CONST_B,
};

const test = async () => {
  const lineNr = await thisLineNumber();
  const expectedLineNr = 24;
  if (lineNr !== expectedLineNr) {
    throw Error(`line number is not ${expectedLineNr} but ${lineNr}`);
  }
};

export {
  test,
};
