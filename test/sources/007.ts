import { thisLineNumber } from "../common/line-nr.js";

export class MyClass {
  private myPrivateField: string = "myPrivateField";
  public uninitializedField: string;
  es6Field = 23;
  public optionalField?: string;

  private get myPrivateGetter(): string {
    return "myPrivateGetter";
  }

  private myFunction(): string {
    return "myFunction";
  }
};

const test = async () => {
  const lineNr = await thisLineNumber();
  const expectedLineNr = 19;
  if (lineNr !== expectedLineNr) {
    throw Error(`line number is not ${expectedLineNr} but ${lineNr}`);
  }

  const myInstance = new MyClass();
  if (myInstance["myPrivateField"] !== "myPrivateField") {
    throw Error(`myInstance["myPrivateField"] is not "myPrivateField" but ${myInstance["myPrivateField"]}`);
  }

  if (myInstance["es6Field"] !== 23) {
    throw Error(`myInstance["es6Field"] is not 23 but ${myInstance["es6Field"]}`);
  }
};

export {
  test,
};
