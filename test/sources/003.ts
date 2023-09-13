import { thisLineNumber } from "../common/line-nr.js";

interface PublicInterface {
};

const abc = () => {
  interface IScopedInterface {
  };
};

const test = async () => {
  const lineNr = await thisLineNumber();
  const expectedLineNr = 12;
  if (lineNr !== expectedLineNr) {
    throw Error(`line number is not ${expectedLineNr} but ${lineNr}`);
  }
};

// function with same name than scoped interface
const IScopedInterface = () => {

};

export {
  PublicInterface,
  abc,
  test,
  IScopedInterface
};
