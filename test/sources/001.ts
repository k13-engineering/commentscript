import { thisLineNumber } from "../common/line-nr.js";


interface MyInterface {
    myProperty: string;
};

const myFunc = (myParam: { a: number, b?: string }): MyInterface => {
  return {
    myProperty: 'test' as string
  };
};

const test = async () => {
  const lineNr = await thisLineNumber();
  const expectedLineNr = 15;
  if (lineNr !== expectedLineNr) {
    throw Error(`line number is not ${expectedLineNr} but ${lineNr}`);
  }
};

export {
  test
};
