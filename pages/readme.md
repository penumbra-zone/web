# Code structure

This MD file discusses the agreed code structure of the project. It combines the NextJS file structure with the Feature-Sliced Design (FSD) principles.

Main ideas:
- To comply with the NextJS file structure, the `app` and `pages` directories are used in the root of the project. However, it should only export the code defined in other directories.
- The `src` directory mainly follows the [Feature-Sliced Design (FSD)](https://feature-sliced.design/docs/get-started/overview) methodology. It defines the layers, slices and segments instead of splitting the files by its type (e.g. "components" or "state").
- All file names should use **kebab-case**.
- When using the FSD layers, apply the top-down approach: start by using the `pages` layer and extract the code from it only when this code is being shared. For example, the project initially may only be one `home` slice in the `pages` layer. When we add the `about` page, the `header` component defined in `home` might be moved 1 layer down to `widgets` or even to `shared` layer.
- Each slice might but not required to include these slices: `ui` for storing components, styles and images, `api` for interactions with the backends or extensions, `model` for storing functions related to business logic or data storage.
- Ideally, the slices must not import other slices from the same layer. In practice, we might allow doing so on the `entities` layer.
- Each slice must include the `index.ts` file representing the public API. To avoid the tree shaking issues, this file should define named exports (e.g. `export { A } from './ui/a.tsx` is good but `export * from './a.tsx` is not).
