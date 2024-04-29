import { thisLineNumber } from "../common/line-nr.js";
import { unusedImport1 } from "../common/line-nr.js";
import { unusedImport2, unusedImport3 } from "../common/line-nr.js";
import { unusedImport4, unusedImport5, unusedImport6 } from "../common/line-nr.js";
import { unusedImport7   ,unusedImport8  , unusedImport9, } from "../common/line-nr.js";
import { unusedImport10,/*comment1*/unusedImport11/*comment,2*/, unusedImport12 } from "../common/line-nr.js";
import {
  unusedImport13, unusedImport14,
  /*comment,3*/
  unusedImport15

} from "../common/line-nr.js";

interface IMyInterface {
  getName(): string;
  getAge(): number;
};

class MyClass implements IMyInterface {
  private name: string;
  private age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  getName(): string {
    return this.name;
  }

  getAge(): number {
    return this.age;
  }
};

class MyBaseClass {
  baseMethod() {

  }
};

class MyClass2 extends MyBaseClass implements IMyInterface {
  getName(): string {
    return "abc"
  }

  getAge(): number {
    return 12;
  }
};

class MyClass3 extends MyBaseClass {
  getName(): string {
    return "abc"
  }

  getAge(): number {
    return 12;
  }
};

const test = async () => {
  const lineNr = await thisLineNumber();
  const expectedLineNr = 64;
  if (lineNr !== expectedLineNr) {
    throw Error(`line number is not ${expectedLineNr} but ${lineNr}`);
  }
};

export {
  test,
};
