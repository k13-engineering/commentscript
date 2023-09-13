import estree from "@typescript-eslint/typescript-estree";
import estraverse from "estraverse";

const transpileCode = async ({ code }) => {
  if (typeof code !== "string") {
    throw new Error("code must be a string");
  }

  const codeAsAst = estree.parse(code, {
    range: true,
  });

  let replacements = [];

  const commentOut = ({ start, end }) => {
    if (end < start) {
      throw new Error("end must be greater than start");
    }

    replacements.push({ start, end, content: `/*${code.substring(start, end)}*/` });
  };

  const handlers = {
    TSAsExpression: ({ node }) => {
      commentOut({
        start: node.expression.range[1],
        end: node.range[1]
      });
    },

    TSInterfaceDeclaration: ({ node }) => {
      const start = node.range[0];
      const end = node.range[1];

      replacements.push({
        start,
        end,
        content: `/*${code.substring(start, end)}*/ const ${node.id.name} = {}`
      });

      return estraverse.VisitorOption.Skip;
    },

    NewExpression: ({ node }) => {
      if (node.typeArguments) {
        commentOut({
          start: node.typeArguments.range[0],
          end: node.typeArguments.range[1]
        });
      }
    },

    TSEnumDeclaration: ({ node }) => {
      let initializers = [];

      let lastValue = 0;

      node.members.forEach((member) => {

        if (member.computed) {
          throw Error("computed enum member not supported yet");
        }

        let value;

        if (member.initializer) {
          value = member.initializer.value;
        } else {
          if (typeof lastValue !== "number") {
            throw Error("enum member without initializer must be preceded by a number initializer");
          }

          value = lastValue + 1;
        }

        const stringifiedValue = JSON.stringify(value);
        initializers.push(`${member.id.name}: ${stringifiedValue}`);

        lastValue = value;
      });

      replacements.push({
        start: node.range[0],
        end: node.range[1],

        content: `/*${code.substring(node.range[0], node.range[1])}*/ const ${node.id.name} = { ${initializers.join(", ")} }`
      });

      return estraverse.VisitorOption.Skip;
    },

    Identifier: ({ node }) => {

      if (node.typeAnnotation) {
        commentOut({
          start: node.typeAnnotation.range[0],
          end: node.typeAnnotation.range[1]
        });
      }

      if (node.optional) {
        const name = code.substring(node.range[0], node.range[1]);
        if (name.endsWith("?")) {
          commentOut({
            start: node.range[1] - 1,
            end: node.range[1]
          });
        } else {
          throw Error("identifier is optional but does not end with ?");
        }
      }
    },

    ArrowFunctionExpression: ({ node }) => {
      if (node.returnType) {
        commentOut({
          start: node.returnType.range[0],
          end: node.returnType.range[1]
        });
      }
    },

    ObjectPattern: ({ node }) => {
      if (node.typeAnnotation) {
        commentOut({
          start: node.typeAnnotation.range[0],
          end: node.typeAnnotation.range[1]
        });
      }
    },

    PropertyDefinition: ({ node }) => {
      const codeSlice = code.substring(node.range[0], node.range[1]);

      if (node.typeAnnotation) {

        if (node.optional) {
          const questionMarkIndex = codeSlice.indexOf("?");
          if (questionMarkIndex < 0) {
            throw Error("BUG: no question mark found");
          }

          const absoluteQuestionMarkIndex = node.range[0] + questionMarkIndex;

          if (absoluteQuestionMarkIndex > node.typeAnnotation.range[0]) {
            throw Error("BUG: question mark is after type annotation");
          }

          commentOut({
            start: absoluteQuestionMarkIndex,
            end: node.typeAnnotation.range[1]
          });
        } else {
          commentOut({
            start: node.typeAnnotation.range[0],
            end: node.typeAnnotation.range[1]
          });
        }
      } else if (node.optional) {
        const questionMarkIndex = codeSlice.indexOf("?");
        if (questionMarkIndex < 0) {
          throw Error("BUG: no question mark found");
        }

        commentOut({
          start: node.range[0] + questionMarkIndex,
          end: node.range[0] + questionMarkIndex + 1
        });
      }

      if (node.accessibility) {
        if (!codeSlice.startsWith(node.accessibility)) {
          throw Error("only leading accessibility is supported");
        }

        commentOut({
          start: node.range[0],
          end: node.range[0] + node.accessibility.length
        });
      }
    },

    MethodDefinition: ({ node }) => {
      if (node.accessibility) {
        if (!code.substring(node.range[0], node.range[0] + node.accessibility.length).startsWith(node.accessibility)) {
          throw Error("only leading accessibility is supported");
        }

        commentOut({
          start: node.range[0],
          end: node.range[0] + node.accessibility.length
        });
      }
    },

    FunctionExpression: ({ node }) => {
      if (node.returnType) {
        commentOut({
          start: node.returnType.range[0],
          end: node.returnType.range[1]
        });
      }
    },

    Program: ({ node }) => {
      let globalTSInterfaces = [];

      node.body.forEach((childNode) => {
        if (childNode.type === "TSInterfaceDeclaration") {

          globalTSInterfaces = [
            childNode,
          ];
        }
      });
    },

    TSNonNullExpression: ({ node }) => {
      commentOut({
        start: node.expression.range[1],
        end: node.range[1]
      });
    },

    VariableDeclarator: ({ node }) => {
      if (node.init?.typeParameters) {
        commentOut({
          start: node.init.typeParameters.range[0],
          end: node.init.typeParameters.range[1]
        });
      }
    },

    ExportNamedDeclaration: ({ node }) => {
      if (node.exportKind === "type" && node.specifiers.length > 0) {
        if (node.declaration) {
          throw Error("BUG: declaration and specifiers not supported");
        }

        const codeSlice = code.substring(node.range[0], node.range[1]);

        const typeKeyword = "type";

        const indexOfType = codeSlice.indexOf(typeKeyword);
        if (indexOfType < 0) {
          throw Error("BUG: no type keyword found");
        }

        commentOut({
          start: node.range[0] + indexOfType,
          end: node.range[0] + indexOfType + typeKeyword.length
        });
      }
    },

    TSTypeAliasDeclaration: ({ node }) => {
      const start = node.range[0];
      const end = node.range[1];

      replacements.push({
        start,
        end,
        content: `/*${code.substring(start, end)}*/ const ${node.id.name} = {}`
      });

      return estraverse.VisitorOption.Skip;
    },

    RestElement: ({ node }) => {
      if (node.typeAnnotation) {
        commentOut({
          start: node.typeAnnotation.range[0],
          end: node.typeAnnotation.range[1]
        });
      }
    },

    FunctionDeclaration: ({ node }) => {
      if (node.returnType) {
        commentOut({
          start: node.returnType.range[0],
          end: node.returnType.range[1]
        });
      }
    }
  };

  estraverse.replace(codeAsAst, {
    enter: function (node) {

      const handler = handlers[node.type];
      if (handler) {
        return handler({ node });
      }
      
    },

    fallback: 'iteration'
  });

  // sort regions to comment from back to front
  // this is so that we don't have to worry about the offset of the code
  replacements = replacements.sort((a, b) => {
    return b.start - a.start;
  });

  let transpiledCode = code;

  replacements.forEach(({ start, end, content }) => {
    transpiledCode = transpiledCode.substring(0, start) + content + transpiledCode.substring(end);
  });

  return {
    transpiledCode,
  };
};

export {
  transpileCode
};
