# Guiding principles

## All code should be typesafe

That means there should be _almost zero_ use of `any` within the repo.
The most important step is ensuring `strict: true` is enabled in [tsconfig.json](../packages/tsconfig/base.json).
There should be no condition on which that is switched off. This will help
future developers from being able to easily add/change code given the whole system
will have type safety guarantees. This, plus extensive testing, will make our code
more resilient. We should only disable the type-checker/linter when we have no choice,
not because it's easier.

## CI/CD enforces best practices

We should treat the master branch with as much respect as possible. This means that our
CI/CD pipeline `/.github/workflows` should actively enforce the best practices:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Vitest](https://vitest.dev/) for unit testing
- [Turborepo](https://turbo.build/) for builds

It should not be possible to ship code that hasn't gone through the fire. Further, the use of `eslint` with quite high standards ([packages/eslint-config-custom/index.js](../packages/eslint-config-custom/index.js)) is necessary to keep the codebase
code quality high. See [CI/CD guide](ci-cd.md) for running commands locally.

## Modularity from the beginning

We should attempt to be liberal about adding packages if we think it can get re-use from another
app in this repo or even outside. This will allow us to expose critical functionality
that can make developing further apps easier.

## Ongoingly document

We should attempt to _document as we go_. That should commonly come in two forms:

1. **Code comments** - When there is code that starts to require domain knowledge to understand, we should be quite liberal about adding in-line code comments to explain variables, functions, decisions, etc.
2. **Architecture docs** - This directory holds the documentation on larger technical decisions and system designs.
