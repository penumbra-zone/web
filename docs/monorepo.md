# Why we chose Turborepo


[Turborepo](https://turbo.build/) is a tool for managing monorepos (codebases with multiple packages/projects) developed by Vercel. 

A few reasons why we thought it was a good decision:
1. **Centralized configuration** - we manage project configurations (type rules, lint rules, etc) from a single place. This allows better enforcement of some of the strict linting we chose for web. This simplifies managing these settings across projects.
2. **Independent packages** - given our modularity goal, having separate repos will allow us to better position the codebase for exporting to NPM. However, it's far easier to manage all of those separate packages under one roof (aka monorepo).
3. **Tight coupling** - the packages we develop are tightly intertwined with our apps. If we make a breaking change, our app will have to be fixed before it can be deployed.


## pnpm package manager

Because there are so many different packages and node modules, we went with [pnpm](https://pnpm.io/) for packet management.
This allows repos to re-use a global cache and not have to re-download everything. It's also quite fast.
