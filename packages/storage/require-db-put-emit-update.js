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
    const INSERT_METHODS = ['put', 'add'];

    function isInsertMethod(node) {
      return (
        node?.callee?.type === 'MemberExpression' &&
        INSERT_METHODS.includes(node.callee.property?.name)
      );
    }

    function isDbInsertCall(node) {
      return (
        isInsertMethod(node) &&
        node.callee.object?.object?.type === 'ThisExpression' &&
        node.callee.object.property?.name === 'db'
      );
    }

    function isTxInsertCall(node) {
      return isInsertMethod(node) && node.callee.object?.callee?.property?.name === 'objectStore';
    }

    function hasEmitUpdate(node) {
      const parent = node.parent;
      if (!parent || !parent.parent) {
        return false;
      }

      return (
        parent.type === 'MemberExpression' &&
        parent.property?.name === 'then' &&
        parent.parent.type === 'CallExpression' &&
        parent.parent.arguments?.length === 1 &&
        parent.parent.arguments[0]?.type === 'CallExpression' &&
        parent.parent.arguments[0].callee?.object?.type === 'ThisExpression' &&
        parent.parent.arguments[0].callee.property?.name === 'emitUpdate'
      );
    }

    function getStoreName(node) {
      if (!node?.callee?.object) {
        return null;
      }

      const storeArg =
        node.callee.object.callee?.property?.name === 'objectStore'
          ? node.callee.object.arguments?.[0]
          : node.arguments?.[0];

      return storeArg?.type === 'Literal' ? storeArg.value : null;
    }

    function getTransactionName(node) {
      if (!isTxInsertCall(node)) {
        return 'null';
      }

      // Find the closest parent that's a function call or block statement
      let current = node;
      while (current?.parent) {
        if (current.parent.type === 'CallExpression' || current.parent.type === 'BlockStatement') {
          break;
        }
        current = current.parent;
      }

      // Look for a variable declaration or parameter that's a transaction
      const scope = context.getScope();
      const txVar = scope.variables.find(v =>
        v.defs.some(
          def =>
            def.node?.type === 'VariableDeclarator' &&
            def.node.init?.type === 'Identifier' &&
            def.node.init.name === 'transaction',
        ),
      );

      return txVar ? txVar.name : 'tx';
    }

    return {
      CallExpression(node) {
        if (!isDbInsertCall(node) && !isTxInsertCall(node)) {
          return;
        }

        if (!hasEmitUpdate(node)) {
          const storeName = getStoreName(node);
          const txName = getTransactionName(node);

          context.report({
            node,
            message: `Database insertion (${node.callee.property.name}) must be followed by .then(this.emitUpdate(...)) to ensure UI updates`,
            fix(fixer) {
              if (!storeName) {
                return null; // Don't provide a fix if we can't determine the store name
              }
              const putCall = context.sourceCode.getText(node);
              return fixer.replaceText(
                node,
                `${putCall}.then(this.emitUpdate('${storeName}', ${txName}))`,
              );
            },
          });
        }
      },
    };
  },
};
