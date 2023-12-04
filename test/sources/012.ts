import { thisLineNumber } from "../common/line-nr.js";

type TMarlinWorkflowStateMachineState = object;
enum EMarlinJobState {
  TEST
};

function abc() {
  const stateMap = new WeakMap<TMarlinWorkflowStateMachineState, EMarlinJobState>();
}

const test = async () => {
  const lineNr = await thisLineNumber();
  const expectedLineNr = 13;
  if (lineNr !== expectedLineNr) {
    throw Error(`line number is not ${expectedLineNr} but ${lineNr}`);
  }
};

export {
  test,
};
