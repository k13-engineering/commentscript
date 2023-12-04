import { thisLineNumber } from "../common/line-nr.js";

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
  const expectedLineNr = 53;
  if (lineNr !== expectedLineNr) {
    throw Error(`line number is not ${expectedLineNr} but ${lineNr}`);
  }
};

export {
  test,
};
