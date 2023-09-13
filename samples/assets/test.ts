interface MyInterface {
    myProperty: string;
};

const myFunc = (myParam: { a: number, b?: string }): MyInterface => {
  return {
    myProperty: 'test' as string
  };
};
