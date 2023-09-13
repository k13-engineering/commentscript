import { thisLineNumber } from "../common/line-nr.js";

export enum EMyEnum {
  VALUE_A = "a",
  VALUE_B = "b"
};

export enum EMyEnum2 {
  FIRST = 1,
  SECOND,
  THIRD
};

const test = async () => {
  const lineNr = await thisLineNumber();
  const expectedLineNr = 15;
  if (lineNr !== expectedLineNr) {
    throw Error(`line number is not ${expectedLineNr} but ${lineNr}`);
  }

  if (EMyEnum2.THIRD !== 3) {
    throw Error(`EMyEnum2.THIRD is not 3 but ${EMyEnum2.THIRD}`);
  }

  if (EMyEnum.VALUE_A !== "a") {
    throw Error(`EMyEnum.VALUE_A is not "a" but ${EMyEnum.VALUE_A}`);
  }
};

export {
  test,
};
