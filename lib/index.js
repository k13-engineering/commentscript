import { parse as parseAst } from "@typescript-eslint/typescript-estree";
import estraverse from "estraverse";
import { commentOutUnusedImports } from "./unused-imports.js";

const transpileCode = async ({ code }) => {
  if (typeof code !== "string") {
    throw new Error("code must be a string");
  }

  const codeAsAst = parseAst(code, {
    range: true,
  });

  let globalTypeIdentifiers = [];

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

    TSInterfaceDeclaration: ({ node, parent }) => {
      const start = node.range[0];
      const end = node.range[1];

      commentOut({ start, end });

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

      if (node.typeParameters) {
        commentOut({
          start: node.typeParameters.range[0],
          end: node.typeParameters.range[1]
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

      if (node.typeParameters) {
        commentOut({
          start: node.typeParameters.range[0],
          end: node.typeParameters.range[1]
        });
      }
    },

    Program: ({ node }) => {
      node.body.forEach((childNode) => {
        if (childNode.type === "TSInterfaceDeclaration") {

          globalTypeIdentifiers = [
            ...globalTypeIdentifiers,
            childNode.id,
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

    },

    ImportDeclaration: ({ node }) => {
      if (node.importKind === "type") {
        commentOut({
          start: node.range[0],
          end: node.range[1]
        });
        return estraverse.VisitorOption.Skip;
      }
    },

    ExportNamedDeclaration: ({ node }) => {
      if (node.exportKind === "type") {
        commentOut({
          start: node.range[0],
          end: node.range[1]
        });
        return estraverse.VisitorOption.Skip;
      }
    },

    ExportSpecifier: ({ node, parent }) => {

      const typeIdentifier = globalTypeIdentifiers.find((identifier) => {
        return identifier.name === node.local.name;
      });

      if (typeIdentifier !== undefined) {
        // export is a type export

        const specifierIndex = parent.specifiers.indexOf(node);
        if (specifierIndex < 0) {
          throw Error("BUG: specifier not found in parent");
        }

        let nextSpecifier = undefined;

        if (specifierIndex < parent.specifiers.length - 1) {
          nextSpecifier = parent.specifiers[specifierIndex + 1];
        }

        const start = node.range[0];
        let end = node.range[1];

        if (nextSpecifier) {
          end = nextSpecifier.range[0];
        } else {
          const closingBracketIndex = code.indexOf("}", end);
          if (closingBracketIndex < 0) {
            throw Error("BUG: closing bracket not found");
          }

          end = closingBracketIndex;
        }

        const textToComment = code.substring(start, end);
        const replacementText = textToComment.replaceAll("*/", "* /");

        replacements.push({ start, end, content: `/*${replacementText}*/` });

        return estraverse.VisitorOption.Skip;
      }
    },

    TSTypeAliasDeclaration: ({ node }) => {
      const start = node.range[0];
      const end = node.range[1];

      commentOut({ start, end });

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
    },

    ClassDeclaration: ({ node }) => {
      const attributesText = code.substring(node.id.range[1], node.body.range[0]);
      const indexOfImplements = attributesText.indexOf("implements");

      if (indexOfImplements >= 0) {
        const implementsText = attributesText.substring(indexOfImplements).trim();

        const start = node.id.range[1] + indexOfImplements;
        const end = start + implementsText.length;

        commentOut({
          start,
          end
        });
      }
    },

    CallExpression: ({ node }) => {
      if (node.typeArguments) {
        commentOut({
          start: node.typeArguments.range[0],
          end: node.typeArguments.range[1]
        });
      }
    }
  };

  estraverse.replace(codeAsAst, {
    enter: function (node, parent) {

      const handler = handlers[node.type];
      if (handler) {
        return handler({ node, parent });
      }

    },

    fallback: 'iteration'
  });

  // sort regions to comment from back to front
  // this is so that we don't have to worry about the offset of the code
  replacements = replacements.sort((a, b) => {
    return b.start - a.start;
  });

  let stage1 = code;

  replacements.forEach(({ start, end, content }) => {
    stage1 = stage1.substring(0, start) + content + stage1.substring(end);
  });

  const stage2 = commentOutUnusedImports({ code: stage1 });

  return {
    transpiledCode: stage2,
  };
};

export {
  transpileCode
};
