# CI/CD guide

### Run commands locally

The CI/CD enforces strict standards before a PR can be merged. It's helpful to run these locally
so you can iterate without pushing to github. Running these commands in the root
directory will recursively run them in each app/package. The essential commands:

- **pnpm install**: Make sure all deps are installed
- **pnpm format**: Use Prettier to format code according to repo's code styling config
- **pnpm lint**: Run ESLint for code syntax, quality, best practice checks
- **pnpm test**: Runs Vitest test suite (i.e. runs \*.test.ts files)
- **pnpm build**: Ensures apps can make production builds

### Github actions

All checks above will be run on opening a pull request and merging to main.
Main merges will also deploy dapp on Firebase. Workflows can be [seen here](../.github/workflows).
