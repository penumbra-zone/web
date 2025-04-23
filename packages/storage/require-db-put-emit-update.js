/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require db insertion calls to be followed by .then(this.emitUpdate(...))',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
  },

  create(context) {
    return {
      CallExpression(node) {
        // Check if this is a this.db.put call or tx.objectStore(...).put call
        const isDbPut =
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'MemberExpression' &&
          node.callee.object.object.type === 'ThisExpression' &&
          node.callee.object.property.type === 'Identifier' &&
          node.callee.object.property.name === 'db' &&
          node.callee.property.type === 'Identifier' &&
          ['put', 'add'].includes(node.callee.property.name);

        const isTxPut =
          node.callee.type === 'MemberExpression' &&
          node.callee.property.type === 'Identifier' &&
          ['put', 'add'].includes(node.callee.property.name) &&
          node.callee.object.type === 'CallExpression' &&
          node.callee.object.callee.type === 'MemberExpression' &&
          node.callee.object.callee.property.type === 'Identifier' &&
          node.callee.object.callee.property.name === 'objectStore';

        if (!isDbPut && !isTxPut) return;

        // Get the parent chain to check for .then(this.emitUpdate(...))
        let current = node;
        let foundThen = false;
        let foundEmitUpdate = false;

        while (current.parent) {
          // Skip over await expressions
          if (current.parent.type === 'AwaitExpression') {
            current = current.parent;
            continue;
          }

          if (
            current.parent.type === 'MemberExpression' &&
            current.parent.property.type === 'Identifier' &&
            current.parent.property.name === 'then'
          ) {
            foundThen = true;
            current = current.parent;
            continue;
          }

          if (
            foundThen &&
            current.parent.type === 'CallExpression' &&
            current.parent.arguments.length === 1 &&
            current.parent.arguments[0].type === 'CallExpression' &&
            current.parent.arguments[0].callee.type === 'MemberExpression' &&
            current.parent.arguments[0].callee.object.type === 'ThisExpression' &&
            current.parent.arguments[0].callee.property.type === 'Identifier' &&
            current.parent.arguments[0].callee.property.name === 'emitUpdate'
          ) {
            foundEmitUpdate = true;
            break;
          }

          current = current.parent;
        }

        if (!foundThen || !foundEmitUpdate) {
          context.report({
            node,
            message: 'db insertion call must be followed by .then(this.emitUpdate(...))',
            fix(fixer) {
              const sourceCode = context.getSourceCode();
              const putCall = sourceCode.getText(node);
              const storeName = isDbPut
                ? node.arguments[0]?.type === 'Literal'
                  ? node.arguments[0].value
                  : 'STORE_NAME'
                : node.callee.object.arguments[0]?.type === 'Literal'
                  ? node.callee.object.arguments[0].value
                  : 'STORE_NAME';

              return fixer.replaceText(
                node,
                `${putCall}.then(this.emitUpdate('${storeName}', ${isTxPut ? 'tx' : 'null'}))`,
              );
            },
          });
        }
      },
    };
  },
};
