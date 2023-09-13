import StackTrace from 'stacktrace-js';

const thisLineNumber = async ()/* : Promise<number>*/ => {
  const stack = await StackTrace.get();
  return stack[1].lineNumber/*!*/;
};

export {
  thisLineNumber
};
