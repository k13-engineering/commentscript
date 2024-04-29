import estree from "@typescript-eslint/typescript-estree";
import estraverse from "estraverse";
import escope from "escope";

const commentOutUnusedImports = ({ code }) => {
    const ast = estree.parse(code, {
        range: true,
    });

    const scopeManager = escope.analyze(ast, {
        sourceType: "module",
        ecmaVersion: 6,
    });

    const moduleScope = scopeManager.acquire(ast, true);

    let replacements = [];

    estraverse.replace(ast, {
        enter: function (node, parent) {
            if (node.type === "ImportSpecifier") {
                const scopeVariable = moduleScope.variables.find((variable) => {
                    if (variable.name === node.local.name) {
                        return variable;
                    }
                });

                // console.log(moduleScope);

                if (scopeVariable === undefined) {
                    throw Error("scope variable not found");
                }

                const used = scopeVariable.references.length > 0;

                if (!used) {

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
                }
            }
        },
    });

    // sort regions to comment from back to front
    // this is so that we don't have to worry about the offset of the code
    replacements = replacements.sort((a, b) => {
        return b.start - a.start;
    });

    let result = code;

    replacements.forEach(({ start, end, content }) => {
        result = result.substring(0, start) + content + result.substring(end);
    });

    return result;
};

export {
    commentOutUnusedImports
};
